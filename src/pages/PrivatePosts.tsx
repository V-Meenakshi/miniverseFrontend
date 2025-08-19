import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Search, Filter } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import blogService from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import { BlogPost, PageResponse } from '../types';
import toast from 'react-hot-toast';

const PrivatePosts = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyPrivatePosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentPage]);

  const fetchMyPrivatePosts = async () => {
    try {
      setLoading(true);
      // Reuse my-posts endpoint client-side; filter private here for simplicity
      const response: PageResponse<BlogPost> = await blogService.getMyPosts(currentPage, 9);
  const privateOnly = response.content.filter(p => p.isPrivate === true && p.status !== 'SCHEDULED');
      if (currentPage === 0) {
        setPosts(privateOnly);
      } else {
        setPosts(prev => [...prev, ...privateOnly]);
      }
      setHasMore(currentPage < response.totalPages - 1);
    } catch (e) {
      console.error('Error fetching private posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) setCurrentPage(p => p + 1);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await blogService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const updatedPost = await blogService.likePost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likesCount: updatedPost.likesCount, 
              likedBy: updatedPost.likedBy 
            }
          : post
      ));
      toast.success('Post liked successfully!');
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleCommentPost = async (postId: string) => {
    try {
      navigate(`/blog/${postId}`);
    } catch (error) {
      console.error('Error commenting on post:', error);
      toast.error('Failed to navigate to post');
    }
  };

  return (
    <div className="pt-16 min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-3 mb-10">
          <Lock className="w-6 h-6 text-[#ff61a6]" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#ff61a6] to-[#6c63ff] bg-clip-text text-transparent">Private Posts</h1>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b3c5] w-5 h-5" />
            <input
              type="text"
              placeholder="Search your private posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d0f1f]/60 backdrop-blur-sm border border-[#6c63ff]/30 rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all duration-300"
            />
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-[#0d0f1f]/60 backdrop-blur-sm border border-[#1f2335] rounded-xl text-[#b0b3c5] hover:text-white hover:border-[#6c63ff]/50 transition-all duration-300">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        {loading && currentPage === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#1f2335] animate-pulse">
                <div className="h-4 bg-[#1f2335] rounded mb-4"></div>
                <div className="h-8 bg-[#1f2335] rounded mb-4"></div>
                <div className="h-20 bg-[#1f2335] rounded mb-4"></div>
                <div className="h-4 bg-[#1f2335] rounded"></div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(p => (
                <BlogCard key={p.id} post={p} showAuthor={false} showActions={true} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#6c63ff]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-[#ff61a6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-12 h-12 text-[#ff61a6]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Private Posts</h3>
            <p className="text-[#b0b3c5]">Create a private story from the Create page and it will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivatePosts;

