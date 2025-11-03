import { ReactNode } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const { signOut, profile } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'categories', icon: FolderTree, label: 'Categories' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">{profile?.username}</p>
          </div>

          <nav className="mt-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-6 py-3 text-left text-gray-300 hover:bg-gray-800 transition mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
