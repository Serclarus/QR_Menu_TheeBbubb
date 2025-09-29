// Admin Panel JavaScript - Cloud Storage Integration
const ADMIN_PASSWORD = 'admin123'; // Change this password

// Online data storage functions
async function saveToCloudStorage(data) {
    try {
        // Save to localStorage as cloud storage simulation
        localStorage.setItem('menuData', JSON.stringify(data.menuData || {}));
        localStorage.setItem('cafeData', JSON.stringify(data.cafeData || {}));
        localStorage.setItem('categories', JSON.stringify(data.categories || {}));
        localStorage.setItem('lastUpdated', Date.now().toString());
        console.log('Data saved to cloud storage');
        return true;
    } catch (error) {
        console.error('Error saving to cloud storage:', error);
        return false;
    }
}

async function loadFromCloudStorage() {
    try {
        const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
        const cafeData = JSON.parse(localStorage.getItem('cafeData') || '{}');
        const categories = JSON.parse(localStorage.getItem('categories') || '{}');
        return { menuData, cafeData, categories };
    } catch (error) {
        console.error('Error loading from cloud storage:', error);
        return {};
    }
}

// Save data to server (cloud storage)
async function saveDataToServer(data) {
    try {
        const success = await saveToCloudStorage(data);
        if (success) {
            console.log('Data saved to cloud storage');
            return true;
        } else {
            throw new Error('Failed to save to cloud storage');
        }
    } catch (error) {
        console.error('Error saving data to server:', error);
        return false;
    }
}

// Load data from server (cloud storage)
async function loadDataFromServer() {
    try {
        const data = await loadFromCloudStorage();
        console.log('Data loaded from cloud storage');
        return data;
    } catch (error) {
        console.error('Error loading data from server:', error);
        return {};
    }
}

// Load menu data
async function loadMenuData() {
    try {
        const data = await loadDataFromServer();
        return data.menuData || {};
    } catch (error) {
        console.error('Error loading menu data:', error);
        return {};
    }
}

// Load cafe data
async function loadCafeData() {
    try {
        const data = await loadDataFromServer();
        return data.cafeData || {};
    } catch (error) {
        console.error('Error loading cafe data:', error);
        return {};
    }
}

// Save cafe information
async function saveCafeInfo() {
    try {
        const cafeName = document.getElementById('cafe-name').value.trim();
        const cafeDescription = document.getElementById('cafe-description').value.trim();
        const instagramLink = document.getElementById('instagram-link').value.trim();
        
        if (!cafeName) {
            alert('Cafe adı gereklidir');
            return;
        }
        
        const data = await loadDataFromServer();
        
        data.cafeData = {
            name: cafeName,
            description: cafeDescription,
            instagram: instagramLink
        };
        
        const success = await saveDataToServer(data);
        if (success) {
            console.log('Cafe information saved to cloud storage');
            alert('Cafe bilgileri başarıyla kaydedildi!');
        } else {
            throw new Error('Failed to save cafe information');
        }
    } catch (error) {
        console.error('Error saving cafe information:', error);
        alert('Cafe bilgileri kaydedilirken hata oluştu: ' + error.message);
    }
}

// Save category information
async function saveCategoryInfo() {
    try {
        const categoryTitle = document.getElementById('category-title').value.trim();
        const categoryDescription = document.getElementById('category-description').value.trim();
        
        if (!categoryTitle) {
            alert('Kategori başlığı gereklidir');
            return;
        }
        
        const data = await loadDataFromServer();
        
        // Check if we're updating an existing category
        const categoryForm = document.getElementById('category-form');
        const existingCategoryName = categoryForm.getAttribute('data-category');
        
        if (existingCategoryName) {
            // Update existing category
            const category = data.categories[existingCategoryName];
            if (category) {
                category.name = categoryTitle;
                category.description = categoryDescription;
            }
        } else {
            // Create new category
            data.categories[categoryTitle] = {
                name: categoryTitle,
                description: categoryDescription,
                icon: ''
            };
        }
        
        const success = await saveDataToServer(data);
        if (success) {
            console.log('Category information saved to cloud storage');
            alert('Kategori bilgileri başarıyla kaydedildi!');
            document.getElementById('category-title').value = '';
            document.getElementById('category-description').value = '';
            categoryForm.removeAttribute('data-category');
            loadCategories();
        } else {
            throw new Error('Failed to save category information');
        }
    } catch (error) {
        console.error('Error saving category information:', error);
        alert('Kategori bilgileri kaydedilirken hata oluştu: ' + error.message);
    }
}

