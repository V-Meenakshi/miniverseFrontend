import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Save, Calendar, FileText, Clock, Lock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';

const CreatePost = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    publishType: 'now', // 'now' or 'future'
    publishAt: '',
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
    // Restore focus and selection
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = before.length + replacement.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Determine status based on publish type
      let status: 'PUBLISHED' | 'SCHEDULED' = 'PUBLISHED';
      let publishAtValue = undefined;
      if (formData.publishType === 'future' && formData.publishAt) {
        try {
          const date = new Date(formData.publishAt);
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
          }
          publishAtValue = date.toISOString(); // Ensures ISO 8601 format
          status = 'SCHEDULED';
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
        status: status,
        isPrivate: formData.isPrivate,
      };

      console.log('Submitting post data:', postData);
      console.log('isPrivate value:', formData.isPrivate);

      await blogService.createPost(postData);
      
      if (formData.publishType === 'now') {
        toast.success('Post published successfully!');
        navigate('/blogs');
      } else {
        toast.success('Time capsule created successfully!');
        navigate('/time-capsule');
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post');
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please enter both title and content before saving draft');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData = {
        title: formData.title,
        content: formData.content,
        status: 'DRAFT' as const,
        isPrivate: formData.isPrivate,
      };

      await blogService.createPost(postData);
      alert('Draft saved successfully!');
      navigate('/my-blogs');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      setError(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="pt-16 min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
            Create Your Story
          </h1>
          <p className="text-xl text-[#b0b3c5]">
            Share your thoughts with the universe, now or in the future
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
                maxLength={30000}
                className="w-full px-4 py-3 bg-[#0d0f1f]/60 border border-[#1f2335] rounded-xl text-white placeholder-[#b0b3c5] focus:outline-none focus:ring-2 focus:ring-[#6c63ff] focus:border-transparent transition-all resize-none font-mono text-sm leading-relaxed"
                placeholder={`Write your story here...\n\nUse the toolbar above to format without learning Markdown.`}
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-xl text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#6c63ff]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : formData.publishType === 'now' ? (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Publish Now</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>Create Time Capsule</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-8 py-3 bg-[#0d0f1f]/50 backdrop-blur-sm border border-[#1f2335] rounded-xl text-white font-semibold hover:bg-[#1f2335]/30 hover:border-[#6c63ff]/50 transition-all duration-300"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;