// Simple Admin Panel JavaScript - No Security Checks
console.log('🔓 Simple admin panel loaded - no security checks');

// Basic admin panel functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔓 Admin panel initialized - no security barriers');
    
    // Load initial data
    loadMenuData();
    loadCategories();
    loadCafeInfo();
    loadCategoriesForDropdown();
    
    // Add test button for debugging
    addTestButton();
});

// Load menu data from menu-data.json
async function loadMenuData() {
    try {
        const response = await fetch('menu-data.json');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Menu data loaded:', data);
            return data;
        } else {
            console.log('❌ menu-data.json not found, using default data');
            return {
                menuData: {
                    'Sıcak İçecekler': {},
                    'Soğuk İçecekler': {},
                    'Ana Yemekler': {},
                    'Tatlılar': {},
                    'Atıştırmalıklar': {},
                    'Nargile': {}
                },
                cafeData: {
                    description: 'Hoşgeldiniz',
                    image: '',
                    instagram: ''
                },
                categories: {
                    'Sıcak İçecekler': { name: 'Sıcak İçecekler', description: 'Sıcak içecekler', icon: 'hotdrinks_icon.png' },
                    'Soğuk İçecekler': { name: 'Soğuk İçecekler', description: 'Soğuk içecekler', icon: 'colddrinks_icon.png' },
                    'Ana Yemekler': { name: 'Ana Yemekler', description: 'Ana yemekler', icon: 'maindishes_icon.png' },
                    'Tatlılar': { name: 'Tatlılar', description: 'Tatlılar', icon: 'desserts_icon.png' },
                    'Atıştırmalıklar': { name: 'Atıştırmalıklar', description: 'Atıştırmalıklar', icon: 'snacks_icon.png' },
                    'Nargile': { name: 'Nargile', description: 'Nargile', icon: 'hookah_icon.png' }
                }
            };
        }
    } catch (error) {
        console.error('Error loading menu data:', error);
        return {};
    }
}

