// Secure Admin Panel with Advanced Security Features
class SecureAdminPanel {
    constructor() {
        this.secretKey = 'QR_MENU_SECRET_2024';
        this.adminPassword = 'SecureAdmin2024!';
        this.maxAttempts = 3;
        this.lockoutTime = 300000; // 5 minutes
        this.sessionTimeout = 1800000; // 30 minutes
        this.attempts = 0;
        this.lastAttempt = 0;
        this.isLocked = false;
        
        this.init();
    }
    
    init() {
        // Check if we have a valid token
        this.checkToken();
        
        // Setup security features
        this.setupSecurity();
        
        // Setup auto-logout
        this.setupAutoLogout();
        
        // Setup form validation
        this.setupFormValidation();
    }
    
    checkToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const storedToken = localStorage.getItem('admin_token');
        
        if (!token || !storedToken || token !== storedToken) {
            this.redirectToLogin();
            return;
        }
        
        // Check session validity
        this.checkSession();
    }
    
    checkSession() {
        const sessionData = localStorage.getItem('secure_session');
        if (!sessionData) {
            this.redirectToLogin();
            return;
        }
        
        try {
            const decrypted = JSON.parse(this.decrypt(sessionData));
            const now = Date.now();
            
            if (now - decrypted.start >= this.sessionTimeout) {
                this.logout();
                return;
            }
            
            // Session is valid, show admin panel
            this.showAdminPanel();
        } catch (e) {
            this.redirectToLogin();
        }
    }
    
    showAdminPanel() {
        document.getElementById('security-check').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        
        // Load existing data
        this.loadMenuData();
    }
    
    setupSecurity() {
        // Prevent right-click
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Prevent F12, Ctrl+Shift+I, etc.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
            }
        });
        
        // Clear clipboard on focus loss
        window.addEventListener('blur', () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText('');
            }
        });
        
        // Disable text selection
        document.addEventListener('selectstart', e => e.preventDefault());
    }
    
    setupAutoLogout() {
        setInterval(() => {
            const sessionData = localStorage.getItem('secure_session');
            if (sessionData) {
                try {
                    const decrypted = JSON.parse(this.decrypt(sessionData));
                    const now = Date.now();
                    
                    if (now - decrypted.start >= this.sessionTimeout) {
                        this.logout();
                    }
                } catch (e) {
                    this.logout();
                }
            }
        }, 60000); // Check every minute
        
        // Activity tracking
        let lastActivity = Date.now();
        document.addEventListener('mousemove', () => lastActivity = Date.now());
        document.addEventListener('keypress', () => lastActivity = Date.now());
        
        setInterval(() => {
            if (Date.now() - lastActivity > 300000) { // 5 minutes of inactivity
                this.logout();
            }
        }, 60000);
    }
    
    setupFormValidation() {
        // Sanitize all inputs
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                // Remove potentially dangerous characters
                e.target.value = e.target.value.replace(/[<>'"&]/g, '');
            });
        });
    }
    
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + this.secretKey);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    encrypt(text) {
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
    
    logout() {
        localStorage.removeItem('secure_session');
        localStorage.removeItem('admin_token');
        window.location.href = 'index.html';
    }
    
    redirectToLogin() {
        window.location.href = 'index.html';
    }
    
    loadMenuData() {
        // Load cafe info
        const cafeData = JSON.parse(localStorage.getItem('cafeData') || '{}');
        if (cafeData.name) {
            document.getElementById('cafe-name').value = cafeData.name;
        }
        if (cafeData.image) {
            document.getElementById('cafe-image').value = cafeData.image;
            const preview = document.getElementById('image-preview');
            preview.src = cafeData.image;
            preview.style.display = 'block';
        }
    }
    
    async changePassword() {
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validation
        if (newPassword.length < 8) {
            this.showMessage('Şifre en az 8 karakter olmalıdır!', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showMessage('Şifreler eşleşmiyor!', 'error');
            return;
        }
        
        // Check if password contains required elements
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            this.showMessage('Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir!', 'error');
            return;
        }
        
        // Hash the new password
        const hashedNewPassword = await this.hashPassword(newPassword);
        
        // Store the hashed password securely
        const passwordData = {
            hash: hashedNewPassword,
            timestamp: Date.now()
        };
        
        localStorage.setItem('admin_password', this.encrypt(JSON.stringify(passwordData)));
        
        // Update current session password
        this.adminPassword = newPassword;
        
        this.showMessage('Şifre başarıyla değiştirildi!', 'success');
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    }
    
    clearAllData() {
        if (confirm('Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            localStorage.clear();
            this.showMessage('Tüm veriler silindi!', 'success');
            setTimeout(() => {
                this.logout();
            }, 2000);
        }
    }
    
    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        const activeSection = document.querySelector('.admin-section.active');
        if (activeSection) {
            activeSection.insertBefore(messageDiv, activeSection.firstChild);
        }
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}

// Initialize secure admin panel
document.addEventListener('DOMContentLoaded', () => {
    window.secureAdmin = new SecureAdminPanel();
});

// Global functions for HTML onclick events
function logout() {
    if (window.secureAdmin) {
        window.secureAdmin.logout();
    }
}

function changePassword() {
    if (window.secureAdmin) {
        window.secureAdmin.changePassword();
    }
}

function clearAllData() {
    if (window.secureAdmin) {
        window.secureAdmin.clearAllData();
    }
}

function returnToMenu() {
    // Clear all admin sessions and return to main menu
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('secure_session');
    localStorage.removeItem('admin_token');
    window.location.href = 'index.html';
}

function exportData() {
    const menuData = localStorage.getItem('menuData');
    const cafeData = localStorage.getItem('cafeData');
    const categories = localStorage.getItem('categories');
    
    const exportData = {
        menuData: JSON.parse(menuData || '{}'),
        cafeData: JSON.parse(cafeData || '{}'),
        categories: JSON.parse(categories || '{}')
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'menu-backup.json';
    link.click();
    
    if (window.secureAdmin) {
        window.secureAdmin.showMessage('Veriler yedeklendi!', 'success');
    }
}

function importData() {
    document.getElementById('import-file').click();
}

function handleImport() {
    const file = document.getElementById('import-file').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.menuData) {
                localStorage.setItem('menuData', JSON.stringify(data.menuData));
            }
            if (data.cafeData) {
                localStorage.setItem('cafeData', JSON.stringify(data.cafeData));
            }
            if (data.categories) {
                localStorage.setItem('categories', JSON.stringify(data.categories));
            }
            
            if (window.secureAdmin) {
                window.secureAdmin.showMessage('Veriler geri yüklendi!', 'success');
                window.secureAdmin.loadMenuData();
            }
        } catch (error) {
            if (window.secureAdmin) {
                window.secureAdmin.showMessage('Dosya formatı hatalı!', 'error');
            }
        }
    };
    reader.readAsText(file);
}
