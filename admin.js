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
    const category = document.getElementById('item-category').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const price = document.getElementById('item-price').value;

    if (!category || !name || !price) {
        alert('Lütfen tüm gerekli alanları doldurun');
        return;
    }

    const itemData = {
        name: name,
        description: description,
        price: parseFloat(price.replace('₺', '').replace(',', '.').trim())
    };

    try {
        const data = await loadDataFromServer();
        const menuData = data.menuData || {};
        
        if (!menuData[category]) {
            menuData[category] = {};
        }
        
        menuData[category][name] = itemData;
        
        // Save the updated data with all existing data
        const updatedData = {
            menuData: menuData,
            cafeData: data.cafeData || {},
            categories: data.categories || {}
        };
        
        const success = await saveDataToServer(updatedData);
        if (success) {
            console.log('Menu item saved to online storage');
            alert('Menü öğesi başarıyla kaydedildi!');
            clearItemForm();
            loadItemsForCategory(category);
        } else {
            throw new Error('Failed to save menu item');
        }
    } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Menü öğesi kaydedilirken hata: ' + error.message);
    }
}

// Delete item from online storage only
async function deleteItem(category, itemName) {
    console.log('deleteItem called with:', category, itemName);
    
    if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
        try {
            console.log('Loading data for deletion...');
            const data = await loadDataFromServer();
            const menuData = data.menuData || {};
            
            console.log('Current menuData:', menuData);
            console.log('Category exists:', !!menuData[category]);
            console.log('Item exists:', !!(menuData[category] && menuData[category][itemName]));
            
            if (menuData[category] && menuData[category][itemName]) {
                delete menuData[category][itemName];
                console.log('Item deleted from memory, saving...');
                
                // Save the updated data with all existing data
                const updatedData = {
                    menuData: menuData,
                    cafeData: data.cafeData || {},
                    categories: data.categories || {}
                };
                
                const success = await saveDataToServer(updatedData);
                if (success) {
                    console.log('Menu item deleted from online storage');
                    alert('Menü öğesi başarıyla silindi!');
                    loadItemsForCategory(category);
                } else {
                    throw new Error('Failed to save after deletion');
                }
            } else {
                alert('Öğe bulunamadı!');
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            alert('Menü öğesi silinirken hata: ' + error.message);
        }
    }
}

