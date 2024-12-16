import { db } from '../firebase/config';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export interface ExhibitionPhoto {
  id: string;
  url: string;
  caption?: string;
}

const exhibitionCollection = collection(db, 'exhibitionPhotos');

export const getExhibitionPhotos = async (): Promise<ExhibitionPhoto[]> => {
  const snapshot = await getDocs(exhibitionCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ExhibitionPhoto));
};

export const saveExhibitionPhoto = async (photo: Omit<ExhibitionPhoto, 'id'>) => {
  const docRef = await addDoc(exhibitionCollection, photo);
  return {
    id: docRef.id,
    ...photo
  };
};

export const updateExhibitionPhoto = async (id: string, updates: Omit<ExhibitionPhoto, 'id'>) => {
  const docRef = doc(db, 'exhibitionPhotos', id);
  await updateDoc(docRef, updates);
  return {
    id,
    ...updates
  };
};

export const deleteExhibitionPhoto = async (id: string) => {
  const docRef = doc(db, 'exhibitionPhotos', id);
  await deleteDoc(docRef);
}; 