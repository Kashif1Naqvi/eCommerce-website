import { useState, useEffect } from 'react';
import { useSearchParams, Link, data } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, categoriesAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash, X, Tag } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdminMode = searchParams.get('admin') === 'true' && user?.is_admin;
  const shouldAddProduct = searchParams.get('action') === 'add' && user?.is_admin;
  
  const [showProductModal, setShowProductModal] = useState(shouldAddProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    is_featured: false
  });

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll()
  });

  // Fetch categories for the form
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data) => productsAPI.create(data),
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductModal(false);
      resetForm();
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => productsAPI.update(id, data),
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductModal(false);
      setEditingProduct(null);
      resetForm();
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => productsAPI.delete(id),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Update the handleSubmit function to include a default image
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity),
      category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
      is_featured: productForm.is_featured,
      image: null  // Add this line to provide a default null value for image
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id?.toString() || '',
      is_featured: product.is_featured
    });
    setShowProductModal(true);
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category_id: '',
      is_featured: false
    });
  };
  
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        
        {/* Admin Controls */}
        {user?.is_admin && (
          <div className="flex space-x-4">
            <Link
              to="/admin/categories"
              className="btn-secondary flex items-center space-x-2"
            >
              <Tag className="w-5 h-5" />
              <span>Manage Categories</span>
            </Link>
            <button
              onClick={() => setShowProductModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.data?.data?.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              
              {/* Admin Actions Overlay */}
              {isAdminMode && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this product?')) {
                        deleteProductMutation.mutate(product.id);
                      }
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    <Trash className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div 
            className="glass-effect border border-gray-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stock</label>
                <input
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">No Category</option>
                  {categories?.data?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  )) || categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}