// Admin Panel JavaScript
const ADMIN_PASSWORD = 'admin123'; // Change this password

// Secure cloud storage functions for real-time menu updates
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
            // Online mode - use localStorage as fallback (not secure for production)
            console.warn('Online mode: Using localStorage (not secure for production)');
            const updatedData = {
                menuData: data.menuData || {},
                cafeData: data.cafeData || {},
                categories: data.categories || {},
                lastUpdated: Date.now()
            };
            
            localStorage.setItem('cloudMenuData', JSON.stringify(updatedData));
            localStorage.setItem('menuDataLastUpdated', Date.now().toString());
            
            // Trigger a custom event to notify other tabs
            window.dispatchEvent(new CustomEvent('menuDataUpdated', { 
                detail: { timestamp: Date.now() } 
            }));
            
            console.log('Menu data saved to localStorage (fallback)');
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
            // Online mode - use localStorage fallback
            const cloudData = localStorage.getItem('cloudMenuData');
            if (cloudData) {
                const parsed = JSON.parse(cloudData);
                console.log('Menu data loaded from localStorage (fallback)');
                return parsed;
            }
            return {};
        }
    } catch (error) {
        console.error('Error loading from cloud storage:', error);
        return {};
    }
}

// Server communication functions with authentication and cloud storage
async function saveDataToServer(data) {
    try {
        // Check if we're running on a server (local development)
        const isLocalServer = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('192.168.');
        
        if (!isLocalServer) {
            // Online mode - use cloud storage for real-time updates
            console.log('Online mode: Saving to cloud storage for real-time updates');
            const success = await saveToCloudStorage(data);
            if (success) {
                // Also save to localStorage as backup
                localStorage.setItem('menuData', JSON.stringify(data.menuData || {}));
                localStorage.setItem('cafeData', JSON.stringify(data.cafeData || {}));
                localStorage.setItem('categories', JSON.stringify(data.categories || {}));
                return true;
            } else {
                // Fallback to localStorage if cloud save fails
                console.log('Cloud save failed, using localStorage fallback');
                localStorage.setItem('menuData', JSON.stringify(data.menuData || {}));
                localStorage.setItem('cafeData', JSON.stringify(data.cafeData || {}));
                localStorage.setItem('categories', JSON.stringify(data.categories || {}));
                return true;
            }
        }
        
        // Local server mode - try server first, fallback to localStorage
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
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Admin session expired. Please login again.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            console.log('Data saved to server successfully');
            // Also save to localStorage as backup
            localStorage.setItem('menuData', JSON.stringify(data.menuData || {}));
            localStorage.setItem('cafeData', JSON.stringify(data.cafeData || {}));
            localStorage.setItem('categories', JSON.stringify(data.categories || {}));
            return true;
        } else {
            console.error('Failed to save data to server:', result.error);
            return false;
        }
    } catch (error) {
        console.error('Error saving data to server:', error);
        // Fallback to localStorage
        console.log('Falling back to localStorage');
        try {
            localStorage.setItem('menuData', JSON.stringify(data.menuData || {}));
            localStorage.setItem('cafeData', JSON.stringify(data.cafeData || {}));
            localStorage.setItem('categories', JSON.stringify(data.categories || {}));
            return true;
        } catch (localError) {
            console.error('Error saving to localStorage:', localError);
            return false;
        }
    }
}

async function loadDataFromServer() {
    try {
        // Check if we're running on a server (local development)
        const isLocalServer = window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.hostname.includes('192.168.');
        
        if (!isLocalServer) {
            // Online mode - try cloud storage first, fallback to localStorage
            console.log('Online mode: Loading data from cloud storage');
            const cloudData = await loadFromCloudStorage();
            if (cloudData && Object.keys(cloudData).length > 0) {
                return cloudData;
            }
            
            // Fallback to localStorage
            const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
            const cafeData = JSON.parse(localStorage.getItem('cafeData') || '{}');
            const categories = JSON.parse(localStorage.getItem('categories') || '{}');
            return { menuData, cafeData, categories };
        }
        
        // Local server mode - try server first, fallback to localStorage
        const response = await fetch('/api/menu-data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data loaded from server:', data);
        return data;
    } catch (error) {
        console.error('Error loading data from server:', error);
        // Fallback to localStorage
        console.log('Falling back to localStorage');
        try {
            const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
            const cafeData = JSON.parse(localStorage.getItem('cafeData') || '{}');
            const categories = JSON.parse(localStorage.getItem('categories') || '{}');
            return { menuData, cafeData, categories };
        } catch (localError) {
            console.error('Error loading from localStorage:', localError);
            return {};
        }
    }
}

