# Documentation Technique - Projet EIP EventBenin

Ce document détaille le fonctionnement interne de la plateforme pour faciliter la collaboration entre les développeurs.

## Architecture du Projet

L'application repose sur une architecture decouplee :
- Frontend : Interface utilisateur developpee en HTML, CSS et JavaScript pur.
- Backend : API developpee avec Node.js et Express, servant de pont avec Supabase.
- Base de donnees et Authentification : Gerees par Supabase.

## Configuration et Lancement

Le projet necessite deux serveurs actifs pour un fonctionnement complet.

### Backend (Port 4000)
Le serveur backend gere les communications securisees avec Supabase.
1. Acceder au dossier : cd backend
2. Installer les dependances : npm install
3. Lancer le serveur : node index.js
Le fichier .env doit contenir les variables SUPABASE_URL et SUPABASE_ANON_KEY.

### Frontend (Port 4001)
Le frontend peut etre servi par n'importe quel serveur statique. Pour les tests, le port 4001 est recommande.
Exemple avec npx : npx serve frontend -l 4001

## Authentification et Roles

L'authentification est integree avec Supabase Auth. Les informations specifiques aux utilisateurs sont stockees dans l'objet user_metadata.

### Types d'utilisateurs
Deux types de comptes sont geres via la propriete user_type :
- client : Utilisateur souhaitant louer du materiel.
- loueur : Professionnel proposant du materiel a la location.

### Flux d'inscription et de connexion
Les pages inscription.html et connexion.html ont ete harmonisees graphiquement. Elles envoient des requetes POST au backend qui communique ensuite avec Supabase.

## Gestion de l'Etat (Store)

Le fichier assets/js/store.js centralise la gestion du stockage local (LocalStorage).
- Store.getUser() : Recupere l'objet utilisateur actuellement connecte.
- Store.setUser(user) : Met a jour les informations utilisateur en local.
- Store.getSession() : Recupere le jeton de session actif.

## Integration Dynamique des Donnees

Pour injecter des donnees dynamiques dans les pages HTML (comme le nom de l'utilisateur ou les statistiques), il est imperatif d'ecouter l'evenement global appReady genere par app.js.

Exemple d'utilisation :
document.addEventListener('appReady', () => {
    const user = Store.getUser();
    if (user && user.user_metadata) {
        const userName = user.user_metadata.name;
        // Logique de mise a jour du DOM
    }
});

## Fichiers Structuraux

- assets/js/app.js : Gère le cycle de vie de l'application, le chargement des composants communs (Header/Footer) et le controle d'acces aux pages protegees.
- assets/js/store.js : Interface unique pour toutes les operations sur le LocalStorage.
- assets/css/style.css : Contient l'ensemble des styles, y compris les classes pour le design vitreux (Glassmorphism) des pages d'authentification.

## Objectifs de Developpement Futurs

1. Migration des donnees : Remplacer les donnees de test du fichier assets/js/data.js par des requetes vers les tables de la base de donnees Supabase.
2. Tunnel de commande : Finaliser la liaison entre le panier local et la creation de reservations en base de donnees.
3. Module Profil : Permettre aux utilisateurs de modifier leurs informations personnelles et leur mot de passe directement depuis l'interface.
