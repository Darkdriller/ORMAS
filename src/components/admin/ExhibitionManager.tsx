import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { getExhibitionPhotos, saveExhibitionPhoto, deleteExhibitionPhoto, updateExhibitionPhoto, type ExhibitionPhoto } from '../../services/exhibitionService';

export const ExhibitionManager = () => {
  const [photos, setPhotos] = useState<ExhibitionPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ url: '', caption: '' });

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const fetchedPhotos = await getExhibitionPhotos();
      setPhotos(fetchedPhotos);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newPhoto.url) {
      try {
        const savedPhoto = await saveExhibitionPhoto(newPhoto);
        setPhotos([...photos, savedPhoto]);
        setNewPhoto({ url: '', caption: '' });
      } catch (err) {
        setError('Failed to add photo');
        console.error('Error adding photo:', err);
      }
    }
  };

  const handleEdit = (photo: ExhibitionPhoto) => {
    setEditingId(photo.id);
    setEditForm({ url: photo.url, caption: photo.caption || '' });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const updatedPhoto = await updateExhibitionPhoto(id, editForm);
      setPhotos(photos.map(photo => 
        photo.id === id ? updatedPhoto : photo
      ));
      setEditingId(null);
    } catch (err) {
      setError('Failed to update photo');
      console.error('Error updating photo:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExhibitionPhoto(id);
      setPhotos(photos.filter(photo => photo.id !== id));
    } catch (err) {
      setError('Failed to delete photo');
      console.error('Error deleting photo:', err);
    }
  };

  if (loading) return <div className="text-center py-4">Loading photos...</div>;
  if (error) return <div className="text-red-600 py-4">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Exhibition Photos</h2>
      
      <div className="grid gap-4 mb-6">
        <input
          type="text"
          placeholder="Photo URL"
          value={newPhoto.url}
          onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          value={newPhoto.caption}
          onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add Photo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map(photo => (
          <div key={photo.id} className="relative group bg-white rounded-lg shadow-md p-2">
            {editingId === photo.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Photo URL"
                />
                <input
                  type="text"
                  value={editForm.caption}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Caption"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(photo.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={photo.url}
                  alt={photo.caption || 'Exhibition photo'}
                  className="w-full h-48 object-cover rounded"
                />
                {photo.caption && (
                  <p className="mt-2 text-sm text-gray-600">{photo.caption}</p>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(photo)}
                    className="bg-white p-1 rounded-full shadow-lg text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="bg-white p-1 rounded-full shadow-lg text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
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