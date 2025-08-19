import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Edit, Trash2, Heart, Share2, Lock, Globe, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import CodeBlock from '../components/CodeBlock';
import CommentSection from '../components/CommentSection';
import blogService from '../services/blogService';
import { useAuth } from '../context/AuthContext';
import { BlogPost } from '../types';

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, username } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchPost = async (postId: string) => {
    try {
      setLoading(true);
      const response = await blogService.getPostById(postId);
      setPost(response);
    } catch (error: any) {
      console.error('Error fetching post:', error);
      setError(error.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!post) return;
    
    try {
      await blogService.deletePost(post.id);
      toast.success('Post deleted successfully!');
      navigate('/blogs');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleLike = async () => {
    if (!post || !isAuthenticated) return;

    try {
      const updatedPost = await blogService.likePost(post.id);
      setPost(updatedPost);
      toast.success(post.isLiked ? 'Post unliked!' : 'Post liked!');
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleShare = async () => {
    if (!post) return;

    try {
      await blogService.sharePost(post.id);
      toast.success('Post shared successfully!');
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Failed to share post');
    }
  };

  // Average reading speed: 200 words per minute
  const getReadTime = (content: string): number => {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'text-[#00ffd0] bg-[#00ffd0]/10 border-[#00ffd0]/30';
      case 'SCHEDULED':
        return 'text-[#ff61a6] bg-[#ff61a6]/10 border-[#ff61a6]/30';
      case 'DRAFT':
        return 'text-[#b0b3c5] bg-[#b0b3c5]/10 border-[#b0b3c5]/30';
      default:
        return 'text-[#b0b3c5] bg-[#b0b3c5]/10 border-[#b0b3c5]/30';
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#b0b3c5]">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
          <p className="text-[#b0b3c5] mb-8">{error || 'The requested post could not be found.'}</p>
          <button
            onClick={() => navigate('/blogs')}
            className="px-6 py-3 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && post.author === username;

  // Debug logging for privacy status
  console.log('BlogDetail - Post ID:', post.id, 'isPrivate:', post.isPrivate, 'Type:', typeof post.isPrivate);

  return (
    <div className="pt-16 min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-[#b0b3c5] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Post Header */}
        <article className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335] mb-8 relative">
          {/* Edit and Delete buttons moved below content as requested */}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 text-sm text-[#b0b3c5]">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Author</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{getReadTime(post.content)} min read</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Privacy indicator */}
              <div className="flex items-center space-x-1">
                {post.isPrivate ? (
                  <Lock className="w-4 h-4 text-[#ff61a6]" />
                ) : (
                  <Globe className="w-4 h-4 text-[#00ffd0]" />
                )}
                <span className="text-xs">
                  {post.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
              {/* Remove the Published tag; show Sealed with publish time when scheduled and in future; otherwise omit */}
              {post.status === 'SCHEDULED' && post.publishAt && new Date(post.publishAt) > new Date() && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}>
                  Sealed • Publishes {formatDate(post.publishAt)}
                </span>
              )}
            </div>
          </div>
          {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title} className="mb-8 rounded-lg w-full object-cover" />
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Remove the scheduled post notification box */}

          {/* Post Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : 'text';
                  const isInline = !match;
                  
                  if (!isInline) {
                    return (
                      <CodeBlock
                        code={String(children).replace(/\n$/, '')}
                        language={language}
                      />
                    );
                  }
                  
                  return (
                    <code
                      className="bg-[#1f2335] text-[#00ffd0] px-2 py-1 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-white mb-6 mt-8">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-white mb-4 mt-6">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-white mb-3 mt-5">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-[#b0b3c5] leading-relaxed mb-4 whitespace-pre-line">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-[#b0b3c5] mb-4 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-[#b0b3c5] mb-4 space-y-2">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[#b0b3c5] leading-relaxed">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#6c63ff] pl-4 italic text-[#b0b3c5] mb-4 bg-[#1f2335]/30 rounded-r-lg py-2">{children}</blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-white">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-[#00ffd0]">{children}</em>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Like, Comment, Share, and Owner Actions */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-[#1f2335]">
            <div className="flex items-center space-x-6">
              {/* Like Button */}
              <div className="flex items-center space-x-2 text-[#b0b3c5]">
                {isAuthenticated && (
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      post.isLiked 
                        ? 'text-[#ff61a6] bg-[#ff61a6]/10' 
                        : 'text-[#b0b3c5] hover:text-[#ff61a6] hover:bg-[#1f2335]'
                    }`}
                    title="Like Post"
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  </button>
                )}
                <span>{post.likesCount || 0} likes</span>
              </div>
              
              {/* Comment Count */}
              <div className="flex items-center space-x-2 text-[#b0b3c5]">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentsCount || 0} comments</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 text-[#b0b3c5] hover:text-[#6c63ff] hover:bg-[#1f2335] rounded-lg transition-colors"
                title="Share Post"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {/* Owner action buttons */}
              {isOwner && (
                <>
                  <button
                    onClick={() => navigate(`/edit/${post.id}`)}
                    className="px-4 py-2 rounded-lg bg-[#00ffd0]/15 border border-[#00ffd0]/30 text-[#00ffd0] hover:bg-[#00ffd0]/25 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-[#ff61a6]/15 border border-[#ff61a6]/30 text-[#ff61a6] hover:bg-[#ff61a6]/25 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </div>

      {/* Professional Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0d0f1f]/95 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335] max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff61a6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-[#ff61a6]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Delete Post</h3>
              <p className="text-[#b0b3c5] mb-8">
                Are you sure you want to delete "{post?.title}"? This action cannot be undone.
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

export default BlogDetail;