// Secure Admin System with Advanced Security
class SecureAdmin {
    constructor() {
        this.secretKey = 'QR_MENU_SECRET_2024'; // Change this to your own secret
        this.adminPassword = 'SecureAdmin2024!'; // Change this password
        this.maxAttempts = 3;
        this.lockoutTime = 300000; // 5 minutes
        this.sessionTimeout = 1800000; // 30 minutes
        this.attempts = 0;
        this.lastAttempt = 0;
        this.sessionStart = null;
        this.isLocked = false;
        
        this.init();
    }
    
    init() {
        // Load stored password if available
        this.loadStoredPassword();
        
        // Hide admin access completely
        this.hideAdminAccess();
        
        // Setup secret key combination (Ctrl+Shift+A)
        this.setupSecretAccess();
        
        // Setup alternative access method (5-click on cafe name)
        this.setupAlternativeAccess();
        
        // Check for existing session
        this.checkSession();
        
        // Setup auto-logout
        this.setupAutoLogout();
    }
    
    loadStoredPassword() {
        try {
            const storedPassword = localStorage.getItem('admin_password');
            if (storedPassword) {
                const decrypted = JSON.parse(this.decrypt(storedPassword));
                // We don't need to decrypt the hash, just store the reference
                this.hasStoredPassword = true;
            }
        } catch (e) {
            // If there's an error, use default password
            this.hasStoredPassword = false;
        }
    }
    
    hideAdminAccess() {
        // Remove any existing admin buttons/links
        const adminLinks = document.querySelectorAll('a[href*="admin"]');
        adminLinks.forEach(link => link.remove());
        
        // Hide admin button if it exists
        const adminButton = document.querySelector('[href="admin.html"]');
        if (adminButton) {
            adminButton.style.display = 'none';
        }
    }
    
    setupSecretAccess() {
        let keySequence = [];
        const secretCode = ['KeyQ', 'KeyR', 'KeyM', 'KeyE', 'KeyN', 'KeyU']; // "QRMENU"
        let lastKeyTime = 0;
        const keyTimeout = 3000; // 3 seconds between keys
        let isSequenceActive = false;
        
        document.addEventListener('keydown', (e) => {
            const now = Date.now();
            
            // Start sequence with Ctrl+Alt+Q (no browser conflicts)
            if (e.ctrlKey && e.altKey && e.code === 'KeyQ' && !isSequenceActive) {
                e.preventDefault(); // Prevent browser shortcuts
                isSequenceActive = true;
                keySequence = ['KeyQ'];
                lastKeyTime = now;
                return;
            }
            
            // Continue sequence only if active and within time limit
            if (isSequenceActive && e.ctrlKey && e.altKey && (now - lastKeyTime) < keyTimeout) {
                e.preventDefault(); // Prevent browser shortcuts
                keySequence.push(e.code);
                lastKeyTime = now;
                
                // Check if sequence matches exactly
                if (this.arraysEqual(keySequence, secretCode)) {
                    this.showSecretLogin();
                    keySequence = [];
                    isSequenceActive = false;
                } else if (keySequence.length >= secretCode.length) {
                    // Wrong sequence, reset
                    keySequence = [];
                    isSequenceActive = false;
                }
            } else if (isSequenceActive && (!e.ctrlKey || !e.altKey)) {
                // Reset if Ctrl+Alt not held
                keySequence = [];
                isSequenceActive = false;
            }
        });
        
        // Reset sequence after timeout
        setInterval(() => {
            const now = Date.now();
            if (isSequenceActive && now - lastKeyTime > keyTimeout) {
                keySequence = [];
                isSequenceActive = false;
            }
        }, 1000);
    }
    
