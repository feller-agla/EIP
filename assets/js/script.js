/*
 * EventBenin Location - Main Script
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Toggle icon
            const icon = mobileBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Close mobile menu
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Animation on Scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.category-card, .step-card, .value-list li');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // --- Cart Logic (MVP) ---
    updateCartCount();

    // Add to Cart Buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            const title = btn.dataset.title;
            const price = parseInt(btn.dataset.price);
            
            addToCart({ id, title, price });
            alert('Produit ajouté au panier !');
        });
    });
});

// Cart Functions
function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem('eventBeninCart')) || [];
    cart.push(item);
    localStorage.setItem('eventBeninCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('eventBeninCart')) || [];
    const count = cart.length;
    // Assuming there's a cart badge in the nav (we'll add it)
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Load Cart Items (for panier.html)
function loadCartItems() {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    
    if (!cartContainer) return;

    const cart = JSON.parse(localStorage.getItem('eventBeninCart')) || [];
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<tr><td colspan="4" class="text-center">Votre panier est vide.</td></tr>';
        if(totalElement) totalElement.textContent = '0 FCFA';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        html += `
            <tr>
                <td>${item.title}</td>
                <td>1 jour</td>
                <td>${item.price.toLocaleString()} FCFA</td>
                <td><button onclick="removeFromCart(${index})" style="color: red; background: none; border: none; cursor: pointer;"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    });

    cartContainer.innerHTML = html;
    if(totalElement) totalElement.textContent = total.toLocaleString() + ' FCFA';
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('eventBeninCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('eventBeninCart', JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
}

// Run loadCartItems if we are on the cart page
if (window.location.pathname.includes('panier.html')) {
    document.addEventListener('DOMContentLoaded', loadCartItems);
}
