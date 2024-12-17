import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, query, where, updateDoc, doc } from 'firebase/firestore';
import { Edit2, Save, X } from 'lucide-react';
import productCategories from '../../data/Product Category.json';

interface DailySale {
  id: string;
  exhibitionId: string;
  stallId: string;
  date: string;
  products: Array<{
    productName: string;
    productCategory: string;
    quantitySold: number;
    salesValue: number;
  }>;
}

interface Stall {
  id: string;
  stallNumber: string;
  participantName: string;
  inventory: Array<{
    productName: string;
    productCategory: string;
  }>;
}

export const DailySales = () => {
  const [exhibitions, setExhibitions] = useState<Array<{ id: string; name: string }>>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState('');
  const [selectedStall, setSelectedStall] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<DailySale['products']>([]);
  const [historicalSales, setHistoricalSales] = useState<DailySale[]>([]);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editingProducts, setEditingProducts] = useState<DailySale['products']>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'exhibitions'));
        if (mounted) {
          setExhibitions(snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
          })));
        }
      } catch (error) {
        console.error('Error fetching exhibitions:', error);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedExhibition) {
      fetchStalls();
    }
  }, [selectedExhibition]);

  useEffect(() => {
    if (selectedStall) {
      fetchHistoricalSales();
    }
  }, [selectedStall]);

  const fetchStalls = async () => {
    const q = query(
      collection(db, 'registrations'),
      where('exhibitionId', '==', selectedExhibition)
    );
    const snapshot = await getDocs(q);
    const stallData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Stall[];
    setStalls(stallData);
  };

  const fetchHistoricalSales = async () => {
    const q = query(
      collection(db, 'dailySales'),
      where('stallId', '==', selectedStall)
    );
    const snapshot = await getDocs(q);
    const salesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DailySale[];
    setHistoricalSales(salesData.sort((a, b) => b.date.localeCompare(a.date)));
  };

  const addSaleItem = () => {
    setSales([...sales, {
      productName: '',
      productCategory: '',
      quantitySold: 0,
      salesValue: 0
    }]);
  };

  const updateSaleItem = (index: number, field: string, value: string | number) => {
    const updatedSales = [...sales];
    if (field === 'productCategory') {
      console.log('Category changed:', {
        newCategory: value,
        availableProducts: getStallProducts(selectedStall)
          .filter(p => p.productCategory.trim() === value.toString().trim())
      });
      
      updatedSales[index] = {
        ...updatedSales[index],
        productCategory: value.toString(),
        productName: ''
      };
      setSales(updatedSales);

      setTimeout(() => {
        setSales([...updatedSales]);
      }, 0);
    } else {
      updatedSales[index] = {
        ...updatedSales[index],
        [field]: value
      };
      setSales(updatedSales);
    }
  };

  const validateSaleItem = (item: DailySale['products'][0]) => {
    return (
      item.productCategory &&
      item.productName &&
      item.quantitySold > 0 &&
      item.salesValue > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all sale items
    const isValid = sales.every(validateSaleItem);
    if (!isValid) {
      alert('Please fill in all required fields with valid values');
      return;
    }

    try {
      const saleData: DailySale = {
        id: '',
        exhibitionId: selectedExhibition,
        stallId: selectedStall,
        date: saleDate,
        products: sales
      };
      await addDoc(collection(db, 'dailySales'), saleData);
      setSales([]);
      fetchHistoricalSales();
      alert('Sales data saved successfully!');
    } catch (error) {
      console.error('Error saving sales data:', error);
      alert('Error saving sales data');
    }
  };

  const startEditing = (sale: DailySale) => {
    setEditingSaleId(sale.id);
    setEditingProducts([...sale.products]);
  };

  const cancelEditing = () => {
    setEditingSaleId(null);
    setEditingProducts([]);
  };

  const updateEditingProduct = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...editingProducts];
    if (field === 'productCategory') {
      console.log('Editing category changed:', {
        newCategory: value,
        availableProducts: getStallProducts(selectedStall)
          .filter(p => p.productCategory.trim() === value.toString().trim())
      });
      
      updatedProducts[index] = {
        ...updatedProducts[index],
        productCategory: value.toString(),
        productName: ''
      };
      setEditingProducts(updatedProducts);

      setTimeout(() => {
        setEditingProducts([...updatedProducts]);
      }, 0);
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: value
      };
      setEditingProducts(updatedProducts);
    }
  };

  const saveSaleEdit = async (saleId: string) => {
    try {
      const saleRef = doc(db, 'dailySales', saleId);
      await updateDoc(saleRef, { products: editingProducts });
      
      // Update local state
      setHistoricalSales(prev => prev.map(sale => 
        sale.id === saleId ? { ...sale, products: editingProducts } : sale
      ));
      
      setEditingSaleId(null);
      setEditingProducts([]);
      alert('Sale updated successfully!');
    } catch (error) {
      console.error('Error updating sale:', error);
      alert('Error updating sale');
    }
  };

  const getStallProducts = (stallId: string): Array<{productCategory: string, productName: string}> => {
    const selectedStallData = stalls.find(stall => stall.id === stallId);
    return (selectedStallData?.inventory || []).map(item => ({
      productCategory: item.productCategory.trim(),
      productName: item.productName.trim()
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-800">Daily Sales Collection</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Exhibition</label>
            <select
              value={selectedExhibition}
              onChange={(e) => setSelectedExhibition(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="">Select Exhibition</option>
              {exhibitions.map(exhibition => (
                <option key={exhibition.id} value={exhibition.id}>
                  {exhibition.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Stall</label>
            <select
              value={selectedStall}
              onChange={(e) => setSelectedStall(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
              disabled={!selectedExhibition}
            >
              <option value="">Select Stall</option>
              {stalls.map(stall => (
                <option key={stall.id} value={stall.id}>
                  {stall.stallNumber} - {stall.participantName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sales Items</h3>
            <button
              type="button"
              onClick={addSaleItem}
              className="text-navy-600 hover:text-navy-700"
            >
              + Add Item
            </button>
          </div>

          {sales.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 border p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Category</label>
                <select
                  value={item.productCategory || ''}
                  onChange={(e) => {
                    const category = e.target.value.trim();
                    updateSaleItem(index, 'productCategory', category);
                    updateSaleItem(index, 'productName', '');
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {[...new Set(getStallProducts(selectedStall).map(p => p.productCategory))]
                    .filter(Boolean)
                    .sort()
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  value={item.productName || ''}
                  onChange={(e) => updateSaleItem(index, 'productName', e.target.value.trim())}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                  disabled={!item.productCategory}
                >
                  <option value="">Select Product</option>
                  {item.productCategory && 
                    getStallProducts(selectedStall)
                      .filter(p => p.productCategory.trim() === item.productCategory.trim())
                      .map((product) => (
                        <option key={product.productName} value={product.productName}>
                          {product.productName}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity Sold</label>
                <input
                  type="number"
                  value={item.quantitySold}
                  onChange={(e) => updateSaleItem(index, 'quantitySold', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Sales Value (₹)</label>
                <input
                  type="number"
                  value={item.salesValue}
                  onChange={(e) => updateSaleItem(index, 'salesValue', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-navy-600 text-white px-6 py-2 rounded-lg hover:bg-navy-700"
        >
          Save Sales Data
        </button>
      </form>

      {selectedStall && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Historical Sales</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historicalSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {editingSaleId === sale.id ? (
                        <div className="space-y-4">
                          {editingProducts.map((product, idx) => (
                            <div key={idx} className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-lg">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Category
                                  </label>
                                  <select
                                    value={product.productCategory || ''}
                                    onChange={(e) => {
                                      const category = e.target.value.trim();
                                      updateEditingProduct(idx, 'productCategory', category);
                                      updateEditingProduct(idx, 'productName', '');
                                    }}
                                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
                                  >
                                    <option value="">Select Category</option>
                                    {[...new Set(getStallProducts(selectedStall).map(p => p.productCategory))]
                                      .filter(Boolean)
                                      .sort()
                                      .map((category) => (
                                        <option key={category} value={category}>
                                          {category}
                                        </option>
                                      ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name
                                  </label>
                                  <select
                                    value={product.productName || ''}
                                    onChange={(e) => updateEditingProduct(idx, 'productName', e.target.value.trim())}
                                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
                                    disabled={!product.productCategory}
                                  >
                                    <option value="">Select Product</option>
                                    {product.productCategory && 
                                      getStallProducts(selectedStall)
                                        .filter(p => p.productCategory.trim() === product.productCategory.trim())
                                        .map((prod) => (
                                          <option key={prod.productName} value={prod.productName}>
                                            {prod.productName}
                                          </option>
                                        ))}
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity Sold
                                  </label>
                                  <input
                                    type="number"
                                    value={product.quantitySold}
                                    onChange={(e) => updateEditingProduct(idx, 'quantitySold', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
                                    min="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sales Value (₹)
                                  </label>
                                  <input
                                    type="number"
                                    value={product.salesValue}
                                    onChange={(e) => updateEditingProduct(idx, 'salesValue', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-navy-500 focus:border-navy-500"
                                    min="0"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => saveSaleEdit(sale.id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {sale.products.map((product, idx) => (
                            <div key={idx} className="text-sm">
                              {product.productName} ({product.quantitySold} units - ₹{product.salesValue})
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{sale.products.reduce((sum, product) => sum + product.salesValue, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingSaleId === sale.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveSaleEdit(sale.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(sale)}
                          className="text-navy-600 hover:text-navy-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 