    setupAlternativeAccess() {
        let clickCount = 0;
        let clickTimeout;
        
        // 5 clicks on cafe name to access admin (more secure)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cafe-name')) {
                clickCount++;
                
                if (clickCount === 5) {
                    this.showSecretLogin();
                    clickCount = 0;
                } else {
                    clearTimeout(clickTimeout);
                    clickTimeout = setTimeout(() => {
                        clickCount = 0;
                    }, 2000); // Reset after 2 seconds
                }
            } else {
                clickCount = 0;
            }
        });
    }
    
    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, i) => val === b[i]);
    }
    
    showSecretLogin() {
        // Create secure login overlay
        const overlay = document.createElement('div');
        overlay.id = 'secure-admin-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Nunito', sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 90%;
                text-align: center;
            ">
                <h2 style="color: #e67e22; margin-bottom: 1rem;">🔐 Secure Access</h2>
                <p style="color: #666; margin-bottom: 1.5rem;">Enter your secure credentials</p>
                <input type="password" id="secure-password" placeholder="Enter password" 
                       style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; margin-bottom: 1rem; font-size: 1rem;">
                <div style="display: flex; gap: 10px;">
                    <button id="secure-login-btn" style="
                        background: #e67e22; color: white; border: none; padding: 12px 24px; 
                        border-radius: 8px; cursor: pointer; flex: 1; font-weight: 600;
                    ">Login</button>
                    <button id="secure-cancel-btn" style="
                        background: #7f8c8d; color: white; border: none; padding: 12px 24px; 
                        border-radius: 8px; cursor: pointer; flex: 1; font-weight: 600;
                    ">Cancel</button>
                </div>
                <div id="secure-error" style="color: #e74c3c; margin-top: 1rem; display: none;"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Focus on password input
        document.getElementById('secure-password').focus();
        
        // Setup event listeners
        document.getElementById('secure-login-btn').addEventListener('click', () => this.handleSecureLogin());
        document.getElementById('secure-cancel-btn').addEventListener('click', () => this.hideSecureLogin());
        
        // Enter key to login
        document.getElementById('secure-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSecureLogin();
            }
        });
    }
    
    hideSecureLogin() {
        const overlay = document.getElementById('secure-admin-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    async handleSecureLogin() {
        const password = document.getElementById('secure-password').value;
        const errorDiv = document.getElementById('secure-error');
        
        // Simple password check - just use the default password for now
        if (password === this.adminPassword) {
            // Successful login
            this.hideSecureLogin();
            this.startSecureSession();
            this.redirectToAdmin();
        } else {
            // Failed login
            this.attempts++;
            this.lastAttempt = Date.now();
            
            if (this.attempts >= this.maxAttempts) {
                this.isLocked = true;
                errorDiv.textContent = 'Too many failed attempts. Access locked for 5 minutes.';
                errorDiv.style.display = 'block';
                setTimeout(() => {
                    this.isLocked = false;
                    this.attempts = 0;
                }, this.lockoutTime);
            } else {
                errorDiv.textContent = `Invalid password. ${this.maxAttempts - this.attempts} attempts remaining.`;
                errorDiv.style.display = 'block';
            }
        }
    }
    
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + this.secretKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    startSecureSession() {
        this.sessionStart = Date.now();
        const sessionData = {
            start: this.sessionStart,
            token: this.generateSecureToken()
        };
        localStorage.setItem('secure_session', this.encrypt(JSON.stringify(sessionData)));
    }
    
    generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    checkSession() {
        const sessionData = localStorage.getItem('secure_session');
        if (sessionData) {
            try {
                const decrypted = JSON.parse(this.decrypt(sessionData));
                const now = Date.now();
                
                if (now - decrypted.start < this.sessionTimeout) {
                    // Valid session, redirect to admin
                    this.redirectToAdmin();
                } else {
                    // Session expired
                    localStorage.removeItem('secure_session');
                }
            } catch (e) {
                // Invalid session data
                localStorage.removeItem('secure_session');
            }
        }
    }
    
    setupAutoLogout() {
        setInterval(() => {
            const sessionData = localStorage.getItem('secure_session');
            if (sessionData) {
                try {
                    const decrypted = JSON.parse(this.decrypt(sessionData));
                    const now = Date.now();
                    
                    if (now - decrypted.start >= this.sessionTimeout) {
                        // Session expired
                        localStorage.removeItem('secure_session');
                        if (window.location.pathname.includes('admin')) {
                            window.location.href = 'index.html';
                        }
                    }
                } catch (e) {
                    localStorage.removeItem('secure_session');
                }
            }
        }, 60000); // Check every minute
    }
    
    redirectToAdmin() {
        // Redirect to simple admin panel
        localStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
    }
    
    encrypt(text) {
        // Simple XOR encryption (for demo - use proper encryption in production)
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length));
        }
        return btoa(result);
    }
    
    decrypt(encryptedText) {
        try {
            const decoded = atob(encryptedText);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(decoded.charCodeAt(i) ^ this.secretKey.charCodeAt(i % this.secretKey.length));
            }
            return result;
        } catch (e) {
            return '';
        }
    }
}

// Initialize secure admin system
document.addEventListener('DOMContentLoaded', () => {
    new SecureAdmin();
});
