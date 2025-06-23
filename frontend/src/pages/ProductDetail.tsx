import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, cartAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { ShoppingCart, Star, Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(parseInt(id!)),
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: (data: { product_id: number; quantity: number }) =>
      cartAPI.addItem(data),
    onSuccess: () => {
      toast.success('Added to cart!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: () => {
      toast.error('Failed to add to cart');
    },
  });

  const addReviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      productsAPI.createReview(parseInt(id!), data),
    onSuccess: () => {
      toast.success('Review added successfully!');
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setComment('');
      setRating(5);
    },
    onError: () => {
      toast.error('Failed to add review');
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCartMutation.mutate({
      product_id: parseInt(id!),
      quantity,
    });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    addReviewMutation.mutate({
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    addReviewMutation.mutate({
      rating: parseInt(rating),
      comment: comment.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 h-96 rounded-lg"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 h-8 w-3/4 rounded"></div>
            <div className="bg-gray-200 h-6 w-1/4 rounded"></div>
            <div className="bg-gray-200 h-24 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  const averageRating = product.data.reviews.length
    ? product.data.reviews.reduce((sum, r) => sum + r.rating, 0) / product.data.reviews.length
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={`${import.meta.env.VITE_API_URL}${product.data.image}` || 'https://via.placeholder.com/400'}
            alt={product.data.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.data.name}</h1>
          
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-gray-600">({product.data.reviews.length} reviews)</span>
          </div>

          <p className="text-3xl font-bold text-blue-600">${product.data.price}</p>
          
          <p className="text-gray-700">{product.data.description}</p>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 border rounded hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 border rounded hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={product.data.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.data.stock_quantity > 0 ? `${product.data.stock_quantity} in stock` : 'Out of stock'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.data.stock_quantity === 0 || addToCartMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

        {/* Add Review Form */}
        {user && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label htmlFor="rating">Rating</label>
              <select
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="input-futuristic"
                required
              >
                <option value="">Select a rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div>
              <label htmlFor="comment">Your Review</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="input-futuristic"
                placeholder="Share your experience with this product..."
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Submit Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {product.data.reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            product.data.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p className="text-gray-700">{review.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}