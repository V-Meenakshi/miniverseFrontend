import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Save, Calendar, FileText, Clock, ArrowLeft, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';
import { BlogPost } from '../types';

const EditPost = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishType: 'now', // 'now' or 'future'
    publishAt: '',
    isPrivate: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchPost();
    }
  }, [isAuthenticated, navigate, id]);

  const fetchPost = async () => {
    if (!id) return;
    
    try {
      setFetchLoading(true);
      const postData = await blogService.getPostById(id);
      setPost(postData);
      
      // Pre-populate form data
      setFormData({
        title: postData.title,
        content: postData.content,
        publishType: postData.status === 'SCHEDULED' ? 'future' : 'now',
        publishAt: postData.status === 'SCHEDULED' ? 
          new Date(postData.publishAt).toISOString().slice(0, 16) : '',
        isPrivate: postData.isPrivate,
      });
    } catch (error: any) {
      console.error('Error fetching post:', error);
      setError('Failed to load post for editing');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const applyFormatting = (action: 'bold' | 'italic' | 'heading' | 'list' | 'code' | 'quote' | 'link') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const value = formData.content;
    const selected = value.substring(start, end) || 'text';
    let before = value.substring(0, start);
    let after = value.substring(end);
    let replacement = selected;

    switch (action) {
      case 'bold':
        replacement = `**${selected}**`;
        break;
      case 'italic':
        replacement = `*${selected}*`;
        break;
      case 'heading':
        replacement = `\n\n# ${selected}\n\n`;
        break;
      case 'list':
        replacement = selected
          .split(/\r?\n/)
          .map(line => (line.trim() ? `- ${line}` : ''))
          .join('\n');
        break;
      case 'code':
        replacement = `\n\n\
\`\`\`\n${selected}\n\`\`\`\n\n`;
        break;
      case 'quote':
        replacement = selected
          .split(/\r?\n/)
          .map(line => (line.trim() ? `> ${line}` : '>'))
          .join('\n');
        break;
      case 'link':
        replacement = `[${selected}](https://)`;
        break;
    }

    const newValue = `${before}${replacement}${after}`;
    setFormData(prev => ({ ...prev, content: newValue }));
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = before.length + replacement.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setLoading(true);
    setError('');
    let imageUrl = post?.imageUrl || '';
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'your_cloudinary_upload_preset'); // Replace with your upload preset from Cloudinary

      try {
        const response = await fetch(
          'https://api.cloudinary.com/v1_1/your_cloudinary_cloud_name/image/upload', // Replace with your Cloudinary cloud name
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        imageUrl = data.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        setError('Failed to upload image. Please try again.');
        setLoading(false);
        return;
      }
    }


    try {
      let publishAtValue = undefined;
      if (formData.publishType === 'future' && formData.publishAt) {
        try {
          const date = new Date(formData.publishAt);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
          }
          publishAtValue = date.toISOString();
        } catch (dateError) {
          setError('Invalid date format. Please select a valid date and time.');
          setLoading(false);
          return;
        }
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        publishAt: publishAtValue,
        status: (formData.publishType === 'future' ? 'SCHEDULED' : 'PUBLISHED') as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED',
        isPrivate: formData.isPrivate,
        imageUrl,
      };

      console.log('Updating post data:', postData);
      console.log('isPrivate value:', formData.isPrivate);

      await blogService.updatePost(id, postData);
      
      if (formData.publishType === 'now') {
        toast.success('Post updated successfully!');
        navigate(`/blog/${id}`);
      } else {
        toast.success('Time capsule updated successfully!');
        navigate('/time-capsule');
      }
    } catch (error: any) {
      console.error('Error updating post:', error);
      setError(error.response?.data?.message || 'Failed to update post');
      toast.error('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (fetchLoading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6c63ff]/30 border-t-[#6c63ff] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#b0b3c5]">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
          <p className="text-[#b0b3c5] mb-8">The post you're trying to edit could not be found.</p>
          <button
            onClick={() => navigate('/my-blogs')}
            className="px-6 py-3 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300"
          >
            Back to My Blogs
          </button>
        </div>
      </div>
    );
  }

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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
            Edit Your Story
          </h1>
          <p className="text-xl text-[#b0b3c5]">
            Update your thoughts and share them with the universe
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#ff61a6]/10 border border-[#ff61a6]/30 rounded-xl max-w-4xl mx-auto">
            <p className="text-[#ff61a6]">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335]">
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="flex items-center space-x-2 text-sm font-medium text-[#b0b3c5] mb-2">
                <FileText className="w-4 h-4" />
                <span>Title</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your post title..."
                className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all"
                required
                minLength={3}
                maxLength={150}
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label htmlFor="image" className="flex items-center space-x-2 text-sm font-medium text-[#b0b3c5] mb-2">
                <FileText className="w-4 h-4" />
                <span>Image (Optional)</span>
              </label>
              {post.imageUrl && <img src={post.imageUrl} alt="Current" className="mb-2 max-h-48" />}
              <input
                type="file"
                id="image"
                name="image"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100"
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#b0b3c5] mb-2">
                Content *
              </label>
              {/* Simple formatting toolbar */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button type="button" onClick={() => applyFormatting('bold')} className="px-3 py-1 rounded-md bg-[#1f2335] text-white text-sm hover:bg-[#2a2f45]">B</button>
                <button type="button" onClick={() => applyFormatting('italic')} className="px-3 py-1 rounded-md bg-[#1f2335] text-white text-sm hover:bg-[#2a2f45]"><em>I</em></button>
                <button type="button" onClick={() => applyFormatting('heading')} className="px-3 py-1 rounded-md bg-[#1f2335] text-white text-sm hover:bg-[#2a2f45]">H1</button>
                <button type="button" onClick={() => applyFormatting('list')} className="px-3 py-1 rounded-md bg-[#1f2335] text-white text-sm hover:bg-[#2a2f45]">List</button>
                <button type="button" onClick={() => applyFormatting('code')} className="px-3 py-1 rounded-md bg-[#1f2335] text-white text-sm hover:bg-[#2a2f45]">Code</button>
                <button type="button" onClick={() => applyFormatting('quote')} className="px-3 py-1 rounded-md bg-[#1f2335] text-white text-sm hover:bg-[#2a2f45]">Quote</button>
                <button type="button" onClick={() => applyFormatting('link')} className="px-3 py-1 rounded-md bg-[#1f2335] text-white text-sm hover:bg-[#2a2f45]">Link</button>
              </div>
              <textarea
                name="content"
                ref={contentRef}
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all resize-none font-mono text-sm leading-relaxed"
                placeholder="Write your story here... 

💡 Tips for better formatting:
• Use numbered lists: 1. First item, 2. Second item
• Use bullet points: • Item 1, • Item 2  
• Add line breaks for better readability
• Use **bold** and *italic* for emphasis
• Separate paragraphs with blank lines

Example:
1. This is a numbered list
2. Each item on a new line
3. Easy to read and follow

• This is a bullet point
• Another bullet point
• Clean and organized

Your content will be automatically formatted for better readability!"
                required
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#b0b3c5]">
                  Content will be automatically formatted for better readability
                </p>
                <p className="text-xs text-[#b0b3c5]">
                  {formData.content.length} characters
                </p>
              </div>
            </div>

            {/* Publish Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#b0b3c5] mb-4">
                Publication Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="publishType"
                    value="now"
                    checked={formData.publishType === 'now'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6c63ff] bg-[#0d0f1f] border-[#1f2335] focus:ring-[#6c63ff] focus:ring-2"
                  />
                  <span className="flex items-center space-x-2 text-white">
                    <Send className="w-4 h-4" />
                    <span>Publish Now</span>
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="publishType"
                    value="future"
                    checked={formData.publishType === 'future'}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#6c63ff] bg-[#0d0f1f] border-[#1f2335] focus:ring-[#6c63ff] focus:ring-2"
                  />
                  <span className="flex items-center space-x-2 text-white">
                    <Clock className="w-4 h-4" />
                    <span>Time Capsule</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Future Date */}
            {formData.publishType === 'future' && (
              <div className="mb-6">
                <label htmlFor="publishAt" className="flex items-center space-x-2 text-sm font-medium text-[#b0b3c5] mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Publish Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  id="publishAt"
                  name="publishAt"
                  value={formData.publishAt}
                  onChange={handleInputChange}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} // At least 1 minute in the future
                  className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all"
                  required={formData.publishType === 'future'}
                />
                <p className="text-xs text-[#b0b3c5] mt-2">
                  Select a date and time at least 1 minute in the future
                </p>
              </div>
            )}

            {/* Privacy Setting */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#b0b3c5] mb-4">
                Privacy Setting
              </label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="isPrivate"
                    value="false"
                    checked={!formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: false }))}
                    className="w-4 h-4 text-[#6c63ff] bg-[#0d0f1f] border-[#1f2335] focus:ring-[#6c63ff] focus:ring-2"
                  />
                  <span className="flex items-center space-x-2 text-white">
                    <Globe className="w-4 h-4 text-[#00ffd0]" />
                    <span>Public</span>
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="isPrivate"
                    value="true"
                    checked={formData.isPrivate}
                    onChange={() => setFormData(prev => ({ ...prev, isPrivate: true }))}
                    className="w-4 h-4 text-[#6c63ff] bg-[#0d0f1f] border-[#1f2335] focus:ring-[#6c63ff] focus:ring-2"
                  />
                  <span className="flex items-center space-x-2 text-white">
                    <Lock className="w-4 h-4 text-[#ff61a6]" />
                    <span>Private</span>
                  </span>
                </label>
              </div>
              <p className="text-xs text-[#b0b3c5] mt-2">
                {formData.isPrivate 
                  ? 'Private posts are only visible to you and can be used for personal journaling.'
                  : 'Public posts are visible to everyone and can be liked, commented on, and shared.'
                }
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-xl text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#6c63ff]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Update Post</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/blog/${id}`)}
                className="flex-1 flex items-center justify-center space-x-2 px-8 py-3 bg-[#0d0f1f]/50 backdrop-blur-sm border border-[#1f2335] rounded-xl text-white font-semibold hover:bg-[#1f2335]/30 hover:border-[#6c63ff]/50 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;