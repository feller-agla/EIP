const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
    // We assume an adminAuth middleware or similar check is applied by the caller or here.
    // Given the simplicity, we'll fetch the user and check the role directly.

    router.get('/clarity-insights', async (req, res) => {
        try {
            // 1. Check authorization
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ error: 'Missing authorization header' });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).json({ error: 'Missing token' });
            }

            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (error || !user) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            // Verify admin role via user_metadata
            const role = user.user_metadata?.user_type;
            if (role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden: admin access required' });
            }

            // 2. Fetch Clarity Data
            const clarityToken = process.env.JETON_CLARITY;
            if (!clarityToken) {
                return res.status(500).json({ error: 'Clarity token not configured' });
            }

            // Note: Clarity live insights usually requires the project ID in the URL.
            // Example: https://www.clarity.ms/export-data/api/v1/project-live-insights?projectId=YOUR_PROJECT_ID
            // Without a projectId, we might need to send it directly to the endpoint based on the token.
            const url = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';

            const clarityRes = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${clarityToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!clarityRes.ok) {
                console.error("Clarity API fetch failed:", clarityRes.status, await clarityRes.text());
                return res.status(clarityRes.status).json({ error: 'Failed to fetch insights from Clarity API' });
            }

            const clarityData = await clarityRes.json();

            // 3. Send back to frontend
            res.status(200).json(clarityData);

        } catch (err) {
            console.error('Error in /admin/clarity-insights:', err);
            res.status(500).json({ error: 'Internal server error while fetching Clarity insights' });
        }
    });

    return router;
};
