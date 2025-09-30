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

// Load menu data from GitHub API
async function loadMenuData() {
    try {
        console.log('Loading menu data from GitHub API...');
        const response = await fetch('menu-data.json');
        if (response.ok) {
            const data = await response.json();
            menuData = data.menuData || {};
            console.log('✅ Menu data loaded from GitHub API:', menuData);
            return data;
        } else {
            console.log('❌ No menu-data.json found on GitHub');
            return { menuData: {} };
        }
    } catch (error) {
        console.error('❌ Error loading menu data from API:', error);
        return { menuData: {} };
    }
}

// Save menu data to GitHub API ONLY
async function saveMenuData() {
    try {
        console.log('Saving menu data to GitHub API...');
        const data = {
            menuData: menuData,
            categories: HARDCODED_CATEGORIES,
            lastUpdated: Date.now()
        };
        
        // Check if GitHub API is available
        if (typeof saveToGitHub !== 'function') {
            alert('❌ GitHub API not available! Please configure your GitHub token first.');
            return false;
        }
        
        // Save via GitHub API
        const success = await saveToGitHub(data);
        if (success) {
            console.log('✅ Data saved to GitHub API');
            alert('✅ Menu updated successfully! Changes are now live for all customers.');
            return true;
        } else {
            alert('❌ Failed to save to GitHub API. Please check your token and try again.');
            return false;
        }
    } catch (error) {
        console.error('Error saving menu data:', error);
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

// Save menu item (add or edit)
async function saveMenuItem() {
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
    
    // Initialize category if it doesn't exist
    if (!menuData[category]) {
        menuData[category] = {};
    }
    
    const itemData = {
        name: name,
        description: description,
        price: parseFloat(price.replace('₺', '').replace(',', '.').trim())
    };
    
    // Check if we're editing an existing item
    const originalName = document.getElementById('item-name').getAttribute('data-original-name');
    if (originalName && originalName !== name) {
        // Item name changed, delete the old one
        delete menuData[category][originalName];
    }
    
    menuData[category][name] = itemData;
    
    const success = await saveMenuData();
    if (success) {
        alert(`✅ Menu item saved successfully!\n\nCategory: ${category}\nItem: ${name}\nPrice: ${price} TL`);
        clearItemForm();
        loadItemsForCategory(category);
    }
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
    if (itemForm) {
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted, calling saveMenuItem');
            saveMenuItem();
        });
    } else {
        console.error('Item form not found!');
    }
});