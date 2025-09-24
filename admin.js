// Admin Panel JavaScript
const ADMIN_PASSWORD = 'admin123'; // Change this password

// Function to format price with ₺ symbol
function formatPrice(price) {
    if (!price) return '';
    // If price already has ₺ symbol, return as is
    if (price.includes('₺')) return price;
    // If it's just a number, add ₺ symbol
    if (!isNaN(price)) return '₺' + price;
    // Otherwise return as is
    return price;
}

// Test the formatPrice function
console.log('Testing formatPrice:', formatPrice('35'), formatPrice('₺35'), formatPrice(''));

// DOM elements
const adminPanel = document.getElementById('admin-panel');
const cafeForm = document.getElementById('cafe-form');
const categoryForm = document.getElementById('category-form');
const itemForm = document.getElementById('item-form');
const itemsList = document.getElementById('items-list');
const itemCategory = document.getElementById('item-category');

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
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
                    value = value.replace(/₺/g, '');
                    // Add ₺ at the beginning if there's a number
                    if (value && !isNaN(value)) {
                        e.target.value = '₺' + value;
                    }
                });
            }
        }, 50);
    }
}

function loadMenuData() {
    // Load cafe info
    const cafeData = JSON.parse(localStorage.getItem('cafeData') || '{}');
    if (cafeData.description) {
        document.getElementById('cafe-description').value = cafeData.description;
    }
    if (cafeData.image) {
        document.getElementById('cafe-image').value = cafeData.image;
        const preview = document.getElementById('image-preview');
        preview.src = cafeData.image;
        preview.style.display = 'block';
    }
    
    // Load categories
    const categories = JSON.parse(localStorage.getItem('categories') || '{}');
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
    const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
    if (Object.keys(menuData).length === 0) {
        // Load default data if no saved data exists
        loadDefaultData();
    }
}

function loadDefaultData() {
    // Default menu data (same as in script.js)
    const defaultMenuData = {
        'hot-drinks': {
            title: 'Sıcak İçecekler',
            description: 'Gününüze başlamak için sıcak içecekler',
            items: [
                { name: 'Espresso', price: '₺35', description: 'Mükemmel krema ile zengin, dolgun kahve' },
                { name: 'Cappuccino', price: '₺42', description: 'Buharda ısıtılmış süt ve köpük ile espresso' },
                { name: 'Latte', price: '₺47', description: 'Buharda ısıtılmış süt ve hafif köpük ile yumuşak espresso' },
                { name: 'Americano', price: '₺37', description: 'Temiz tat için sıcak su ile seyreltilmiş espresso' },
                { name: 'Mocha', price: '₺52', description: 'Çikolata ve buharda ısıtılmış süt ile espresso' },
                { name: 'Sıcak Çikolata', price: '₺45', description: 'Krem şanti ile süslenmiş zengin, kremsi çikolata içeceği' },
                { name: 'Chai Latte', price: '₺47', description: 'Buharda ısıtılmış süt ve bal ile baharatlı çay' },
                { name: 'Yeşil Çay', price: '₺32', description: 'Antioksidanlarla premium yeşil çay' }
            ]
        },
        'cold-drinks': {
            title: 'Soğuk İçecekler',
            description: 'Her zaman için ferahlatıcı içecekler',
            items: [
                { name: 'Buzlu Kahve', price: '₺40', description: 'Buz üzerinde servis edilen soğuk demlenmiş kahve' },
                { name: 'Buzlu Latte', price: '₺47', description: 'Buz üzerinde soğuk süt ile espresso' },
                { name: 'Frappuccino', price: '₺55', description: 'Buz ve krem şanti ile karıştırılmış kahve içeceği' },
                { name: 'Cold Brew', price: '₺42', description: '12 saat soğuk demlenmiş yumuşak, daha az asitli kahve' },
                { name: 'Buzlu Çay', price: '₺35', description: 'Buz üzerinde servis edilen ferahlatıcı siyah çay' },
                { name: 'Limonata', price: '₺37', description: 'Nane ile taze sıkılmış limonata' },
                { name: 'Smoothie', price: '₺62', description: 'Yoğurt ile karıştırılmış meyve smoothie' },
                { name: 'Maden Suyu', price: '₺25', description: 'Limon ile ferahlatıcı maden suyu' }
            ]
        },
        'meals': {
            title: 'Yemekler',
            description: 'Açlığınızı giderecek lezzetli yemekler',
            items: [
                { name: 'Avokado Tost', price: '₺85', description: 'Kiraz domates ile zanaatkar ekmeği üzerinde ezilmiş avokado' },
                { name: 'Kahvaltı Sandviçi', price: '₺77', description: 'Kruvasan üzerinde yumurta, peynir ve pastırma' },
                { name: 'Sezar Salatası', price: '₺92', description: 'Parmesan, kruton ve sezar sosu ile taze marul' },
                { name: 'Kulüp Sandviçi', price: '₺105', description: 'Kızarmış ekmek üzerinde hindi, pastırma, marul, domates' },
                { name: 'Quiche Lorraine', price: '₺87', description: 'Pastırma ve gruyere peyniri ile geleneksel quiche' },
                { name: 'Günün Çorbası', price: '₺65', description: 'Şefin günlük özel çorbası ekmek ile' },
                { name: 'Izgara Peynir', price: '₺72', description: 'Ekşi mayalı ekmek üzerinde üç peynir karışımı' },
                { name: 'Sebze Wrap', price: '₺80', description: 'Ispanak tortilla içinde taze sebzeler ve humus' }
            ]
        },
        'desserts': {
            title: 'Tatlılar',
            description: 'Yemeğinizi bitirmek için tatlı ikramlar',
            items: [
                { name: 'Çikolatalı Kek', price: '₺57', description: 'Çikolata ganaj ile zengin çikolatalı kek' },
                { name: 'Cheesecake', price: '₺62', description: 'Meyve kompostosu ile New York tarzı cheesecake' },
                { name: 'Tiramisu', price: '₺65', description: 'Kahve ve mascarpone ile klasik İtalyan tatlısı' },
                { name: 'Elmalı Turta', price: '₺55', description: 'Tarçın ve vanilyalı dondurma ile ev yapımı elmalı turta' },
                { name: 'Çikolata Parçacıklı Kurabiye', price: '₺27', description: 'Premium çikolata parçacıkları ile taze pişmiş kurabiyeler' },
                { name: 'Kruvasan', price: '₺32', description: 'Tereyağlı, katmerli Fransız hamur işi' },
                { name: 'Muffin', price: '₺35', description: 'Günün taze pişmiş muffin\'i' },
                { name: 'Dondurma', price: '₺42', description: 'İki top premium dondurma' }
            ]
        }
    };
    
    localStorage.setItem('menuData', JSON.stringify(defaultMenuData));
    localStorage.setItem('categories', JSON.stringify(defaultMenuData));
}

