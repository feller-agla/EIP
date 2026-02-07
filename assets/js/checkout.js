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
    
    // Initial calc
    updateTotalDisplay();
});

window.currentCartTotal = 0;

function getShippingCost() {
    const delivery = document.querySelector('input[name="delivery"]:checked');
    if (!delivery) return 0;
    
    if (delivery.value === 'zone1') return 1000;
    if (delivery.value === 'zone2') return 1500;
    return 0; // pickup
}

function updateTotalDisplay() {
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    const cartTotal = window.currentCartTotal;
    const shipping = getShippingCost();
    
    const grandTotal = cartTotal + shipping;
    
    // Update labels in summary if exists
    const shippingLabel = document.getElementById('summary-shipping');
    if (shippingLabel) shippingLabel.textContent = Utils.formatCurrency(shipping);

    const totalLabel = document.getElementById('checkout-total');
    if (totalLabel) totalLabel.textContent = Utils.formatCurrency(grandTotal);

    let amountToPay = grandTotal;
    if (paymentType === 'deposit') {
        amountToPay = grandTotal * 0.3;
    }
    
    document.getElementById('pay-amount').textContent = Utils.formatCurrency(amountToPay);
}


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

    window.currentCartTotal = total;
    
    // Append Shipping Line
    const summaryContainer = document.getElementById('checkout-items').parentNode;
    let shippingRow = document.getElementById('shipping-row');
    if (!shippingRow) {
        shippingRow = document.createElement('div');
        shippingRow.id = 'shipping-row';
        shippingRow.style.display = 'flex';
        shippingRow.style.justifyContent = 'space-between';
        shippingRow.style.marginBottom = '0.5rem';
        shippingRow.style.marginTop = '1rem';
        shippingRow.style.fontSize = '0.9rem';
        shippingRow.innerHTML = `<span>Livraison</span><span id="summary-shipping">0 F</span>`;
        // Insert before total border
        const totalBorder = summaryContainer.children[summaryContainer.children.length - 1];
        summaryContainer.insertBefore(shippingRow, totalBorder);
    }

    updateTotalDisplay();
}

function handlePayment(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    // Simulate processing
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';

    setTimeout(() => {
        const date = document.getElementById('event-date').value;
        const location = document.getElementById('event-location').value;
        const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
        const deliveryMode = document.querySelector('input[name="delivery"]:checked').value;
        
        const cartTotal = Store.getCartTotal();
        const shipping = getShippingCost();
        const grandTotal = cartTotal + shipping;
        
        let amountPaid = grandTotal;
        let remaining = 0;
        
        if (paymentType === 'deposit') {
            amountPaid = grandTotal * 0.3;
            remaining = grandTotal - amountPaid;
        }

        const order = Store.createOrder({
            eventDate: date,
            eventLocation: location,
            items: Store.getCart(),
            amount: grandTotal, 
            paymentType: paymentType,
            deliveryMode: deliveryMode,
            shippingCost: shipping,
            paidAmount: amountPaid,
            remainingBalance: remaining
        });

        // Show Success and Redirect
        alert('Paiement réussi ! Votre réservation est confirmée.');
        window.location.href = 'dashboard-client.html'; // Or success page
    }, 2000);
}
