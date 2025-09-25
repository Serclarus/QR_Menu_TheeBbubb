// Load menu data from localStorage or use default
let menuData = {};

// Default menu data (fallback)
const defaultMenuData = {
    'hot-drinks': {
        title: 'Sıcak İçecekler',
        description: 'Gününüze başlamak için sıcak içecekler',
        items: [
            {
                name: 'Espresso',
                price: '35 ₺',
                description: 'Mükemmel krema ile zengin, dolgun kahve'
            },
            {
                name: 'Cappuccino',
                price: '42 ₺',
                description: 'Buharda ısıtılmış süt ve köpük ile espresso'
            },
            {
                name: 'Latte',
                price: '47 ₺',
                description: 'Buharda ısıtılmış süt ve hafif köpük ile yumuşak espresso'
            },
            {
                name: 'Americano',
                price: '37 ₺',
                description: 'Temiz tat için sıcak su ile seyreltilmiş espresso'
            },
            {
                name: 'Mocha',
                price: '52 ₺',
                description: 'Çikolata ve buharda ısıtılmış süt ile espresso'
            },
            {
                name: 'Sıcak Çikolata',
                price: '45 ₺',
                description: 'Krem şanti ile süslenmiş zengin, kremsi çikolata içeceği'
            },
            {
                name: 'Chai Latte',
                price: '47 ₺',
                description: 'Buharda ısıtılmış süt ve bal ile baharatlı çay'
            },
            {
                name: 'Yeşil Çay',
                price: '32 ₺',
                description: 'Antioksidanlarla premium yeşil çay'
            }
        ]
    },
    'cold-drinks': {
        title: 'Soğuk İçecekler',
        description: 'Her zaman için ferahlatıcı içecekler',
        items: [
            {
                name: 'Buzlu Kahve',
                price: '40 ₺',
                description: 'Buz üzerinde servis edilen soğuk demlenmiş kahve'
            },
            {
                name: 'Buzlu Latte',
                price: '47 ₺',
                description: 'Buz üzerinde soğuk süt ile espresso'
            },
            {
                name: 'Frappuccino',
                price: '55 ₺',
                description: 'Buz ve krem şanti ile karıştırılmış kahve içeceği'
            },
            {
                name: 'Cold Brew',
                price: '42 ₺',
                description: '12 saat soğuk demlenmiş yumuşak, daha az asitli kahve'
            },
            {
                name: 'Buzlu Çay',
                price: '35 ₺',
                description: 'Buz üzerinde servis edilen ferahlatıcı siyah çay'
            },
            {
                name: 'Limonata',
                price: '37 ₺',
                description: 'Nane ile taze sıkılmış limonata'
            },
            {
                name: 'Smoothie',
                price: '62 ₺',
                description: 'Yoğurt ile karıştırılmış meyve smoothie'
            },
            {
                name: 'Maden Suyu',
                price: '25 ₺',
                description: 'Limon ile ferahlatıcı maden suyu'
            }
        ]
    },
    'meals': {
        title: 'Yemekler',
        description: 'Açlığınızı giderecek lezzetli yemekler',
        items: [
            {
                name: 'Avokado Tost',
                price: '85 ₺',
                description: 'Kiraz domates ile zanaatkar ekmeği üzerinde ezilmiş avokado'
            },
            {
                name: 'Kahvaltı Sandviçi',
                price: '77 ₺',
                description: 'Kruvasan üzerinde yumurta, peynir ve pastırma'
            },
            {
                name: 'Sezar Salatası',
                price: '92 ₺',
                description: 'Parmesan, kruton ve sezar sosu ile taze marul'
            },
            {
                name: 'Kulüp Sandviçi',
                price: '105 ₺',
                description: 'Kızarmış ekmek üzerinde hindi, pastırma, marul, domates'
            },
            {
                name: 'Quiche Lorraine',
                price: '87 ₺',
                description: 'Pastırma ve gruyere peyniri ile geleneksel quiche'
            },
            {
                name: 'Günün Çorbası',
                price: '65 ₺',
                description: 'Şefin günlük özel çorbası ekmek ile'
            },
            {
                name: 'Izgara Peynir',
                price: '72 ₺',
                description: 'Ekşi mayalı ekmek üzerinde üç peynir karışımı'
            },
            {
                name: 'Sebze Wrap',
                price: '80 ₺',
                description: 'Ispanak tortilla içinde taze sebzeler ve humus'
            }
        ]
    },
    'desserts': {
        title: 'Tatlılar',
        description: 'Yemeğinizi bitirmek için tatlı ikramlar',
        items: [
            {
                name: 'Çikolatalı Kek',
                price: '57 ₺',
                description: 'Çikolata ganaj ile zengin çikolatalı kek'
            },
            {
                name: 'Cheesecake',
                price: '62 ₺',
                description: 'Meyve kompostosu ile New York tarzı cheesecake'
            },
            {
                name: 'Tiramisu',
                price: '65 ₺',
                description: 'Kahve ve mascarpone ile klasik İtalyan tatlısı'
            },
            {
                name: 'Elmalı Turta',
                price: '55 ₺',
                description: 'Tarçın ve vanilyalı dondurma ile ev yapımı elmalı turta'
            },
            {
                name: 'Çikolata Parçacıklı Kurabiye',
                price: '27 ₺',
                description: 'Premium çikolata parçacıkları ile taze pişmiş kurabiyeler'
            },
            {
                name: 'Kruvasan',
                price: '32 ₺',
                description: 'Tereyağlı, katmerli Fransız hamur işi'
            },
            {
                name: 'Muffin',
                price: '35 ₺',
                description: 'Günün taze pişmiş muffin\'i'
            },
            {
                name: 'Dondurma',
                price: '42 ₺',
                description: 'İki top premium dondurma'
            }
        ]
    },
    'nargile': {
        title: 'Nargile',
        description: 'Geleneksel nargile deneyimi için özel aromalar',
        items: [
            {
                name: 'Elma Nargile',
                price: '120 ₺',
                description: 'Geleneksel elma aroması ile klasik nargile'
            },
            {
                name: 'Çilek Nargile',
                price: '120 ₺',
                description: 'Tatlı çilek aroması ile ferahlatıcı nargile'
            },
            {
                name: 'Nane Nargile',
                price: '120 ₺',
                description: 'Serinletici nane aroması ile taze nargile'
            },
            {
                name: 'Çikolata Nargile',
                price: '130 ₺',
                description: 'Zengin çikolata aroması ile lüks nargile'
            },
            {
                name: 'Vanilya Nargile',
                price: '125 ₺',
                description: 'Kremalı vanilya aroması ile yumuşak nargile'
            },
            {
                name: 'Karpuz Nargile',
                price: '120 ₺',
                description: 'Yaz mevsimi için ferahlatıcı karpuz aroması'
            },
            {
                name: 'Mango Nargile',
                price: '125 ₺',
                description: 'Tropikal mango aroması ile egzotik nargile'
            },
            {
                name: 'Karışık Meyve Nargile',
                price: '135 ₺',
                description: 'Çeşitli meyve aromalarının karışımı ile özel nargile'
            }
        ]
    }
};

