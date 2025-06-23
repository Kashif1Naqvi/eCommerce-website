import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, categoriesAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash, X, Tag, Upload, Image } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

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
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Add image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ productId, file }: { productId: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      return productsAPI.uploadImage(productId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      stock_quantity: parseInt(productForm.stock_quantity),
      category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
      is_featured: productForm.is_featured,
      image: null
    };

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({ id: editingProduct.id, data });
        
        // Upload image if provided
        if (productImage) {
          await uploadImageMutation.mutateAsync({ 
            productId: editingProduct.id, 
            file: productImage 
          });
        }
      } else {
        const response = await createProductMutation.mutateAsync(data);
        
        // Upload image if provided for new product
        if (productImage && response?.data?.id) {
          await uploadImageMutation.mutateAsync({ 
            productId: response.data.id, 
            file: productImage 
          });
        }
      }
      
      resetForm();
      setShowProductModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, or WebP)');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProductImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setProductImage(null);
    setImagePreview(null);
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
    setImagePreview(`${import.meta.env.VITE_API_URL}${product.image}`);
    setShowProductModal(true);
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
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 999998 }}
            onClick={() => {
              setShowProductModal(false);
              setEditingProduct(null);
              resetForm();
            }}
          />
          
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 999999 }}
          >
            <div 
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-cyan-400">PRODUCT IMAGE</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="relative block w-full">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors cursor-pointer"
                        >
                          <div className="text-center">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <span className="text-sm text-gray-400">
                              Click to upload image
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              JPEG, PNG, WebP (Max 5MB)
                            </p>
                          </div>
                        </label>
                      </label>
                    </div>
                    
                    {/* Image Preview */}
                    {(imagePreview || editingProduct?.image) && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-700">
                        <img
                          src={imagePreview || `${import.meta.env.VITE_API_URL}${editingProduct?.image}`}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setProductImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-400">NAME</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-400">DESCRIPTION</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    rows={3}
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-400">PRICE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="Enter product price"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-400">STOCK</label>
                  <input
                    type="number"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="Enter stock quantity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-400">CATEGORY</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
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
                    <span className="text-cyan-400">Featured Product</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending || uploadImageMutation.isPending}
                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {(createProductMutation.isPending || updateProductMutation.isPending || uploadImageMutation.isPending) ? (
                      <span className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </span>
                    ) : (
                      <span>{editingProduct ? 'Update' : 'Create'} Product</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}