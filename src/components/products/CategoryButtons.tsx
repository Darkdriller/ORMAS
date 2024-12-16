import React from 'react';
import { motion } from 'framer-motion';

interface CategoryButtonsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryButtons = ({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryButtonsProps) => {
  const firstRowCategories = categories.slice(0, 4);
  const secondRowCategories = categories.slice(4);

  return (
    <div className="grid grid-rows-2 gap-4 mb-8">
      <div className="grid grid-cols-4 gap-4">
        {firstRowCategories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-lg text-center transition-all ${
              selectedCategory === category
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-orange-600 hover:bg-orange-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {secondRowCategories.map((category) => (
          <motion.button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-lg text-center transition-all ${
              selectedCategory === category
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-orange-600 hover:bg-orange-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category}
          </motion.button>
        ))}
      </div>
    </div>
  );
};