// Function to format price with ₺ symbol (right side)
function formatPrice(price) {
    if (!price) return '';
    // Remove any existing ₺ symbols first
    let cleanPrice = price.replace(/₺/g, '');
    // If it's a number, add ₺ symbol on the right
    if (!isNaN(cleanPrice) && cleanPrice !== '') {
        return cleanPrice + ' ₺';
    }
    // If it already has ₺ on the left, move it to the right
    if (price.includes('₺')) {
        let cleanPrice = price.replace(/₺/g, '');
        return cleanPrice + ' ₺';
    }
    // Otherwise return as is
    return price;
}

// Test the formatPrice function
console.log('Testing formatPrice:', formatPrice('35'), formatPrice('₺35'), formatPrice(''));

// Function to convert all existing prices to new format
function convertPricesToNewFormat() {
    const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
    let needsUpdate = false;
    
    Object.keys(menuData).forEach(categoryKey => {
        const category = menuData[categoryKey];
        if (category.items) {
            category.items.forEach(item => {
                if (item.price && item.price.includes('₺') && !item.price.includes(' ₺')) {
                    // Convert from "₺35" to "35 ₺"
                    item.price = item.price.replace(/₺/g, '').trim() + ' ₺';
                    needsUpdate = true;
                }
            });
        }
    });
    
    if (needsUpdate) {
        localStorage.setItem('menuData', JSON.stringify(menuData));
        console.log('Converted existing prices to new format');
    }
}

// DOM elements
const adminPanel = document.getElementById('admin-panel');
const cafeForm = document.getElementById('cafe-form');
const categoryForm = document.getElementById('category-form');
const itemForm = document.getElementById('item-form');
const itemsList = document.getElementById('items-list');
const itemCategory = document.getElementById('item-category');

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Force clear old data and reload with new format
    console.log('Admin: Clearing old menu data and reloading...');
    localStorage.removeItem('menuData');
    
    // Convert existing prices to new format first
    convertPricesToNewFormat();
    
    // Load saved data
    loadMenuData();
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Cafe form
    cafeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCafeInfo();
    });
    
    // Category form
    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCategoryInfo();
    });
    
    // Item form
    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveMenuItem();
    });
    
    // Auto-add ₺ symbol to price input - setup after DOM is ready
    setTimeout(() => {
        const priceInput = document.getElementById('item-price');
        if (priceInput) {
            priceInput.addEventListener('input', function(e) {
                let value = e.target.value;
                // Remove any existing ₺ symbols
                value = value.replace(/₺/g, '');
                // Add ₺ at the beginning if there's a number
                if (value && !isNaN(value)) {
                    e.target.value = '₺' + value;
                }
            });
        }
    }, 100);
    
    // Category selection
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            const category = this.getAttribute('data-category');
            loadCategoryForEdit(category);
        });
    });
    
    // Item category change
    itemCategory.addEventListener('change', function() {
        loadItemsForCategory(this.value);
    });
    
    // Image preview
    document.getElementById('cafe-image').addEventListener('input', function() {
        const preview = document.getElementById('image-preview');
        if (this.value) {
            preview.src = this.value;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    });
}


