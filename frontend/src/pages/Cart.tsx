import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { Trash2, Minus, Plus, ShoppingBag, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartAPI.get,
    enabled: !!user,
  });
  console.log("cart", cart);
  
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      cartAPI.updateItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: cartAPI.removeItem,
    onSuccess: () => {
      toast.success('Item removed from cart');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantity = (itemId: number, quantity: number) => {
    updateItemMutation.mutate({ itemId, quantity });
  };

  if (!user) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-full p-8 border border-cyan-500/30">
            <ShoppingCart className="w-16 h-16 text-cyan-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Please Login
        </h2>
        <p className="text-gray-400 mb-8">You need to be logged in to view your cart</p>
        <Link 
          to="/login" 
          className="btn-primary inline-flex items-center gap-2 group"
        >
          Login
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-cyan-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart?.data?.items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-full p-8 border border-cyan-500/30">
            <ShoppingBag className="w-16 h-16 text-cyan-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-8">Add some products to get started</p>
        <Link 
          to="/products" 
          className="btn-primary inline-flex items-center gap-2 group"
        >
          <ShoppingBag className="w-5 h-5" />
          Continue Shopping
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    );
  }

  const subtotal = cart?.data?.items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Futuristic Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
          Shopping Cart
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <AnimatePresence>
            {cart?.data?.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="group relative mb-6"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"></div>
                
                {/* Main Card */}
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-cyan-500/30 transition-all duration-300">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${item.product.image}` || '/placeholder.png'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {item.product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity === 1}
                            className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center
                                     hover:bg-cyan-500/20 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-all duration-200 group/btn"
                          >
                            <Minus className="w-4 h-4 text-gray-400 group-hover/btn:text-cyan-400" />
                          </button>
                          
                          <div className="px-4 py-1 bg-gray-800/50 border border-gray-700 rounded-lg min-w-[60px] text-center">
                            <span className="font-mono text-cyan-400">{item.quantity}</span>
                          </div>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center
                                     hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-200 group/btn"
                          >
                            <Plus className="w-4 h-4 text-gray-400 group-hover/btn:text-cyan-400" />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Price</p>
                            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                              ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => removeItemMutation.mutate(item.id)}
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 
                                     hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]
                                     transition-all duration-200 group/del"
                          >
                            <Trash2 className="w-5 h-5 text-red-400 group-hover/del:text-red-300" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-lg"></div>
          
          {/* Main Card */}
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-mono text-gray-300">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Tax (10%)</span>
                <span className="font-mono text-gray-300">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-gray-300">Total</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <Link
              to="/products"
              className="block text-center mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}