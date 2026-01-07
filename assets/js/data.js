/**
 * Données simulées pour EventBenin
 * Ces données seront chargées dans le localStorage au premier lancement
 */

const APP_DATA = {
    projects: [
        {
            id: '1',
            name: 'Pack Sono Complet 500W',
            category: 'sonorisation',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Pack idéal pour les anniversaires et petites fêtes. Comprend 2 enceintes actives 250W, 1 table de mixage 4 canaux, et les câbles nécessaires.',
            isPopular: true,
            stock: 5
        },
        {
            id: '2',
            name: 'Chaise Chiavari Or',
            category: 'mobilier',
            price: 1500,
            image: 'https://images.unsplash.com/photo-1503602642458-2321114458ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'L\'élégance par excellence. Chaises Chiavari dorées avec coussin blanc inclus. Parfaites pour les mariages et galas.',
            isPopular: true,
            stock: 200
        },
        {
            id: '3',
            name: 'Chapiteau 100 Personnes',
            category: 'tentes',
            price: 150000,
            image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Grand chapiteau blanc imperméable. Installation et démontage inclus dans le prix. Dimensions : 10m x 10m.',
            isPopular: true,
            stock: 2
        },
        {
            id: '4',
            name: 'Kit Lumière Ambiance',
            category: 'eclairage',
            price: 30000,
            image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Créez une atmosphère magique avec ce kit de 4 projecteurs LED RGBW et 1 guirlande de 20m.',
            isPopular: true,
            stock: 10
        },
        {
            id: '5',
            name: 'Table Ronde 10p',
            category: 'mobilier',
            price: 5000,
            image: 'https://images.unsplash.com/photo-1574621100236-d25a64a4aeee?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Table ronde pliable de 180cm de diamètre, idéale pour 10 convives. Nappe blanche non incluse.',
            isPopular: false,
            stock: 20
        },
        {
            id: '6',
            name: 'Micro Sans Fil Pro',
            category: 'sonorisation',
            price: 10000,
            image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Microphone main sans fil portée 50m. Son clair, idéal pour les discours et animations.',
            isPopular: false,
            stock: 8
        },
         {
            id: '7',
            name: 'Arche Florale',
            category: 'decoration',
            price: 45000,
            image: 'https://images.unsplash.com/photo-1519225421980-715cb0202128?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Magnifique arche décorée de fleurs artificielles haute qualité. Le point focal parfait pour vos photos.',
            isPopular: false,
            stock: 1
        },
        {
            id: '8',
            name: 'Générateur 5KVA',
            category: 'energie',
            price: 40000,
            image: 'https://plus.unsplash.com/premium_photo-1663047242137-2384c5029a21?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Assurez la réussite de votre événement même en cas de coupure. Carburant non inclus.',
            isPopular: false,
            stock: 3
        }
    ],
    categories: [
        { id: 'all', name: 'Tout' },
        { id: 'sonorisation', name: 'Sonorisation' },
        { id: 'mobilier', name: 'Mobilier' },
        { id: 'tentes', name: 'Tentes & Chapiteaux' },
        { id: 'eclairage', name: 'Éclairage' },
        { id: 'decoration', name: 'Décoration' },
        { id: 'energie', name: 'Énergie' }
    ]
};
