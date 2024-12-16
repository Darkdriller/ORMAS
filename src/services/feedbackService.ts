import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  name: string;
  gender: string;
  email: string;
  mobile: string;
  location: string;
  areaOfInterest: string;
  responses: Array<{
    question: string;
    answer: string;
  }>;
  additionalFeedback?: string;
  discountCode?: string;
  assignedStall?: string;
}

const feedbackCollection = collection(db, 'feedback');

export const saveFeedback = async (feedbackData: Omit<FeedbackEntry, 'id' | 'timestamp' | 'discountCode' | 'assignedStall'>) => {
  const newEntry = {
    ...feedbackData,
    timestamp: new Date().toISOString(),
    discountCode: generateDiscountCode(feedbackData.areaOfInterest),
    assignedStall: assignStall(feedbackData.areaOfInterest)
  };

  const docRef = await addDoc(feedbackCollection, newEntry);
  return {
    id: docRef.id,
    ...newEntry
  };
};

export const getFeedbackData = async (): Promise<FeedbackEntry[]> => {
  const snapshot = await getDocs(feedbackCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FeedbackEntry));
};

const generateDiscountCode = (category: string): string => {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORMAS-${random}-15`;
};

const assignStall = (category: string): string => {
  const stallRanges: { [key: string]: [number, number] } = {
    'Handloom': [1, 10],
    'Handicraft': [11, 20],
    'Minor Forest Products (MFP)': [21, 25],
    'Food & Spices': [26, 30],
    'Home Furnishing': [31, 35],
    'Woolen Knit Wear': [36, 40],
    'Leather Products': [41, 45],
    'Jewellery': [46, 50]
  };

  const range = stallRanges[category] || [1, 50];
  const stallNumber = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  return `Stall ${stallNumber}`;
};