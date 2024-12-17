export interface Location {
  district: string;
  blocks: {
    name: string;
    gramPanchayats: string[];
  }[];
} 