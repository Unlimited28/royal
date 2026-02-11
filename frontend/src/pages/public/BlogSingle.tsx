import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { PublicNavbar } from '../../components/layout/PublicNavbar';

const BlogSingle: React.FC = () => {
    const { idOrSlug } = useParams<{ idOrSlug: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/blogs/${idOrSlug}`);
                setPost(response.data);
            } catch (error) {
                console.error('Failed to fetch post:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [idOrSlug]);

    if (loading) return <div className="min-h-screen bg-navy-950 text-white p-20 text-center">Loading article...</div>;

    if (!post) return (
        <div className="min-h-screen bg-navy-950 text-white p-20 text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <Link to="/blog" className="text-gold-500 hover:underline">Back to Blog</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-navy-950">
            <PublicNavbar />
            <article className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <Link to="/blog" className="text-gold-500 hover:text-gold-400 mb-8 inline-block">
                    ← Back to Blog
                </Link>

                <div className="flex items-center space-x-4 mb-6">
                    <span className="px-3 py-1 bg-gold-500/20 text-gold-500 rounded-full text-sm font-medium">
                        {post.category}
                    </span>
                    <span className="text-slate-400 text-sm">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">{post.title}</h1>

                {post.featuredImage && (
                    <img src={post.featuredImage} alt={post.title} className="w-full h-auto rounded-2xl mb-12 border border-navy-800" />
                )}

                <div className="prose prose-invert prose-gold max-w-none">
                    <div className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                        {post.content}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogSingle;
