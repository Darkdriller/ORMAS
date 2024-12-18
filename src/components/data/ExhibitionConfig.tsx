import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { Plus, Activity, Package, DollarSign } from 'lucide-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

interface Exhibition {
  id?: string;
  name: string;
  status: 'live' | 'completed';
  totalStalls: number;
  totalSales: number;
}

const downloadRegistrations = async (exhibitionId: string, exhibitionName: string) => {
  const q = query(
    collection(db, 'registrations'),
    where('exhibitionId', '==', exhibitionId)
  );
  const snapshot = await getDocs(q);
  
  // Flatten the data structure
  const flattenedData = snapshot.docs.flatMap(doc => {
    const data = doc.data();
    // Create a base record with common fields
    const baseRecord = {
      registrationId: doc.id,
      exhibitionId: data.exhibitionId,
      stallNumber: data.stallNumber,
      stallState: data.stallState,
      otherState: data.otherState || '',
      stallDistrict: data.stallDistrict,
      stallBlock: data.stallBlock,
      gramPanchayat: data.gramPanchayat || '',
      organizationType: data.organizationType,
      otherOrganization: data.otherOrganization || '',
      stallSponsor: data.stallSponsor,
      otherSponsor: data.otherSponsor || '',
      accommodation: data.accommodation,
      stallPhotos: (data.stallPhotos || []).join(', '),
    };

    // Create a record for each participant
    return data.participants.map((participant: any, index: number) => ({
      ...baseRecord,
      participantNumber: index + 1,
      participantName: participant.name || '',
      participantPhone: participant.phone || '',
      participantGender: participant.gender || '',
      participantPhoto: participant.profilePhoto || '',
      // Add inventory items with more details
      inventoryItems: (data.inventory || [])
        .map((item: any) => 
          `${item.productCategory}: ${item.productName} (Qty: ${item.quantity}, Value: ₹${item.value}, Photo: ${item.photo || 'N/A'})`
        )
        .join('; '),
    }));
  });

  const csv = Papa.unparse(flattenedData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${exhibitionName}_registrations.csv`);
};

const downloadSales = async (exhibitionId: string, exhibitionName: string) => {
  const q = query(
    collection(db, 'dailySales'),
    where('exhibitionId', '==', exhibitionId)
  );
  const snapshot = await getDocs(q);
  
  // Flatten the sales data structure
  const flattenedData = snapshot.docs.flatMap(doc => {
    const data = doc.data();
    // Create a base record with common fields
    const baseRecord = {
      saleId: doc.id,
      exhibitionId: data.exhibitionId,
      stallId: data.stallId,
      date: data.date,
    };

    // Create a record for each product
    return data.products.map((product: any) => ({
      ...baseRecord,
      productCategory: product.productCategory,
      productName: product.productName,
      quantitySold: product.quantitySold,
      salesValue: product.salesValue,
    }));
  });

  const csv = Papa.unparse(flattenedData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${exhibitionName}_sales.csv`);
};

export const ExhibitionConfig = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [newExhibition, setNewExhibition] = useState<Exhibition>({
    name: '',
    status: 'live',
    totalStalls: 0,
    totalSales: 0
  });

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    const querySnapshot = await getDocs(collection(db, 'exhibitions'));
    const exhibitionData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Exhibition[];
    setExhibitions(exhibitionData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'exhibitions'), newExhibition);
      setNewExhibition({
        name: '',
        status: 'live',
        totalStalls: 0,
        totalSales: 0
      });
      fetchExhibitions();
    } catch (error) {
      console.error('Error adding exhibition:', error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-navy-700 mb-2">
          <Plus className="w-5 h-5" />
          <h3 className="font-semibold">Add New Exhibition</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Exhibition Name</label>
          <input
            type="text"
            required
            value={newExhibition.name}
            onChange={(e) => setNewExhibition({ ...newExhibition, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={newExhibition.status}
              onChange={(e) => setNewExhibition({ ...newExhibition, status: e.target.value as 'live' | 'completed' })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-500"
            >
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Total Stalls</label>
            <input
              type="number"
              required
              value={newExhibition.totalStalls}
              onChange={(e) => setNewExhibition({ ...newExhibition, totalStalls: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Total Sales (₹)</label>
          <input
            type="number"
            required
            value={newExhibition.totalSales}
            onChange={(e) => setNewExhibition({ ...newExhibition, totalSales: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-navy-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-navy-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-navy-700"
        >
          Add Exhibition
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-navy-800">Current Exhibitions</h3>
        {exhibitions.map((exhibition) => (
          <div key={exhibition.id} className="bg-white rounded-lg p-4 shadow-sm space-y-2">
            <h4 className="font-semibold text-navy-700">{exhibition.name}</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Activity className="w-4 h-4" />
                {exhibition.status}
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Package className="w-4 h-4" />
                {exhibition.totalStalls}
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <DollarSign className="w-4 h-4" />
                ₹{exhibition.totalSales}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => exhibition.id && exhibition.name && downloadRegistrations(exhibition.id, exhibition.name)}
                  className="text-sm text-navy-600 hover:text-navy-700"
                >
                  Download Registrations
                </button>
                <button
                  onClick={() => exhibition.id && exhibition.name && downloadSales(exhibition.id, exhibition.name)}
                  className="text-sm text-navy-600 hover:text-navy-700"
                >
                  Download Sales
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 