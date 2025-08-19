import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { isAuthenticated, username } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const fetchedComments = await blogService.getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const comment = await blogService.addComment(postId, { content: newComment });
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await blogService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#1f2335]">
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-[#00ffd0]" />
        <h3 className="text-xl font-bold text-white">Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 bg-[#1f2335] border border-[#2a2f45] rounded-lg text-white placeholder-[#b0b3c5] focus:outline-none focus:border-[#6c63ff] transition-colors"
            disabled={!isAuthenticated}
          />
          <button
            type="submit"
            disabled={!isAuthenticated || !newComment.trim() || submitting}
            className="px-4 py-2 bg-[#6c63ff] text-white rounded-lg hover:bg-[#5a52e6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-[#1f2335] rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#1f2335] rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-[#1f2335] rounded mb-2"></div>
                  <div className="h-4 bg-[#1f2335] rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 p-4 bg-[#0d0f1f]/40 rounded-xl border border-[#1f2335]">
              <div className="w-8 h-8 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{comment.authorUsername}</span>
                    <span className="text-xs text-[#b0b3c5]">{formatDate(comment.createdAt)}</span>
                  </div>
                  {isAuthenticated && comment.authorUsername === username && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-[#ff61a6] hover:text-white transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[#b0b3c5] leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-[#b0b3c5] mx-auto mb-4" />
          <p className="text-[#b0b3c5]">
            {isAuthenticated ? 'Be the first to comment!' : 'Sign in to leave a comment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
