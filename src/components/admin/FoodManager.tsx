import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { getFoods, saveFood, updateFood, deleteFood, type Food } from '../../services/foodService';

export const FoodManager = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFood, setNewFood] = useState({
    name: '',
    description: '',
    location: '',
    price: '',
    images: ['']
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    location: '',
    price: '',
    images: ['']
  });

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const fetchedFoods = await getFoods();
      setFoods(fetchedFoods);
    } catch (err) {
      setError('Failed to load foods');
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newFood.name && newFood.description && newFood.location && newFood.price) {
      try {
        const savedFood = await saveFood(newFood);
        setFoods([...foods, savedFood]);
        setNewFood({ name: '', description: '', location: '', price: '', images: [''] });
      } catch (err) {
        setError('Failed to add food item');
        console.error('Error adding food:', err);
      }
    }
  };

  const handleEdit = (food: Food) => {
    setEditingId(food.id);
    setEditForm({
      name: food.name,
      description: food.description,
      location: food.location,
      price: food.price,
      images: food.images
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (editForm.name && editForm.description && editForm.location && editForm.price) {
      try {
        const updatedFood = await updateFood(id, editForm);
        setFoods(foods.map(food => 
          food.id === id ? updatedFood : food
        ));
        setEditingId(null);
      } catch (err) {
        setError('Failed to update food item');
        console.error('Error updating food:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFood(id);
      setFoods(foods.filter(food => food.id !== id));
    } catch (err) {
      setError('Failed to delete food item');
      console.error('Error deleting food:', err);
    }
  };

  const handleImageChange = (index: number, value: string, isEdit: boolean = false) => {
    if (isEdit) {
      const newImages = [...editForm.images];
      newImages[index] = value;
      setEditForm({ ...editForm, images: newImages });
    } else {
      const newImages = [...newFood.images];
      newImages[index] = value;
      setNewFood({ ...newFood, images: newImages });
    }
  };

  const addImageField = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditForm({ ...editForm, images: [...editForm.images, ''] });
    } else {
      setNewFood({ ...newFood, images: [...newFood.images, ''] });
    }
  };

  const removeImageField = (index: number, isEdit: boolean = false) => {
    if (isEdit && editForm.images.length > 1) {
      const newImages = editForm.images.filter((_, i) => i !== index);
      setEditForm({ ...editForm, images: newImages });
    } else if (!isEdit && newFood.images.length > 1) {
      const newImages = newFood.images.filter((_, i) => i !== index);
      setNewFood({ ...newFood, images: newImages });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading foods...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Foods</h2>
      
      <div className="grid gap-4 mb-6">
        <input
          type="text"
          placeholder="Food Name"
          value={newFood.name}
          onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Description"
          value={newFood.description}
          onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Location"
          value={newFood.location}
          onChange={(e) => setNewFood({ ...newFood, location: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Price"
          value={newFood.price}
          onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images
          </label>
          {newFood.images.map((image, index) => (
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
          Add Food Item
        </button>
      </div>

      <div className="grid gap-4">
        {foods.map(food => (
          <div key={food.id} className="flex items-start justify-between p-4 border rounded-lg">
            {editingId === food.id ? (
              <div className="flex-1 grid gap-4">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  placeholder="Food name"
                />
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  placeholder="Description"
                />
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  placeholder="Location"
                />
                <input
                  type="text"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  placeholder="Price"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images
                  </label>
                  {editForm.images.map((image, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value, true)}
                        className="flex-1 px-4 py-2 border rounded-lg"
                        placeholder="Enter image URL"
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
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(food.id)}
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
                  {food.images[0] && (
                    <img
                      src={food.images[0]}
                      alt={food.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold">{food.name}</h3>
                      <span className="text-green-600">{food.price}</span>
                    </div>
                    <p className="text-gray-600">{food.description}</p>
                    <p className="text-sm text-gray-500">{food.location}</p>
                    <p className="text-xs text-gray-500">{food.images.length} image(s)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(food)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(food.id)}
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