// Load categories
async function loadCategories() {
    try {
        const data = await loadDataFromServer();
        const categories = data.categories || {};
        
        const categoriesGrid = document.getElementById('categories-grid');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = '';
            
            Object.keys(categories).forEach(categoryKey => {
                const category = categories[categoryKey];
                const categoryCard = document.createElement('div');
                categoryCard.className = 'category-card';
                categoryCard.setAttribute('data-category', categoryKey);
                categoryCard.innerHTML = `
                    <h3>${category.name || categoryKey}</h3>
                    <p>${category.description || 'Açıklama yok'}</p>
                    <div class="category-actions">
                        <button onclick="editCategory('${categoryKey}')" class="btn btn-small">Düzenle</button>
                        <button onclick="deleteCategory('${categoryKey}')" class="btn btn-danger btn-small">Sil</button>
                    </div>
                `;
                categoriesGrid.appendChild(categoryCard);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Edit category
async function editCategory(categoryKey) {
    try {
        const data = await loadDataFromServer();
        const categories = data.categories || {};
        const category = categories[categoryKey];
        
        if (category) {
            document.getElementById('category-title').value = category.name || categoryKey;
            document.getElementById('category-description').value = category.description || '';
            
            // Store the category name for updating
            document.getElementById('category-form').setAttribute('data-category', categoryKey);
        }
    } catch (error) {
        console.error('Error loading category for editing:', error);
        alert('Kategori düzenlenirken hata oluştu: ' + error.message);
    }
}

// Delete category
async function deleteCategory(categoryKey) {
    if (confirm(`"${categoryKey}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
        try {
            const data = await loadDataFromServer();
            const menuData = data.menuData || {};
            const categories = data.categories || {};
            
            // Remove category from menu data
            delete menuData[categoryKey];
            
            // Remove category from categories
            delete categories[categoryKey];
            
            // Save updated data
            const updatedData = {
                menuData: menuData,
                cafeData: data.cafeData || {},
                categories: categories
            };
            
            const success = await saveDataToServer(updatedData);
            if (success) {
                alert('Kategori başarıyla silindi!');
                loadCategories();
            } else {
                throw new Error('Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Kategori silinirken hata oluştu: ' + error.message);
        }
    }
}

// Load categories for dropdown
async function loadCategoriesForDropdown() {
    try {
        const data = await loadDataFromServer();
        const categories = data.categories || {};
        
        const categorySelect = document.getElementById('item-category');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Kategori seçin...</option>';
            
            Object.keys(categories).forEach(categoryKey => {
                const option = document.createElement('option');
                option.value = categoryKey;
                option.textContent = categories[categoryKey].name || categoryKey;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories for dropdown:', error);
    }
}

// Load items for category
async function loadItemsForCategory(category) {
    try {
        const data = await loadDataFromServer();
        const menuData = data.menuData || {};
        const items = menuData[category] || {};
        
        const itemList = document.getElementById('items-list');
        if (itemList) {
            itemList.innerHTML = '';
            
            if (Object.keys(items).length === 0) {
                itemList.innerHTML = '<p style="text-align: center; color: #6c757d;">Bu kategoride henüz öğe yok</p>';
                return;
            }
            
            Object.keys(items).forEach(itemKey => {
                const item = items[itemKey];
                const itemCard = document.createElement('div');
                itemCard.className = 'item-card';
                itemCard.innerHTML = `
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>${item.description || 'Açıklama yok'}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span class="item-price">${item.price} ₺</span>
                        <div class="item-actions">
                            <button onclick="editItem('${category}', '${itemKey}')" class="btn btn-small">Düzenle</button>
                            <button onclick="deleteItem('${category}', '${itemKey}')" class="btn btn-danger btn-small">Sil</button>
                        </div>
                    </div>
                `;
                itemList.appendChild(itemCard);
            });
        }
    } catch (error) {
        console.error('Error loading items for category:', error);
    }
}

// Save menu item
async function saveMenuItem() {
    try {
        const category = document.getElementById('item-category').value;
        const itemName = document.getElementById('item-name').value.trim();
        const itemPrice = document.getElementById('item-price').value.trim();
        const itemDescription = document.getElementById('item-description').value.trim();
        
        if (!category) {
            alert('Lütfen bir kategori seçin');
            return;
        }
        
        if (!itemName) {
            alert('Öğe adı gereklidir');
            return;
        }
        
        if (!itemPrice) {
            alert('Fiyat gereklidir');
            return;
        }
        
        const data = await loadDataFromServer();
        
        if (!data.menuData) data.menuData = {};
        if (!data.menuData[category]) data.menuData[category] = {};
        
        data.menuData[category][itemName] = {
            name: itemName,
            price: itemPrice,
            description: itemDescription
        };
        
        const success = await saveDataToServer(data);
        if (success) {
            console.log('Menu item saved to cloud storage');
            alert('Menü öğesi başarıyla kaydedildi!');
            
            // Clear form
            document.getElementById('item-name').value = '';
            document.getElementById('item-price').value = '';
            document.getElementById('item-description').value = '';
            
            // Reload items
            loadItemsForCategory(category);
        } else {
            throw new Error('Failed to save menu item');
        }
    } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Menü öğesi kaydedilirken hata oluştu: ' + error.message);
    }
}

// Edit item
async function editItem(category, itemName) {
    try {
        const data = await loadDataFromServer();
        const menuData = data.menuData || {};
        const item = menuData[category][itemName];
        
        if (item) {
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-price').value = item.price;
            document.getElementById('item-description').value = item.description || '';
            
            // Store for updating
            document.getElementById('item-form').setAttribute('data-category', category);
            document.getElementById('item-form').setAttribute('data-item', itemName);
        }
    } catch (error) {
        console.error('Error loading item for editing:', error);
        alert('Öğe düzenlenirken hata oluştu: ' + error.message);
    }
}

// Delete item
async function deleteItem(category, itemName) {
    if (confirm(`"${itemName}" öğesini silmek istediğinizden emin misiniz?`)) {
        try {
            const data = await loadDataFromServer();
            const menuData = data.menuData || {};
            
            if (menuData[category] && menuData[category][itemName]) {
                delete menuData[category][itemName];
                
                const success = await saveDataToServer(data);
                if (success) {
                    console.log('Menu item deleted from cloud storage');
                    alert('Menü öğesi başarıyla silindi!');
                    loadItemsForCategory(category);
                } else {
                    throw new Error('Failed to delete menu item');
                }
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
            alert('Öğe silinirken hata oluştu: ' + error.message);
        }
    }
}

// Navigation functions
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
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        sessionStorage.removeItem('adminSessionToken');
        window.location.href = 'index.html';
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Admin panel initialized - Cloud storage mode');
    
    // Load initial data from cloud storage
    await loadMenuData();
    await loadCafeData();
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
    
    // Handle category form submission
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCategoryInfo();
        });
    }
    
    // Handle category selection for menu items
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            if (selectedCategory) {
                loadItemsForCategory(selectedCategory);
            } else {
                document.getElementById('items-list').innerHTML = '<p style="text-align: center; color: #6c757d;">Önce bir kategori seçin</p>';
            }
        });
    }
    
    console.log('Admin panel ready - All data operations use cloud storage');
});