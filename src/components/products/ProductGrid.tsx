import React from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, Store } from 'lucide-react';
import type { Product } from '../../services/productService';

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export const ProductGrid = ({ products, onProductSelect }: ProductGridProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={itemVariants}
          className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
          whileHover={{ y: -5 }}
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.button
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={() => onProductSelect(product)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="bg-white/90 p-3 rounded-full">
                <ZoomIn className="w-6 h-6 text-orange-600" />
              </div>
            </motion.button>
          </div>
          <motion.div 
            className="p-4 bg-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {product.category}
            </p>
            {product.stallRange && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <Store className="w-4 h-4" />
                <span>Available in Stalls: {product.stallRange}</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
};