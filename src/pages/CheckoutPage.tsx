import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
}

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchasedKeys, setPurchasedKeys] = useState<Array<{ product: string; key: string }>>([]);

  const handleCheckout = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://ipapi.co/json/');
      const locationData = await response.json();

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: totalAmount,
          status: 'completed',
          payment_method: 'credit_card',
          ip_address: locationData.ip || '',
          country: locationData.country_name || '',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const keys: Array<{ product: string; key: string }> = [];

      for (const item of items) {
        const { data: availableKey } = await supabase
          .from('product_keys')
          .select('*')
          .eq('product_id', item.productId)
          .eq('is_sold', false)
          .limit(1)
          .maybeSingle();

        if (availableKey) {
          await supabase
            .from('product_keys')
            .update({
              is_sold: true,
              sold_to_user_id: user.id,
              sold_at: new Date().toISOString(),
            })
            .eq('id', availableKey.id);

          await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.productId,
            product_key_id: availableKey.id,
            product_name: item.name,
            price: item.price,
          });

          const { data: product } = await supabase
            .from('products')
            .select('stock_count')
            .eq('id', item.productId)
            .single();

          if (product) {
            await supabase
              .from('products')
              .update({ stock_count: Math.max(0, product.stock_count - 1) })
              .eq('id', item.productId);
          }

          keys.push({ product: item.name, key: availableKey.key_value });
        }
      }

      setPurchasedKeys(keys);
      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    onNavigate('cart');
    return null;
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">Your order has been completed successfully.</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Product Keys</h2>
            <div className="space-y-4">
              {purchasedKeys.map((item, idx) => (
                <div key={idx} className="border-b pb-4 last:border-b-0">
                  <p className="font-medium text-gray-700 mb-2">{item.product}</p>
                  <div className="bg-white px-4 py-3 rounded border border-gray-200">
                    <code className="text-blue-600 font-mono text-lg">{item.key}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('profile')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            View Order History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-gray-700">
              <span>{item.name}</span>
              <span className="font-medium">${item.price}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
        <div className="flex items-center space-x-3 p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <span className="font-medium text-gray-900">Credit Card</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg"
      >
        {loading ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
      </button>
    </div>
  );
}
