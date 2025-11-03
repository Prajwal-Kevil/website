import { ReactNode } from 'react';
import { ShoppingCart, User, LogOut, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface LayoutProps {
  children: ReactNode;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Layout({ children, onNavigate, currentPage }: LayoutProps) {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 text-xl font-bold text-gray-900"
              >
                <Key className="w-6 h-6 text-blue-600" />
                <span>KeyMarket</span>
              </button>

              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => onNavigate('home')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentPage === 'home'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentPage === 'products'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => onNavigate('categories')}
                  className={`px-3 py-2 text-sm font-medium ${
                    currentPage === 'categories'
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Categories
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Admin Panel
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('cart')}
                    className="relative p-2 text-gray-700 hover:text-blue-600"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigate('profile')}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-blue-600"
                  >
                    <User className="w-6 h-6" />
                    <span className="hidden md:inline text-sm">{profile?.username}</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2025 KeyMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
