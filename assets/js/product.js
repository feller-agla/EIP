/**
 * Logic for Product Details Page
 */

document.addEventListener('appReady', () => {
    const productId = Utils.getUrlParam('id');
    if (!productId) {
        window.location.href = 'catalogue.html';
        return;
    }

    const product = Store.getProductById(productId);
    if (!product) {
        document.getElementById('product-content').innerHTML = '<div style="text-align:center">Produit introuvable</div>';
        return;
    }

    renderProduct(product);
});

function renderProduct(product) {
    // Update breadcrumb
    document.getElementById('breadcrumb-current').textContent = product.name;

    const container = document.getElementById('product-content');
    container.innerHTML = `
        <!-- Gallery -->
        <div class="product-gallery" style="background-image: url('${product.image}'); position: relative;">
            ${product.isPopular ? '<span class="product-badge" style="top: 20px; right: 20px; font-size: 1rem;">Populaire</span>' : ''}
        </div>

        <!-- Meta -->
        <div class="product-meta">
            <div>
                <span class="product-category">${product.category}</span>
                <h1 class="section-title" style="margin-bottom: 0.5rem; font-size: 2rem;">${product.name}</h1>
                <div style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 1.5rem;">Réf: ${product.id.toUpperCase().substring(0,6)} • Stock: ${product.stock} disp.</div>
                
                <div class="price-tag">${Utils.formatCurrency(product.price)} <span style="font-size: 1rem; color: var(--text-gray); font-weight: 500;">/ jour</span></div>
            </div>

            <div style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 1.5rem 0;">
                <p style="color: var(--text-gray); line-height: 1.8;">${product.description}</p>
            </div>

            <div class="form-group">
                <label class="form-label">Quantité souhaitée</label>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="display: flex; align-items: center; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
                        <button class="btn btn-secondary" style="border:none; padding: 0.5rem 1rem;" onclick="updateQty(-1)">-</button>
                        <input type="number" id="qty-input" value="1" min="1" max="${product.stock}" style="border:none; width: 50px; text-align: center; font-weight: bold;">
                        <button class="btn btn-secondary" style="border:none; padding: 0.5rem 1rem;" onclick="updateQty(1)">+</button>
                    </div>
                    
                    <button class="btn btn-primary" onclick="addToCart('${product.id}')" style="flex: 1; height: 50px;">
                        <i class="fas fa-cart-plus"></i> Ajouter au Panier
                    </button>
                </div>
                <div class="mt-1" style="font-size: 0.85rem; color: var(--text-gray);">Total: <span id="total-price" style="font-weight:700; color: var(--text-dark)">${Utils.formatCurrency(product.price)}</span></div>
            </div>

            <div style="background: rgba(0, 135, 81, 0.05); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid rgba(0, 135, 81, 0.2); display: flex; gap: 1rem;">
                <i class="fas fa-truck" style="color: var(--primary-color); font-size: 1.5rem;"></i>
                <div>
                    <h4 style="color: var(--primary-color); margin-bottom: 0.25rem;">Livraison & Installation</h4>
                    <p style="font-size: 0.9rem; color: var(--text-gray);">Disponible à Cotonou et environs. Nous livrons, installons et récupérons le matériel.</p>
                </div>
            </div>
        </div>
    `;

    // Initialize total price calculation var
    window.currentBasePrice = product.price;
}

// Global scope for onclick handlers (simpler than event delegation for this specific layout)
window.updateQty = (change) => {
    const input = document.getElementById('qty-input');
    let val = parseInt(input.value) + change;
    if (val < 1) val = 1;
    // Check stock limit logic could be here
    
    input.value = val;
    
    // Update total
    const total = val * window.currentBasePrice;
    document.getElementById('total-price').textContent = Utils.formatCurrency(total);
};

window.addToCart = (id) => {
    const qty = parseInt(document.getElementById('qty-input').value);
    Store.addToCart(id, qty);
    App.showToast(`${qty} produit(s) ajouté(s) au panier !`);
};
