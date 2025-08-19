import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showMyBlogsDropdown, setShowMyBlogsDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMyBlogsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleButtonClick = (buttonType: string) => {
    setActiveButton(buttonType);
    // Reset the active state after a short delay
    setTimeout(() => setActiveButton(null), 300);
  };

  const publicNavItems = [
    { path: '/', label: 'Home' },
    { path: '/blogs', label: 'All Blogs' },
  ];

  const authNavItems = [
    { path: '/create', label: 'Create Post' },
    { path: '/time-capsule', label: 'Time Capsule' },
  ];

  const authButtons = !isAuthenticated ? [
    { path: '/login', label: 'Login', type: 'login' },
    { path: '/register', label: 'Register', type: 'register' },
  ] : [];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0f1f]/90 backdrop-blur-lg border-b border-[#1f2335]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-[#6c63ff] group-hover:text-[#00ffd0] transition-colors duration-300" />
              <div className="absolute inset-0 w-8 h-8 bg-[#6c63ff]/20 rounded-full blur-md group-hover:bg-[#00ffd0]/30 transition-colors duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#6c63ff] via-[#00ffd0] to-[#ff61a6] bg-clip-text text-transparent">
              MiniVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {publicNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-[#6c63ff]/20 text-[#00ffd0] shadow-lg shadow-[#6c63ff]/20'
                    : 'text-[#b0b3c5] hover:text-white hover:bg-[#1f2335]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated && (
              <>
                {authNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-[#6c63ff]/20 text-[#00ffd0] shadow-lg shadow-[#6c63ff]/20'
                        : 'text-[#b0b3c5] hover:text-white hover:bg-[#1f2335]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* MyBlogs Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowMyBlogsDropdown(!showMyBlogsDropdown)}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                      location.pathname === '/my-blogs' || location.pathname === '/private'
                        ? 'bg-[#6c63ff]/20 text-[#00ffd0] shadow-lg shadow-[#6c63ff]/20'
                        : 'text-[#b0b3c5] hover:text-white hover:bg-[#1f2335]'
                    }`}
                  >
                    <span>My Blogs</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMyBlogsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showMyBlogsDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#0d0f1f]/95 backdrop-blur-lg border border-[#1f2335] rounded-lg shadow-xl z-50">
                      <Link
                        to="/my-blogs"
                        onClick={() => setShowMyBlogsDropdown(false)}
                        className="block px-4 py-3 text-[#b0b3c5] hover:text-white hover:bg-[#1f2335] transition-colors rounded-t-lg"
                      >
                        Public & Private
                      </Link>
                      <Link
                        to="/private"
                        onClick={() => setShowMyBlogsDropdown(false)}
                        className="block px-4 py-3 text-[#b0b3c5] hover:text-white hover:bg-[#1f2335] transition-colors rounded-b-lg"
                      >
                        Private Only
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              authButtons.map((button) => (
                <Link
                  key={button.path}
                  to={button.path}
                  onClick={() => handleButtonClick(button.type)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                    location.pathname === button.path
                      ? button.type === 'register'
                        ? 'bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] text-white shadow-lg shadow-[#6c63ff]/25'
                        : 'bg-gradient-to-r from-[#00ffd0] to-[#6c63ff] text-white shadow-lg shadow-[#00ffd0]/25'
                      : activeButton === button.type
                        ? button.type === 'register'
                          ? 'bg-gradient-to-r from-[#ff61a6] to-[#6c63ff] text-white shadow-lg shadow-[#ff61a6]/25 transform scale-105'
                          : 'bg-gradient-to-r from-[#00ffd0] to-[#6c63ff] text-white shadow-lg shadow-[#00ffd0]/25 transform scale-105'
                        : button.type === 'register'
                          ? 'bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] text-white hover:from-[#5a52e6] hover:to-[#00e6bb] shadow-lg shadow-[#6c63ff]/25'
                          : 'bg-gradient-to-r from-[#00ffd0] to-[#6c63ff] text-white hover:from-[#00e6bb] hover:to-[#5a52e6] shadow-lg shadow-[#00ffd0]/25'
                  }`}
                >
                  {button.label}
                </Link>
              ))
            ) : (
              <div className="flex items-center space-x-4">
                <button // Username button with profile functionality
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] text-white rounded-lg hover:from-[#5a52e6] hover:to-[#00e6bb] transition-all duration-200 shadow-lg shadow-[#6c63ff]/25"
                >
                  <User className="w-4 h-4" />
                  <span>{username}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#ff61a6] to-[#6c63ff] text-white rounded-lg hover:from-[#e5578f] hover:to-[#5a52e6] transition-all duration-200 shadow-lg shadow-[#ff61a6]/25"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#b0b3c5] hover:text-white hover:bg-[#1f2335] transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1f2335]">
            <nav className="flex flex-col space-y-2">
              {[...publicNavItems, ...(isAuthenticated ? authNavItems : [])].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-[#6c63ff]/20 text-[#00ffd0]'
                      : 'text-[#b0b3c5] hover:text-white hover:bg-[#1f2335]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/my-blogs"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === '/my-blogs'
                        ? 'bg-[#6c63ff]/20 text-[#00ffd0]'
                        : 'text-[#b0b3c5] hover:text-white hover:bg-[#1f2335]'
                    }`}
                  >
                    My Blogs (All)
                  </Link>
                  <Link
                    to="/private"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === '/private'
                        ? 'bg-[#6c63ff]/20 text-[#00ffd0]'
                        : 'text-[#b0b3c5] hover:text-white hover:bg-[#1f2335]'
                    }`}
                  >
                    Private Only
                  </Link>
                </>
              )}
              
              {!isAuthenticated ? (
                authButtons.map((button) => (
                  <Link
                    key={button.path}
                    to={button.path}
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleButtonClick(button.type);
                    }}
                    className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                      location.pathname === button.path
                        ? button.type === 'register'
                          ? 'bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] text-white'
                          : 'bg-[#1f2335] text-white'
                        : activeButton === button.type
                          ? button.type === 'register'
                            ? 'bg-gradient-to-r from-[#ff61a6] to-[#6c63ff] text-white'
                            : 'bg-gradient-to-r from-[#00ffd0] to-[#6c63ff] text-white'
                          : 'text-[#b0b3c5] hover:text-white hover:bg-[#1f2335]'
                    }`}
                  >
                    {button.label}
                  </Link>
                ))
              ) : (
                <div className="pt-2 border-t border-[#1f2335] mt-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-[#6c63ff] to-[#00ffd0] text-white rounded-lg transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>{username}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-[#b0b3c5] hover:text-white hover:bg-[#1f2335] rounded-lg transition-all duration-200 mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;