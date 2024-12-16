import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { getProducts, saveProduct, deleteProduct, updateProduct, categories } from '../../services/productService';
import type { Product } from '../../services/productService';

export const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    category: '',
    name: '',
    images: [''],
    stallRange: ''
  });
  const [editForm, setEditForm] = useState({
    category: '',
    name: '',
    images: [''],
    stallRange: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateStallRange = (range: string) => {
    const rangeFormat = /^\d+-\d+$/;
    const commaFormat = /^\d+(,\d+)*$/;
    return rangeFormat.test(range) || commaFormat.test(range);
  };

  const handleAdd = async () => {
    if (newProduct.category && newProduct.name && newProduct.images[0] && validateStallRange(newProduct.stallRange)) {
      try {
        const savedProduct = await saveProduct(newProduct);
        setProducts([...products, savedProduct]);
        setNewProduct({ category: '', name: '', images: [''], stallRange: '' });
      } catch (err) {
        setError('Failed to add product');
        console.error('Error adding product:', err);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      category: product.category,
      name: product.name,
      images: [...product.images],
      stallRange: product.stallRange || ''
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (editForm.category && editForm.name && editForm.images[0] && validateStallRange(editForm.stallRange)) {
      try {
        const updatedProduct = await updateProduct(id, editForm);
        setProducts(products.map(product => 
          product.id === id ? updatedProduct : product
        ));
        setEditingId(null);
      } catch (err) {
        setError('Failed to update product');
        console.error('Error updating product:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const handleImageChange = (index: number, value: string, isEdit: boolean = false) => {
    if (isEdit) {
      const newImages = [...editForm.images];
      newImages[index] = value;
      setEditForm({ ...editForm, images: newImages });
    } else {
      const newImages = [...newProduct.images];
      newImages[index] = value;
      setNewProduct({ ...newProduct, images: newImages });
    }
  };

  const addImageField = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditForm({ ...editForm, images: [...editForm.images, ''] });
    } else {
      setNewProduct({ ...newProduct, images: [...newProduct.images, ''] });
    }
  };

  const removeImageField = (index: number, isEdit: boolean = false) => {
    if (isEdit) {
      const newImages = editForm.images.filter((_, i) => i !== index);
      setEditForm({ ...editForm, images: newImages });
    } else {
      const newImages = newProduct.images.filter((_, i) => i !== index);
      setNewProduct({ ...newProduct, images: newImages });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading products...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Products</h2>
      
      <div className="grid gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stall Range
          </label>
          <input
            type="text"
            value={newProduct.stallRange}
            onChange={(e) => setNewProduct({ ...newProduct, stallRange: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Format: 1-10 or 1,3,5,7"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images
          </label>
          {newProduct.images.map((image, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="Enter image URL"
              />
              {index > 0 && (
                <button
                  onClick={() => removeImageField(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addImageField()}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + Add another image
          </button>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="grid gap-4">
        {products.map(product => (
          <div key={product.id} className="flex items-start justify-between p-4 border rounded-lg">
            {editingId === product.id ? (
              <div className="w-full grid gap-4">
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Product name"
                />
                <input
                  type="text"
                  value={editForm.stallRange}
                  onChange={(e) => setEditForm({ ...editForm, stallRange: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Stall range (e.g., 1-10 or 1,3,5,7)"
                />
                {editForm.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value, true)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                      placeholder="Image URL"
                    />
                    {index > 0 && (
                      <button
                        onClick={() => removeImageField(index, true)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addImageField(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add another image
                </button>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(product.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <p className="text-sm text-gray-600">Stalls: {product.stallRange}</p>
                    <p className="text-xs text-gray-500">{product.images.length} image(s)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};