import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash, X, Tag } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export default function CategoryManagement() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    is_active: true
  });

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesAPI.getAll
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => categoriesAPI.create(data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create category');
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      categoriesAPI.update(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowCategoryModal(false);
      setEditingCategory(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update category');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categoriesAPI.delete(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: categoryForm.name,
      description: categoryForm.description || null,
      is_active: categoryForm.is_active
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active
    });
    setShowCategoryModal(true);
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      is_active: true
    });
  };

  if (!user?.is_admin) {
    return <div>Access denied. Admin only.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Category Management</h1>
          <p className="text-gray-400">Manage product categories for your store</p>
        </div>
        
        <button
          onClick={() => setShowCategoryModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category: Category) => (
            <div
              key={category.id}
              className="glass-effect border border-gray-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg">
                    <Tag className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              {category.description && (
                <p className="text-gray-400 text-sm mb-4">{category.description}</p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Created: {new Date(category.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(category)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 999998 }}
            onClick={() => {
              setShowCategoryModal(false);
              setEditingCategory(null);
              resetForm();
            }}
          />
          
          <div 
            className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
            style={{ zIndex: 999999 }}
          >
            <div 
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-cyan-400">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="e.g., Electronics"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                    placeholder="Optional description for the category"
                    rows={3}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <span className="text-gray-300">Active Category</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Inactive categories won't be available for product assignment
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingCategory(null);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                    className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? (
                      <span className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </span>
                    ) : (
                      <span>{editingCategory ? 'Update' : 'Create'} Category</span>
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