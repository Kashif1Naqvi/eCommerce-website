import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import { 
  Package, ShoppingCart, Users, TrendingUp,
  DollarSign, Star, AlertCircle, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminAPI.getStats
  });

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats?.total_revenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      change: '+12.5%'
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      change: '+8.2%'
    },
    {
      title: 'Active Products',
      value: stats?.active_products || 0,
      icon: Package,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      change: '+3'
    },
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
      change: '+15'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="glass-effect border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm text-green-400">{stat.change}</span>
            </div>
            <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-effect border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>Add New Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>View Orders</span>
          </Link>
          <Link
            to="/admin/users"
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass-effect border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {stats?.recent_orders?.map((order: any) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <p className="font-medium">Order #{order.id}</p>
                <p className="text-sm text-gray-400">{order.user_email}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${order.total.toFixed(2)}</p>
                <p className="text-sm text-gray-400">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}