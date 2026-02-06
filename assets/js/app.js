/**
 * Application Core Logic
 * Gère le chargement dynamique du header/footer et l'initialisation des pages
 */

const App = {
    init: async () => {
        // 1. Charger le Header et le Footer
        await App.loadHeader();
        await App.loadFooter();

        // 2. Mettre à jour l'état (Panier, User)
        App.updateUIState();

        // 3. Setup des listeners globaux
        App.setupGlobalListeners();
        
        // 4. Access Control (Security)
        App.checkAccessControl();

        // 5. Dispatch event 'appReady' pour les scripts spécifiques aux pages
        document.dispatchEvent(new Event('appReady'));
    },

    checkAccessControl: () => {
        const user = Store.getUser();
        const path = window.location.pathname;
        const page = path.split('/').pop();

        // List of pages restricted for Vendors
        const clientOnlyPages = ['catalogue.html', 'panier.html', 'checkout.html', 'product-details.html'];
        
        // List of pages restricted for Clients
        const vendorOnlyPages = ['dashboard-loueur.html', 'profile-loueur.html']; // profile-loueur is public usually? "Public Vendor Profile" -> Client should see it.
        // Wait, "profile-loueur.html" is likely the public view. "dashboard-loueur.html" is private.

        if (user && user.role === 'vendor') {
            if (clientOnlyPages.includes(page)) {
                alert("Espace réservé aux clients. Redirection vers votre tableau de bord.");
                window.location.href = 'dashboard-loueur.html';
            }
        }
        
        if (user && user.role === 'client') {
            if (page === 'dashboard-loueur.html') {
                window.location.href = 'dashboard-client.html';
            }
        }
        
        // Protect Dashboards if not logged in
        if (!user) {
            if (page === 'dashboard-loueur.html' || page === 'dashboard-client.html' || page === 'checkout.html' || page === 'panier.html') {
                window.location.href = 'connexion.html';
            }
        }
    },

    loadHeader: async () => {
        const header = document.querySelector('nav.navbar') || document.createElement('nav');
        if (!document.querySelector('nav.navbar')) {
            header.className = 'navbar';
            document.body.prepend(header);
        }

        const user = Store.getUser();
        const isLoggedIn = !!user;
        const isVendor = user?.role === 'vendor';

        header.innerHTML = `
            <div class="container">
                <a href="index.html" class="logo">
                    <i class="fas fa-layer-group"></i> EventBenin<span style="color:var(--secondary-color)">.</span>
                </a>
                
                <div class="mobile-toggle">
                    <i class="fas fa-bars"></i>
                </div>

                <div class="nav-collapse">
                    <ul class="nav-menu">
                        <li><a href="index.html" class="nav-link ${App.isActive('index.html')}">Accueil</a></li>
                        <li><a href="catalogue.html" class="nav-link ${App.isActive('catalogue.html')}">Catalogue</a></li>
                        
                        ${isVendor ? 
                            `<li><a href="dashboard-loueur.html" class="nav-link ${App.isActive('dashboard-loueur.html')}">Espace Loueur</a></li>` :
                            `<li><a href="index.html#comment-ca-marche" class="nav-link">Comment ça marche</a></li>`
                        }
                    </ul>
                    
                    <div class="nav-actions">
                        <!-- Cart Icon (Hidden for Vendors) -->
                        ${!isVendor ? `
                        <a href="panier.html" class="icon-btn" title="Mon Panier">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="badge" id="cart-count">0</span>
                        </a>` : ''}

                        <!-- User Menu -->
                        ${isLoggedIn ? `
                            <div class="user-dropdown">
                                <div class="user-avatar">${user.avatar || (user.name ? user.name.charAt(0) : 'U')}</div>
                                <div class="dropdown-menu">
                                    <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
                                        <strong>${user.name}</strong><br>
                                        <small style="color:var(--text-gray)">${user.email}</small>
                                    </div>
                                    <a href="${isVendor ? 'dashboard-loueur.html' : 'dashboard-client.html'}" class="dropdown-item"><i class="fas fa-th-large"></i> Mon Tableau de bord</a>
                                    <a href="#" onclick="App.logout()" class="dropdown-item"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>
                                </div>
                            </div>
                        ` : `
                            <a href="connexion.html" class="btn btn-primary btn-sm">Compte</a>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    loadFooter: async () => {
        const footer = document.querySelector('footer.footer') || document.createElement('footer');
        if (!document.querySelector('footer.footer')) {
            footer.className = 'footer';
            document.body.append(footer);
            
            footer.innerHTML = `
                <div class="container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <h3>EventBenin.</h3>
                            <p>La plateforme de référence pour la location de matériel événementiel au Bénin. Simple, rapide, sécurisé.</p>
                        </div>
                        <div class="footer-links">
                            <h4>Plateforme</h4>
                            <ul>
                                <li><a href="catalogue.html">Catalogue</a></li>
                                <li><a href="index.html#comment-ca-marche">Comment ça marche</a></li>
                                <li><a href="dashboard-loueur.html">Espace Loueur</a></li>
                            </ul>
                        </div>
                        <div class="footer-links">
                            <h4>Légal</h4>
                            <ul>
                                <li><a href="#">Conditions Générales</a></li>
                                <li><a href="#">Politique de Confidentialité</a></li>
                            </ul>
                        </div>
                        <div class="footer-links">
                            <h4>Contact</h4>
                            <ul>
                                <li><i class="fas fa-envelope"></i> contact@eventbenin.bj</li>
                                <li><i class="fas fa-phone"></i> +229 01 23 45 67</li>
                            </ul>
                        </div>
                    </div>
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem; text-align: center; font-size: 0.9rem;">
                        &copy; 2026 EventBenin. Tous droits réservés.
                    </div>
                </div>
            `;
        }
    },

    updateUIState: () => {
        // Update Cart Count
        const count = Store.getCartCount();
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    setupGlobalListeners: () => {
        // Ecouter les changements de store
        Store.subscribe('cartUpdated', App.updateUIState);

        // Mobile Menu Toggle
        const toggle = document.querySelector('.mobile-toggle');
        const menu = document.querySelector('.nav-collapse');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                const icon = toggle.querySelector('i');
                if (menu.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        }

        // Dropdown Toggle (Stability Fix)
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.user-dropdown');
            const menu = document.querySelector('.dropdown-menu');
            
            if (dropdown && menu) {
                // If clicking inside dropdown, toggle
                if (dropdown.contains(e.target)) {
                    menu.classList.toggle('show');
                } else {
                    // Click outside -> close
                    menu.classList.remove('show');
                }
            }
        });
    },

    isActive: (page) => {
        const path = window.location.pathname;
        return path.includes(page) ? 'active' : '';
    },

    logout: () => {
        Store.logout();
    },

    // Afficher une notification Toast
    showToast: (message, type = 'success') => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="color: ${type === 'success' ? 'var(--primary-color)' : 'var(--accent-color)'}; font-size: 1.5rem;"></i>
            <div class="toast-content">
                <h4>${type === 'success' ? 'Succès' : 'Erreur'}</h4>
                <p>${message}</p>
            </div>
        `;

        container.appendChild(toast);

        // Remove after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
