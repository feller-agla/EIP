/**
 * Gestionnaire d'état (State Manager)
 * Centralise toutes les interactions avec le LocalStorage
 */

const Store = {
    // Clés de stockage
    KEYS: {
        PRODUCTS: 'eventbenin_products',
        CART: 'eventbenin_cart',
        USER: 'eventbenin_user',
        SESSION: 'eventbenin_session', // New key for session
        ORDERS: 'eventbenin_orders'
    },

    // Initialisation
    init: () => {
        // Charger les produits s'ils n'existent pas
        if (!localStorage.getItem(Store.KEYS.PRODUCTS)) {
            localStorage.setItem(Store.KEYS.PRODUCTS, JSON.stringify(APP_DATA.projects));
        } else {
            // MERGE/RESET Strategy for Demo: 
            // If the structure is too different or we want to force updates, we might need to reset.
            // For now, let's just check if "Packs" exist, if not, reset to ensure new data is loaded.
            const currentProds = JSON.parse(localStorage.getItem(Store.KEYS.PRODUCTS));
            if (!currentProds.find(p => p.category === 'packs')) {
               localStorage.setItem(Store.KEYS.PRODUCTS, JSON.stringify(APP_DATA.projects));
            }
        }
        
        // Initialiser panier vide si inexistant
        if (!localStorage.getItem(Store.KEYS.CART)) {
            localStorage.setItem(Store.KEYS.CART, JSON.stringify([]));
        }

        // Initialiser commandes vides si inexistant
        if (!localStorage.getItem(Store.KEYS.ORDERS)) {
            localStorage.setItem(Store.KEYS.ORDERS, JSON.stringify([]));
        }
    },

    // --- PRODUITS ---
    getAllProducts: () => {
        return JSON.parse(localStorage.getItem(Store.KEYS.PRODUCTS));
    },

    getProductById: (id) => {
        const products = JSON.parse(localStorage.getItem(Store.KEYS.PRODUCTS) || '[]');
        return products.find(p => p.id === id);
    },

    addProduct: (product) => {
        const products = JSON.parse(localStorage.getItem(Store.KEYS.PRODUCTS) || '[]');
        const newProduct = {
            id: Utils.generateId(),
            ...product
        };
        products.push(newProduct);
        localStorage.setItem(Store.KEYS.PRODUCTS, JSON.stringify(products));
        return newProduct;
    },

    // Check availability for a specific date range (basic implementation: per single date)
    checkStock: (productId, date, quantity) => {
        const product = Store.getProductById(productId);
        if (!product) return false;

        const allOrders = JSON.parse(localStorage.getItem(Store.KEYS.ORDERS) || '[]');
        
        // Filter orders that are CONFIRMED and cover this date
        // Note: Our simple model just has one "eventDate". 
        // In a real app, we'd need start/end dates.
        const activeOrders = allOrders.filter(o => 
            (o.status === 'Confirmé' || o.status === 'En attente') && 
            o.eventDate === date
        );

        let reservedQuantity = 0;
        activeOrders.forEach(order => {
            const item = order.items.find(i => i.productId === productId);
            if (item) reservedQuantity += item.quantity;
        });

        return (product.stock - reservedQuantity) >= quantity;
    },

    getAvailableStock: (productId, date) => {
        const product = Store.getProductById(productId);
        if (!product) return 0;
        
        const allOrders = JSON.parse(localStorage.getItem(Store.KEYS.ORDERS) || '[]');
        const activeOrders = allOrders.filter(o => 
            (o.status === 'Confirmé' || o.status === 'En attente') && 
            o.eventDate === date
        );

        let reservedQuantity = 0;
        activeOrders.forEach(order => {
            const item = order.items.find(i => i.productId === productId);
            if (item) reservedQuantity += item.quantity;
        });
        
        return Math.max(0, product.stock - reservedQuantity);
    },

    // --- PANIER ---
    getCart: () => {
        return JSON.parse(localStorage.getItem(Store.KEYS.CART) || '[]');
    },

    addToCart: (productId, quantity = 1) => {
        const cart = Store.getCart();
        const existingItem = cart.find(item => item.productId === productId);
        
        // Simple global stock check (not date specific yet because date is chosen at checkout)
        // For the cart, we just check against total stock.
        const product = Store.getProductById(productId);
        const currentQtyInCart = existingItem ? existingItem.quantity : 0;
        
        if ((currentQtyInCart + parseInt(quantity)) > product.stock) {
             if (window.Utils && Utils.showToast) {
                Utils.showToast(`Stock insuffisant. Max disponible: ${product.stock}`, 'error');
             } else {
                alert(`Stock insuffisant. Max disponible: ${product.stock}`);
             }
             return false;
        }

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.push({ productId, quantity: parseInt(quantity) });
        }
        
        localStorage.setItem(Store.KEYS.CART, JSON.stringify(cart));
        Store.notifyObservers('cartUpdated');
        if (window.Utils && Utils.showToast) Utils.showToast("Article ajouté au panier !");
        return true;
    },

    removeFromCart: (productId) => {
        let cart = Store.getCart();
        cart = cart.filter(item => item.productId !== productId);
        localStorage.setItem(Store.KEYS.CART, JSON.stringify(cart));
        Store.notifyObservers('cartUpdated');
    },
    
    updateCartQuantity: (productId, quantity) => {
        let cart = Store.getCart();
        const item = cart.find(item => item.productId === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                 return Store.removeFromCart(productId);
            }
            localStorage.setItem(Store.KEYS.CART, JSON.stringify(cart));
            Store.notifyObservers('cartUpdated');
        }
    },

    clearCart: () => {
         localStorage.setItem(Store.KEYS.CART, JSON.stringify([]));
         Store.notifyObservers('cartUpdated');
    },

    getCartTotal: () => {
        const cart = Store.getCart();
        const products = Store.getAllProducts();
        return cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    },

    getCartCount: () => {
        const cart = Store.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    },

    // --- UTILISATEUR & AUTH ---
    getUser: () => {
        return JSON.parse(localStorage.getItem(Store.KEYS.USER));
    },

    setUser: (user) => {
        localStorage.setItem(Store.KEYS.USER, JSON.stringify(user));
        Store.notifyObservers('userUpdated');
    },

    getSession: () => {
        return JSON.parse(localStorage.getItem(Store.KEYS.SESSION));
    },

    setSession: (session) => {
        localStorage.setItem(Store.KEYS.SESSION, JSON.stringify(session));
        Store.notifyObservers('sessionUpdated');
    },

    // Removed old login simulation
    // login: (email, password) => { ... }

    logout: async () => { // Made async for API call
        // Call backend logout endpoint
        try {
            const response = await fetch('http://localhost:4000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include Authorization header if session token is needed for logout
                    // 'Authorization': `Bearer ${Store.getSession()?.access_token}`
                },
            });

            if (!response.ok) {
                console.error('Backend logout failed:', await response.json());
                // Even if backend logout fails, clear local storage for UX
            }
        } catch (error) {
            console.error('Network error during logout:', error);
        } finally {
            localStorage.removeItem(Store.KEYS.USER);
            localStorage.removeItem(Store.KEYS.SESSION);
            Store.notifyObservers('userUpdated'); // Notify UI of logout
            window.location.href = 'index.html'; // Redirect after clearing local data
        }
    },

    // --- COMMANDES ---
    createOrder: (orderDetails) => {
        const orders = JSON.parse(localStorage.getItem(Store.KEYS.ORDERS) || '[]');
        const newOrder = {
            id: 'RES-2026-' + Math.floor(1000 + Math.random() * 9000), 
            date: new Date().toISOString(),
            status: 'En attente', // En attente, Confirmé, Terminé, Annulé
            paymentType: orderDetails.paymentType || 'full', // 'full' or 'deposit'
            remainingBalance: orderDetails.remainingBalance || 0,
            ...orderDetails
        };
        orders.unshift(newOrder); // Ajouter au début
        localStorage.setItem(Store.KEYS.ORDERS, JSON.stringify(orders));
        Store.clearCart();
        return newOrder;
    },

    getUserOrders: () => {
        return JSON.parse(localStorage.getItem(Store.KEYS.ORDERS) || '[]');
    },

    // --- PATTERN OBSERVER POUR UI UPDATES ---
    observers: {},
    
    subscribe: (event, callback) => {
        if (!Store.observers[event]) Store.observers[event] = [];
        Store.observers[event].push(callback);
    },

    notifyObservers: (event) => {
        if (Store.observers[event]) {
            Store.observers[event].forEach(cb => cb());
        }
    }
};

// Initialiser au chargement
Store.init();
