import express from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { supabaseAuth } from '../middleware/supabaseAuth.js';

const router = express.Router();

// Get all blog posts
router.get('/', async (req, res) => {
    try {
        const { data: posts, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(posts);
    } catch (error) {
        console.error('Blog fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

// Get a single blog post
router.get('/:id', async (req, res) => {
    try {
        const { data: post, error } = await supabaseAdmin
            .from('blog_posts')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(post);
    } catch (error) {
        console.error('Blog post fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch blog post' });
    }
});

// Create a blog post (Admin only)
router.post('/', supabaseAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can create blog posts' });
        }

        const { title, content, author, image_url, category, tags } = req.body;

        const { data: post, error } = await supabaseAdmin
            .from('blog_posts')
            .insert([{
                title,
                content,
                author: author || req.user.name,
                image_url,
                category,
                tags,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(post);
    } catch (error) {
        console.error('Blog creation error:', error);
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

export default router;
