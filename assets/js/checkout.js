/**
 * Logic for Checkout Page
 */

// Initialize store manually since we don't import app.js which does it (to avoid auto-injecting full header)
Store.init();

document.addEventListener('DOMContentLoaded', () => {
    const user = Store.getUser();
    if (!user) {
        window.location.href = 'connexion.html?redirect=checkout';
        return;
    }

    renderOrderSummary();

    document.getElementById('checkout-form').addEventListener('submit', handlePayment);
});

function renderOrderSummary() {
    const items = Store.getCart();
    const products = Store.getAllProducts();
    const container = document.getElementById('checkout-items');
    
    if (items.length === 0) {
        window.location.href = 'catalogue.html';
        return;
    }

    let total = 0;

    container.innerHTML = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        const itemTotal = product.price * item.quantity;
        total += itemTotal;
        return `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 50px; height: 50px; background-image: url('${product.image}'); background-size: cover; border-radius: var(--radius-sm);"></div>
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${product.name}</div>
                    <div style="color: var(--text-gray); font-size: 0.8rem;">x${item.quantity} - ${Utils.formatCurrency(itemTotal)}</div>
                </div>
            </div>
        `;
    }).join('');

    const formattedTotal = Utils.formatCurrency(total);
    document.getElementById('checkout-total').textContent = formattedTotal;
    document.getElementById('pay-amount').textContent = formattedTotal;
}

function handlePayment(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    // Simulate processing
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';

    setTimeout(() => {
        // Create Order
        const date = document.getElementById('event-date').value;
        const location = document.getElementById('event-location').value;
        
        const order = Store.createOrder({
            eventDate: date,
            eventLocation: location,
            items: Store.getCart(),
            amount: Store.getCartTotal()
        });

        // Show Success and Redirect
        alert('Paiement réussi ! Votre réservation est confirmée.');
        window.location.href = 'dashboard-client.html'; // Or success page
    }, 2000);
}
