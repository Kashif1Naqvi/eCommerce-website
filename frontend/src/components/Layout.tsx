import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, User, LogOut, Sparkles, Menu, X, Home, Package, ShoppingBag, UserCircle, Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cartAPI } from '../lib/api';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Fetch cart data to get item count
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartAPI.get,
    enabled: !!user, // Only fetch if user is logged in
  });

  // Calculate total items in cart
  const cartItemCount = cart?.data?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'glass-effect shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <Sparkles className="w-8 h-8 text-cyan-400 group-hover:animate-pulse-neon" />
                <span className="text-2xl font-bold neon-text">ShopSwift</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex ml-10 items-center space-x-1">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/') 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/50' 
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50'
                  }`}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>
                <Link
                  to="/products"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/products') 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/50' 
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50'
                  }`}
                >
                  <Package size={18} />
                  <span>Products</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Cart Icon with Badge */}
              <Link
                to="/cart"
                className="relative p-3 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 transition-all duration-300 group"
              >
                <ShoppingCart size={24} className="group-hover:animate-pulse" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    to="/orders"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <ShoppingBag size={18} />
                    <span>Orders</span>
                  </Link>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-effect border border-gray-700">
                    <UserCircle size={20} className="text-cyan-400" />
                    <span className="text-gray-300">{user.email}</span>
                  </div>
                  {user?.is_admin && (
                    <>
                      <div className="border-t border-gray-700 my-2"></div>
                      <Link
                        to="/admin/categories"
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 transition-all duration-300"
                      >
                        <Tag size={18} />
                        <span>Manage Categories</span>
                      </Link>
                      <Link
                        to="/products?admin=true"
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 transition-all duration-300"
                      >
                        <Package size={18} />
                        <span>Manage Products</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-cyan-400 transition-colors duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-effect border-t border-gray-800">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-4 py-2 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              {user ? (
                <>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-400/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 rounded-lg text-cyan-400 hover:bg-gray-800/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {children}
      </main>

      <footer className="relative z-100 glass-effect border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <span className="text-xl font-bold neon-text">ShopSwift</span>
              </div>
              <p className="text-gray-400">The future of online shopping is here.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/products" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                  All Products
                </Link>
                <Link to="/cart" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                  Shopping Cart
                </Link>
                <Link to="/orders" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                  My Orders
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Connect</h3>
              <p className="text-gray-400">Experience the next generation of e-commerce with our cutting-edge platform.</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">© 2025 ShopSwift. Powered by the future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}