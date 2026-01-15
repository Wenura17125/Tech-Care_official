import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { Button } from '../components/ui/button';
import { Loader2, Calendar, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/blog/${id}`);
                setPost(response.data);
            } catch (error) {
                console.error('Error fetching blog post:', error);
                navigate('/blog');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
        window.scrollTo(0, 0);
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20">
            <SEO
                title={`${post.title} - TechCare Blog`}
                description={post.content.substring(0, 160)}
            />

            {/* Post Header */}
            <div className="max-w-4xl mx-auto pt-16 px-6">
                <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
                    <ArrowLeft className="h-4 w-4" /> Back to Blog
                </Link>

                <h1 className="text-4xl md:text-6xl font-['Outfit'] font-bold mb-6 leading-tight">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-6 border-y border-zinc-800 py-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{post.author}</p>
                                <p className="text-xs text-zinc-500">Expert Contributor</p>
                            </div>
                        </div>
                        <div className="text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                            <Bookmark className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="rounded-3xl overflow-hidden mb-12 aspect-[21/9]">
                    <img
                        src={post.image_url || 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop'}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div
                    className="prose prose-invert prose-emerald max-w-none font-['Inter'] text-zinc-300 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-12 pt-12 border-t border-zinc-800">
                        {post.tags.map((tag, idx) => (
                            <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-xs">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPost;
