import React, { useState, useEffect } from 'react';
import { Tabs } from '../common/Tabs';
import { ProductManager } from './ProductManager';
import { ScheduleManager } from './ScheduleManager';
import { FoodManager } from './FoodManager';
import { DiscountManager } from './DiscountManager';
import { FeedbackViewer } from './FeedbackViewer';
import { ExhibitionManager } from './ExhibitionManager';
import { SettingsManager } from './SettingsManager';
import { db } from '../../firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        const testQuery = query(collection(db, 'products'), limit(1));
        await getDocs(testQuery);
        setIsLoading(false);
      } catch (err) {
        console.error('Firebase connection error:', err);
        setError('Failed to connect to the database. Please try again later.');
        setIsLoading(false);
      }
    };

    checkFirebaseConnection();
  }, []);

  const tabs = [
    { id: 'settings', label: 'Settings', component: SettingsManager },
    { id: 'products', label: 'Products', component: ProductManager },
    { id: 'schedule', label: 'Schedule', component: ScheduleManager },
    { id: 'foods', label: 'Foods', component: FoodManager },
    { id: 'exhibition-photos', label: 'Exhibition Photos', component: ExhibitionManager },
    { id: 'discounts', label: 'Discounts', component: DiscountManager },
    { id: 'feedback', label: 'Feedback Data', component: FeedbackViewer }
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-4">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="text-red-600 py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Administrator Dashboard</h1>
      <Tabs tabs={tabs} />
    </div>
  );
};