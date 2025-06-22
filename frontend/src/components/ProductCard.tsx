import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Zap } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  category?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-75 blur transition duration-500"></div>
      
      <div className="relative glass-effect border border-gray-800 rounded-2xl overflow-hidden card-hover">
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative h-56 overflow-hidden">
            <img
              src={product.image_url || 'https://via.placeholder.com/300'}
              alt={product.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
            
            {/* Price badge */}
            <div className="absolute top-4 right-4 glass-effect px-3 py-1 rounded-full border border-gray-700">
              <span className="text-lg font-bold neon-text">${product.price}</span>
            </div>
          </div>
        </Link>
        
        <div className="p-5">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-lg mb-1 text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          {product.category && (
            <p className="text-sm text-gray-400 mb-3 flex items-center space-x-1">
              <Zap size={14} className="text-cyan-400" />
              <span>{product.category.name}</span>
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-cyan-400 text-cyan-400" />
              ))}
              <span className="text-xs text-gray-400 ml-1">(4.5)</span>
            </div>
            
            <Link
              to={`/products/${product.id}`}
              className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white 
                hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 
                shadow-lg hover:shadow-cyan-500/25 group/btn"
            >
              <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}