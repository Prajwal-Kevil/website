import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { Plus, Edit, Trash, Key, Eye, EyeOff, Star } from 'lucide-react';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showKeysModal, setShowKeysModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productKeys, setProductKeys] = useState<string[]>([]);
  const [newKeys, setNewKeys] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    description: '',
    price: '',
    image_url: '',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    if (editingProduct) {
      await supabase.from('products').update(productData).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert(productData);
    }

    setShowModal(false);
    resetForm();
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      loadData();
    }
  };

  const handleToggleActive = async (product: Product) => {
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    loadData();
  };

  const handleToggleFeatured = async (product: Product) => {
    await supabase
      .from('products')
      .update({ is_featured: !product.is_featured })
      .eq('id', product.id);
    loadData();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category_id: product.category_id,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      is_active: product.is_active,
      is_featured: product.is_featured,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category_id: '',
      description: '',
      price: '',
      image_url: '',
      is_active: true,
      is_featured: false,
    });
  };

  const handleManageKeys = async (productId: string) => {
    setSelectedProductId(productId);
    const { data } = await supabase
      .from('product_keys')
      .select('key_value')
      .eq('product_id', productId)
      .eq('is_sold', false);

    setProductKeys(data?.map((k) => k.key_value) || []);
    setShowKeysModal(true);
  };

  const handleAddKeys = async () => {
    const keys = newKeys.split('\n').filter((k) => k.trim());
    if (keys.length === 0) return;

    const keyInserts = keys.map((key) => ({
      product_id: selectedProductId,
      key_value: key.trim(),
      is_sold: false,
    }));

    await supabase.from('product_keys').insert(keyInserts);

    const { count } = await supabase
      .from('product_keys')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', selectedProductId)
      .eq('is_sold', false);

    await supabase
      .from('products')
      .update({ stock_count: count || 0 })
      .eq('id', selectedProductId);

    setNewKeys('');
    handleManageKeys(selectedProductId);
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stock
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
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image_url || 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 flex items-center space-x-2">
                        <span>{product.name}</span>
                        {product.is_featured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{product.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {categories.find((c) => c.id === product.category_id)?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  ${product.price}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.stock_count}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleToggleFeatured(product)}
                      className={`p-2 rounded hover:bg-gray-100 ${
                        product.is_featured ? 'text-yellow-500' : 'text-gray-400'
                      }`}
                      title="Toggle Featured"
                    >
                      <Star className={`w-4 h-4 ${product.is_featured ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="Toggle Active"
                    >
                      {product.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleManageKeys(product.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Manage Keys"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, is_featured: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showKeysModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Manage Product Keys</h2>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">
                Available Keys ({productKeys.length})
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                {productKeys.length === 0 ? (
                  <p className="text-gray-500 text-sm">No keys available</p>
                ) : (
                  <div className="space-y-1">
                    {productKeys.map((key, idx) => (
                      <div key={idx} className="text-sm font-mono text-gray-700">
                        {key}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Keys (one per line)
              </label>
              <textarea
                value={newKeys}
                onChange={(e) => setNewKeys(e.target.value)}
                rows={5}
                placeholder="KEY-1234-ABCD&#10;KEY-5678-EFGH&#10;KEY-9012-IJKL"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <button
                onClick={handleAddKeys}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Keys
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowKeysModal(false);
                  setNewKeys('');
                }}
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
