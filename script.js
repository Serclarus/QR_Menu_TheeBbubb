// Menu data
const menuData = {
    'hot-drinks': {
        title: 'Hot Drinks',
        description: 'Warm beverages to start your day',
        items: [
            {
                name: 'Espresso',
                price: '$3.50',
                description: 'Rich, full-bodied coffee with a perfect crema'
            },
            {
                name: 'Cappuccino',
                price: '$4.25',
                description: 'Espresso with steamed milk and foam'
            },
            {
                name: 'Latte',
                price: '$4.75',
                description: 'Smooth espresso with steamed milk and light foam'
            },
            {
                name: 'Americano',
                price: '$3.75',
                description: 'Espresso diluted with hot water for a clean taste'
            },
            {
                name: 'Mocha',
                price: '$5.25',
                description: 'Espresso with chocolate and steamed milk'
            },
            {
                name: 'Hot Chocolate',
                price: '$4.50',
                description: 'Rich, creamy chocolate drink topped with whipped cream'
            },
            {
                name: 'Chai Latte',
                price: '$4.75',
                description: 'Spiced tea with steamed milk and honey'
            },
            {
                name: 'Green Tea',
                price: '$3.25',
                description: 'Premium green tea with antioxidants'
            }
        ]
    },
    'cold-drinks': {
        title: 'Cold Drinks',
        description: 'Refreshing drinks for any time',
        items: [
            {
                name: 'Iced Coffee',
                price: '$4.00',
                description: 'Cold-brewed coffee served over ice'
            },
            {
                name: 'Iced Latte',
                price: '$4.75',
                description: 'Espresso with cold milk over ice'
            },
            {
                name: 'Frappuccino',
                price: '$5.50',
                description: 'Blended coffee drink with ice and whipped cream'
            },
            {
                name: 'Cold Brew',
                price: '$4.25',
                description: 'Smooth, less acidic coffee brewed cold for 12 hours'
            },
            {
                name: 'Iced Tea',
                price: '$3.50',
                description: 'Refreshing black tea served over ice'
            },
            {
                name: 'Lemonade',
                price: '$3.75',
                description: 'Fresh squeezed lemonade with mint'
            },
            {
                name: 'Smoothie',
                price: '$6.25',
                description: 'Blended fruit smoothie with yogurt'
            },
            {
                name: 'Sparkling Water',
                price: '$2.50',
                description: 'Refreshing sparkling water with lemon'
            }
        ]
    },
    'meals': {
        title: 'Meals',
        description: 'Delicious food to satisfy your hunger',
        items: [
            {
                name: 'Avocado Toast',
                price: '$8.50',
                description: 'Smashed avocado on artisan bread with cherry tomatoes'
            },
            {
                name: 'Breakfast Sandwich',
                price: '$7.75',
                description: 'Egg, cheese, and bacon on a croissant'
            },
            {
                name: 'Caesar Salad',
                price: '$9.25',
                description: 'Fresh romaine with parmesan, croutons, and caesar dressing'
            },
            {
                name: 'Club Sandwich',
                price: '$10.50',
                description: 'Turkey, bacon, lettuce, tomato on toasted bread'
            },
            {
                name: 'Quiche Lorraine',
                price: '$8.75',
                description: 'Traditional quiche with bacon and gruyere cheese'
            },
            {
                name: 'Soup of the Day',
                price: '$6.50',
                description: 'Chef\'s daily special soup with bread'
            },
            {
                name: 'Grilled Cheese',
                price: '$7.25',
                description: 'Three cheese blend on sourdough bread'
            },
            {
                name: 'Veggie Wrap',
                price: '$8.00',
                description: 'Fresh vegetables and hummus in a spinach tortilla'
            }
        ]
    },
    'desserts': {
        title: 'Desserts',
        description: 'Sweet treats to end your meal',
        items: [
            {
                name: 'Chocolate Cake',
                price: '$5.75',
                description: 'Rich chocolate cake with chocolate ganache'
            },
            {
                name: 'Cheesecake',
                price: '$6.25',
                description: 'New York style cheesecake with berry compote'
            },
            {
                name: 'Tiramisu',
                price: '$6.50',
                description: 'Classic Italian dessert with coffee and mascarpone'
            },
            {
                name: 'Apple Pie',
                price: '$5.50',
                description: 'Homemade apple pie with cinnamon and vanilla ice cream'
            },
            {
                name: 'Chocolate Chip Cookies',
                price: '$2.75',
                description: 'Fresh baked cookies with premium chocolate chips'
            },
            {
                name: 'Croissant',
                price: '$3.25',
                description: 'Buttery, flaky French pastry'
            },
            {
                name: 'Muffin',
                price: '$3.50',
                description: 'Fresh baked muffin of the day'
            },
            {
                name: 'Ice Cream',
                price: '$4.25',
                description: 'Two scoops of premium ice cream'
            }
        ]
    }
};

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
                        <span class="item-price">${item.price}</span>
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

// Add touch support for mobile
categoryCards.forEach(card => {
    card.addEventListener('touchstart', (e) => {
        e.preventDefault();
        card.style.transform = 'scale(0.95)';
    });
    
    card.addEventListener('touchend', (e) => {
        e.preventDefault();
        card.style.transform = '';
        const category = card.getAttribute('data-category');
        showCategory(category);
    });
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);
    
    // Add smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
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
