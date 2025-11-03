import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductsManagement } from './pages/admin/ProductsManagement';
import { CategoriesManagement } from './pages/admin/CategoriesManagement';
import { UsersManagement } from './pages/admin/UsersManagement';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParam, setPageParam] = useState<string | undefined>();
  const [adminPage, setAdminPage] = useState('dashboard');
  const { loading, isAdmin } = useAuth();

  const navigate = (page: string, param?: string) => {
    setCurrentPage(page);
    setPageParam(param);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (currentPage === 'admin') {
    if (!isAdmin) {
      navigate('home');
      return null;
    }

    return (
      <AdminLayout currentPage={adminPage} onNavigate={(page) => {
        if (page === 'home') {
          navigate('home');
        } else {
          setAdminPage(page);
        }
      }}>
        {adminPage === 'dashboard' && <Dashboard />}
        {adminPage === 'products' && <ProductsManagement />}
        {adminPage === 'categories' && <CategoriesManagement />}
        {adminPage === 'users' && <UsersManagement />}
        {adminPage === 'orders' && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
            <p className="text-gray-600 mt-2">Coming soon</p>
          </div>
        )}
        {adminPage === 'settings' && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600 mt-2">Coming soon</p>
          </div>
        )}
      </AdminLayout>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'products':
        return <ProductsPage onNavigate={navigate} />;
      case 'categories':
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <p className="text-gray-600 mt-2">Coming soon</p>
          </div>
        );
      case 'product':
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
            <p className="text-gray-600 mt-2">Product ID: {pageParam}</p>
          </div>
        );
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      case 'cart':
        return <CartPage onNavigate={navigate} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigate} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <Layout onNavigate={navigate} currentPage={currentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
