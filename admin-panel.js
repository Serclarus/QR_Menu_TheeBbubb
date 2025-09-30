// Simple Menu Admin - Add/Edit/Delete Menu Items Only
console.log('Simple Menu Admin loaded');

// Hardcoded categories - no API management needed
const HARDCODED_CATEGORIES = {
                            'Sıcak İçecekler': { name: 'Sıcak İçecekler', description: 'Sıcak içecekler', icon: 'hotdrinks_icon.png' },
                            'Soğuk İçecekler': { name: 'Soğuk İçecekler', description: 'Soğuk içecekler', icon: 'colddrinks_icon.png' },
                            'Ana Yemekler': { name: 'Ana Yemekler', description: 'Ana yemekler', icon: 'maindishes_icon.png' },
                            'Tatlılar': { name: 'Tatlılar', description: 'Tatlılar', icon: 'desserts_icon.png' },
                            'Atıştırmalıklar': { name: 'Atıştırmalıklar', description: 'Atıştırmalıklar', icon: 'snacks_icon.png' },
                            'Nargile': { name: 'Nargile', description: 'Nargile', icon: 'hookah_icon.png' }
};

// Global variables
let menuData = {};

// Load menu data from GitHub API with backup recovery
async function loadMenuData() {
    try {
        console.log('📥 Loading menu data from GitHub API...');
        const response = await fetch(`menu-data.json?t=${Date.now()}`);
        if (response.ok) {
            const data = await response.json();
            menuData = data.menuData || {};
            console.log('✅ Menu data loaded from GitHub API:', menuData);
            
            // Check if we have a newer backup
            const backupData = localStorage.getItem('menuDataBackup');
            const backupTime = localStorage.getItem('menuDataBackupTime');
            
            if (backupData && backupTime) {
                const backupTimestamp = parseInt(backupTime);
                const apiTimestamp = data.lastUpdated || 0;
                
                if (backupTimestamp > apiTimestamp) {
                    console.log('🔄 Found newer backup data, restoring...');
                    const backup = JSON.parse(backupData);
                    menuData = backup.menuData || {};
                    
                    // Try to save the backup to GitHub
                    try {
                        await saveMenuData();
                        console.log('✅ Backup data restored and saved to GitHub');
                    } catch (error) {
                        console.warn('⚠️ Could not save backup to GitHub:', error.message);
                    }
                }
            }
            
            return data;
        } else {
            console.log('❌ No menu-data.json found on GitHub');
            
            // Try to restore from backup
            const backupData = localStorage.getItem('menuDataBackup');
            if (backupData) {
                console.log('🔄 Restoring from backup...');
                const backup = JSON.parse(backupData);
                menuData = backup.menuData || {};
                alert('⚠️ Using backup data. Please check your GitHub connection.');
                return backup;
            }
            
            alert('⚠️ No menu data found. Please add some menu items first.');
            return { menuData: {} };
        }
    } catch (error) {
        console.error('❌ Error loading menu data from API:', error);
        
        // Try to restore from backup
        const backupData = localStorage.getItem('menuDataBackup');
        if (backupData) {
            console.log('🔄 Restoring from backup due to error...');
            const backup = JSON.parse(backupData);
            menuData = backup.menuData || {};
            alert('⚠️ Using backup data due to connection error.');
            return backup;
        }
        
        alert('❌ Failed to load menu data from GitHub. Please check your connection.');
        return { menuData: {} };
    }
}

