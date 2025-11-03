import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [] as Array<{
      id: string;
      order_number: string;
      total_amount: number;
      status: string;
      created_at: string;
      user: { username: string };
    }>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const [productsRes, usersRes, ordersRes, revenueRes, recentOrdersRes] =
      await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('users_profile').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
        supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            status,
            created_at,
            users_profile!orders_user_id_fkey(username)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

    const totalRevenue = revenueRes.data?.reduce(
      (sum, order) => sum + Number(order.total_amount),
      0
    ) || 0;

    const formattedOrders = recentOrdersRes.data?.map((order) => ({
      id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
      user: { username: (order.users_profile as { username: string })?.username || 'Unknown' },
    })) || [];

    setStats({
      totalProducts: productsRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalOrders: ordersRes.count || 0,
      totalRevenue,
      recentOrders: formattedOrders,
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Package,
      label: 'Total Products',
      value: stats.totalProducts,
      color: 'blue',
    },
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      color: 'green',
    },
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: stats.totalOrders,
      color: 'purple',
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      color: 'yellow',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your marketplace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 bg-${stat.color}-100 rounded-lg`}
                >
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
