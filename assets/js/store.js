/**
 * Gestionnaire d'état (State Manager)
 * Centralise toutes les interactions avec le LocalStorage
 */

const Store = {
    // Clés de stockage
    KEYS: {
        PRODUCTS: 'eventbenin_ products',
        CART: 'eventbenin_cart',
        USER: 'eventbenin_user',
        ORDERS: 'eventbenin_orders'
    },

    // Initialisation
    init: () => {
        // Charger les produits s'ils n'existent pas
        if (!localStorage.getItem(Store.KEYS.PRODUCTS)) {
            localStorage.setItem(Store.KEYS.PRODUCTS, JSON.stringify(APP_DATA.projects));
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
        const products = Store.getAllProducts();
        return products.find(p => p.id === id);
    },

    // --- PANIER ---
    getCart: () => {
        return JSON.parse(localStorage.getItem(Store.KEYS.CART) || '[]');
    },

    addToCart: (productId, quantity = 1) => {
        const cart = Store.getCart();
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.push({ productId, quantity: parseInt(quantity) });
        }
        
        localStorage.setItem(Store.KEYS.CART, JSON.stringify(cart));
        Store.notifyObservers('cartUpdated');
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

    login: (email, password) => {
        // Simulation améliorée avec Rôles
        if (email === 'vendor@eventbenin.bj' && password === 'admin123') {
             const vendor = {
                id: 'v1',
                name: "Event's House",
                email: email,
                role: 'vendor',
                avatar: 'EH'
            };
            localStorage.setItem(Store.KEYS.USER, JSON.stringify(vendor));
            return true;
        }

        if (email && password) {
            const user = {
                id: 'u1',
                name: 'Marie A.',
                email: email,
                role: 'client',
                avatar: 'MA'
            };
            localStorage.setItem(Store.KEYS.USER, JSON.stringify(user));
            return true;
        }
        return false;
    },

    logout: () => {
        localStorage.removeItem(Store.KEYS.USER);
        window.location.href = 'index.html';
    },

    // --- COMMANDES ---
    createOrder: (orderDetails) => {
        const orders = JSON.parse(localStorage.getItem(Store.KEYS.ORDERS) || '[]');
        const newOrder = {
            id: 'RES-2026-' + Math.floor(100 + Math.random() * 900), // ex: RES-2026-105
            date: new Date().toISOString(),
            status: 'En attente', // En attente, Confirmé, Terminé
            ...orderDetails
        };
        orders.unshift(newOrder); // Ajouter au début
        localStorage.setItem(Store.KEYS.ORDERS, JSON.stringify(orders));
        Store.clearCart();
        return newOrder;
    },

    getUserOrders: () => {
        // En vrai, on filtrerait par ID user, mais ici c'est stocké en local donc c'est forcément "mes" commandes
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
