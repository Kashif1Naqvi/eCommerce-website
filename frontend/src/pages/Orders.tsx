import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  Search, 
  Calendar, 
  Hash, 
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';

// Mock orders data - replace with actual API call
const mockOrders = [
  {
    id: 1,
    created_at: '2025-06-20T10:00:00Z',
    total_amount: 129.99,
    status: 'delivered',
    items: [
      { id: 1, product: { name: 'Product 1' }, quantity: 2, price: 49.99 },
      { id: 2, product: { name: 'Product 2' }, quantity: 1, price: 30.01 },
    ],
  },
  {
    id: 2,
    created_at: '2025-06-22T14:30:00Z',
    total_amount: 79.99,
    status: 'processing',
    items: [
      { id: 3, product: { name: 'Product 3' }, quantity: 1, price: 79.99 },
    ],
  },
];

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');

  // In a real app, you would fetch orders from the API
  const { data: orders = mockOrders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // return ordersAPI.getMyOrders();
      return mockOrders;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="w-8 h-8 text-cyan-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-full p-8 border border-cyan-500/30">
            <Package className="w-16 h-16 text-cyan-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          No orders yet
        </h2>
        <p className="text-gray-400 mb-8">Start shopping to see your orders here</p>
        <Link 
          to="/products" 
          className="btn-primary inline-flex items-center gap-2 group"
        >
          <ShoppingBag className="w-5 h-5" />
          Shop Now
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50 text-yellow-400';
      case 'processing':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/50 text-blue-400';
      case 'shipped':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/50 text-purple-400';
      case 'delivered':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400';
      case 'cancelled':
        return 'from-red-500/20 to-rose-500/20 border-red-500/50 text-red-400';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/50 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4 animate-pulse" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'pending':
        return 'shadow-[0_0_15px_rgba(251,191,36,0.3)]';
      case 'processing':
        return 'shadow-[0_0_15px_rgba(59,130,246,0.3)]';
      case 'shipped':
        return 'shadow-[0_0_15px_rgba(168,85,247,0.3)]';
      case 'delivered':
        return 'shadow-[0_0_15px_rgba(34,197,94,0.3)]';
      case 'cancelled':
        return 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';
      default:
        return '';
    }
  };

  return (
    <div>
      {/* Futuristic Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
          My Orders
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
      </motion.div>

      {/* Futuristic Search Bar */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
          <input
            type="search"
            placeholder="Search orders by ID or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-cyan-500/30 rounded-lg 
                     text-white placeholder-gray-500 
                     focus:bg-gray-900/80 focus:border-cyan-400 focus:outline-none
                     focus:ring-2 focus:ring-cyan-400/20 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)]
                     transition-all duration-300"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </motion.div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order, index) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="group relative"
          >
            {/* Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${getStatusColor(order.status).split(' ')[0]} ${getStatusColor(order.status).split(' ')[1]} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300`}></div>
            
            {/* Main Card */}
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-cyan-500/30 transition-all duration-300">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-xl font-bold text-white">
                      Order <span className="text-cyan-400 font-mono">#{order.id.toString().padStart(6, '0')}</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
                
                <div className={`
                  px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor(order.status)} 
                  backdrop-blur-xl flex items-center gap-2 ${getStatusGlow(order.status)}
                `}>
                  {getStatusIcon(order.status)}
                  <span className="font-semibold capitalize">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {order.items.map((item) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ x: 5 }}
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <Package className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-gray-300">
                        {item.product.name} 
                        <span className="text-cyan-400 ml-2">×{item.quantity}</span>
                      </span>
                    </div>
                    <span className="font-mono text-cyan-400">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-400">Total</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}