import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { Search, UserX, UserCheck, Eye, MapPin, Clock } from 'lucide-react';

type UserProfile = Database['public']['Tables']['users_profile']['Row'];

interface UserWithOrders extends UserProfile {
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

export function UsersManagement() {
  const [users, setUsers] = useState<UserWithOrders[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithOrders | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data: profiles } = await supabase.from('users_profile').select('*');

    if (profiles) {
      const usersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('id, total_amount, created_at')
            .eq('user_id', profile.id);

          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
          const lastOrderDate = orders?.[0]?.created_at || null;

          return {
            ...profile,
            order_count: orderCount,
            total_spent: totalSpent,
            last_order_date: lastOrderDate,
          };
        })
      );

      setUsers(usersWithStats);
    }
    setLoading(false);
  };

  const handleToggleBlock = async (user: UserProfile) => {
    await supabase
      .from('users_profile')
      .update({ is_blocked: !user.is_blocked })
      .eq('id', user.id);
    loadUsers();
  };

  const handleViewDetails = async (user: UserWithOrders) => {
    setSelectedUser(user);

    const [ordersRes, sessionsRes] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    setUserOrders(ordersRes.data || []);
    setUserSessions(sessionsRes.data || []);
    setShowDetailsModal(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Users Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.full_name}</div>
                      <div className="text-xs text-gray-400 mt-1">{user.last_ip}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{user.country || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.order_count}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${user.total_spent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_blocked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleBlock(user)}
                        className={`p-2 rounded ${
                          user.is_blocked
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.is_blocked ? 'Unblock' : 'Block'}
                      >
                        {user.is_blocked ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">User Details</h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Username:</span>{' '}
                    <span className="font-medium">{selectedUser.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Full Name:</span>{' '}
                    <span className="font-medium">{selectedUser.full_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Role:</span>{' '}
                    <span className="font-medium">{selectedUser.role}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Account ID:</span>{' '}
                    <span className="font-mono text-xs">{selectedUser.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>{' '}
                    <span
                      className={`font-medium ${
                        selectedUser.is_blocked ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {selectedUser.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>{' '}
                    <span className="font-medium">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Activity Summary</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Total Orders:</span>{' '}
                    <span className="font-medium">{selectedUser.order_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Spent:</span>{' '}
                    <span className="font-medium">${selectedUser.total_spent.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last IP:</span>{' '}
                    <span className="font-medium">{selectedUser.last_ip || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Country:</span>{' '}
                    <span className="font-medium">{selectedUser.country || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Order History</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                {userOrders.length === 0 ? (
                  <p className="text-gray-500 text-sm p-4">No orders yet</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Order #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Amount
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {userOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-2">{order.order_number}</td>
                          <td className="px-4 py-2">${order.total_amount}</td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Recent Sessions</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {userSessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No sessions recorded</p>
                ) : (
                  <div className="space-y-2">
                    {userSessions.map((session) => (
                      <div
                        key={session.id}
                        className="text-xs bg-white p-2 rounded border border-gray-200"
                      >
                        <div className="flex justify-between">
                          <span className="font-mono text-gray-700">{session.ip_address}</span>
                          <span className="text-gray-500">
                            {new Date(session.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-gray-600 mt-1">{session.country}</div>
                        <div className="text-gray-500 truncate mt-1">{session.user_agent}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
