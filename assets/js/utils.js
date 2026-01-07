/**
 * Fonctions utilitaires
 */

const Utils = {
    // Formater un prix en FCFA
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR', // Astuce: On utilise 'EUR' pour le formatage européen, puis on remplace le symbole
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('€', 'FCFA');
    },

    // Générer un ID unique
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Formater une date (YYYY-MM-DD -> DD Month YYYY)
    formatDate: (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    },

    // Récupérer un paramètre d'URL
    getUrlParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
};
