import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, categoriesAPI } from '../../lib/api';
import { toast } from 'react-toastify';
import { 
  Plus, Edit, Trash, Upload, Star, StarOff, 
  Search, Filter, X, Check, AlertCircle, Package
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id?: number;
  image?: string;
  is_active: boolean;
  is_featured: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  product_count: number;
}

export default function ProductManagement() {
  const queryClient = useQueryClient();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [showInactive, setShowInactive] = useState(false);
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    is_featured: false
  });
  
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  
  // Queries
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-products', search, categoryFilter, showInactive],
    queryFn: () => productsAPI.getAll({
      search: search || undefined,
      category_id: categoryFilter,
      limit: 100
    })
  });
  
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll
  });
  
  // Mutations
  const createProductMutation = useMutation({
    mutationFn: (data: any) => productsAPI.create(data),
    onSuccess: () => {
      toast.success('Product created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowProductModal(false);
      resetProductForm();
    },
    onError: () => toast.error('Failed to create product')
  });
  
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      productsAPI.update(id, data),
    onSuccess: () => {
      toast.success('Product updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
    },
    onError: () => toast.error('Failed to update product')
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => productsAPI.delete(id),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('Failed to delete product')
  });
  
  const toggleFeaturedMutation = useMutation({
    mutationFn: (id: number) => productsAPI.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    }
  });
  
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => categoriesAPI.create(data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      resetCategoryForm();
    },
    onError: () => toast.error('Failed to create category')
  });
  
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      categoriesAPI.update(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      setEditingCategory(null);
      resetCategoryForm();
    },
    onError: () => toast.error('Failed to update category')
  });
  
  // Handlers
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity),
      category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
      is_featured: productForm.is_featured
    };
    
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };
  
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: categoryForm.name,
      description: categoryForm.description || null
    };
    
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };
  
  const handleEditProduct = (product: Product) => {
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
  
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    });
    setShowCategoryModal(true);
  };
  
  const handleImageUpload = async (productId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await productsAPI.uploadImage(productId, formData);
      toast.success('Image uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };
  
  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category_id: '',
      is_featured: false
    });
  };
  
  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: ''
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Product Management</h1>
        <p className="text-gray-600">Manage your products and categories</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-effect border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-cyan-400">
                {products?.total || 0}
              </p>
            </div>
            <Package className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        
        <div className="glass-effect border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Products</p>
              <p className="text-2xl font-bold text-green-400">
                {products?.data.filter(p => p.is_active).length || 0}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="glass-effect border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Featured Products</p>
              <p className="text-2xl font-bold text-purple-400">
                {products?.data.filter(p => p.is_featured).length || 0}
              </p>
            </div>
            <Star className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="glass-effect border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-orange-400">
                {products?.data.filter(p => p.stock_quantity < 10).length || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>
      
      {/* Actions and Filters */}
      <div className="glass-effect border border-gray-800 rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
            
            <select
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories?.data.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.product_count})
                </option>
              ))}
            </select>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-gray-400">Show Inactive</span>
            </label>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingCategory(null);
                resetCategoryForm();
                setShowCategoryModal(true);
              }}
              className="btn-secondary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
            
            <button
              onClick={() => {
                setEditingProduct(null);
                resetProductForm();
                setShowProductModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Categories Section */}
      <div className="glass-effect border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories?.data.map((category) => (
            <div
              key={category.id}
              className="glass-effect border border-gray-700 rounded-lg p-4 hover:border-cyan-500 transition-colors cursor-pointer"
              onClick={() => handleEditCategory(category)}
            >
              <h3 className="font-semibold text-cyan-400">{category.name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {category.product_count} products
              </p>
              {category.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Products Table */}
      <div className="glass-effect border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {productsLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                  </td>
                </tr>
              ) : products?.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No products found
                  </td>
                </tr>
              ) : (
                products?.data
                  .filter(p => showInactive || p.is_active)
                  .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-gray-400 line-clamp-1">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {categories?.data.find(c => c.id === product.category_id)?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`${
                          product.stock_quantity < 10 ? 'text-orange-400' : 'text-green-400'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{product.average_rating.toFixed(1)}</span>
                          <span className="text-gray-400">({product.review_count})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {product.is_active ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">
                              Inactive
                            </span>
                          )}
                          {product.is_featured && (
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => toggleFeaturedMutation.mutate(product.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            title={product.is_featured ? "Remove from featured" : "Add to featured"}
                          >
                            {product.is_featured ? (
                              <StarOff className="w-4 h-4 text-purple-400" />
                            ) : (
                              <Star className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                          
                          <label className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                            <Upload className="w-4 h-4 text-gray-400" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(product.id, file);
                              }}
                            />
                          </label>
                          
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-cyan-400" />
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                deleteProductMutation.mutate(product.id);
                              }
                            }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Trash className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  resetProductForm();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name</label>
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
              
              <div className="grid grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">No Category</option>
                  {categories?.data.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Featured Product</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="btn-primary"
                >
                  {createProductMutation.isPending || updateProductMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-effect border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  resetCategoryForm();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    resetCategoryForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="btn-primary"
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    editingCategory ? 'Update Category' : 'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}