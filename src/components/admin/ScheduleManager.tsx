import React, { useState, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { getEvents, saveEvent, updateEvent, deleteEvent, type Event } from '../../services/scheduleService';

export const ScheduleManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    images: ['']
  });
  const [editForm, setEditForm] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    images: ['']
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await getEvents();
      const eventsWithImages = fetchedEvents.map(event => ({
        ...event,
        images: event.images || ['']
      }));
      setEvents(eventsWithImages);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (newEvent.name && newEvent.date && newEvent.time && newEvent.venue) {
      try {
        const savedEvent = await saveEvent(newEvent);
        setEvents([...events, savedEvent]);
        setNewEvent({ name: '', date: '', time: '', venue: '', description: '', images: [''] });
      } catch (err) {
        setError('Failed to add event');
        console.error('Error adding event:', err);
      }
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setEditForm({
      name: event.name,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description,
      images: event.images || ['']
    });
  };

  const handleSaveEdit = async (id: string) => {
    if (editForm.name && editForm.date && editForm.time && editForm.venue) {
      try {
        const updatedEvent = await updateEvent(id, editForm);
        setEvents(events.map(event => 
          event.id === id ? updatedEvent : event
        ));
        setEditingId(null);
      } catch (err) {
        setError('Failed to update event');
        console.error('Error updating event:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

  const handleImageChange = (index: number, value: string, isEdit: boolean = false) => {
    if (isEdit) {
      const newImages = [...editForm.images];
      newImages[index] = value;
      setEditForm({ ...editForm, images: newImages });
    } else {
      const newImages = [...newEvent.images];
      newImages[index] = value;
      setNewEvent({ ...newEvent, images: newImages });
    }
  };

  const addImageField = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditForm({ ...editForm, images: [...editForm.images, ''] });
    } else {
      setNewEvent({ ...newEvent, images: [...newEvent.images, ''] });
    }
  };

  const removeImageField = (index: number, isEdit: boolean = false) => {
    if (isEdit && editForm.images.length > 1) {
      const newImages = editForm.images.filter((_, i) => i !== index);
      setEditForm({ ...editForm, images: newImages });
    } else if (!isEdit && newEvent.images.length > 1) {
      const newImages = newEvent.images.filter((_, i) => i !== index);
      setNewEvent({ ...newEvent, images: newImages });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading schedule...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 py-4">
        {error}
        <button 
          onClick={fetchEvents}
          className="ml-4 text-blue-600 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Add console logging for debugging
  console.log('Events:', events);
  console.log('EditingId:', editingId);
  console.log('EditForm:', editForm);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Schedule</h2>
      
      <div className="grid gap-4 mb-6">
        <input
          type="text"
          placeholder="Event Name"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="time"
          value={newEvent.time}
          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Venue"
          value={newEvent.venue}
          onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        />
        <textarea
          placeholder="Event Description"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          className="px-4 py-2 border rounded-lg min-h-[100px]"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photos
          </label>
          {newEvent.images.map((image, index) => (
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
            + Add another photo
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="grid gap-4">
        {events.map(event => (
          <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
            {editingId === event.id ? (
              <div className="flex-1 grid gap-4">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  placeholder="Event name"
                />
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  value={editForm.venue}
                  onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                  placeholder="Venue"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="px-4 py-2 border rounded-lg min-h-[100px]"
                  placeholder="Event Description"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photos
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
                    + Add another photo
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
                    onClick={() => handleSaveEdit(event.id)}
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
                  {event.images[0] && (
                    <img
                      src={event.images[0]}
                      alt={event.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-gray-600">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-sm text-gray-500">{event.venue}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500">{event.images.length} photo(s)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
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