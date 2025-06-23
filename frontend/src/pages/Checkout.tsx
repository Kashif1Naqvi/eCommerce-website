import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { cartAPI } from '../lib/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Home,
  Package,
  ShoppingCart,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

function CheckoutForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    state: '',
    postal_code: '',
    payment_method: 'cash',
  });

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartAPI.get,
  });

  const subtotal = cart?.data?.items?.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  ) || 0;
  const tax = subtotal * 0.1;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, you would:
      // 1. Create order in your backend
      // 2. If payment_method is 'card', initialize Stripe payment
      // 3. If payment_method is 'cash', just create the order

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

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
            <ShoppingCart className="w-16 h-16 text-cyan-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-8">Add items to cart before checkout</p>
        <button
          onClick={() => navigate('/products')}
          className="btn-primary inline-flex items-center gap-2 group"
        >
          <Package className="w-5 h-5" />
          Continue Shopping
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-8">
        {/* Billing Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-lg opacity-50"></div>
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
              <User className="w-6 h-6 text-cyan-400" />
              Billing Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group md:col-span-2">
                <label className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="input-field w-full"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-lg opacity-50"></div>
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-purple-400" />
              Shipping Address
            </h2>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="flex items-center gap-2 mb-2">
                  <Home className="w-4 h-4" />
                  Street Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="input-field w-full"
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4" />
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="input-field w-full"
                    placeholder="New York"
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="input-field w-full"
                    placeholder="NY"
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    required
                    className="input-field w-full"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-lg opacity-50"></div>
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-green-400" />
              Payment Method
            </h2>
            
            <div className="space-y-3">
              <label className={`
                flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all
                ${formData.payment_method === 'cash' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                  : 'bg-gray-800/50 border border-gray-700 hover:border-cyan-500/30'
                }
              `}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cash"
                  checked={formData.payment_method === 'cash'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.payment_method === 'cash' ? 'border-cyan-400' : 'border-gray-500'
                }`}>
                  {formData.payment_method === 'cash' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                  )}
                </div>
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <span className="text-white">Cash on Delivery</span>
              </label>

              <label className={`
                flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-all
                ${formData.payment_method === 'card' 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                  : 'bg-gray-800/50 border border-gray-700 hover:border-cyan-500/30'
                }
              `}>
                <input
                  type="radio"
                  name="payment_method"
                  value="card"
                  checked={formData.payment_method === 'card'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  formData.payment_method === 'card' ? 'border-cyan-400' : 'border-gray-500'
                }`}>
                  {formData.payment_method === 'card' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                  )}
                </div>
                <CreditCard className="w-5 h-5 text-cyan-400" />
                <span className="text-white">Credit/Debit Card</span>
              </label>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Order Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:sticky lg:top-28 h-fit"
      >
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-lg"></div>
          <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Order Summary
            </h2>
            
            {/* Cart Items */}
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
              {cart?.data?.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${item.product.image}` || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-mono text-cyan-400">
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal</span>
                <span className="font-mono text-gray-300">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tax (10%)</span>
                <span className="font-mono text-gray-300">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Shipping</span>
                <span className="font-mono text-gray-300">
                  {shipping === 0 ? (
                    <span className="text-green-400">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                <span className="text-lg font-semibold text-gray-300">Total</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-6 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Place Order
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Secure checkout powered by Stripe</span>
            </div>
          </div>
        </div>
      </motion.div>
    </form>
  );
}

export default function Checkout() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Futuristic Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">
          Secure Checkout
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
      </motion.div>
      
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}