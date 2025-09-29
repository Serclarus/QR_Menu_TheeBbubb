// Admin Panel JavaScript - Secure & Focused
const ADMIN_PASSWORD = 'admin123'; // Change this password
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Security: Session management
let adminSession = {
    isLoggedIn: false,
    loginTime: null,
    sessionId: null
};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    setupEventListeners();
});

// Security: Check if user is logged in
function checkSession() {
    const sessionData = sessionStorage.getItem('adminSession');
    if (sessionData) {
        const session = JSON.parse(sessionData);
        const now = Date.now();
        
        if (session.loginTime && (now - session.loginTime) < SESSION_TIMEOUT) {
            adminSession = session;
            showAdminPanel();
        } else {
            sessionStorage.removeItem('adminSession');
            showLoginForm();
        }
    } else {
        showLoginForm();
    }
}

// Security: Create secure session
function createSession() {
    adminSession = {
        isLoggedIn: true,
        loginTime: Date.now(),
        sessionId: Math.random().toString(36).substr(2, 9)
    };
    sessionStorage.setItem('adminSession', JSON.stringify(adminSession));
}

// Show/hide panels
function showLoginForm() {
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadAllData();
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('admin-login').addEventListener('submit', handleLogin);
    
    // Category selection for menu items
    document.getElementById('item-category-select').addEventListener('change', loadMenuItems);
}

// Security: Handle login
function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        createSession();
        showAdminPanel();
        document.getElementById('admin-password').value = '';
    } else {
        alert('❌ Yanlış şifre!');
    }
}

// Security: Logout
function logoutAdmin() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        sessionStorage.removeItem('adminSession');
        adminSession = { isLoggedIn: false, loginTime: null, sessionId: null };
        showLoginForm();
    }
}

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.admin-nav button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for specific sections
    if (sectionId === 'categories') {
        loadCategories();
    } else if (sectionId === 'menu-items') {
        loadCategoriesForDropdown();
    }
}

// Data Management Functions
async function loadAllData() {
    try {
        await loadGeneralSettings();
        await loadCategories();
        await loadCategoriesForDropdown();
    } catch (error) {
        console.error('Error loading data:', error);
        showAlert('Veri yüklenirken hata oluştu', 'danger');
    }
}

// Load general settings
async function loadGeneralSettings() {
    try {
        const data = await loadDataFromStorage();
        
        document.getElementById('cafe-name').value = data.cafeData?.name || '';
        document.getElementById('cafe-description').value = data.cafeData?.description || '';
        document.getElementById('instagram-link').value = data.cafeData?.instagram || '';
    } catch (error) {
        console.error('Error loading general settings:', error);
    }
}

// Save general settings
async function saveGeneralSettings() {
    try {
        const cafeName = document.getElementById('cafe-name').value.trim();
        const cafeDescription = document.getElementById('cafe-description').value.trim();
        const instagramLink = document.getElementById('instagram-link').value.trim();
        
        if (!cafeName) {
            showAlert('Cafe adı gereklidir', 'danger');
            return;
        }
        
        const data = await loadDataFromStorage();
        
        data.cafeData = {
            name: cafeName,
            description: cafeDescription,
            instagram: instagramLink
        };
        
        await saveDataToStorage(data);
        showAlert('Genel ayarlar başarıyla kaydedildi!', 'success');
        
    } catch (error) {
        console.error('Error saving general settings:', error);
        showAlert('Ayarlar kaydedilirken hata oluştu', 'danger');
    }
}