function saveCafeInfo() {
    const cafeData = {
        description: document.getElementById('cafe-description').value,
        image: document.getElementById('cafe-image').value
    };
    
    localStorage.setItem('cafeData', JSON.stringify(cafeData));
    showMessage('Cafe bilgileri kaydedildi!', 'success');
}

function loadCategoryForEdit(categoryKey) {
    const categories = JSON.parse(localStorage.getItem('categories') || '{}');
    const category = categories[categoryKey];
    
    if (category) {
        document.getElementById('category-title').value = category.title;
        document.getElementById('category-description').value = category.description;
    }
}

function saveCategoryInfo() {
    const selectedCard = document.querySelector('.category-card.selected');
    if (!selectedCard) {
        showMessage('Lütfen bir kategori seçin!', 'error');
        return;
    }
    
    const categoryKey = selectedCard.getAttribute('data-category');
    const title = document.getElementById('category-title').value;
    const description = document.getElementById('category-description').value;
    
    // Get existing data to preserve what's not being changed
    const categories = JSON.parse(localStorage.getItem('categories') || '{}');
    const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
    
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
    
    // Save the updated data
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('menuData', JSON.stringify(menuData));
    
    showMessage('Kategori güncellendi!', 'success');
}

function loadItemsForCategory(categoryKey) {
    if (!categoryKey) return;
    
    const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
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
}

function saveMenuItem() {
    const categoryKey = document.getElementById('item-category').value;
    const name = document.getElementById('item-name').value;
    let price = document.getElementById('item-price').value;
    const description = document.getElementById('item-description').value;
    
    // Ensure price has ₺ symbol
    if (price) {
        // Remove any existing ₺ symbols first
        price = price.replace(/₺/g, '');
        // Add ₺ symbol
        price = '₺' + price;
    }
    
    if (!categoryKey) {
        showMessage('Lütfen bir kategori seçin!', 'error');
        return;
    }
    
    const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
    
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
        showMessage('Menü öğesi güncellendi!', 'success');
    } else {
        // Add new item
        menuData[categoryKey].items.push({ name, price, description });
        showMessage('Menü öğesi eklendi!', 'success');
    }
    
    localStorage.setItem('menuData', JSON.stringify(menuData));
    clearItemForm();
    loadItemsForCategory(categoryKey);
}

function deleteItem(categoryKey, index) {
    if (confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) {
        const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
        menuData[categoryKey].items.splice(index, 1);
        localStorage.setItem('menuData', JSON.stringify(menuData));
        
        showMessage('Öğe silindi!', 'success');
        loadItemsForCategory(categoryKey);
    }
}

function editItem(categoryKey, index) {
    const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
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