function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.admin-nav button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Setup ₺ symbol for price input when menu items section is shown
    if (sectionId === 'menu-items') {
        setTimeout(() => {
            const priceInput = document.getElementById('item-price');
            if (priceInput && !priceInput.hasAttribute('data-lira-setup')) {
                priceInput.setAttribute('data-lira-setup', 'true');
                priceInput.addEventListener('input', function(e) {
                    let value = e.target.value;
                    // Remove any existing ₺ symbols
                    value = value.replace(/₺/g, '').trim();
                    // Add ₺ at the end if there's a number
                    if (value && !isNaN(value)) {
                        e.target.value = value + ' ₺';
                    }
                });
            }
        }, 50);
    }
}

async function loadMenuData() {
    try {
        // Load data from server
        const serverData = await loadDataFromServer();
        
        // Load cafe info
        const cafeData = serverData.cafeData || {};
        if (cafeData.description) {
            document.getElementById('cafe-description').value = cafeData.description;
        }
        if (cafeData.image) {
            document.getElementById('cafe-image').value = cafeData.image;
            const preview = document.getElementById('image-preview');
            preview.src = cafeData.image;
            preview.style.display = 'block';
        }
        if (cafeData.instagramUrl) {
            document.getElementById('instagram-url').value = cafeData.instagramUrl;
        }
        
        // Load categories
        const categories = serverData.categories || {};
        Object.keys(categories).forEach(categoryKey => {
            const category = categories[categoryKey];
            // Update category form if this category is selected
            const selectedCard = document.querySelector(`[data-category="${categoryKey}"]`);
            if (selectedCard && selectedCard.classList.contains('selected')) {
                document.getElementById('category-title').value = category.title;
                document.getElementById('category-description').value = category.description;
            }
        });
        
        // Load menu items
        const menuData = serverData.menuData || {};
        if (Object.keys(menuData).length === 0) {
            // Load default data if no saved data exists
            loadDefaultData();
        }
    } catch (error) {
        console.error('Error loading menu data:', error);
        showMessage('Veri yüklenirken hata oluştu!', 'error');
    }
}