// Function to load menu data
function loadMenuData() {
    const savedData = localStorage.getItem('menuData');
    if (savedData) {
        menuData = JSON.parse(savedData);
    } else {
        menuData = defaultMenuData;
        localStorage.setItem('menuData', JSON.stringify(menuData));
    }
}

// Function to load cafe data
function loadCafeData() {
    const cafeData = JSON.parse(localStorage.getItem('cafeData') || '{}');
    
    if (cafeData.description) {
        const cafeDescriptionElement = document.querySelector('.cafe-description');
        if (cafeDescriptionElement) {
            cafeDescriptionElement.textContent = cafeData.description;
        }
    }
    
    if (cafeData.instagramUrl) {
        const instagramLink = document.getElementById('instagram-link');
        if (instagramLink) {
            instagramLink.href = cafeData.instagramUrl;
        }
    }
    
    if (cafeData.image) {
        const cafeImageElement = document.querySelector('.cafe-image img');
        if (cafeImageElement) {
            cafeImageElement.src = cafeData.image;
        }
    }
}

// Function to format price with ₺ symbol (right side)
function formatPrice(price) {
    if (!price) return '';
    // Remove any existing ₺ symbols first
    let cleanPrice = price.replace(/₺/g, '').trim();
    // If it's a number, add ₺ symbol on the right
    if (!isNaN(cleanPrice) && cleanPrice !== '') {
        return cleanPrice + ' ₺';
    }
    // If it already has ₺ on the left, move it to the right
    if (price.includes('₺')) {
        let cleanPrice = price.replace(/₺/g, '').trim();
        return cleanPrice + ' ₺';
    }
    // Otherwise return as is
    return price;
}

