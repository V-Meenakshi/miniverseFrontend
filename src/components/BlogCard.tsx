import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight, Edit, Trash2, Eye, Heart, MessageCircle, Share2, Lock, Globe } from 'lucide-react';
import { BlogPost } from '../types';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';

interface BlogCardProps {
  post: BlogPost;
  showAuthor?: boolean;
  showActions?: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  post, 
  showAuthor = true, 
  showActions = false, 
  onLike,
  onComment,
  onShare
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, username } = useAuth();

  // Debug logging for privacy status
  console.log('BlogCard - Post ID:', post.id, 'isPrivate:', post.isPrivate, 'Type:', typeof post.isPrivate);

  // Check if the current user is the author of this post
  const isAuthor = (() => {
    // If we're in MyBlogs (showActions is true), all posts belong to the current user
    if (showActions) {
      return true;
    }
    // For other cases, check the actual author
    return post.author === username;
  })();

  // Check if the current user has liked this post
  const isLiked = post.likedBy && username && post.likedBy.includes(username);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hourCycle: 'h23',
    });
  };

  const getStatusLabel = (status: string) => {
    // Sealed until publish time
    if (status === 'SCHEDULED' && post.publishAt) {
      const now = new Date();
      const publishDate = new Date(post.publishAt);
      return publishDate <= now ? 'Open' : 'Sealed';
    }
    // After publish, show Open tag instead of Published
    if (status === 'PUBLISHED') {
      return 'Open';
    }
    if (status === 'DRAFT') {
      return 'Draft';
    }
    return status;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'SCHEDULED' && post.publishAt) {
      const now = new Date();
      const publishDate = new Date(post.publishAt);
      return publishDate <= now ? '🔓' : '🔒';
    }
    if (status === 'PUBLISHED') {
      return '🔓';
    }
    if (status === 'DRAFT') {
      return '📝';
    }
    return '📄';
  };

  const getStatusColor = (status: string) => {
    if (status === 'SCHEDULED' && post.publishAt) {
      const now = new Date();
      const publishDate = new Date(post.publishAt);
      return publishDate <= now
        ? 'text-[#00ffd0] bg-[#00ffd0]/10 border-[#00ffd0]/30'
        : 'text-[#ff61a6] bg-[#ff61a6]/10 border-[#ff61a6]/30';
    }
    if (status === 'PUBLISHED') {
      return 'text-[#00ffd0] bg-[#00ffd0]/10 border-[#00ffd0]/30';
    }
    if (status === 'DRAFT') {
      return 'text-[#b0b3c5] bg-[#b0b3c5]/10 border-[#b0b3c5]/30';
    }
    return 'text-[#b0b3c5] bg-[#b0b3c5]/10 border-[#b0b3c5]/30';
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (!content) return '';
    
    // Preserve original formatting but clean up excessive whitespace
    let cleanedContent = content
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n') // Normalize line endings
      .replace(/\n\s*\n/g, '\n\n') // Remove excessive blank lines
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks to 2
      .trim();
    
    // If content is short enough, return as is
    if (cleanedContent.length <= maxLength) {
      return cleanedContent;
    }
    
    // Find a good truncation point
    const truncated = cleanedContent.substring(0, maxLength);
    const lastNewline = truncated.lastIndexOf('\n');
    const lastSpace = truncated.lastIndexOf(' ');
    
    // Prefer breaking at line breaks, then spaces
    const breakPoint = lastNewline > maxLength * 0.7 ? lastNewline : lastSpace;
    
    if (breakPoint > maxLength * 0.5) {
      return cleanedContent.substring(0, breakPoint) + '...';
    }
    
    return truncated + '...';
  };

  const handleView = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(`/blog/${post.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike) {
      onLike(post.id);
    } else {
      try {
        await blogService.likePost(post.id);
        // Optionally refresh the post data or update the UI
      } catch (error) {
        console.error('Error liking post:', error);
      }
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onComment) {
      onComment(post.id);
    } else {
      // Navigate to post detail for commenting
      navigate(`/blog/${post.id}`);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          url,
        });
      } catch (error) {
        console.error('Error sharing post:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying link:', error);
      }
    }
    if (onShare) {
      onShare(post.id);
    }
  };

  return (
    <article className="group bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#1f2335] hover:border-[#6c63ff]/50 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#6c63ff]/10 overflow-hidden">
      <Link to={`/blog/${post.id}`} className="block cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-[#b0b3c5] min-w-0 flex-1">
            {showAuthor && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                <User className="w-4 h-4" />
                <span>{post.author || 'Unknown'}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
          {/* Privacy indicator and status badge separated for spacing */}
          <div className="flex items-center flex-shrink-0">
            {/* Privacy icon */}
            <div className="flex items-center mr-8">
              {post.isPrivate ? (
                <Lock className="w-4 h-4 text-[#ff61a6]" />
              ) : (
                <Globe className="w-4 h-4 text-[#00ffd0]" />
              )}
            </div>
            {/* Status badge */}
            <div className="flex items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(post.status)}`}> 
                {getStatusIcon(post.status)} {getStatusLabel(post.status)}
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00ffd0] transition-colors line-clamp-2 min-w-0">
          {post.title}
        </h2>

        {/* Content Preview */}
        <p className="text-[#b0b3c5] text-sm leading-relaxed mb-4 whitespace-pre-line">
          {truncateContent(post.content)}
        </p>

        {/* Read More button - only show if content is truncated */}
        {post.content.length > 200 && (
          <div className="mb-4 min-w-0">
            <div className="inline-flex items-center space-x-2 text-[#6c63ff] group-hover:text-[#00ffd0] transition-colors font-medium text-sm">
              <span>Read More</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}

        {/* Live Likes, Comments, and Share - Grouped together */}
        <div className="flex items-center space-x-8 mb-4 text-sm text-[#b0b3c5] min-w-0">
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isAuthenticated && (
              <button 
                onClick={handleLike} 
                className={`p-2 rounded-lg transition-colors ${
                  isLiked 
                    ? 'text-[#ff61a6] bg-[#ff61a6]/10' 
                    : 'text-[#b0b3c5] hover:text-[#ff61a6] hover:bg-[#1f2335]'
                }`}
                title="Like Post"
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            )}
            <span className="ml-1">{post.likesCount || 0} likes</span>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount || 0} comments</span>
          </div>
          
          {/* Share button moved beside comments */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="p-2 text-[#b0b3c5] hover:text-[#6c63ff] hover:bg-[#1f2335] rounded-lg transition-colors"
              title="Share Post"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#b0b3c5]">Share</span>
          </div>
        </div>

        {/* Scheduled post publish date - only show for sealed posts */}
        {post.status === 'SCHEDULED' && post.publishAt && (() => {
          const now = new Date();
          const publishDate = new Date(post.publishAt);
          const isSealed = publishDate > now;
          return isSealed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="text-sm text-[#ff61a6] bg-[#ff61a6]/10 px-3 py-1 rounded-lg border border-[#ff61a6]/30 flex-shrink-0">
                  Publishes: {formatDate(post.publishAt)}
                </div>
              </div>
            </div>
          ) : null;
        })()}
      </Link>
    </article>
  );
};

export default BlogCard;