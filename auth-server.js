// Secure Authentication Server
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Secure password hashing
const SALT_ROUNDS = 12;
const ADMIN_PASSWORD_HASH = crypto.scryptSync('Thee2025Bbubb!', 'secure_salt', 64).toString('hex');

// Session management
const activeSessions = new Map();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting
const loginAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Generate secure session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Validate password securely
function validatePassword(inputPassword) {
    const hash = crypto.scryptSync(inputPassword, 'secure_salt', 64).toString('hex');
    return hash === ADMIN_PASSWORD_HASH;
}

// Create secure session
function createSession(ip) {
    const token = generateSessionToken();
    const session = {
        token,
        ip,
        created: Date.now(),
        lastActivity: Date.now()
    };
    activeSessions.set(token, session);
    return token;
}

// Validate session
function validateSession(token, ip) {
    const session = activeSessions.get(token);
    if (!session) return false;
    
    // Check if session expired
    if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
        activeSessions.delete(token);
        return false;
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    return true;
}

// Clean expired sessions
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of activeSessions.entries()) {
        if (now - session.lastActivity > SESSION_TIMEOUT) {
            activeSessions.delete(token);
        }
    }
}, 60 * 1000); // Clean every minute

// Rate limiting check
function checkRateLimit(ip) {
    const attempts = loginAttempts.get(ip);
    if (!attempts) return true;
    
    if (Date.now() - attempts.lastAttempt < LOCKOUT_DURATION) {
        return attempts.count < MAX_ATTEMPTS;
    }
    
    // Reset if lockout period passed
    loginAttempts.delete(ip);
    return true;
}

// Record failed attempt
function recordFailedAttempt(ip) {
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(ip, attempts);
}

// Clear attempts on successful login
function clearAttempts(ip) {
    loginAttempts.delete(ip);
}

// Create secure server
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    
    // Set secure headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // CORS - Restrictive policy
    const allowedOrigins = [
        'https://serclarus.github.io',
        'https://theebbubb.github.io',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Admin login endpoint
    if (pathname === '/api/admin-login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { password } = JSON.parse(body);
                const clientIP = req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
                
                // Check rate limiting
                if (!checkRateLimit(clientIP)) {
                    res.writeHead(429, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Too many attempts. Please try again later.',
                        lockoutTime: LOCKOUT_DURATION
                    }));
                    return;
                }
                
                // Validate password
                if (validatePassword(password)) {
                    const token = createSession(clientIP);
                    clearAttempts(clientIP);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        token: token,
                        expires: Date.now() + SESSION_TIMEOUT
                    }));
                } else {
                    recordFailedAttempt(clientIP);
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Invalid password',
                        remainingAttempts: MAX_ATTEMPTS - (loginAttempts.get(clientIP)?.count || 0)
                    }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid request' }));
            }
        });
        return;
    }
    
    // Validate session endpoint
    if (pathname === '/api/validate-session' && req.method === 'POST') {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valid: false, error: 'No token provided' }));
            return;
        }
        
        const token = authHeader.substring(7);
        const clientIP = req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        
        if (validateSession(token, clientIP)) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valid: true }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valid: false, error: 'Invalid or expired session' }));
        }
        return;
    }
    
    // Logout endpoint
    if (pathname === '/api/logout' && req.method === 'POST') {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            activeSessions.delete(token);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }
    
    // Default response
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🔒 Secure Auth Server running on port ${PORT}`);
});

module.exports = server;
