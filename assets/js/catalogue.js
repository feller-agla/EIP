/**
 * Logic for Catalogue Page
 */

let state = {
    products: [],
    filters: {
        category: 'all',
        maxPrice: 200000,
        search: ''
    }
};

document.addEventListener('appReady', () => {
    state.products = Store.getAllProducts();
    
    // Check for URL params (Search)
    const urlSearch = Utils.getUrlParam('search');
    if (urlSearch) {
        state.filters.search = decodeURIComponent(urlSearch);
        document.getElementById('catalogue-search').value = state.filters.search;
    }

    renderFilters();
    renderProducts();
    setupEventListeners();
});

function renderFilters() {
    const categories = APP_DATA.categories;
    const container = document.getElementById('category-filters');
    
    container.innerHTML = categories.map(cat => `
        <label class="checkbox-label">
            <input type="radio" name="category" value="${cat.id}" ${state.filters.category === cat.id ? 'checked' : ''}>
            ${cat.name}
        </label>
    `).join('');
}

function renderProducts() {
    const container = document.getElementById('products-grid');
    const noResults = document.getElementById('no-results');
    
    // Filter Logic
    const filtered = state.products.filter(p => {
        const matchCategory = state.filters.category === 'all' || p.category === state.filters.category;
        const matchPrice = p.price <= state.filters.maxPrice;
        const matchSearch = !state.filters.search || 
            p.name.toLowerCase().includes(state.filters.search.toLowerCase()) || 
            p.description.toLowerCase().includes(state.filters.search.toLowerCase());
        
        return matchCategory && matchPrice && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    
    // Animate products in
    container.innerHTML = filtered.map((product, index) => `
        <div class="product-card" style="animation: fadeInUp 0.5s ease backwards ${index * 0.1}s">
            <div class="product-image" style="background-image: url('${product.image}');">
                ${product.isPopular ? '<span class="product-badge">Populaire</span>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title"><a href="product-details.html?id=${product.id}">${product.name}</a></h3>
                <div class="product-price">${Utils.formatCurrency(product.price)} <span>/ jour</span></div>
                <div style="display: flex; gap: 0.5rem; margin-top: auto;">
                    <a href="product-details.html?id=${product.id}" class="btn btn-outline btn-sm" style="flex: 1; text-align: center;">Voir</a>
                    <button class="btn btn-primary btn-sm addToCartBtn" data-id="${product.id}" style="flex: 1;">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Re-attach listeners for buttons (better to event delegate but this is simple)
    document.querySelectorAll('.addToCartBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            addToCart(id);
        });
    });
}

function setupEventListeners() {
    // Categories
    document.getElementById('category-filters').addEventListener('change', (e) => {
        if (e.target.name === 'category') {
            state.filters.category = e.target.value;
            renderProducts();
        }
    });

    // Price
    const priceRange = document.getElementById('price-range');
    const priceDisplay = document.getElementById('price-display');
    
    priceRange.addEventListener('input', (e) => {
        state.filters.maxPrice = parseInt(e.target.value);
        priceDisplay.textContent = Utils.formatCurrency(state.filters.maxPrice);
        renderProducts();
    });

    // Search
    const searchInput = document.getElementById('catalogue-search');
    const searchBtn = document.getElementById('search-btn');

    const doSearch = () => {
        state.filters.search = searchInput.value.trim();
        renderProducts();
    };

    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') doSearch();
        // Optional: live search
        // state.filters.search = e.target.value;
        // renderProducts();
    });

    // Reset
    document.getElementById('reset-filters').addEventListener('click', () => {
        state.filters = { category: 'all', maxPrice: 200000, search: '' };
        
        // Reset inputs
        document.querySelector('input[name="category"][value="all"]').checked = true;
        priceRange.value = 200000;
        priceDisplay.textContent = Utils.formatCurrency(200000);
        searchInput.value = '';
        
        renderProducts();
    });
}

function addToCart(productId) {
    Store.addToCart(productId, 1);
    App.showToast('Produit ajouté au panier !');
}

// Add CSS keyframes for animation if not present
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
