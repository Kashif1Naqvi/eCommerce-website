import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { Zap, Shield, Truck, Star, ArrowRight, Sparkles, Package, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsAPI.getAll({ limit: 8 }),
  });

  const { user } = useAuthStore();

  return (
    <>
      {/* Full Page Hero Section */}
      <section className="relative min-h-screen -mt-20 pt-20 flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
          <div className="absolute inset-0">
            {/* Grid pattern - using CSS instead of inline SVG */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v100h-1zM0 0v1h100v-1z' fill='%2306b6d4' fill-opacity='0.5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
            ></div>
            
            {/* Animated gradients */}
            <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full glass-effect border border-cyan-500/50 mb-8 animate-fade-in">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Welcome to the Future</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight animate-fade-in-up">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
                Next-Gen
              </span>
              <span className="block text-white mt-2">
                Shopping Experience
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Discover a revolutionary way to shop online. Powered by cutting-edge technology, 
              delivering products at the speed of tomorrow.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up animation-delay-400">
              <Link to="/products" className="btn-primary group flex items-center justify-center space-x-3 text-lg px-8 py-4">
                <span>Explore Products</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link to="/register" className="btn-secondary flex items-center justify-center text-lg px-8 py-4">
                <Sparkles className="w-6 h-6 mr-2" />
                <span>Join the Revolution</span>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in-up animation-delay-600">
              <div className="glass-effect rounded-2xl p-6 border border-gray-800">
                <div className="text-4xl md:text-5xl font-bold neon-text mb-2">10K+</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Products</div>
              </div>
              <div className="glass-effect rounded-2xl p-6 border border-gray-800">
                <div className="text-4xl md:text-5xl font-bold neon-text mb-2">50K+</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Happy Users</div>
              </div>
              <div className="glass-effect rounded-2xl p-6 border border-gray-800">
                <div className="text-4xl md:text-5xl font-bold neon-text mb-2">24/7</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Support</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Revolutionary</span> Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience shopping like never before with our advanced platform features
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Instant checkout and rapid delivery', color: 'from-yellow-500 to-orange-600' },
            { icon: Shield, title: 'Ultra Secure', desc: 'Military-grade encryption for your data', color: 'from-cyan-500 to-blue-600' },
            { icon: Star, title: 'AI-Powered', desc: 'Smart recommendations just for you', color: 'from-purple-500 to-pink-600' },
            { icon: Truck, title: 'Drone Delivery', desc: 'Get your orders in record time', color: 'from-green-500 to-emerald-600' }
          ].map((feature, index) => (
            <div key={index} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 -z-10`}></div>
              
              <div className="relative glass-effect border border-gray-800 rounded-2xl p-8 h-full card-hover">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-6`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Featured</span> Products
            </h2>
            <p className="text-xl text-gray-400">Handpicked items from the future</p>
          </div>
          <Link to="/products" className="group flex items-center space-x-3 text-cyan-400 hover:text-cyan-300 transition-colors text-lg mt-6 md:mt-0">
            <span>View All Products</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-effect border border-gray-800 rounded-2xl h-96 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts?.data?.data?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Admin Section - Only visible to admin users */}
      {user?.is_admin && (
        <div className="mt-12 p-6 glass-effect border border-gray-800 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-cyan-400">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/products?admin=true" 
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Package className="w-5 h-5" />
              <span>Manage Products</span>
            </Link>
            <button 
              onClick={() => window.location.href = '/products?action=add'}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20"></div>
          <div className="relative glass-effect border border-gray-800 rounded-3xl p-16 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Future</span>?
            </h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Join thousands of users who are already shopping in the next dimension
            </p>
            <Link to="/register" className="btn-primary inline-flex items-center space-x-3 text-xl px-10 py-5">
              <Sparkles className="w-7 h-7" />
              <span>Start Your Journey</span>
              <ArrowRight className="w-7 h-7" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}