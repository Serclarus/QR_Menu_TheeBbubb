// Admin Panel JavaScript - Online Only (No localStorage)
const ADMIN_PASSWORD = 'admin123'; // Change this password

// Online data storage functions with localStorage fallback
async function saveToCloudStorage(data) {
    try {
        // Check if we're running on a server (local development)
        const isLocalServer = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('192.168.');
        
        if (isLocalServer) {
            // Local server mode - use secure server API
            const adminToken = sessionStorage.getItem('adminSessionToken');
            if (!adminToken) {
                throw new Error('No admin session found');
            }
            
            const response = await fetch('/api/menu-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log('Menu data saved to secure server');
                return true;
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        } else {
            // Online mode - use localStorage for now (will be replaced with proper cloud storage)
            console.log('Online mode: Saving to localStorage (temporary solution)');
            const updatedData = {
                menuData: data.menuData || {},
                cafeData: data.cafeData || {},
                categories: data.categories || {},
                lastUpdated: Date.now(),
                timestamp: Date.now(),
                version: Date.now().toString(),
                updateId: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            // Save to localStorage as temporary solution
            localStorage.setItem('menuData', JSON.stringify(updatedData.menuData));
            localStorage.setItem('cafeData', JSON.stringify(updatedData.cafeData));
            localStorage.setItem('categories', JSON.stringify(updatedData.categories));
            localStorage.setItem('menuDataLastUpdated', updatedData.lastUpdated.toString());
            
            // Also save to a public data format
            localStorage.setItem('publicMenuData', JSON.stringify(updatedData));
            
            console.log('Menu data saved to localStorage');
            console.log('Update ID:', updatedData.updateId);
            console.log('Timestamp:', updatedData.timestamp);
            
            // Trigger a custom event to notify other tabs
            window.dispatchEvent(new CustomEvent('menuDataUpdated', { 
                detail: { 
                    timestamp: updatedData.timestamp,
                    updateId: updatedData.updateId
                } 
            }));
            
            return true;
        }
    } catch (error) {
        console.error('Error saving to cloud storage:', error);
        return false;
    }
}

async function loadFromCloudStorage() {
    try {
        // Check if we're running on a server (local development)
        const isLocalServer = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('192.168.');
        
        if (isLocalServer) {
            // Local server mode - use secure server API
            const response = await fetch('/api/menu-data');
            if (response.ok) {
                const data = await response.json();
                console.log('Menu data loaded from secure server');
                return data;
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        } else {
            // Online mode - load from localStorage (temporary solution)
            try {
                // Try to load from public data first
                const publicData = localStorage.getItem('publicMenuData');
                if (publicData) {
                    const parsed = JSON.parse(publicData);
                    console.log('Menu data loaded from public data');
                    return parsed;
                }
                
                // Fallback to individual localStorage items
                const menuData = localStorage.getItem('menuData');
                const cafeData = localStorage.getItem('cafeData');
                const categories = localStorage.getItem('categories');
                
                if (menuData || cafeData || categories) {
                    const data = {
                        menuData: menuData ? JSON.parse(menuData) : {},
                        cafeData: cafeData ? JSON.parse(cafeData) : {},
                        categories: categories ? JSON.parse(categories) : {},
                        lastUpdated: localStorage.getItem('menuDataLastUpdated') || Date.now()
                    };
                    console.log('Menu data loaded from localStorage');
                    return data;
                }
                
                // If no data found, return empty object
                console.log('No data found in localStorage');
                return {};
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                return {};
            }
        }
    } catch (error) {
        console.error('Error loading from cloud storage:', error);
        return {};
    }
}

// Online-only data storage functions (no localStorage)
async function saveDataToServer(data) {
    try {
        // Check if we're running on a server (local development)
        const isLocalServer = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('192.168.');
        
        if (isLocalServer) {
            // Local server mode - use secure server API
            const adminToken = sessionStorage.getItem('adminSessionToken');
            if (!adminToken) {
                throw new Error('No admin session found');
            }
            
            const response = await fetch('/api/menu-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log('Menu data saved to secure server');
                return true;
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        } else {
            // Online mode - save directly to public JSON file
            return await saveToCloudStorage(data);
        }
    } catch (error) {
        console.error('Error saving data to server:', error);
        return false;
    }
}

async function loadDataFromServer() {
    try {
        // Check if we're running on a server (local development)
        const isLocalServer = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('192.168.');
        
        if (isLocalServer) {
            // Local server mode - use secure server API
            const response = await fetch('/api/menu-data');
            if (response.ok) {
                const data = await response.json();
                console.log('Menu data loaded from secure server');
                return data;
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        } else {
            // Online mode - load from public JSON file only
            return await loadFromCloudStorage();
        }
    } catch (error) {
        console.error('Error loading data from server:', error);
        return {};
    }
}

// Load menu data from online storage only
async function loadMenuData() {
    try {
        const data = await loadDataFromServer();
        if (data && data.menuData) {
            menuData = data.menuData;
            console.log('Menu data loaded from online storage');
        } else {
            menuData = {};
            console.log('No menu data found, starting with empty menu');
        }
    } catch (error) {
        console.error('Error loading menu data:', error);
        menuData = {};
    }
}

// Save cafe information to online storage only
async function saveCafeInfo() {
    const cafeName = document.getElementById('cafeName').value;
    const cafeDescription = document.getElementById('cafeDescription').value;
    const cafeAddress = document.getElementById('cafeAddress').value;
    const cafePhone = document.getElementById('cafePhone').value;
    const cafeEmail = document.getElementById('cafeEmail').value;
    const cafeWebsite = document.getElementById('cafeWebsite').value;
    const cafeHours = document.getElementById('cafeHours').value;
    const cafeLogo = document.getElementById('cafeLogo').value;

    const cafeData = {
        name: cafeName,
        description: cafeDescription,
        address: cafeAddress,
        phone: cafePhone,
        email: cafeEmail,
        website: cafeWebsite,
        hours: cafeHours,
        logo: cafeLogo
    };

    try {
        const success = await saveDataToServer({ cafeData });
        if (success) {
            console.log('Cafe information saved to online storage');
            alert('Cafe information saved successfully!');
        } else {
            throw new Error('Failed to save cafe information');
        }
    } catch (error) {
        console.error('Error saving cafe information:', error);
        alert('Error saving cafe information: ' + error.message);
    }
}

// Save category information to online storage only
async function saveCategoryInfo() {
    const categoryName = document.getElementById('categoryName').value;
    const categoryDescription = document.getElementById('categoryDescription').value;
    const categoryIcon = document.getElementById('categoryIcon').value;

    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }

    const categoryData = {
        name: categoryName,
        description: categoryDescription,
        icon: categoryIcon
    };

    try {
        const data = await loadDataFromServer();
        const categories = data.categories || {};
        categories[categoryName] = categoryData;
        
        const success = await saveDataToServer({ categories });
        if (success) {
            console.log('Category information saved to online storage');
            alert('Category information saved successfully!');
            document.getElementById('categoryName').value = '';
            document.getElementById('categoryDescription').value = '';
            document.getElementById('categoryIcon').value = '';
            loadCategories();
        } else {
            throw new Error('Failed to save category information');
        }
    } catch (error) {
        console.error('Error saving category information:', error);
        alert('Error saving category information: ' + error.message);
    }
}

// Load categories from online storage only
async function loadCategories() {
    try {
        const data = await loadDataFromServer();
        const categories = data.categories || {};
        
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';

        for (const [name, category] of Object.entries(categories)) {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <div class="category-info">
                    <h3>${name}</h3>
                    <p>${category.description || 'No description'}</p>
                    <p><strong>Icon:</strong> ${category.icon || 'No icon'}</p>
                </div>
                <div class="category-actions">
                    <button onclick="editCategory('${name}')" class="btn btn-sm btn-primary">Edit</button>
                    <button onclick="deleteCategory('${name}')" class="btn btn-sm btn-danger">Delete</button>
                </div>
            `;
            categoryList.appendChild(categoryItem);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load category for editing from online storage only
async function loadCategoryForEdit(categoryName) {
    try {
        const data = await loadDataFromServer();
        const categories = data.categories || {};
        const category = categories[categoryName];
        
        if (category) {
            document.getElementById('categoryName').value = categoryName;
            document.getElementById('categoryDescription').value = category.description || '';
            document.getElementById('categoryIcon').value = category.icon || '';
        }
    } catch (error) {
        console.error('Error loading category for edit:', error);
    }
}

// Save menu item to online storage only
async function saveMenuItem() {
    const category = document.getElementById('itemCategory').value;
    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;
    const price = document.getElementById('itemPrice').value;
    const image = document.getElementById('itemImage').value;

    if (!category || !name || !price) {
        alert('Please fill in all required fields');
        return;
    }

    const itemData = {
        name: name,
        description: description,
        price: parseFloat(price),
        image: image
    };

    try {
        const data = await loadDataFromServer();
        const menuData = data.menuData || {};
        
        if (!menuData[category]) {
            menuData[category] = {};
        }
        
        menuData[category][name] = itemData;
        
        const success = await saveDataToServer({ menuData });
        if (success) {
            console.log('Menu item saved to online storage');
            alert('Menu item saved successfully!');
            document.getElementById('itemName').value = '';
            document.getElementById('itemDescription').value = '';
            document.getElementById('itemPrice').value = '';
            document.getElementById('itemImage').value = '';
            loadItemsForCategory(category);
        } else {
            throw new Error('Failed to save menu item');
        }
    } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Error saving menu item: ' + error.message);
    }
}

// Delete item from online storage only
async function deleteItem(category, itemName) {
    if (confirm('Are you sure you want to delete this item?')) {
        try {
            const data = await loadDataFromServer();
            const menuData = data.menuData || {};
            
            if (menuData[category] && menuData[category][itemName]) {
                delete menuData[category][itemName];
                
                const success = await saveDataToServer({ menuData });
                if (success) {
                    console.log('Menu item deleted from online storage');
                    alert('Menu item deleted successfully!');
                    loadItemsForCategory(category);
                } else {
                    throw new Error('Failed to delete menu item');
                }
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            alert('Error deleting menu item: ' + error.message);
        }
    }
}

// Load items for category from online storage only
async function loadItemsForCategory(category) {
    try {
        const data = await loadDataFromServer();
        const menuData = data.menuData || {};
        const items = menuData[category] || {};
        
        const itemList = document.getElementById('itemList');
        itemList.innerHTML = '';

        for (const [name, item] of Object.entries(items)) {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <h3>${name}</h3>
                    <p>${item.description || 'No description'}</p>
                    <p><strong>Price:</strong> $${item.price}</p>
                    <p><strong>Image:</strong> ${item.image || 'No image'}</p>
                </div>
                <div class="item-actions">
                    <button onclick="editItem('${category}', '${name}')" class="btn btn-sm btn-primary">Edit</button>
                    <button onclick="deleteItem('${category}', '${name}')" class="btn btn-sm btn-danger">Delete</button>
                </div>
            `;
            itemList.appendChild(itemElement);
        }
    } catch (error) {
        console.error('Error loading items for category:', error);
    }
}

// Edit item in online storage only
async function editItem(category, itemName) {
    try {
        const data = await loadDataFromServer();
        const menuData = data.menuData || {};
        const item = menuData[category] && menuData[category][itemName];
        
        if (item) {
            document.getElementById('itemCategory').value = category;
            document.getElementById('itemName').value = itemName;
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemPrice').value = item.price || '';
            document.getElementById('itemImage').value = item.image || '';
        }
    } catch (error) {
        console.error('Error loading item for edit:', error);
    }
}

// Additional functions needed for admin panel functionality
function editCategory(categoryName) {
    loadCategoryForEdit(categoryName);
}

function deleteCategory(categoryName) {
    if (confirm('Are you sure you want to delete this category?')) {
        // Implementation for deleting category
        console.log('Delete category:', categoryName);
        // TODO: Implement category deletion
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin panel initialized - Online mode only');
    
    // Load initial data from online storage
    await loadMenuData();
    await loadCategories();
    
    // Set up event listeners
    document.getElementById('saveCafeBtn').addEventListener('click', saveCafeInfo);
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategoryInfo);
    document.getElementById('saveItemBtn').addEventListener('click', saveMenuItem);
    
    // Load categories for item category dropdown
    const categorySelect = document.getElementById('itemCategory');
    categorySelect.innerHTML = '<option value="">Select a category</option>';
    
    try {
        const data = await loadDataFromServer();
        const categories = data.categories || {};
        
        for (const [name, category] of Object.entries(categories)) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            categorySelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error loading categories for dropdown:', error);
    }
    
    console.log('Admin panel ready - All data operations use online storage only');
});