import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BlogCard from '../components/BlogCard';
import blogService from '../services/blogService';
import { BlogPost, PageResponse } from '../types';

const BlogList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response: PageResponse<BlogPost> = await blogService.getPublicPosts(currentPage, 9);
      
      if (currentPage === 0) {
        setPosts(response.content);
      } else {
        setPosts(prev => [...prev, ...response.content]);
      }
      
      setTotalPages(response.totalPages);
      setHasMore(currentPage < response.totalPages - 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const updatedPost = await blogService.likePost(postId);
      // Update the post in the list with new like count and like state
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

  const handleSharePost = async (postId: string) => {
    try {
      await blogService.sharePost(postId);
      // You could show a toast notification here
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // Exclude scheduled (time capsule) posts
  const filteredPosts = posts
    .filter(post => post.status !== 'SCHEDULED')
    .filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="pt-16 min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
            Cosmic Chronicles
          </h1>
          <p className="text-xl text-[#b0b3c5] mb-8">
            Explore thoughts and stories from across the MiniVerse
          </p>

          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b3c5] w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0d0f1f]/60 backdrop-blur-sm border border-[#6c63ff]/30 rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {loading && currentPage === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#1f2335] animate-pulse">
                <div className="h-4 bg-[#1f2335] rounded mb-4"></div>
                <div className="h-8 bg-[#1f2335] rounded mb-4"></div>
                <div className="h-20 bg-[#1f2335] rounded mb-4"></div>
                <div className="h-4 bg-[#1f2335] rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  onLike={handleLikePost}
                  onComment={handleCommentPost}
                  onShare={handleSharePost}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !searchTerm && (
              <div className="text-center mt-12">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#6c63ff]/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-[#6c63ff]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-[#6c63ff]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchTerm ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-[#b0b3c5] mb-8">
              {searchTerm 
                ? `No posts match "${searchTerm}". Try a different search term.`
                : 'The universe is waiting for the first story.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;