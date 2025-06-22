import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

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
  // In a real app, you would fetch orders from the API
  const { data: orders = mockOrders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // return ordersAPI.getMyOrders();
      return mockOrders;
    },
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
        <Link to="/products" className="btn-primary">
          Shop Now
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">Order #{order.id}</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-lg">
                ${order.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}