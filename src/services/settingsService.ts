import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export interface ExhibitionSettings {
  title: string;
  subtitle?: string;
  year: string;
  welcomeText: string;
  headerColor: string;
  headerSize: 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl';
  marqueeMessages: string[];
  marqueeSpeed?: number;
  marqueeColor?: string;
}

const settingsDoc = doc(db, 'settings', 'exhibition');

export const getExhibitionSettings = async (): Promise<ExhibitionSettings> => {
  const docSnap = await getDoc(settingsDoc);
  if (docSnap.exists()) {
    return docSnap.data() as ExhibitionSettings;
  }
  // Default settings
  return {
    title: 'Gonasika Kendujhar Mahotsaav',
    subtitle: 'and Regional Saras',
    year: '2024',
    welcomeText: 'Welcome to the Exhibition',
    headerColor: '#1e40af',
    headerSize: 'text-3xl',
    marqueeMessages: ['🎉 Please fill the Visitor Feedback form and win assured discount at choice of ORMAS store!', '🎁 Get a chance to win a bumper prize at lucky draw!'],
    marqueeSpeed: 30,
    marqueeColor: '#1e40af' // navy blue
  };
};

export const updateExhibitionSettings = async (settings: ExhibitionSettings) => {
  await setDoc(settingsDoc, settings);
  return settings;
}; 