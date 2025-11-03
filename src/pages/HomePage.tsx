import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Star, TrendingUp } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

type Product = Database['public']['Tables']['products']['Row'];

interface HomePageProps {
  onNavigate: (page: string, id?: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .gt('stock_count', 0)
      .limit(6);

    if (data) setFeaturedProducts(data);
    setLoading(false);
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url,
    });
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to KeyMarket</h1>
          <p className="text-xl mb-8">
            Your trusted marketplace for digital product keys
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Browse Products
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-6 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative">
                  <img
                    src={product.image_url || 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    Featured
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.stock_count} in stock
                    </span>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => onNavigate('product', product.id)}
                      className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide instant delivery of digital product keys with 24/7 support
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Delivery</h3>
              <p className="text-gray-600">Get your keys immediately after purchase</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">Your transactions are safe and encrypted</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">We're always here to help you</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