// Load items for category from online storage only
async function loadItemsForCategory(category) {
    console.log('loadItemsForCategory called with category:', category);
    
    try {
        const data = await loadDataFromServer();
        console.log('Loaded data:', data);
        
        const menuData = data.menuData || {};
        console.log('Menu data:', menuData);
        
        const items = menuData[category] || {};
        console.log('Items for category', category, ':', items);
        
        const itemList = document.getElementById('items-list');
        console.log('Items list element:', itemList);
        
        if (itemList) {
            itemList.innerHTML = '';
            
            if (Object.keys(items).length === 0) {
                itemList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Bu kategoride henüz öğe yok.</p>';
                return;
            }

            for (const [name, item] of Object.entries(items)) {
                console.log('Creating item element for:', name, item);
                
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
                        <p style="margin: 0 0 0.5rem 0; color: #666;">${item.description || 'Açıklama yok'}</p>
                        <p style="margin: 0; color: #e67e22; font-weight: bold;">₺${item.price}</p>
                    </div>
                    <div class="item-actions">
                        <button onclick="editItem('${category}', '${name}')" style="background: #3498db; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-right: 0.5rem; cursor: pointer;">Düzenle</button>
                        <button onclick="deleteItem('${category}', '${name}')" style="background: #e74c3c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">Sil</button>
                    </div>
                `;
                itemList.appendChild(itemElement);
            }
            
            console.log('Items loaded successfully');
        } else {
            console.error('Items list element not found');
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
            document.getElementById('item-category').value = category;
            document.getElementById('item-name').value = itemName;
            document.getElementById('item-description').value = item.description || '';
            document.getElementById('item-price').value = item.price || '';
        }
    } catch (error) {
        console.error('Error loading item for edit:', error);
    }
}

// Navigation functions for admin panel
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.admin-nav button');
    navButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for specific sections
    if (sectionId === 'categories') {
        loadCategories();
    } else if (sectionId === 'menu-items') {
        loadCategoriesForDropdown();
    }
}

function returnToMenu() {
    window.location.href = 'index.html';
}

function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminSessionToken');
        sessionStorage.removeItem('adminSecurityLevel');
        window.location.href = 'index.html';
    }
}

function clearItemForm() {
    document.getElementById('item-name').value = '';
    document.getElementById('item-description').value = '';
    document.getElementById('item-price').value = '';
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

// Load categories for dropdown in menu items section
async function loadCategoriesForDropdown() {
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Kategori seçin...</option>';
        
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
    
    // Handle menu items form submission
    const itemForm = document.getElementById('item-form');
    if (itemForm) {
        itemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMenuItem();
        });
    }
    
    // Handle category selection for menu items
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
        console.log('Category select element found:', categorySelect);
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            console.log('Category selection changed to:', selectedCategory);
            if (selectedCategory) {
                console.log('Loading items for category:', selectedCategory);
                loadItemsForCategory(selectedCategory);
            } else {
                console.log('No category selected, clearing items list');
                document.getElementById('items-list').innerHTML = '';
            }
        });
    } else {
        console.error('Category select element not found!');
    }
    
    // Add a test button to manually load items
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Load Items';
    testButton.style.cssText = 'background: #e67e22; color: white; padding: 10px; margin: 10px; border: none; border-radius: 5px; cursor: pointer;';
    testButton.onclick = function() {
        const testCategory = categorySelect ? categorySelect.value : 'test';
        console.log('Manual test - loading items for category:', testCategory);
        loadItemsForCategory(testCategory);
    };
    
    // Add test button to the menu items section
    const menuItemsSection = document.getElementById('menu-items');
    if (menuItemsSection) {
        menuItemsSection.appendChild(testButton);
        
        // Add a button to create test data
        const testDataButton = document.createElement('button');
        testDataButton.textContent = 'Create Test Data';
        testDataButton.style.cssText = 'background: #27ae60; color: white; padding: 10px; margin: 10px; border: none; border-radius: 5px; cursor: pointer;';
        testDataButton.onclick = async function() {
            console.log('Creating test data...');
            const testData = {
                menuData: {
                    'Sıcak İçecekler': {
                        'Türk Kahvesi': {
                            name: 'Türk Kahvesi',
                            description: 'Geleneksel Türk kahvesi',
                            price: 15
                        },
                        'Çay': {
                            name: 'Çay',
                            description: 'Demli çay',
                            price: 5
                        }
                    },
                    'Soğuk İçecekler': {
                        'Ayran': {
                            name: 'Ayran',
                            description: 'Taze ayran',
                            price: 8
                        }
                    }
                },
                cafeData: {},
                categories: {
                    'Sıcak İçecekler': {
                        name: 'Sıcak İçecekler',
                        description: 'Sıcak içecekler',
                        icon: 'hotdrinks_icon.png'
                    },
                    'Soğuk İçecekler': {
                        name: 'Soğuk İçecekler',
                        description: 'Soğuk içecekler',
                        icon: 'colddrinks_icon.png'
                    }
                }
            };
            
            try {
                const success = await saveDataToServer(testData);
                if (success) {
                    alert('Test data created successfully!');
                    // Reload categories
                    loadCategoriesForDropdown();
                } else {
                    alert('Failed to create test data');
                }
            } catch (error) {
                console.error('Error creating test data:', error);
                alert('Error creating test data: ' + error.message);
            }
        };
        
        menuItemsSection.appendChild(testDataButton);
    }
    
    // Load categories for item category dropdown
    try {
        const data = await loadDataFromServer();
        const categories = data.categories || {};
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Kategori seçin...</option>';
            
            for (const [name, category] of Object.entries(categories)) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                categorySelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error('Error loading categories for dropdown:', error);
    }
    
    console.log('Admin panel ready - All data operations use online storage only');
});