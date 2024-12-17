import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ZoomIn, Store, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts, categories, type Product } from '../services/productService';
import { ProductGrid } from '../components/products/ProductGrid';
import { CategoryButtons } from '../components/products/CategoryButtons';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Handloom');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    product => !selectedCategory || product.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-4 flex items-center justify-center">
        <div className="text-orange-600">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-4">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-4">
      <Link to="/" className="inline-flex items-center text-orange-600 mb-6">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-orange-800 mb-4">
          Product Availability
        </h1>
        
        <div className="overflow-x-auto pb-4 mb-6">
          <div className="flex space-x-2 min-w-max">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-orange-600 hover:bg-orange-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              layout
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
            >
              <div className="aspect-square relative">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 sm:p-3">
                <h3 className="text-sm sm:text-base font-medium truncate">{product.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{product.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 flex items-center justify-center"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-md sm:max-w-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-4">
                <div className="aspect-square sm:aspect-video w-full overflow-hidden rounded-lg mb-4">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <p className="text-gray-600 mb-2">{selectedProduct.category}</p>
                {selectedProduct.stallRange && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm sm:text-base">
                    <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Available in Stalls: {selectedProduct.stallRange}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};