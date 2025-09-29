const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Data storage file
const DATA_FILE = './menu-data.json';

// Function to read data from file
function readData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading data file:', error);
    }
    return {};
}

// Function to write data to file
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data file:', error);
        return false;
    }
}

// In-memory session storage for admin authentication
const adminSessions = new Map();

// Rate limiting for admin login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Function to validate admin session
function validateAdminSession(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
    }
    
    const token = authHeader.substring(7);
    const session = adminSessions.get(token);
    
    if (!session) {
        return false;
    }
    
    // Check if session is expired (30 minutes)
    const now = Date.now();
    if (now - session.loginTime > 30 * 60 * 1000) {
        adminSessions.delete(token);
        return false;
    }
    
    return true;
}

// Function to create admin session
function createAdminSession() {
    const token = Math.random().toString(36) + Date.now().toString(36);
    adminSessions.set(token, {
        loginTime: Date.now(),
        ip: 'local' // In production, get real IP
    });
    return token;
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Handle API endpoints with authentication
    if (pathname === '/api/menu-data' && req.method === 'GET') {
        // GET requests are allowed for public menu display (read-only)
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(data));
        return;
    }
    
    // Public menu data endpoint (read-only for customers)
    if (pathname === '/api/public-menu' && req.method === 'GET') {
        const data = readData();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(data));
        return;
    }
    
    if (pathname === '/api/menu-data' && req.method === 'POST') {
        // POST requests require admin authentication
        if (!validateAdminSession(req)) {
            res.writeHead(401, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: false, error: 'Unauthorized - Admin access required' }));
            return;
        }
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                if (writeData(data)) {
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ success: false, error: 'Failed to save data' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
        return;
    }
    
    // Admin login endpoint with rate limiting
    if (pathname === '/api/admin-login' && req.method === 'POST') {
        const clientIP = req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
        const now = Date.now();
        
        // Check rate limiting
        if (loginAttempts.has(clientIP)) {
            const attempts = loginAttempts.get(clientIP);
            if (attempts.count >= MAX_ATTEMPTS) {
                if (now - attempts.lastAttempt < LOCKOUT_DURATION) {
                    res.writeHead(429, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Too many attempts. Please try again later.',
                        lockoutTime: LOCKOUT_DURATION - (now - attempts.lastAttempt)
                    }));
                    return;
                } else {
                    // Reset attempts after lockout period
                    loginAttempts.delete(clientIP);
                }
            }
        }
        
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { password } = JSON.parse(body);
                const expectedPassword = 'Thee2025Bbubb!'; // Decoded from client obfuscation
                
                if (password === expectedPassword) {
                    // Successful login - clear attempts
                    loginAttempts.delete(clientIP);
                    const token = createAdminSession();
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ success: true, token: token }));
                } else {
                    // Failed login - increment attempts
                    if (!loginAttempts.has(clientIP)) {
                        loginAttempts.set(clientIP, { count: 0, lastAttempt: 0 });
                    }
                    const attempts = loginAttempts.get(clientIP);
                    attempts.count++;
                    attempts.lastAttempt = now;
                    
                    res.writeHead(401, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Invalid password',
                        remainingAttempts: MAX_ATTEMPTS - attempts.count
                    }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
        return;
    }
    
    // Handle CORS for all requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Security: Block direct access to sensitive files
    if (filePath.includes('menu-data.json') || 
        filePath.includes('.env') || 
        filePath.includes('config.json')) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Access Forbidden</h1><p>This file is protected and cannot be accessed directly.</p>');
        return;
    }

    // Serve static files
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 8000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`🚀 Server running at http://192.168.52.171:${PORT}`);
    console.log(`📱 Access from your phone: http://192.168.52.171:${PORT}`);
    console.log(`💻 Local access: http://localhost:${PORT}`);
});