async function loadDefaultData() {
    // Default menu data (same as in script.js)
    const defaultMenuData = {
        'hot-drinks': {
            title: 'Sıcak İçecekler',
            description: 'Gününüze başlamak için sıcak içecekler',
            items: [
                { name: 'Espresso', price: '35 ₺', description: 'Mükemmel krema ile zengin, dolgun kahve' },
                { name: 'Cappuccino', price: '42 ₺', description: 'Buharda ısıtılmış süt ve köpük ile espresso' },
                { name: 'Latte', price: '47 ₺', description: 'Buharda ısıtılmış süt ve hafif köpük ile yumuşak espresso' },
                { name: 'Americano', price: '37 ₺', description: 'Temiz tat için sıcak su ile seyreltilmiş espresso' },
                { name: 'Mocha', price: '52 ₺', description: 'Çikolata ve buharda ısıtılmış süt ile espresso' },
                { name: 'Sıcak Çikolata', price: '45 ₺', description: 'Krem şanti ile süslenmiş zengin, kremsi çikolata içeceği' },
                { name: 'Chai Latte', price: '47 ₺', description: 'Buharda ısıtılmış süt ve bal ile baharatlı çay' },
                { name: 'Yeşil Çay', price: '32 ₺', description: 'Antioksidanlarla premium yeşil çay' }
            ]
        },
        'cold-drinks': {
            title: 'Soğuk İçecekler',
            description: 'Her zaman için ferahlatıcı içecekler',
            items: [
                { name: 'Buzlu Kahve', price: '40 ₺', description: 'Buz üzerinde servis edilen soğuk demlenmiş kahve' },
                { name: 'Buzlu Latte', price: '47 ₺', description: 'Buz üzerinde soğuk süt ile espresso' },
                { name: 'Frappuccino', price: '55 ₺', description: 'Buz ve krem şanti ile karıştırılmış kahve içeceği' },
                { name: 'Cold Brew', price: '42 ₺', description: '12 saat soğuk demlenmiş yumuşak, daha az asitli kahve' },
                { name: 'Buzlu Çay', price: '35 ₺', description: 'Buz üzerinde servis edilen ferahlatıcı siyah çay' },
                { name: 'Limonata', price: '37 ₺', description: 'Nane ile taze sıkılmış limonata' },
                { name: 'Smoothie', price: '62 ₺', description: 'Yoğurt ile karıştırılmış meyve smoothie' },
                { name: 'Maden Suyu', price: '25 ₺', description: 'Limon ile ferahlatıcı maden suyu' }
            ]
        },
        'meals': {
            title: 'Yemekler',
            description: 'Açlığınızı giderecek lezzetli yemekler',
            items: [
                { name: 'Avokado Tost', price: '85 ₺', description: 'Kiraz domates ile zanaatkar ekmeği üzerinde ezilmiş avokado' },
                { name: 'Kahvaltı Sandviçi', price: '77 ₺', description: 'Kruvasan üzerinde yumurta, peynir ve pastırma' },
                { name: 'Sezar Salatası', price: '92 ₺', description: 'Parmesan, kruton ve sezar sosu ile taze marul' },
                { name: 'Kulüp Sandviçi', price: '105 ₺', description: 'Kızarmış ekmek üzerinde hindi, pastırma, marul, domates' },
                { name: 'Quiche Lorraine', price: '87 ₺', description: 'Pastırma ve gruyere peyniri ile geleneksel quiche' },
                { name: 'Günün Çorbası', price: '65 ₺', description: 'Şefin günlük özel çorbası ekmek ile' },
                { name: 'Izgara Peynir', price: '72 ₺', description: 'Ekşi mayalı ekmek üzerinde üç peynir karışımı' },
                { name: 'Sebze Wrap', price: '80 ₺', description: 'Ispanak tortilla içinde taze sebzeler ve humus' }
            ]
        },
        'desserts': {
            title: 'Tatlılar',
            description: 'Yemeğinizi bitirmek için tatlı ikramlar',
            items: [
                { name: 'Çikolatalı Kek', price: '57 ₺', description: 'Çikolata ganaj ile zengin çikolatalı kek' },
                { name: 'Cheesecake', price: '62 ₺', description: 'Meyve kompostosu ile New York tarzı cheesecake' },
                { name: 'Tiramisu', price: '65 ₺', description: 'Kahve ve mascarpone ile klasik İtalyan tatlısı' },
                { name: 'Elmalı Turta', price: '55 ₺', description: 'Tarçın ve vanilyalı dondurma ile ev yapımı elmalı turta' },
                { name: 'Çikolata Parçacıklı Kurabiye', price: '27 ₺', description: 'Premium çikolata parçacıkları ile taze pişmiş kurabiyeler' },
                { name: 'Kruvasan', price: '32 ₺', description: 'Tereyağlı, katmerli Fransız hamur işi' },
                { name: 'Muffin', price: '35 ₺', description: 'Günün taze pişmiş muffin\'i' },
                { name: 'Dondurma', price: '42 ₺', description: 'İki top premium dondurma' }
            ]
        },
        'nargile': {
            title: 'Nargile',
            description: 'Geleneksel nargile deneyimi için özel aromalar',
            items: [
                { name: 'Elma Nargile', price: '120 ₺', description: 'Geleneksel elma aroması ile klasik nargile' },
                { name: 'Çilek Nargile', price: '120 ₺', description: 'Tatlı çilek aroması ile ferahlatıcı nargile' },
                { name: 'Nane Nargile', price: '120 ₺', description: 'Serinletici nane aroması ile taze nargile' },
                { name: 'Çikolata Nargile', price: '130 ₺', description: 'Zengin çikolata aroması ile lüks nargile' },
                { name: 'Vanilya Nargile', price: '125 ₺', description: 'Kremalı vanilya aroması ile yumuşak nargile' },
                { name: 'Karpuz Nargile', price: '120 ₺', description: 'Yaz mevsimi için ferahlatıcı karpuz aroması' },
                { name: 'Mango Nargile', price: '125 ₺', description: 'Tropikal mango aroması ile egzotik nargile' },
                { name: 'Karışık Meyve Nargile', price: '135 ₺', description: 'Çeşitli meyve aromalarının karışımı ile özel nargile' }
            ]
        }
    };
    
    const defaultData = {
        menuData: defaultMenuData,
        categories: defaultMenuData,
        cafeData: {}
    };
    
    await saveDataToServer(defaultData);
}