// Load categories
async function loadCategories() {
    try {
        const data = await loadDataFromStorage();
        const categories = data.categories || {};
        
        const categoriesGrid = document.getElementById('categories-grid');
        categoriesGrid.innerHTML = '';
        
        Object.keys(categories).forEach(categoryKey => {
            const category = categories[categoryKey];
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <h3>${category.name || categoryKey}</h3>
                <p>${category.description || 'Açıklama yok'}</p>
                <div class="category-actions">
                    <button onclick="editCategory('${categoryKey}')" class="btn btn-small">✏️ Düzenle</button>
                    <button onclick="deleteCategory('${categoryKey}')" class="btn btn-danger btn-small">🗑️ Sil</button>
                </div>
            `;
            categoriesGrid.appendChild(categoryCard);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showAlert('Kategoriler yüklenirken hata oluştu', 'danger');
    }
}

// Add new category
async function addNewCategory() {
    try {
        const categoryName = document.getElementById('new-category-name').value.trim();
        
        if (!categoryName) {
            showAlert('Kategori adı gereklidir', 'danger');
            return;
        }
        
        const data = await loadDataFromStorage();
        
        if (data.categories[categoryName]) {
            showAlert('Bu kategori zaten mevcut', 'danger');
            return;
        }
        
        data.categories[categoryName] = {
            name: categoryName,
            description: ''
        };
        
        // Initialize empty menu data for this category
        if (!data.menuData) data.menuData = {};
        data.menuData[categoryName] = {};
        
        await saveDataToStorage(data);
        document.getElementById('new-category-name').value = '';
        loadCategories();
        loadCategoriesForDropdown();
        showAlert('Kategori başarıyla eklendi!', 'success');
        
    } catch (error) {
        console.error('Error adding category:', error);
        showAlert('Kategori eklenirken hata oluştu', 'danger');
    }
}

// Edit category
async function editCategory(categoryKey) {
    const newName = prompt('Yeni kategori adı:', categoryKey);
    if (newName && newName.trim() && newName !== categoryKey) {
        try {
            const data = await loadDataFromStorage();
            
            // Update category name
            const category = data.categories[categoryKey];
            delete data.categories[categoryKey];
            data.categories[newName] = category;
            category.name = newName;
            
            // Update menu data
            if (data.menuData[categoryKey]) {
                data.menuData[newName] = data.menuData[categoryKey];
                delete data.menuData[categoryKey];
            }
            
            await saveDataToStorage(data);
            loadCategories();
            loadCategoriesForDropdown();
            showAlert('Kategori başarıyla güncellendi!', 'success');
            
        } catch (error) {
            console.error('Error editing category:', error);
            showAlert('Kategori güncellenirken hata oluştu', 'danger');
        }
    }
}

// Delete category
async function deleteCategory(categoryKey) {
    if (confirm(`"${categoryKey}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
        try {
            const data = await loadDataFromStorage();
            
            delete data.categories[categoryKey];
            delete data.menuData[categoryKey];
            
            await saveDataToStorage(data);
            loadCategories();
            loadCategoriesForDropdown();
            showAlert('Kategori başarıyla silindi!', 'success');
            
        } catch (error) {
            console.error('Error deleting category:', error);
            showAlert('Kategori silinirken hata oluştu', 'danger');
        }
    }
}

// Load categories for dropdown
async function loadCategoriesForDropdown() {
    try {
        const data = await loadDataFromStorage();
        const categories = data.categories || {};
        
        const select = document.getElementById('item-category-select');
        select.innerHTML = '<option value="">Kategori seçin...</option>';
        
        Object.keys(categories).forEach(categoryKey => {
            const option = document.createElement('option');
            option.value = categoryKey;
            option.textContent = categories[categoryKey].name || categoryKey;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories for dropdown:', error);
    }
}

// Load menu items for selected category
async function loadMenuItems() {
    try {
        const categoryKey = document.getElementById('item-category-select').value;
        const itemsList = document.getElementById('items-list');
        
        if (!categoryKey) {
            itemsList.innerHTML = '<p style="text-align: center; color: #6c757d;">Önce bir kategori seçin</p>';
            return;
        }
        
        const data = await loadDataFromStorage();
        const items = data.menuData?.[categoryKey] || {};
        
        if (Object.keys(items).length === 0) {
            itemsList.innerHTML = '<p style="text-align: center; color: #6c757d;">Bu kategoride henüz öğe yok</p>';
            return;
        }
        
        itemsList.innerHTML = '';
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
                        <button onclick="editMenuItem('${categoryKey}', '${itemKey}')" class="btn btn-small">✏️</button>
                        <button onclick="deleteMenuItem('${categoryKey}', '${itemKey}')" class="btn btn-danger btn-small">🗑️</button>
                    </div>
                </div>
            `;
            itemsList.appendChild(itemCard);
        });
        
    } catch (error) {
        console.error('Error loading menu items:', error);
        showAlert('Menü öğeleri yüklenirken hata oluştu', 'danger');
    }
}

// Add menu item
async function addMenuItem() {
    try {
        const categoryKey = document.getElementById('item-category-select').value;
        const itemName = document.getElementById('item-name').value.trim();
        const itemPrice = parseFloat(document.getElementById('item-price').value);
        const itemDescription = document.getElementById('item-description').value.trim();
        
        if (!categoryKey) {
            showAlert('Lütfen bir kategori seçin', 'danger');
            return;
        }
        
        if (!itemName) {
            showAlert('Öğe adı gereklidir', 'danger');
            return;
        }
        
        if (isNaN(itemPrice) || itemPrice <= 0) {
            showAlert('Geçerli bir fiyat girin', 'danger');
            return;
        }
        
        const data = await loadDataFromStorage();
        
        if (!data.menuData) data.menuData = {};
        if (!data.menuData[categoryKey]) data.menuData[categoryKey] = {};
        
        if (data.menuData[categoryKey][itemName]) {
            showAlert('Bu öğe zaten mevcut', 'danger');
            return;
        }
        
        data.menuData[categoryKey][itemName] = {
            name: itemName,
            price: itemPrice,
            description: itemDescription
        };
        
        await saveDataToStorage(data);
        
        // Clear form
        document.getElementById('item-name').value = '';
        document.getElementById('item-price').value = '';
        document.getElementById('item-description').value = '';
        
        loadMenuItems();
        showAlert('Menü öğesi başarıyla eklendi!', 'success');
        
    } catch (error) {
        console.error('Error adding menu item:', error);
        showAlert('Menü öğesi eklenirken hata oluştu', 'danger');
    }
}

// Edit menu item
async function editMenuItem(categoryKey, itemKey) {
    const data = await loadDataFromStorage();
    const item = data.menuData[categoryKey][itemKey];
    
    const newName = prompt('Yeni öğe adı:', item.name);
    if (newName && newName.trim()) {
        const newPrice = prompt('Yeni fiyat (₺):', item.price);
        if (newPrice && !isNaN(parseFloat(newPrice))) {
            const newDescription = prompt('Yeni açıklama (opsiyonel):', item.description || '');
            
            try {
                // Remove old item
                delete data.menuData[categoryKey][itemKey];
                
                // Add updated item
                data.menuData[categoryKey][newName] = {
                    name: newName,
                    price: parseFloat(newPrice),
                    description: newDescription || ''
                };
                
                await saveDataToStorage(data);
                loadMenuItems();
                showAlert('Menü öğesi başarıyla güncellendi!', 'success');
                
            } catch (error) {
                console.error('Error editing menu item:', error);
                showAlert('Menü öğesi güncellenirken hata oluştu', 'danger');
            }
        }
    }
}

// Delete menu item
async function deleteMenuItem(categoryKey, itemKey) {
    if (confirm(`"${itemKey}" öğesini silmek istediğinizden emin misiniz?`)) {
        try {
            const data = await loadDataFromStorage();
            delete data.menuData[categoryKey][itemKey];
            
            await saveDataToStorage(data);
            loadMenuItems();
            showAlert('Menü öğesi başarıyla silindi!', 'success');
            
        } catch (error) {
            console.error('Error deleting menu item:', error);
            showAlert('Menü öğesi silinirken hata oluştu', 'danger');
        }
    }
}

// Data Storage Functions
async function loadDataFromStorage() {
    try {
        // Try to load from localStorage first
        const storedData = localStorage.getItem('menuData');
        if (storedData) {
            return JSON.parse(storedData);
        }
        
        // If no localStorage data, try to load from JSON file
        const response = await fetch('menu-data.json');
        if (response.ok) {
            const data = await response.json();
            // Save to localStorage for future use
            localStorage.setItem('menuData', JSON.stringify(data));
            return data;
        }
        
        // Return empty data structure
        return {
            menuData: {},
            cafeData: {},
            categories: {}
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return {
            menuData: {},
            cafeData: {},
            categories: {}
        };
    }
}

async function saveDataToStorage(data) {
    try {
        // Save to localStorage
        localStorage.setItem('menuData', JSON.stringify(data));
        
        // Also try to save to JSON file (for backup)
        // Note: This won't work on static hosting, but localStorage will persist
        console.log('Data saved to localStorage');
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Utility Functions
function showAlert(message, type) {
    // Remove existing alerts
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at the top of the current section
    const activeSection = document.querySelector('.admin-section.active');
    activeSection.insertBefore(alert, activeSection.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Auto-save session periodically
setInterval(() => {
    if (adminSession.isLoggedIn) {
        sessionStorage.setItem('adminSession', JSON.stringify(adminSession));
    }
}, 60000); // Every minute