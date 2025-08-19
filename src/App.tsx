import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ParticleBackground from './components/ParticleBackground';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import CreatePost from './pages/CreatePost';
import MyBlogs from './pages/MyBlogs';
import TimeCapsule from './pages/TimeCapsule';
import Login from './pages/Login';
import Register from './pages/Register';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import PrivatePosts from './pages/PrivatePosts';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0d0f1f] text-white relative overflow-hidden">
          <ParticleBackground />
          <div className="relative z-10">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogDetail />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/edit/:id" element={<EditPost />} />
                <Route path="/my-blogs" element={<MyBlogs />} />
                <Route path="/private" element={<PrivatePosts />} />
                <Route path="/time-capsule" element={<TimeCapsule />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path='/profile' element={<Profile />} />
              </Routes>
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0d0f1f',
                color: '#ffffff',
                border: '1px solid #1f2335',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#00ffd0',
                  secondary: '#0d0f1f',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff61a6',
                  secondary: '#0d0f1f',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;