async function saveCafeInfo() {
    const cafeData = {
        description: document.getElementById('cafe-description').value,
        image: document.getElementById('cafe-image').value,
        instagramUrl: document.getElementById('instagram-url').value
    };
    
    // Get existing data from server
    const serverData = await loadDataFromServer();
    serverData.cafeData = cafeData;
    
    const success = await saveDataToServer(serverData);
    if (success) {
        showMessage('Cafe bilgileri kaydedildi!', 'success');
    } else {
        showMessage('Cafe bilgileri kaydedilemedi!', 'error');
    }
}

async function loadCategoryForEdit(categoryKey) {
    try {
        const serverData = await loadDataFromServer();
        const categories = serverData.categories || {};
        const category = categories[categoryKey];
        
        if (category) {
            document.getElementById('category-title').value = category.title;
            document.getElementById('category-description').value = category.description;
        }
    } catch (error) {
        console.error('Error loading category for edit:', error);
        showMessage('Kategori bilgileri yüklenirken hata oluştu!', 'error');
    }
}

async function saveCategoryInfo() {
    const selectedCard = document.querySelector('.category-card.selected');
    if (!selectedCard) {
        showMessage('Lütfen bir kategori seçin!', 'error');
        return;
    }
    
    const categoryKey = selectedCard.getAttribute('data-category');
    const title = document.getElementById('category-title').value;
    const description = document.getElementById('category-description').value;
    
    // Get existing data from server
    const serverData = await loadDataFromServer();
    const categories = serverData.categories || {};
    const menuData = serverData.menuData || {};
    
    // Update only if title is provided
    if (title.trim()) {
        if (!categories[categoryKey]) {
            categories[categoryKey] = {};
        }
        categories[categoryKey].title = title;
        
        if (menuData[categoryKey]) {
            menuData[categoryKey].title = title;
        }
        
        // Update the category card text in admin panel
        const categoryCard = document.querySelector(`[data-category="${categoryKey}"] h3`);
        if (categoryCard) {
            categoryCard.textContent = title;
        }
    }
    
    // Update description only if provided
    if (description.trim()) {
        if (!categories[categoryKey]) {
            categories[categoryKey] = {};
        }
        categories[categoryKey].description = description;
        
        if (menuData[categoryKey]) {
            menuData[categoryKey].description = description;
        }
    }
    
    // Update server data
    serverData.categories = categories;
    serverData.menuData = menuData;
    
    const success = await saveDataToServer(serverData);
    if (success) {
        showMessage('Kategori güncellendi!', 'success');
    } else {
        showMessage('Kategori güncellenemedi!', 'error');
    }
}

async function loadItemsForCategory(categoryKey) {
    if (!categoryKey) return;
    
    try {
        const serverData = await loadDataFromServer();
        const menuData = serverData.menuData || {};
        const category = menuData[categoryKey];
        
        if (!category || !category.items) return;
        
        itemsList.innerHTML = '';
        
        category.items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-list';
            itemDiv.innerHTML = `
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <p class="price">${formatPrice(item.price)}</p>
                <button class="btn btn-danger" onclick="deleteItem('${categoryKey}', ${index})">Sil</button>
                <button class="btn btn-secondary" onclick="editItem('${categoryKey}', ${index})">Düzenle</button>
            `;
            itemsList.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error loading items for category:', error);
        showMessage('Kategori öğeleri yüklenirken hata oluştu!', 'error');
    }
}

