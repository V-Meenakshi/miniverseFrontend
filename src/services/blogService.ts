import api from '../config/api'; // Import the configured api instance
import { BlogPost, PostRequest, Page, Comment, CommentRequest } from '../types'; // Assuming types are in a types folder

class BlogService {
  async getPublicPosts(page = 0, size = 10): Promise<Page<BlogPost>> {
    const response = await api.get('/posts/public', {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  }

  async getMyPosts(page = 0, size = 10): Promise<Page<BlogPost>> {
    const response = await api.get('/posts/me', {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  }

  async getPostById(id: string): Promise<BlogPost> {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  }

  async createPost(postData: PostRequest): Promise<BlogPost> {
    const response = await api.post('/posts', postData);
    return response.data;
  }

  async updatePost(id: string, postData: PostRequest): Promise<BlogPost> {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  }

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  }

  async likePost(id: string): Promise<BlogPost> {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  }

  async addComment(postId: string, commentData: CommentRequest): Promise<Comment> {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  }

  async getComments(postId: string): Promise<Comment[]> {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/posts/comments/${commentId}`);
  }

  async sharePost(postId: string): Promise<void> {
    const url = `${window.location.origin}/blog/${postId}`;
    if (navigator.share) {
      try {
        const post = await this.getPostById(postId);
        // Share only URL and title so platforms treat it as a clickable link
        await navigator.share({
          title: post.title,
          url
        });
        return;
      } catch (error) {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          // Fall through to clipboard fallback below on non-abort errors
        } else {
          return;
        }
      }
    }
    // Fallback: copy to clipboard as a proper URL
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Failed to copy URL to clipboard:', error);
      throw new Error('Failed to share post');
    }
  }
}

export default new BlogService();