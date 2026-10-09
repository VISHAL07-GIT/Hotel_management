/**
 * Foodie Hub - Modern Restaurant & Online Ordering Application Script
 * Advanced Cart & Payment Gateway Engine Included
 */

// --------------------------------------------------------------------------
// 1. Food Menu Dataset
// --------------------------------------------------------------------------
const MENU_DATA = [
    {
        id: "fh-01",
        title: "Truffle Ribeye Steak",
        category: "dinner",
        price: 890,
        diet: "non-veg",
        rating: 4.9,
        prepTime: "25 mins",
        calories: "650 kcal",
        popular: true,
        badge: "Chef Special",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
        desc: "Prime grass-fed ribeye steak seared in truffle butter, served with roasted asparagus & garlic mash."
    },
    {
        id: "fh-02",
        title: "Wood-Fired Margherita Pizza",
        category: "lunch",
        price: 480,
        diet: "veg",
        rating: 4.8,
        prepTime: "20 mins",
        calories: "520 kcal",
        popular: true,
        badge: "Bestseller",
        image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80",
        desc: "Authentic Neapolitan crust topped with San Marzano tomato sauce, fresh mozzarella & fresh basil."
    },
    {
        id: "fh-03",
        title: "Royal Hyderabadi Mutton Biryani",
        category: "dinner",
        price: 520,
        diet: "non-veg",
        rating: 4.9,
        prepTime: "30 mins",
        calories: "780 kcal",
        popular: true,
        badge: "Trending",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
        desc: "Fragrant basmati rice dum-cooked with tender marinated lamb, saffron, caramelized onions & exotic spices."
    },
    {
        id: "fh-04",
        title: "Gourmet Monster Cheese Burger",
        category: "lunch",
        price: 380,
        diet: "non-veg",
        rating: 4.7,
        prepTime: "15 mins",
        calories: "620 kcal",
        popular: true,
        badge: "Must Try",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        desc: "Juicy smashed beef patty, aged cheddar cheese, crispy bacon jam, signature sauce on brioche bun."
    },
    {
        id: "fh-05",
        title: "Crispy Paneer Butter Masala",
        category: "lunch",
        price: 360,
        diet: "veg",
        rating: 4.8,
        prepTime: "20 mins",
        calories: "450 kcal",
        popular: false,
        badge: "Popular Veg",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",
        desc: "Char-grilled cottage cheese cubes simmered in rich cashew tomato gravy with aromatic fenugreek."
    },
    {
        id: "fh-06",
        title: "Avocado & Poached Egg Toast",
        category: "breakfast",
        price: 290,
        diet: "veg",
        rating: 4.6,
        prepTime: "12 mins",
        calories: "320 kcal",
        popular: false,
        badge: "Healthy Choice",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80",
        desc: "Sourdough toast topped with mashed hass avocado, organic poached eggs, microgreens & chili flakes."
    },
    {
        id: "fh-07",
        title: "South Indian Special Masala Dosa",
        category: "breakfast",
        price: 180,
        diet: "veg",
        rating: 4.9,
        prepTime: "15 mins",
        calories: "280 kcal",
        popular: false,
        badge: "Classic",
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
        desc: "Crispy golden crepe stuffed with spiced potato masala, served with coconut chutney & lentil sambar."
    },
    {
        id: "fh-08",
        title: "Sizzling Chocolate Lava Brownie",
        category: "dessert",
        price: 260,
        diet: "veg",
        rating: 4.9,
        prepTime: "10 mins",
        calories: "490 kcal",
        popular: true,
        badge: "Dessert Choice",
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
        desc: "Warm dark chocolate brownie topped with vanilla bean ice cream & drizzled with hot fudge syrup."
    },
    {
        id: "fh-09",
        title: "Tropical Mango & Passion Smoothie",
        category: "drinks",
        price: 190,
        diet: "veg",
        rating: 4.7,
        prepTime: "8 mins",
        calories: "180 kcal",
        popular: false,
        badge: "Refreshing",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80",
        desc: "Fresh Alphonso mango pulp blended with passionfruit, chia seeds & coconut water."
    },
    {
        id: "fh-10",
        title: "Smokey Tandoori Chicken Wings",
        category: "dinner",
        price: 420,
        diet: "non-veg",
        rating: 4.8,
        prepTime: "22 mins",
        calories: "510 kcal",
        popular: false,
        badge: "Spicy",
        image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80",
        desc: "Clay oven roasted chicken wings marinated in hung curd, Kashmiri chili & lemon glaze."
    },
    {
        id: "fh-11",
        title: "Iced Caramel Macchiato",
        category: "drinks",
        price: 210,
        diet: "veg",
        rating: 4.8,
        prepTime: "5 mins",
        calories: "210 kcal",
        popular: false,
        badge: "Cold Brew",
        image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
        desc: "Freshly pulled espresso shot poured over cold milk, ice cubes and buttery caramel drizzle."
    },
    {
        id: "fh-12",
        title: "Classic Italian Tiramisu",
        category: "dessert",
        price: 310,
        diet: "veg",
        rating: 4.9,
        prepTime: "5 mins",
        calories: "380 kcal",
        popular: false,
        badge: "Italian Original",
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
        desc: "Espresso-soaked ladyfingers layered with mascarpone cream & dusted with Dutch cocoa powder."
    }
];

