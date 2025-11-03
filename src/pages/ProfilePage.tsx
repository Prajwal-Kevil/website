import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, ShoppingBag, Key } from 'lucide-react';

export function ProfilePage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!profile) return;

    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product_keys(key_value)
        )
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 p-6 rounded-full">
                <User className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
              <p className="text-gray-600 mt-1">{profile.full_name || 'No name set'}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{profile.role}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium ${
                    profile.is_blocked ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {profile.is_blocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium">{profile.country || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Joined:</span>
                <span className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No orders yet</div>
            ) : (
              <div className="divide-y">
                {orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${order.total_amount}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.order_items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3"
                        >
                          <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product_name}</p>
                            <div className="mt-2 bg-white px-3 py-2 rounded border border-gray-200">
                              <code className="text-sm font-mono text-blue-600">
                                {item.product_keys?.key_value || 'Key not available'}
                              </code>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-gray-900">${item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