// Save menu data to GitHub API with backup mechanism
async function saveMenuData() {
    try {
        console.log('💾 Saving menu data to GitHub API...');
        const data = {
            menuData: menuData,
            categories: HARDCODED_CATEGORIES,
            lastUpdated: Date.now()
        };
        
        console.log('📊 Data being sent to GitHub:', data);
        
        // Check if GitHub API is available
        if (typeof saveToGitHub !== 'function') {
            console.error('❌ saveToGitHub function not found');
            alert('❌ GitHub API not available! Please configure your GitHub token first.');
            return false;
        }
        
        // Check if GitHub API is configured
        if (!window.githubAPI || !window.githubAPI.token) {
            console.error('❌ GitHub API not configured');
            alert('❌ GitHub API not configured! Please set your GitHub token in the GitHub API section.');
            return false;
        }
        
        // 🔒 BACKUP: Save to localStorage as backup
        try {
            localStorage.setItem('menuDataBackup', JSON.stringify(data));
            localStorage.setItem('menuDataBackupTime', Date.now().toString());
            console.log('💾 Data backed up to localStorage');
        } catch (backupError) {
            console.warn('⚠️ Could not backup to localStorage:', backupError.message);
        }
        
        // Save via GitHub API with retry mechanism
        let success = false;
        let attempt = 1;
        const maxAttempts = 3;
        
        while (attempt <= maxAttempts && !success) {
            try {
                console.log(`🔄 GitHub API attempt ${attempt}/${maxAttempts}...`);
                success = await saveToGitHub(data);
                
                if (success) {
                    console.log('✅ Data saved to GitHub API successfully');
                    
                    // Clear backup after successful save
                    localStorage.removeItem('menuDataBackup');
                    localStorage.removeItem('menuDataBackupTime');
                    
                    alert('✅ Menu updated successfully! Changes are now live for all customers.');
                    return true;
                } else {
                    console.warn(`⚠️ GitHub API attempt ${attempt} failed`);
                    attempt++;
                    if (attempt <= maxAttempts) {
                        console.log(`⏳ Waiting 2 seconds before retry...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            } catch (error) {
                console.error(`❌ GitHub API attempt ${attempt} error:`, error);
                attempt++;
                if (attempt <= maxAttempts) {
                    console.log(`⏳ Waiting 2 seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        
        if (!success) {
            console.error('❌ All GitHub API attempts failed');
            alert('❌ Failed to save to GitHub API after multiple attempts. Data is backed up locally. Please check your token and try again.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error saving menu data:', error);
        alert('❌ Error saving to API: ' + error.message);
        return false;
    }
}

// Navigation functions
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.admin-nav button');
    navButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for menu items section
    if (sectionId === 'menu-items') {
        loadCategoriesForDropdown();
    }
}

function returnToMenu() {
    window.location.href = 'index.html';
}

function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}

// Load categories for dropdown
async function loadCategoriesForDropdown() {
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select category...</option>';
        
        for (const [name, category] of Object.entries(HARDCODED_CATEGORIES)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            categorySelect.appendChild(option);
        }
    }
}

// Load items for selected category
async function loadItemsForCategory(category) {
    const itemList = document.getElementById('items-list');
    if (itemList) {
        itemList.innerHTML = '';
        
        const items = menuData[category] || {};
            
            if (Object.keys(items).length === 0) {
            itemList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No items in this category.</p>';
        return;
    }
    
            for (const [name, item] of Object.entries(items)) {
                const itemElement = document.createElement('div');
                itemElement.className = 'item';
                itemElement.style.cssText = `
                    background: white;
                    padding: 1rem;
                    margin: 0.5rem 0;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                `;
                itemElement.innerHTML = `
                    <div class="item-info">
                        <h3 style="margin: 0 0 0.5rem 0; color: #2c3e50;">${name}</h3>
                    <p style="margin: 0 0 0.5rem 0; color: #666;">${item.description || 'No description'}</p>
                        <p style="margin: 0; color: #e67e22; font-weight: bold;">₺${item.price}</p>
                    </div>
                    <div class="item-actions">
                    <button onclick="editItem('${category}', '${name}')" style="background: #3498db; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-right: 0.5rem; cursor: pointer;">Edit</button>
                    <button onclick="deleteItem('${category}', '${name}')" style="background: #e74c3c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Delete</button>
                    </div>
                `;
                itemList.appendChild(itemElement);
            }
    }
}

// 🔒 SECURE: Save menu item with XSS prevention
async function saveMenuItem() {
    try {
        console.log('saveMenuItem called');
        const category = document.getElementById('item-category').value;
        const name = document.getElementById('item-name').value;
        const description = document.getElementById('item-description').value;
        const price = document.getElementById('item-price').value;
        
        console.log('Form values:', { category, name, description, price });
        
        if (!category || !name || !price) {
            alert('Please fill in all required fields');
            return;
        }
    
    // 🔒 XSS PREVENTION: Sanitize all inputs
    const sanitizedData = {
        category: sanitizeInput(category),
        name: sanitizeInput(name),
        description: sanitizeInput(description),
        price: parseFloat(price.replace('₺', '').replace(',', '.').trim())
    };
    
    // Validate sanitized data
    if (!sanitizedData.name || sanitizedData.name.length > 100) {
        alert('Item name is required and must be less than 100 characters');
        return;
    }
    
    if (sanitizedData.description && sanitizedData.description.length > 500) {
        alert('Description must be less than 500 characters');
        return;
    }
    
    if (isNaN(sanitizedData.price) || sanitizedData.price < 0 || sanitizedData.price > 10000) {
        alert('Price must be a valid number between 0 and 10000');
        return;
    }
    
    // Initialize category if it doesn't exist
    if (!menuData[sanitizedData.category]) {
        menuData[sanitizedData.category] = {};
    }
    
    const itemData = {
        name: sanitizedData.name,
        description: sanitizedData.description,
        price: sanitizedData.price
    };
    
    // Check if we're editing an existing item
    const originalName = document.getElementById('item-name').getAttribute('data-original-name');
    if (originalName && originalName !== sanitizedData.name) {
        // Item name changed, delete the old one
        delete menuData[sanitizedData.category][originalName];
    }
    
    menuData[sanitizedData.category][sanitizedData.name] = itemData;
    
        console.log('Updated menuData before saving:', menuData);
        const success = await saveMenuData();
        if (success) {
            alert(`✅ Menu item saved successfully!\n\nCategory: ${sanitizedData.category}\nItem: ${sanitizedData.name}\nPrice: ${sanitizedData.price} TL`);
            clearItemForm();
            loadItemsForCategory(sanitizedData.category);
        }
    } catch (error) {
        console.error('Error in saveMenuItem:', error);
        alert('❌ Error saving menu item: ' + error.message);
    }
}

// 🔒 XSS PREVENTION: Sanitize user input
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
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

// Edit existing item
async function editItem(category, itemName) {
        const item = menuData[category] && menuData[category][itemName];
        
        if (item) {
            document.getElementById('item-category').value = category;
            document.getElementById('item-name').value = itemName;
            document.getElementById('item-name').setAttribute('data-original-name', itemName);
            document.getElementById('item-description').value = item.description || '';
            document.getElementById('item-price').value = item.price || '';
            
        // Change button text
            const submitButton = document.querySelector('#item-form button[type="submit"]');
            if (submitButton) {
            submitButton.textContent = 'Update Item';
            submitButton.style.backgroundColor = '#e67e22';
            }
            
        // Show cancel button
            const cancelBtn = document.getElementById('cancel-edit-btn');
            if (cancelBtn) {
                cancelBtn.style.display = 'inline-block';
            }
    }
}

// Delete item
async function deleteItem(category, itemName) {
    if (confirm(`Delete item "${itemName}"?`)) {
        if (menuData[category] && menuData[category][itemName]) {
            delete menuData[category][itemName];
            
            const success = await saveMenuData();
            if (success) {
                alert('Item deleted successfully!');
                loadItemsForCategory(category);
            }
        }
    }
}

// Clear form
function clearItemForm() {
    document.getElementById('item-name').value = '';
    document.getElementById('item-name').removeAttribute('data-original-name');
    document.getElementById('item-description').value = '';
    document.getElementById('item-price').value = '';
    
    // Reset button
    const submitButton = document.querySelector('#item-form button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Add Item';
        submitButton.style.backgroundColor = '#27ae60';
    }
    
    // Hide cancel button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
}

// Cancel edit
function cancelEdit() {
    clearItemForm();
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Simple Menu Admin initialized');
    
    try {
        // Load initial data
        await loadMenuData();
        await loadCategoriesForDropdown();
        
        console.log('Menu admin ready');
    } catch (error) {
        console.error('Error initializing menu admin:', error);
    }
    
    // Set up event listeners
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            if (selectedCategory) {
                loadItemsForCategory(selectedCategory);
            } else {
                document.getElementById('items-list').innerHTML = '';
            }
        });
    }
    
    // Set up form submission
    const itemForm = document.getElementById('item-form');
    console.log('Item form element:', itemForm);
    if (itemForm) {
        console.log('Adding form submission listener');
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted, calling saveMenuItem');
            saveMenuItem();
        });
        console.log('Form submission listener added');
        
        // Also add click listener to submit button as backup
        const submitButton = itemForm.querySelector('button[type="submit"]');
        console.log('Submit button:', submitButton);
        if (submitButton) {
            submitButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Submit button clicked, calling saveMenuItem');
                saveMenuItem();
            });
            console.log('Submit button click listener added');
        }
    } else {
        console.error('Item form not found!');
    }
});