async function saveMenuItem() {
    const categoryKey = document.getElementById('item-category').value;
    const name = document.getElementById('item-name').value;
    let price = document.getElementById('item-price').value;
    const description = document.getElementById('item-description').value;
    
    // Ensure price has ₺ symbol on the right
    if (price) {
        // Remove any existing ₺ symbols first
        price = price.replace(/₺/g, '').trim();
        // Add ₺ symbol on the right
        price = price + ' ₺';
    }
    
    if (!categoryKey) {
        showMessage('Lütfen bir kategori seçin!', 'error');
        return;
    }
    
    // Get existing data from server
    const serverData = await loadDataFromServer();
    const menuData = serverData.menuData || {};
    
    if (!menuData[categoryKey]) {
        menuData[categoryKey] = { title: '', description: '', items: [] };
    }
    
    if (!menuData[categoryKey].items) {
        menuData[categoryKey].items = [];
    }
    
    // Check if we're in edit mode
    const isEditMode = document.getElementById('item-form').getAttribute('data-edit-mode') === 'true';
    
    if (isEditMode) {
        // Update existing item
        const index = parseInt(document.getElementById('item-form').getAttribute('data-index'));
        menuData[categoryKey].items[index] = { name, price, description };
    } else {
        // Add new item
        menuData[categoryKey].items.push({ name, price, description });
    }
    
    // Update server data
    serverData.menuData = menuData;
    
    const success = await saveDataToServer(serverData);
    if (success) {
        if (isEditMode) {
            showMessage('Menü öğesi güncellendi!', 'success');
        } else {
            showMessage('Menü öğesi eklendi!', 'success');
        }
        clearItemForm();
        loadItemsForCategory(categoryKey);
    } else {
        showMessage('Menü öğesi kaydedilemedi!', 'error');
    }
}

async function deleteItem(categoryKey, index) {
    if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
        // Get existing data from server
        const serverData = await loadDataFromServer();
        const menuData = serverData.menuData || {};
        
        if (menuData[categoryKey] && menuData[categoryKey].items) {
            menuData[categoryKey].items.splice(index, 1);
            
            // Update server data
            serverData.menuData = menuData;
            
            const success = await saveDataToServer(serverData);
            if (success) {
                showMessage('Öğe silindi!', 'success');
                loadItemsForCategory(categoryKey);
            } else {
                showMessage('Öğe silinemedi!', 'error');
            }
        }
    }
}

async function editItem(categoryKey, index) {
    try {
        const serverData = await loadDataFromServer();
        const menuData = serverData.menuData || {};
        const item = menuData[categoryKey].items[index];
        
        document.getElementById('item-category').value = categoryKey;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-description').value = item.description;
        
        // Store edit mode
        document.getElementById('item-form').setAttribute('data-edit-mode', 'true');
        document.getElementById('item-form').setAttribute('data-category', categoryKey);
        document.getElementById('item-form').setAttribute('data-index', index);
        
        // Change submit button text
        const submitBtn = document.querySelector('#item-form button[type="submit"]');
        submitBtn.textContent = 'Güncelle';
    } catch (error) {
        console.error('Error loading item for edit:', error);
        showMessage('Öğe bilgileri yüklenirken hata oluştu!', 'error');
    }
}

function clearItemForm() {
    document.getElementById('item-form').reset();
    document.getElementById('item-form').removeAttribute('data-edit-mode');
    document.getElementById('item-form').removeAttribute('data-category');
    document.getElementById('item-form').removeAttribute('data-index');
    
    const submitBtn = document.querySelector('#item-form button[type="submit"]');
    submitBtn.textContent = 'Öğe Ekle';
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    const activeSection = document.querySelector('.admin-section.active');
    activeSection.insertBefore(messageDiv, activeSection.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
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
    
    showMessage('Veriler yedeklendi!', 'success');
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
            
            showMessage('Veriler geri yüklendi!', 'success');
            loadMenuData();
        } catch (error) {
            showMessage('Dosya formatı hatalı!', 'error');
        }
    };
    reader.readAsText(file);
}

function returnToMenu() {
    // Clear all admin sessions and return to main menu
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('secure_session');
    localStorage.removeItem('admin_token');
    window.location.href = 'index.html';
}

function forceExit() {
    // Force clear everything and exit
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'index.html';
}
