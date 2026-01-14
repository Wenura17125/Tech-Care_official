import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { supabaseAuth } from '../middleware/supabaseAuth.js';

const router = express.Router();

// Default services for fallback
const defaultServices = [
    { id: 'battery', name: 'Battery Replacement', price: 5000, category: 'mobile', description: 'Professional battery replacement service' },
    { id: 'screen', name: 'Screen Repair', price: 12000, category: 'mobile', description: 'Screen replacement and repair' },
    { id: 'water-damage', name: 'Water Damage', price: 8500, category: 'mobile', description: 'Water damage assessment and repair' },
    { id: 'general', name: 'General Repair', price: 4000, category: 'general', description: 'General device repair and diagnostics' },
    { id: 'charging-port', name: 'Charging Port Repair', price: 3500, category: 'mobile', description: 'Fix charging issues' },
    { id: 'software', name: 'Software Issues', price: 3000, category: 'general', description: 'OS reinstall, virus removal, optimization' },
    { id: 'data-recovery', name: 'Data Recovery', price: 7500, category: 'general', description: 'Recover lost or deleted files' },
    { id: 'pc-repair', name: 'PC Repair', price: 5500, category: 'pc', description: 'Desktop and laptop repair' },
];

// GET all services - Public
router.get('/', async (req, res) => {
    try {
        const { data: services, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching services from DB:', error);
            // Return default services if database fails
            return res.json(defaultServices);
        }

        // If no services in DB, return defaults
        if (!services || services.length === 0) {
            return res.json(defaultServices);
        }

        res.json(services);
    } catch (err) {
        console.error('Services fetch error:', err);
        // Return fallback data on error
        res.json(defaultServices);
    }
});

// GET service by ID - Public
router.get('/:id', async (req, res) => {
    try {
        const { data: service, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !service) {
            // Check default services
            const defaultService = defaultServices.find(s => s.id === req.params.id);
            if (defaultService) {
                return res.json(defaultService);
            }
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (err) {
        console.error('Service fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

// Create service - Admin only
router.post('/', supabaseAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { name, price, category, description, duration, image } = req.body;

        const { data: service, error } = await supabaseAdmin
            .from('services')
            .insert([{
                name,
                price: parseFloat(price),
                category,
                description,
                duration,
                image,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(service);
    } catch (err) {
        console.error('Service creation error:', err);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// Update service - Admin only
router.put('/:id', supabaseAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { name, price, category, description, duration, image } = req.body;

        const { data: service, error } = await supabaseAdmin
            .from('services')
            .update({
                name,
                price: parseFloat(price),
                category,
                description,
                duration,
                image,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(service);
    } catch (err) {
        console.error('Service update error:', err);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// Delete service - Admin only
router.delete('/:id', supabaseAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { error } = await supabaseAdmin
            .from('services')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Service deleted successfully' });
    } catch (err) {
        console.error('Service deletion error:', err);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

export default router;