// Function to convert all existing prices to new format
function convertPricesToNewFormat() {
    const menuData = JSON.parse(localStorage.getItem('menuData') || '{}');
    let needsUpdate = false;
    
    console.log('Converting prices...', menuData);
    
    Object.keys(menuData).forEach(categoryKey => {
        const category = menuData[categoryKey];
        if (category.items) {
            category.items.forEach(item => {
                console.log('Checking item:', item.name, 'price:', item.price);
                if (item.price && item.price.includes('₺') && !item.price.includes(' ₺')) {
                    console.log('Converting price from', item.price, 'to', item.price.replace(/₺/g, '').trim() + ' ₺');
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
    } else {
        console.log('No prices needed conversion');
    }
}

// Function to load category titles
function loadCategoryTitles() {
    const categories = JSON.parse(localStorage.getItem('categories') || '{}');
    
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        const categoryCard = document.querySelector(`[data-category="${categoryKey}"] h3`);
        if (categoryCard && category.title) {
            categoryCard.textContent = category.title;
        }
    });
}

// DOM elements
const categoryContent = document.getElementById('category-content');
const backBtn = document.getElementById('back-btn');
const categoryCards = document.querySelectorAll('.category-card');
const mainNav = document.querySelector('.main-nav');

// Show category content
function showCategory(categoryKey) {
    const category = menuData[categoryKey];
    if (!category) return;

    // Hide main navigation
    mainNav.style.display = 'none';
    
    // Hide Instagram button
    const instagramSection = document.querySelector('.instagram-section');
    if (instagramSection) {
        instagramSection.classList.add('hidden');
    }
    
    // Show back button
    backBtn.style.display = 'block';
    
    // Create category content
    const content = `
        <div class="category-header fade-in">
            <h2>${category.title}</h2>
            <p>${category.description}</p>
        </div>
        <div class="items-grid">
            ${category.items.map(item => `
                <div class="menu-item fade-in">
                    <div class="item-header">
                        <h3 class="item-name">${item.name}</h3>
                        <span class="item-price">${formatPrice(item.price)}</span>
                    </div>
                    <p class="item-description">${item.description}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    categoryContent.innerHTML = content;
    categoryContent.style.display = 'block';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Show main menu
function showMainMenu() {
    mainNav.style.display = 'block';
    backBtn.style.display = 'none';
    categoryContent.style.display = 'none';
    categoryContent.innerHTML = '';
    
    // Show Instagram button
    const instagramSection = document.querySelector('.instagram-section');
    if (instagramSection) {
        instagramSection.classList.remove('hidden');
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Event listeners
categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        showCategory(category);
    });
});

backBtn.addEventListener('click', showMainMenu);

// Add touch support for mobile with improved scroll detection
categoryCards.forEach(card => {
    let touchStartTime = 0;
    let touchStartY = 0;
    let touchStartX = 0;
    let touchMoved = false;
    let isScrolling = false;
    
    card.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        touchMoved = false;
        isScrolling = false;
        
        // Only show visual feedback if it's likely a tap
        card.style.transform = 'scale(0.98)';
        card.style.transition = 'transform 0.1s ease';
    });
    
    card.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const deltaY = Math.abs(touchY - touchStartY);
        const deltaX = Math.abs(touchX - touchStartX);
        
        // If user moved more than 5px in any direction, consider it a scroll
        if (deltaY > 5 || deltaX > 5) {
            touchMoved = true;
            isScrolling = true;
            card.style.transform = '';
            card.style.transition = 'transform 0.3s ease';
        }
    });
    
    card.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        
        // Only trigger click if:
        // 1. Touch was very short (less than 300ms)
        // 2. User didn't move at all (delta < 5px)
        // 3. It's not a scroll gesture
        // 4. Page is not currently scrolling
        if (touchDuration < 300 && !touchMoved && !isScrolling && !isPageScrolling) {
            e.preventDefault();
            e.stopPropagation();
            card.style.transform = '';
            card.style.transition = 'transform 0.3s ease';
            const category = card.getAttribute('data-category');
            setTimeout(() => showCategory(category), 50);
        } else {
            card.style.transform = '';
            card.style.transition = 'transform 0.3s ease';
        }
    });
    
    card.addEventListener('touchcancel', (e) => {
        card.style.transform = '';
        card.style.transition = 'transform 0.3s ease';
        touchMoved = true;
        isScrolling = true;
    });
});

// Global scroll detection
let isPageScrolling = false;
let scrollTimeout;

document.addEventListener('scroll', () => {
    isPageScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        isPageScrolling = false;
    }, 150);
}, { passive: true });

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Force clear old data and reload with new format
    console.log('Clearing old menu data and reloading...');
    localStorage.removeItem('menuData');
    
    // Convert existing prices to new format first
    convertPricesToNewFormat();
    
    // Load data from localStorage
    loadMenuData();
    loadCafeData();
    loadCategoryTitles();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Prevent zoom on double tap for mobile (only on non-interactive elements)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        // Only prevent zoom if it's not on a button or interactive element
        if (!event.target.closest('.category-card, .back-btn, .menu-item')) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }
    }, false);
    
    // Improve scrolling performance
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Add passive event listeners for better scroll performance
    document.addEventListener('touchstart', function() {}, {passive: true});
    document.addEventListener('touchmove', function() {}, {passive: true});
});

// Handle browser back button
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.category) {
        showCategory(e.state.category);
    } else {
        showMainMenu();
    }
});

// Update URL when showing category
function showCategoryWithHistory(categoryKey) {
    history.pushState({ category: categoryKey }, '', `#${categoryKey}`);
    showCategory(categoryKey);
}

// Check for hash on page load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && menuData[hash]) {
        showCategory(hash);
    }
});