// --------------------------------------------------------------------------
// 2. Application State Management
// --------------------------------------------------------------------------
let cartState = JSON.parse(localStorage.getItem('foodie_hub_cart')) || [];
let currentCategory = 'all';
let currentDiet = 'all';
let searchQuery = '';
let activeDiscount = 0;
let selectedPayTab = 'upi';
let selectedTip = 30;
let userPoints = parseInt(localStorage.getItem('foodie_hub_points')) || 350;
let trackerStep = 2;

// --------------------------------------------------------------------------
// 3. DOM Initialization & Event Listeners
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderPopularDishes();
    renderMenu();
    updateCartUI();
    initSmartFinder();
    initBookingForm();
    initTracker();
    initPagePaymentSystem();
    initReviews();
    initRewards();
});

// --------------------------------------------------------------------------
// 4. Navigation & Mobile Menu Handler
// --------------------------------------------------------------------------
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)';
            navbar.style.background = 'rgba(10, 11, 14, 0.95)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.background = 'rgba(10, 11, 14, 0.85)';
        }
    });

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            navLinks.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        });
    });

    // Top Cart Trigger Button scrolls directly to Cart & Pay section
    document.getElementById('cartBtn')?.addEventListener('click', () => {
        document.getElementById('cart-payment')?.scrollIntoView({ behavior: 'smooth' });
    });
}

// --------------------------------------------------------------------------
// 5. Popular Dishes Renderer
// --------------------------------------------------------------------------
function renderPopularDishes() {
    const popularContainer = document.getElementById('popularGrid');
    if (!popularContainer) return;

    const popularDishes = MENU_DATA.filter(item => item.popular);
    popularContainer.innerHTML = popularDishes.map(item => createFoodCardHTML(item)).join('');
    bindAddToCartButtons(popularContainer);
}

// --------------------------------------------------------------------------
// 6. Food Menu Renderer & Interactive Filters
// --------------------------------------------------------------------------
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    if (!menuGrid) return;

    const filteredItems = MENU_DATA.filter(item => {
        const matchesCategory = (currentCategory === 'all' || item.category === currentCategory);
        const matchesDiet = (currentDiet === 'all' || item.diet === currentDiet);
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesDiet && matchesSearch;
    });

    if (filteredItems.length === 0) {
        menuGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;" class="cart-empty-state">
                <i class="fa-solid fa-cookie-bite cart-empty-icon"></i>
                <h3>No dishes found matching your criteria</h3>
                <p>Try searching for something else or reset your filters.</p>
                <button class="btn btn-secondary btn-sm" onclick="resetMenuFilters()" style="margin-top: 16px;">
                    <i class="fa-solid fa-rotate-right"></i> Reset Filters
                </button>
            </div>
        `;
        return;
    }

    menuGrid.innerHTML = filteredItems.map(item => createFoodCardHTML(item)).join('');
    bindAddToCartButtons(menuGrid);
    initMenuControls();
}

function createFoodCardHTML(item) {
    const isVeg = item.diet === 'veg';
    return `
        <div class="food-card" data-id="${item.id}">
            <div class="food-img-wrap">
                <img src="${item.image}" alt="${item.title}" class="food-img" loading="lazy">
                <div class="food-badge">
                    <span class="dot ${isVeg ? 'veg-dot' : 'nonveg-dot'}"></span>
                    ${item.badge || (isVeg ? 'Pure Veg' : 'Non-Veg')}
                </div>
                <div class="prep-tag"><i class="fa-regular fa-clock"></i> ${item.prepTime}</div>
            </div>
            <div class="food-content">
                <div class="food-header">
                    <h3 class="food-title">${item.title}</h3>
                    <span class="food-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
                </div>
                <p class="food-desc">${item.desc}</p>
                <div class="food-footer">
                    <span class="food-price">₹${item.price}</span>
                    <button class="add-cart-btn" data-id="${item.id}">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
}

