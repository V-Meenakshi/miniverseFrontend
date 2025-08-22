import React, { useState, useEffect } from 'react';
// Correctly import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BlogCard from '../components/BlogCard';
import blogService from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import { BlogPost, PageResponse } from '../types';

const MyBlogs = () => {
  // Now that it's imported, this line will work correctly
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setPosts([]);
    setCurrentPage(0);
    fetchMyPosts(0);
  }, [isAuthenticated, navigate, privacyFilter]);

  useEffect(() => {
    if (currentPage > 0) {
      fetchMyPosts(currentPage);
    }
  }, [currentPage]);


  const fetchMyPosts = async (pageToFetch: number) => {
    try {
      setLoading(true);
      let response: PageResponse<BlogPost>;

      switch (privacyFilter) {
        case 'public':
          response = await blogService.getMyPublicPosts(pageToFetch, 9);
          break;
        case 'private':
          response = await blogService.getMyPrivatePosts(pageToFetch, 9);
          break;
        default: // 'all'
          response = await blogService.getMyPosts(pageToFetch, 9);
          break;
      }

      if (pageToFetch === 0) {
        setPosts(response.content);
      } else {
        setPosts(prev => [...prev, ...response.content]);
      }

      setHasMore(pageToFetch < response.totalPages - 1);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      await blogService.deletePost(postToDelete);
      toast.success('Post deleted successfully!');
      setCurrentPage(0);
      fetchMyPosts(0);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPostToDelete(null);
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

  const handleSharePost = async (postId: string) => {
    try {
      await blogService.sharePost(postId);
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pt-16 min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
              My Stories
            </h1>
            <p className="text-xl text-[#b0b3c5]">
              Manage your published posts and time capsules
            </p>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="mt-6 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#6c63ff]/25"
          >
            <Plus className="w-5 h-5" />
            <span>New Post</span>
          </button>
        </div>

        <div className="flex justify-center space-x-2 mb-8">
          <button onClick={() => setPrivacyFilter('all')} className={privacyFilter === 'all' ? 'active-filter' : 'filter-button'}>All</button>
          <button onClick={() => setPrivacyFilter('public')} className={privacyFilter === 'public' ? 'active-filter' : 'filter-button'}>Public</button>
          <button onClick={() => setPrivacyFilter('private')} className={privacyFilter === 'private' ? 'active-filter' : 'filter-button'}>Private</button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b0b3c5] w-5 h-5" />
            <input
              type="text"
              placeholder="Search your posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d0f1f]/60 backdrop-blur-sm border border-[#6c63ff]/30 rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {loading && currentPage === 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
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
                showAuthor={false}
                showActions={true}
                onLike={handleLikePost}
                onComment={handleCommentPost}
                onShare={handleSharePost}
              />
            ))}
          </div>

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
            <Plus className="w-12 h-12 text-[#6c63ff]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {searchTerm ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="text-[#b0b3c5] mb-8">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Start your cosmic journey by creating your first post.'
            }
          </p>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-3 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300"
          >
            Create Your First Post
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0d0f1f]/95 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335] max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff61a6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-[#ff61a6]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Delete Post</h3>
              <p className="text-[#b0b3c5] mb-8">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3 bg-[#1f2335] border border-[#2a2f45] rounded-lg text-[#b0b3c5] hover:text-white hover:border-[#6c63ff]/50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-[#ff61a6]/20 border border-[#ff61a6]/30 rounded-lg text-[#ff61a6] hover:bg-[#ff61a6]/30 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBlogs;