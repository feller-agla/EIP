const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

    // POST /api/track/click — Enregistrer un clic sur un produit
    router.post('/click', async (req, res) => {
        try {
            const { product_id } = req.body;
            if (!product_id) return res.status(400).json({ error: 'product_id is required' });

            let user_id = null;
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = authHeader.split(' ')[1];
                if (token) {
                    const { data: { user } } = await supabase.auth.getUser(token).catch(() => ({ data: {} }));
                    user_id = user?.id || null;
                }
            }

            const { error } = await supabase.from('product_clicks').insert({ product_id, user_id });

            if (error) {
                console.warn('product_clicks insert error:', error.message);
                return res.status(200).json({ ok: true, warn: 'Table may not exist yet.' });
            }

            res.status(200).json({ ok: true });
        } catch (err) {
            console.error('Error tracking click:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // GET /api/track/pmf-cohorts — Calcul des cohortes PMF (admin only)
    // Semaine 01 = semaine courante | Semaine 02 = semaine précédente, etc.
    // Colonne 1 = % des inscrits de cette cohorte qui ont cliqué sur au moins 1 produit
    router.get('/pmf-cohorts', async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
            const token = authHeader.split(' ')[1];
            const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
            if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
            if (user.user_metadata?.user_type !== 'admin') return res.status(403).json({ error: 'Forbidden' });

            // Récupérer tous les profils
            const { data: profiles, error: profilesErr } = await supabase
                .from('profiles').select('id, created_at').order('created_at');
            if (profilesErr) return res.status(500).json({ error: profilesErr.message });

            // Récupérer tous les clics
            const { data: clicks, error: clicksErr } = await supabase
                .from('product_clicks').select('user_id, created_at');
            if (clicksErr) return res.status(200).json({ cohorts: [], missingTable: true });

            // Ensemble des users qui ont cliqué au moins une fois
            const allClickerIds = new Set(clicks.filter(c => c.user_id).map(c => c.user_id));

            // Début de la semaine courante (lundi)
            const now = new Date();
            const startOfCurrentWeek = new Date(now);
            const dow = now.getDay() === 0 ? 7 : now.getDay(); // dimanche=7
            startOfCurrentWeek.setDate(now.getDate() - dow + 1);
            startOfCurrentWeek.setHours(0, 0, 0, 0);

            const NUM_WEEKS = 12;
            const cohorts = [];

            for (let w = 0; w < NUM_WEEKS; w++) {
                // w=0 → semaine courante (Semaine 01), w=1 → semaine précédente (Semaine 02)…
                const weekStart = new Date(startOfCurrentWeek);
                weekStart.setDate(weekStart.getDate() - w * 7);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);

                // Profils inscrits cette semaine
                const cohortUsers = profiles.filter(p => {
                    const d = new Date(p.created_at);
                    return d >= weekStart && d < weekEnd;
                });

                const acquired = cohortUsers.length;
                const cohortUserIds = new Set(cohortUsers.map(u => u.id));

                // % qui ont cliqué au moins 1 fois (toutes périodes confondues)
                let pct = null;
                if (acquired > 0) {
                    const clickerCount = [...cohortUserIds].filter(id => allClickerIds.has(id)).length;
                    pct = Math.round((clickerCount / acquired) * 100);
                }

                // Construire le tableau de valeurs (12 colonnes max, décroissant)
                const numCols = NUM_WEEKS - w;
                const values = Array(numCols).fill(null);
                values[0] = pct; // colonne 1 = % engagement depuis inscription

                cohorts.push({
                    week: `Semaine ${String(w + 1).padStart(2, '0')}`,
                    acquired,
                    weekStart: weekStart.toISOString(),
                    values
                });
            }

            res.status(200).json({ cohorts });
        } catch (err) {
            console.error('Error computing PMF cohorts:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};
