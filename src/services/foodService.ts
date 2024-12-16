import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Food {
  id: string;
  name: string;
  description: string;
  location: string;
  price: string;
  images: string[];
}

const foodsCollection = collection(db, 'foods');

export const getFoods = async (): Promise<Food[]> => {
  const snapshot = await getDocs(foodsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Food));
};

export const saveFood = async (food: Omit<Food, 'id'>) => {
  const docRef = await addDoc(foodsCollection, food);
  return {
    id: docRef.id,
    ...food
  };
};

export const updateFood = async (id: string, updates: Omit<Food, 'id'>) => {
  const docRef = doc(db, 'foods', id);
  await updateDoc(docRef, updates);
  return {
    id,
    ...updates
  };
};

export const deleteFood = async (id: string) => {
  const docRef = doc(db, 'foods', id);
  await deleteDoc(docRef);
};