function initMenuControls() {
    const searchInput = document.getElementById('menuSearchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value.trim();
            if (clearBtn) clearBtn.style.display = searchQuery ? 'block' : 'none';
            renderMenu();
        };
    }

    if (clearBtn) {
        clearBtn.onclick = () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            clearBtn.style.display = 'none';
            renderMenu();
        };
    }

    const catTabs = document.querySelectorAll('.cat-tab');
    catTabs.forEach(tab => {
        tab.onclick = () => {
            catTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderMenu();
        };
    });

    const dietBtns = document.querySelectorAll('.diet-btn');
    dietBtns.forEach(btn => {
        btn.onclick = () => {
            dietBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDiet = btn.dataset.diet;
            renderMenu();
        };
    });
}

function resetMenuFilters() {
    currentCategory = 'all';
    currentDiet = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.cat-tab').forEach((t, idx) => t.classList.toggle('active', idx === 0));
    document.querySelectorAll('.diet-btn').forEach((b, idx) => b.classList.toggle('active', idx === 0));
    renderMenu();
}

function bindAddToCartButtons(container) {
    const btns = container.querySelectorAll('.add-cart-btn');
    btns.forEach(btn => {
        btn.onclick = () => {
            const itemId = btn.dataset.id;
            addToCart(itemId);
        };
    });
}

