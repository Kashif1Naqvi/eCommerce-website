import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartAPI.get,
    enabled: !!user,
  });

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

  if (!user) {
    return (
      <div className="text-center py-12">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-4">Please login to view your cart</p>
        <Link to="/login" className="btn-primary">
          Login
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading cart...</div>;
  }

  const cartItems = cart?.data?.items || [];
  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-4">Add some products to your cart</p>
        <Link to="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex gap-4">
                <img
                  src={item.product.image_url || 'https://via.placeholder.com/100'}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">
                    <Link to={`/products/${item.product.id}`} className="hover:text-blue-600">
                      {item.product.name}
                    </Link>
                  </h3>
                  <p className="text-gray-600">${item.product.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateItemMutation.mutate({
                          itemId: item.id,
                          quantity: Math.max(1, item.quantity - 1),
                        })
                      }
                      className="p-1 border rounded hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateItemMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                      className="p-1 border rounded hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeItemMutation.mutate(item.id)}
                    className="text-red-600 hover:text-red-700 mt-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/products"
              className="block text-center mt-4 text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}