// Load categories
async function loadCategories() {
    try {
        const data = await loadMenuData();
        const categories = data.categories || {};
        
        const categoriesGrid = document.getElementById('categories-grid');
        if (categoriesGrid) {
            categoriesGrid.innerHTML = '';
            
            for (const [name, category] of Object.entries(categories)) {
                const categoryCard = document.createElement('div');
                categoryCard.className = 'category-card';
                categoryCard.innerHTML = `
                    <h3>${category.name || name}</h3>
                    <p>${category.description || 'No description'}</p>
                    <p><strong>Icon:</strong> ${category.icon || 'No icon'}</p>
                    <div class="category-actions">
                        <button onclick="editCategory('${name}')" class="btn-small">Düzenle</button>
                        <button onclick="deleteCategory('${name}')" class="btn-small btn-danger">Sil</button>
                    </div>
                `;
                categoriesGrid.appendChild(categoryCard);
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load cafe info
async function loadCafeInfo() {
    try {
        const data = await loadMenuData();
        const cafeData = data.cafeData || {};
        
        document.getElementById('cafe-description').value = cafeData.description || '';
        document.getElementById('cafe-image').value = cafeData.image || '';
        document.getElementById('cafe-instagram').value = cafeData.instagram || '';
    } catch (error) {
        console.error('Error loading cafe info:', error);
    }
}

// Load categories for dropdown
async function loadCategoriesForDropdown() {
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Kategori seçin...</option>';
        
        try {
            const data = await loadMenuData();
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

// Save menu item
async function saveMenuItem() {
    console.log('🔓 saveMenuItem called - no security checks');
    
    const category = document.getElementById('item-category').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const price = document.getElementById('item-price').value;
    
    if (!category || !name || !price) {
        alert('Lütfen tüm gerekli alanları doldurun');
        return;
    }
    
    try {
        const data = await loadMenuData();
        const menuData = data.menuData || {};
        
        if (!menuData[category]) {
            menuData[category] = {};
        }
        
        menuData[category][name] = {
            name: name,
            description: description,
            price: parseFloat(price.replace('₺', '').replace(',', '.'))
        };
        
        // Save to localStorage
        localStorage.setItem('menuData', JSON.stringify(menuData));
        localStorage.setItem('cafeData', JSON.stringify(data.cafeData || {}));
        localStorage.setItem('categories', JSON.stringify(data.categories || {}));
        localStorage.setItem('lastUpdated', Date.now().toString());
        
        console.log('✅ Menu item saved to localStorage');
        alert(`✅ Menü öğesi başarıyla kaydedildi!\n\nKategori: ${category}\nÖğe: ${name}\nFiyat: ${price} TL`);
        
        // Clear form
        document.getElementById('item-name').value = '';
        document.getElementById('item-description').value = '';
        document.getElementById('item-price').value = '';
        
        // Refresh display
        loadItemsForCategory(category);
        loadCategories();
        
    } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Menü öğesi kaydedilirken hata: ' + error.message);
    }
}

// Load items for category
async function loadItemsForCategory(category) {
    console.log('🔓 loadItemsForCategory called for:', category);
    
    try {
        const data = await loadMenuData();
        const menuData = data.menuData || {};
        const items = menuData[category] || {};
        
        const itemsList = document.getElementById('items-list');
        if (itemsList) {
            itemsList.innerHTML = '';
            
            if (Object.keys(items).length === 0) {
                itemsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Bu kategoride henüz öğe yok.</p>';
            } else {
                for (const [name, item] of Object.entries(items)) {
                    const itemCard = document.createElement('div');
                    itemCard.className = 'item-card';
                    itemCard.innerHTML = `
                        <h4>${name}</h4>
                        <p>${item.description || 'No description'}</p>
                        <p><strong>Fiyat:</strong> ${item.price} TL</p>
                        <div class="item-actions">
                            <button onclick="editItem('${category}', '${name}')" class="btn-small">Düzenle</button>
                            <button onclick="deleteItem('${category}', '${name}')" class="btn-small btn-danger">Sil</button>
                        </div>
                    `;
                    itemsList.appendChild(itemCard);
                }
            }
        }
    } catch (error) {
        console.error('Error loading items for category:', error);
    }
}

// Add test button for debugging
function addTestButton() {
    const testButton = document.createElement('button');
    testButton.innerHTML = '🧪 TEST: Add Sample Item';
    testButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        z-index: 9999;
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
    `;
    
    testButton.onclick = async function() {
        console.log('🧪 TEST: Adding sample item...');
        
        // Fill form with test data
        document.getElementById('item-category').value = 'Sıcak İçecekler';
        document.getElementById('item-name').value = 'Test Çay';
        document.getElementById('item-description').value = 'Test açıklama';
        document.getElementById('item-price').value = '5';
        
        console.log('🧪 TEST: Form filled, now calling saveMenuItem...');
        
        // Call save function
        try {
            await saveMenuItem();
            console.log('🧪 TEST: Save function completed');
        } catch (error) {
            console.error('🧪 TEST: Save function failed:', error);
        }
    };
    
    document.body.appendChild(testButton);
    console.log('🧪 TEST: Test button added to admin panel');
}

// Placeholder functions for compatibility
function editCategory(name) {
    console.log('Edit category:', name);
    alert('Edit category: ' + name);
}

function deleteCategory(name) {
    console.log('Delete category:', name);
    alert('Delete category: ' + name);
}

function editItem(category, name) {
    console.log('Edit item:', category, name);
    alert('Edit item: ' + name + ' in ' + category);
}

function deleteItem(category, name) {
    console.log('Delete item:', category, name);
    alert('Delete item: ' + name + ' from ' + category);
}

function showSection(sectionId) {
    console.log('Show section:', sectionId);
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

function returnToMenu() {
    window.location.href = 'index.html';
}

function logoutAdmin() {
    alert('Çıkış yapıldı');
    window.location.href = 'index.html';
}
