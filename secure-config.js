// Secure Configuration Management
const crypto = require('crypto');

class SecureConfig {
    constructor() {
        this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateKey();
        this.githubToken = null;
    }
    
    // Generate encryption key
    generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }
    
    // Encrypt sensitive data
    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    
    // Decrypt sensitive data
    decrypt(encryptedText) {
        const textParts = encryptedText.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encrypted = textParts.join(':');
        const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    
    // Set GitHub token securely
    setGitHubToken(token) {
        this.githubToken = this.encrypt(token);
        return true;
    }
    
    // Get GitHub token securely
    getGitHubToken() {
        if (!this.githubToken) return null;
        try {
            return this.decrypt(this.githubToken);
        } catch (error) {
            console.error('Failed to decrypt GitHub token:', error);
            return null;
        }
    }
    
    // Validate token format
    validateGitHubToken(token) {
        // GitHub tokens are typically 40 characters for personal access tokens
        return token && typeof token === 'string' && token.length >= 20;
    }
}

// Global secure config instance
const secureConfig = new SecureConfig();

module.exports = secureConfig;
