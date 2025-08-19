import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Clock, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import BlogCard from '../components/BlogCard';
import blogService from '../services/blogService';
import { BlogPost } from '../types';

const Home = () => {
  const navigate = useNavigate();
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        const response = await blogService.getPublicPosts(0, 3); // show fewer to avoid redundancy
        setFeaturedPosts(response.content);
      } catch (error) {
        console.error('Error fetching featured posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  const handleLikePost = async (postId: string) => {
    try {
      console.log('Liked post:', postId);
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

  const features = [
    {
      icon: PenTool,
      title: 'Create & Share',
      description: 'Write beautiful blog posts with rich text formatting and share your thoughts with the cosmos.',
      color: 'from-[#6c63ff] to-[#00ffd0]',
    },
    {
      icon: Clock,
      title: 'Time Capsule',
      description: 'Seal your thoughts in time capsules to be automatically published on future dates.',
      color: 'from-[#ff61a6] to-[#6c63ff]',
    },
    {
      icon: Sparkles,
      title: 'Public & Private Blogs',
      description: 'Choose to share publicly or keep your thoughts private with secure personal journaling.',
      color: 'from-[#00ffd0] to-[#ff61a6]',
    },
  ];

  return (
    <div className="pt-16 relative z-10">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#6c63ff] via-[#00ffd0] to-[#ff61a6] bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#ff61a6] via-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
                MiniVerse
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[#b0b3c5] mb-8 leading-relaxed max-w-3xl mx-auto">
              A cosmic platform where your thoughts travel through time. Create instant blog posts or seal them in digital time capsules for the future.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              to="/create"
              className="group px-8 py-4 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full text-white font-semibold hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#6c63ff]/25 flex items-center space-x-2"
            >
              <PenTool className="w-5 h-5" />
              <span>Start Writing</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/time-capsule"
              className="group px-8 py-4 bg-[#0d0f1f]/50 backdrop-blur-sm border border-[#1f2335] rounded-full text-white font-semibold hover:bg-[#1f2335]/30 hover:border-[#6c63ff]/50 transition-all duration-300 flex items-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Create Time Capsule</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
              Featured Stories
            </h2>
            <p className="text-xl text-[#b0b3c5] max-w-2xl mx-auto">
              Discover editor-picked highlights from the cosmic community
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#1f2335] animate-pulse">
                  <div className="h-4 bg-[#1f2335] rounded mb-4"></div>
                  <div className="h-8 bg-[#1f2335] rounded mb-4"></div>
                  <div className="h-20 bg-[#1f2335] rounded mb-4"></div>
                  <div className="h-4 bg-[#1f2335] rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  onComment={handleCommentPost}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/blogs"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#ff61a6] to-[#6c63ff] rounded-full text-white font-semibold hover:from-[#e5578f] hover:to-[#5a52e6] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#ff61a6]/25 space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Explore All Posts</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Curated Highlights Section to reduce redundancy */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00ffd0] to-[#ff61a6] bg-clip-text text-transparent">
              Why MiniVerse
            </h2>
            <p className="text-xl text-[#b0b3c5] max-w-2xl mx-auto">
              A focused look at what makes this universe-themed platform special
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-[#0d0f1f]/60 backdrop-blur-sm border border-[#1f2335] hover:border-[#6c63ff]/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6c63ff]/10 to-[#00ffd0]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="text-[#b0b3c5] leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - How to Use */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] bg-clip-text text-transparent">
              How to Use MiniVerse
            </h2>
            <p className="text-xl text-[#b0b3c5] max-w-2xl mx-auto">
              Your complete guide to navigating and making the most of our cosmic platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Getting Started */}
            <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335]">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</span>
                Getting Started
              </h3>
              <div className="space-y-4 text-[#b0b3c5]">
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#00ffd0] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Create an account to unlock all features and start your journey</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#00ffd0] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Explore public blogs to discover stories from the community</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#00ffd0] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Use the search and filter options to find content that interests you</p>
                </div>
              </div>
            </div>

            {/* Creating Content */}
            <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335]">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-[#ff61a6] to-[#6c63ff] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</span>
                Creating Content
              </h3>
              <div className="space-y-4 text-[#b0b3c5]">
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#ff61a6] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Write instant blog posts or schedule them for future publication</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#ff61a6] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Choose between public and private posts for your content</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#ff61a6] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Use markdown formatting for rich text and code blocks</p>
                </div>
              </div>
            </div>

            {/* Time Capsules */}
            <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335]">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-[#00ffd0] to-[#ff61a6] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
                Time Capsules
              </h3>
              <div className="space-y-4 text-[#b0b3c5]">
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#00ffd0] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Seal your thoughts in digital time capsules for future dates</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#00ffd0] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Set specific publish dates and times for your content</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#00ffd0] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Watch as your sealed content automatically publishes</p>
                </div>
              </div>
            </div>

            {/* Privacy & Sharing */}
            <div className="bg-[#0d0f1f]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#1f2335]">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-r from-[#6c63ff] to-[#ff61a6] rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">4</span>
                Privacy & Sharing
              </h3>
              <div className="space-y-4 text-[#b0b3c5]">
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#6c63ff] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Keep personal thoughts private with secure journaling</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#6c63ff] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Share public posts with the global community</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 bg-[#6c63ff] rounded-full mt-2 flex-shrink-0"></span>
                  <p>Like, comment, and share posts to engage with others</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#0d0f1f]/80 to-[#1f2335]/80 backdrop-blur-sm rounded-3xl p-12 border border-[#1f2335]">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#6c63ff] to-[#ff61a6] bg-clip-text text-transparent">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-[#b0b3c5] mb-8">
              Join the MiniVerse community and begin sharing your thoughts with the cosmos.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00ffd0] to-[#6c63ff] rounded-full text-white font-semibold hover:from-[#00e6bb] hover:to-[#5a52e6] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#00ffd0]/25 space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Join MiniVerse</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;