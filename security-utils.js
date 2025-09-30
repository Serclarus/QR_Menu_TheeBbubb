// Security Utilities for XSS Prevention and Input Validation

// HTML sanitization function
function sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    
    // Remove all HTML tags and attributes
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .trim();
}

// Escape HTML entities
function escapeHTML(text) {
    if (typeof text !== 'string') return '';
    
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// Validate menu item data
function validateMenuItem(itemData) {
    const errors = [];
    
    // Validate name
    if (!itemData.name || typeof itemData.name !== 'string') {
        errors.push('Item name is required');
    } else if (itemData.name.length > 100) {
        errors.push('Item name too long (max 100 characters)');
    } else if (!/^[a-zA-Z0-9\s\-\.\u00C0-\u017F]+$/.test(itemData.name)) {
        errors.push('Item name contains invalid characters');
    }
    
    // Validate description
    if (itemData.description && typeof itemData.description === 'string') {
        if (itemData.description.length > 500) {
            errors.push('Description too long (max 500 characters)');
        }
    }
    
    // Validate price
    if (!itemData.price || typeof itemData.price !== 'number') {
        errors.push('Valid price is required');
    } else if (itemData.price < 0 || itemData.price > 10000) {
        errors.push('Price must be between 0 and 10000');
    }
    
    // Validate category
    if (!itemData.category || typeof itemData.category !== 'string') {
        errors.push('Category is required');
    } else {
        const allowedCategories = [
            'Sıcak İçecekler',
            'Soğuk İçecekler', 
            'Ana Yemekler',
            'Tatlılar',
            'Atıştırmalıklar',
            'Nargile'
        ];
        if (!allowedCategories.includes(itemData.category)) {
            errors.push('Invalid category');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Sanitize menu item data
function sanitizeMenuItem(itemData) {
    return {
        name: sanitizeHTML(itemData.name),
        description: sanitizeHTML(itemData.description || ''),
        price: parseFloat(itemData.price) || 0,
        category: sanitizeHTML(itemData.category)
    };
}

// Validate and sanitize menu data
function validateAndSanitizeMenuData(menuData) {
    const sanitizedData = {
        menuData: {},
        categories: menuData.categories || {},
        lastUpdated: Date.now()
    };
    
    // Validate and sanitize each category
    for (const [categoryName, items] of Object.entries(menuData.menuData || {})) {
        if (typeof items !== 'object' || items === null) continue;
        
        sanitizedData.menuData[categoryName] = {};
        
        for (const [itemName, itemData] of Object.entries(items)) {
            if (typeof itemData !== 'object' || itemData === null) continue;
            
            const sanitizedItem = sanitizeMenuItem({
                ...itemData,
                category: categoryName
            });
            
            const validation = validateMenuItem(sanitizedItem);
            if (validation.isValid) {
                sanitizedData.menuData[categoryName][sanitizedItem.name] = {
                    name: sanitizedItem.name,
                    description: sanitizedItem.description,
                    price: sanitizedItem.price
                };
            }
        }
    }
    
    return sanitizedData;
}

// Content Security Policy headers
function getCSPHeaders() {
    return {
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://api.github.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "connect-src 'self' https://api.github.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; ')
    };
}

// Rate limiting for API endpoints
class RateLimiter {
    constructor(maxRequests = 100, windowMs = 15 * 60 * 1000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }
    
    isAllowed(ip) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        // Clean old entries
        for (const [key, timestamp] of this.requests.entries()) {
            if (timestamp < windowStart) {
                this.requests.delete(key);
            }
        }
        
        // Count requests from this IP
        const ipRequests = Array.from(this.requests.entries())
            .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart);
        
        if (ipRequests.length >= this.maxRequests) {
            return false;
        }
        
        // Record this request
        this.requests.set(`${ip}-${now}`, now);
        return true;
    }
}

module.exports = {
    sanitizeHTML,
    escapeHTML,
    validateMenuItem,
    sanitizeMenuItem,
    validateAndSanitizeMenuData,
    getCSPHeaders,
    RateLimiter
};