// --------------------------------------------------------------------------
// 7. Shopping Cart Engine & Auto-Navigation to Cart & Payment Page
// --------------------------------------------------------------------------
function addToCart(itemId) {
    const item = MENU_DATA.find(i => i.id === itemId);
    if (!item) return;

    const existingIndex = cartState.findIndex(c => c.id === itemId);
    if (existingIndex > -1) {
        cartState[existingIndex].qty += 1;
    } else {
        cartState.push({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            qty: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added "${item.title}" to cart! Proceeding to Payment... 💳`, 'success');

    // Auto-scroll smooth navigation to Cart & Payment Details Section
    setTimeout(() => {
        const cartPaymentSec = document.getElementById('cart-payment');
        if (cartPaymentSec) {
            cartPaymentSec.scrollIntoView({ behavior: 'smooth' });
        }
    }, 400);
}

function addExtraAddon(addonTitle, addonPrice) {
    const addonId = `addon-${Date.now()}`;
    cartState.push({
        id: addonId,
        title: addonTitle,
        price: addonPrice,
        image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=200&q=80",
        qty: 1
    });

    saveCart();
    updateCartUI();
    showToast(`Added Extra "${addonTitle}" (+₹${addonPrice}) to Cart!`, 'success');
}

function updateCartQty(itemId, delta) {
    const index = cartState.findIndex(c => c.id === itemId);
    if (index === -1) return;

    cartState[index].qty += delta;
    if (cartState[index].qty <= 0) {
        cartState.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('foodie_hub_cart', JSON.stringify(cartState));
}

function updateCartUI() {
    const cartBadge = document.getElementById('cartBadge');
    const totalCount = cartState.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadge) cartBadge.textContent = totalCount;

    const cartStepCount = document.getElementById('cartItemCountStep');
    if (cartStepCount) cartStepCount.textContent = totalCount;

    // Update Full-Page Cart Items List
    const pageCartList = document.getElementById('pageCartItemsList');
    const pageSubtotal = document.getElementById('pageSubtotal');
    const pageTax = document.getElementById('pageTax');
    const pageDelivery = document.getElementById('pageDelivery');
    const pageDiscountRow = document.getElementById('pageDiscountRow');
    const pageDiscountVal = document.getElementById('pageDiscountVal');
    const pageGrandTotal = document.getElementById('pageGrandTotal');
    const upiQrAmount = document.getElementById('upiQrAmount');
    const payCtaAmount = document.getElementById('payCtaAmount');
    const paySubmitBtn = document.getElementById('executeOrderPaymentBtn');

    if (!pageCartList) return;

    if (cartState.length === 0) {
        pageCartList.innerHTML = `
            <div class="cart-empty-state" style="padding: 40px 20px;">
                <i class="fa-solid fa-basket-shopping cart-empty-icon"></i>
                <h4>Your Cart is Empty</h4>
                <p>Add some delicious dishes from our food menu above to start your order.</p>
                <a href="#menu" class="btn btn-primary btn-sm" style="margin-top: 14px;">
                    <i class="fa-solid fa-utensils"></i> Browse Food Menu
                </a>
            </div>
        `;
        if (pageSubtotal) pageSubtotal.textContent = '₹0';
        if (pageTax) pageTax.textContent = '₹0';
        if (pageDelivery) pageDelivery.textContent = '₹0';
        if (pageGrandTotal) pageGrandTotal.textContent = '₹0';
        if (upiQrAmount) upiQrAmount.textContent = '₹0';
        if (payCtaAmount) payCtaAmount.textContent = '₹0';
        if (pageDiscountRow) pageDiscountRow.style.display = 'none';
        if (paySubmitBtn) paySubmitBtn.disabled = true;
        return;
    }

    if (paySubmitBtn) paySubmitBtn.disabled = false;

    // Render Page Cart Items
    pageCartList.innerHTML = cartState.map(item => `
        <div class="page-cart-item">
            <img src="${item.image}" alt="${item.title}" class="page-cart-img">
            <div class="page-cart-info">
                <div class="page-cart-title">${item.title}</div>
                <div class="page-cart-price">₹${item.price * item.qty}</div>
                <input type="text" class="item-notes-input" placeholder="Custom note (e.g. Less spicy, Extra dip)">
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
            </div>
        </div>
    `).join('');

    // Price Calculations
    const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const deliveryFee = subtotal >= 499 ? 0 : 40;
    
    let grandTotal = subtotal + tax + deliveryFee + (selectedPayTab === 'cod' ? selectedTip : 0) - activeDiscount;
    if (grandTotal < 0) grandTotal = 0;

    if (pageSubtotal) pageSubtotal.textContent = `₹${subtotal}`;
    if (pageTax) pageTax.textContent = `₹${tax}`;
    if (pageDelivery) pageDelivery.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    if (pageGrandTotal) pageGrandTotal.textContent = `₹${grandTotal}`;
    if (upiQrAmount) upiQrAmount.textContent = `₹${grandTotal}`;
    if (payCtaAmount) payCtaAmount.textContent = `₹${grandTotal}`;

    if (pageDiscountRow && activeDiscount > 0) {
        pageDiscountRow.style.display = 'flex';
        if (pageDiscountVal) pageDiscountVal.textContent = `-₹${activeDiscount}`;
    } else if (pageDiscountRow) {
        pageDiscountRow.style.display = 'none';
    }
}

// Clear Cart button
document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    cartState = [];
    activeDiscount = 0;
    saveCart();
    updateCartUI();
    showToast('Cart cleared.', 'info');
});

// Page Promo code apply
document.getElementById('pageApplyPromoBtn')?.addEventListener('click', () => {
    const promoInput = document.getElementById('pagePromoInput');
    const promoMsg = document.getElementById('pagePromoMsg');
    if (!promoInput || !promoMsg) return;

    const code = promoInput.value.trim().toUpperCase();
    const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (code === 'FOODIE20') {
        activeDiscount = Math.round(subtotal * 0.20);
        promoMsg.className = 'promo-msg success';
        promoMsg.textContent = `🎉 Promo FOODIE20 applied! You saved 20% (₹${activeDiscount}).`;
    } else if (code === 'WELCOME100') {
        if (subtotal >= 499) {
            activeDiscount = 100;
            promoMsg.className = 'promo-msg success';
            promoMsg.textContent = '🎉 Promo WELCOME100 applied! Flat ₹100 discount added.';
        } else {
            promoMsg.className = 'promo-msg error';
            promoMsg.textContent = 'Minimum cart value of ₹499 required for WELCOME100.';
        }
    } else {
        promoMsg.className = 'promo-msg error';
        promoMsg.textContent = 'Invalid promo code. Try FOODIE20 or WELCOME100.';
    }

    updateCartUI();
});

// --------------------------------------------------------------------------
// 8. Advanced Payment Gateway & Tab Switcher
// --------------------------------------------------------------------------
function initPagePaymentSystem() {
    const payTabs = document.querySelectorAll('.pay-tab-btn');
    const payContents = document.querySelectorAll('.pay-tab-content');

    payTabs.forEach(tab => {
        tab.onclick = () => {
            payTabs.forEach(t => t.classList.remove('active'));
            payContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            selectedPayTab = tab.dataset.paytab;
            const targetContent = document.getElementById(`paytab-${selectedPayTab}`);
            if (targetContent) targetContent.classList.add('active');
            
            updateCartUI();
        };
    });

    // Tip buttons for COD
    const tipBtns = document.querySelectorAll('.tip-btn');
    tipBtns.forEach(btn => {
        btn.onclick = () => {
            tipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTip = parseInt(btn.dataset.tip);
            updateCartUI();
        };
    });

    // Auto-formatting Card Number & Expiry
    const cardInput = document.getElementById('cardNumberInput');
    if (cardInput) {
        cardInput.oninput = (e) => {
            let val = e.target.value.replace(/\D/g, '');
            val = val.substring(0, 16);
            val = val.match(/.{1,4}/g)?.join(' ') || val;
            e.target.value = val;
        };
    }

    const expiryInput = document.getElementById('cardExpiryInput');
    if (expiryInput) {
        expiryInput.oninput = (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) {
                val = val.substring(0, 2) + '/' + val.substring(2, 4);
            }
            e.target.value = val;
        };
    }

    // Execute Payment Submit Button Handler
    const executePayBtn = document.getElementById('executeOrderPaymentBtn');
    if (executePayBtn) {
        executePayBtn.onclick = () => {
            if (cartState.length === 0) {
                showToast('Your cart is empty! Please add dishes before paying.', 'error');
                return;
            }

            const name = document.getElementById('pCustName')?.value.trim();
            const phone = document.getElementById('pCustPhone')?.value.trim();
            const address = document.getElementById('pCustAddress')?.value.trim();

            if (!name || !phone || !address) {
                showToast('Please enter your full name, phone number & delivery address.', 'error');
                return;
            }

            // Launch Simulated Payment Gateway Modal
            processPaymentGateway(name, phone, address);
        };
    }
}

// --------------------------------------------------------------------------
// 9. Payment Gateway Simulation & Order Confirmation
// --------------------------------------------------------------------------
function processPaymentGateway(name, phone, address) {
    const gatewayModal = document.getElementById('paymentGatewayModal');
    const statusTitle = document.getElementById('gatewayStatusTitle');
    const statusDesc = document.getElementById('gatewayStatusDesc');
    const progressFill = document.getElementById('gatewayProgressFill');
    const orderConfirmModal = document.getElementById('orderConfirmModal');

    if (!gatewayModal) return;

    gatewayModal.classList.add('active');
    if (progressFill) progressFill.style.width = '20%';
    if (statusTitle) statusTitle.textContent = 'Connecting to Secure Payment Gateway...';

    // Step 1: 1.2 Seconds
    setTimeout(() => {
        if (progressFill) progressFill.style.width = '60%';
        if (statusTitle) statusTitle.textContent = 'Verifying Payment Credentials & Bank Authorization...';
    }, 1200);

    // Step 2: 2.5 Seconds - Approved
    setTimeout(() => {
        if (progressFill) progressFill.style.width = '100%';
        if (statusTitle) statusTitle.textContent = 'Payment Approved! Generating Order Receipt...';
    }, 2500);

    // Step 3: 3.4 Seconds - Complete Order
    setTimeout(() => {
        gatewayModal.classList.remove('active');

        const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const tax = Math.round(subtotal * 0.05);
        const deliveryFee = subtotal >= 499 ? 0 : 40;
        const finalPayable = Math.max(0, subtotal + tax + deliveryFee + (selectedPayTab === 'cod' ? selectedTip : 0) - activeDiscount);

        const orderId = `#FH-${Math.floor(1000 + Math.random() * 9000)}`;
        const ptsEarned = Math.floor(finalPayable / 10);

        userPoints += ptsEarned;
        localStorage.setItem('foodie_hub_points', userPoints);
        updateRewardsUI();

        // Populate Order Confirmation Modal
        let payMethodLabel = "UPI / Scan & Pay";
        if (selectedPayTab === 'card') payMethodLabel = "Credit / Debit Card";
        if (selectedPayTab === 'netbanking') payMethodLabel = "Net Banking";
        if (selectedPayTab === 'cod') payMethodLabel = "Cash on Delivery";

        document.getElementById('confirmOrderId').textContent = orderId;
        document.getElementById('confirmPayMethod').textContent = payMethodLabel;
        document.getElementById('confirmAmount').textContent = `₹${finalPayable}`;
        document.getElementById('confirmPoints').textContent = `+${ptsEarned} Points`;

        if (orderConfirmModal) orderConfirmModal.classList.add('active');

        // Reset Cart
        cartState = [];
        activeDiscount = 0;
        saveCart();
        updateCartUI();

        // Update Tracker
        document.getElementById('trackDisplayId').textContent = orderId;
        trackerStep = 1;
        updateTrackerUI();

    }, 3400);
}

// Modal Close Handlers
document.getElementById('closeConfirmBtn')?.addEventListener('click', () => {
    document.getElementById('orderConfirmModal')?.classList.remove('active');
});

document.getElementById('trackMyOrderBtn')?.addEventListener('click', () => {
    document.getElementById('orderConfirmModal')?.classList.remove('active');
    document.getElementById('tracker')?.scrollIntoView({ behavior: 'smooth' });
});

// --------------------------------------------------------------------------
// 10. Smart Food Finder Modal
// --------------------------------------------------------------------------
function initSmartFinder() {
    const modal = document.getElementById('smartFinderModal');
    const openBtn = document.getElementById('smartFinderBtn');
    const closeBtn = document.getElementById('closeSmartFinder');
    const applyBtn = document.getElementById('applyFinderBtn');
    const budgetRange = document.getElementById('finderBudgetRange');
    const budgetVal = document.getElementById('finderBudgetValue');

    if (openBtn && modal) openBtn.onclick = () => modal.classList.add('active');
    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.remove('active');

    if (budgetRange && budgetVal) {
        budgetRange.oninput = (e) => {
            budgetVal.textContent = `₹${e.target.value}`;
        };
    }

    const optionBtns = document.querySelectorAll('.finder-opt-btn');
    optionBtns.forEach(btn => {
        btn.onclick = () => {
            const parent = btn.parentElement;
            parent.querySelectorAll('.finder-opt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    if (applyBtn) {
        applyBtn.onclick = () => {
            const maxBudget = parseInt(budgetRange.value);
            const activeDietBtn = document.querySelector('.finder-opt-btn[data-finder-diet].active');
            const dietPref = activeDietBtn ? activeDietBtn.dataset.finderDiet : 'any';

            const matches = MENU_DATA.filter(item => {
                const fitBudget = item.price <= maxBudget;
                const fitDiet = dietPref === 'any' || item.diet === dietPref;
                return fitBudget && fitDiet;
            });

            modal.classList.remove('active');

            if (matches.length > 0) {
                showToast(`Found ${matches.length} matching delicacies for you! ✨`, 'success');
                document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
                currentDiet = dietPref === 'any' ? 'all' : dietPref;
                renderMenu();
            } else {
                showToast('No exact match under that budget! Showing top recommendations.', 'info');
                document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }
}

// --------------------------------------------------------------------------
// 11. Table Booking Form Logic
// --------------------------------------------------------------------------
function initBookingForm() {
    const form = document.getElementById('tableBookingForm');
    const confirmModal = document.getElementById('bookingConfirmModal');
    const closeBtn = document.getElementById('closeBookingConfirmBtn');

    const dateInput = document.getElementById('bookDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('bookName').value;
            const date = document.getElementById('bookDate').value;
            const time = document.getElementById('bookTime').value;
            const guests = document.getElementById('bookGuests').value;
            const seating = document.getElementById('bookSeating').value;

            const resCode = `#TB-${Math.floor(1000 + Math.random() * 9000)}`;

            document.getElementById('confirmBookCode').textContent = resCode;
            document.getElementById('confirmBookName').textContent = name;
            document.getElementById('confirmBookDateTime').textContent = `${date} at ${time}`;
            document.getElementById('confirmBookDetails').textContent = `${guests} Guests • ${seating}`;

            confirmModal.classList.add('active');
            form.reset();
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => confirmModal.classList.remove('active');
    }
}

// --------------------------------------------------------------------------
// 12. Live Order Tracker System
// --------------------------------------------------------------------------
function initTracker() {
    const simBtn = document.getElementById('simStepBtn');
    const trackBtn = document.getElementById('trackOrderBtn');

    if (simBtn) {
        simBtn.onclick = () => {
            trackerStep = trackerStep < 5 ? trackerStep + 1 : 1;
            updateTrackerUI();
            showToast(`Order Status updated to Step ${trackerStep}/5!`, 'info');
        };
    }

    if (trackBtn) {
        trackBtn.onclick = () => {
            const input = document.getElementById('trackerInput');
            if (input && input.value.trim()) {
                document.getElementById('trackDisplayId').textContent = input.value.trim().toUpperCase();
                showToast(`Fetched status for ${input.value.trim().toUpperCase()}`, 'success');
            }
        };
    }

    updateTrackerUI();
}

function updateTrackerUI() {
    const steps = document.querySelectorAll('.timeline-step');
    const etaDisplay = document.getElementById('trackEta');

    steps.forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        if (stepNum <= trackerStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    const etas = ["30 Mins", "22 Mins", "15 Mins", "8 Mins", "Delivered! 🎉"];
    if (etaDisplay) etaDisplay.textContent = etas[trackerStep - 1] || "20 Mins";
}

// --------------------------------------------------------------------------
// 13. VIP Food Rewards Logic
// --------------------------------------------------------------------------
function initRewards() {
    updateRewardsUI();

    const redeemBtns = document.querySelectorAll('.redeem-btn');
    redeemBtns.forEach(btn => {
        btn.onclick = () => {
            const requiredPts = parseInt(btn.dataset.pts);
            const discount = btn.dataset.discount;

            if (userPoints >= requiredPts) {
                userPoints -= requiredPts;
                localStorage.setItem('foodie_hub_points', userPoints);

                if (discount === 'dessert') {
                    showToast('🎉 Free Dessert Voucher added to your account!', 'success');
                } else {
                    activeDiscount += parseInt(discount);
                    showToast(`🎉 ₹${discount} Voucher redeemed & applied to cart!`, 'success');
                }

                updateRewardsUI();
                updateCartUI();
            } else {
                showToast(`Insufficient Points! You need ${requiredPts - userPoints} more points.`, 'error');
            }
        };
    });
}

function updateRewardsUI() {
    const ptsVal = document.getElementById('userPointsVal');
    if (ptsVal) ptsVal.textContent = userPoints;
}

// --------------------------------------------------------------------------
// 14. Customer Reviews Section
// --------------------------------------------------------------------------
function initReviews() {
    const form = document.getElementById('addReviewForm');
    const grid = document.getElementById('reviewsGrid');

    if (form && grid) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('revName').value;
            const rating = parseInt(document.getElementById('revRating').value);
            const comment = document.getElementById('revComment').value;

            const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
            const initial = name.charAt(0).toUpperCase();

            const newRevCard = document.createElement('div');
            newRevCard.className = 'review-card';
            newRevCard.innerHTML = `
                <div class="rev-stars">${stars}</div>
                <p class="rev-text">"${comment}"</p>
                <div class="rev-author">
                    <div class="rev-avatar">${initial}</div>
                    <div>
                        <h5>${name}</h5>
                        <span>Verified Guest</span>
                    </div>
                </div>
            `;

            grid.prepend(newRevCard);
            form.reset();
            showToast('Thank you! Your review has been published. ⭐', 'success');
        };
    }
}

// --------------------------------------------------------------------------
// 15. Toast Notification Manager
// --------------------------------------------------------------------------
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-solid fa-circle-info text-gold';
    if (type === 'success') icon = 'fa-solid fa-circle-check text-gold';
    if (type === 'error') icon = 'fa-solid fa-circle-exclamation text-gold';

    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
