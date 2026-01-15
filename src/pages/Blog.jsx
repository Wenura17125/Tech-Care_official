import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2, Calendar, User, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/blog`);
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching blog posts:', error);
                // Fallback to empty array if API fails
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        window.scrollTo(0, 0);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20">
            <SEO
                title="Blog - TechCare"
                description="Read the latest tech repair tips, electronics guides, and TechCare news."
            />

            {/* Hero Section */}
            <div className="relative py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-['Outfit'] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                        TechCare Insights
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-['Inter']">
                        Expert advice, repair guides, and the latest updates from the world of electronics maintenance.
                    </p>
                </div>
            </div>

            {/* Post Grid */}
            <div className="max-w-7xl mx-auto px-6">
                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                        <Calendar className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No Articles Yet</h2>
                        <p className="text-zinc-500">Check back soon for our first blog post!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link key={post.id} to={`/blog/${post.id}`}>
                                <Card className="bg-zinc-900/40 backdrop-blur-md border-zinc-800 hover:border-emerald-500/50 transition-all group overflow-hidden h-full flex flex-col">
                                    <div className="aspect-video w-full overflow-hidden relative">
                                        <img
                                            src={post.image_url || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop'}
                                            alt={post.title}
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-emerald-500 text-white border-none">
                                                {post.category || 'General'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-2">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {post.author}
                                            </span>
                                        </div>
                                        <CardTitle className="text-xl font-['Outfit'] font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                                            {post.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-zinc-400 text-sm line-clamp-3 mb-6">
                                            {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                        </p>
                                        <div className="mt-auto flex items-center text-emerald-400 text-sm font-bold gap-2">
                                            Read Article <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
