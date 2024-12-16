import React, { useState, useEffect } from 'react';
import { Download, ChevronDown, ChevronUp } from 'lucide-react';
import { getFeedbackData, type FeedbackEntry } from '../../services/feedbackService';
import { surveyQuestions } from '../../constants/feedbackConstants';

export const FeedbackViewer = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FeedbackEntry;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getFeedbackData();
      setFeedbackData(data);
    } catch (err) {
      setError('Failed to load feedback data');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof FeedbackEntry) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...feedbackData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setFeedbackData(sortedData);
  };

  const handleExport = () => {
    const headers = [
      'Timestamp',
      'Name',
      'Gender',
      'Email',
      'Mobile',
      'Location',
      'Area of Interest',
      ...surveyQuestions,
      'Additional Feedback',
      'Discount Code',
      'Assigned Stall'
    ];

    const csvContent = [
      headers,
      ...feedbackData.map(entry => [
        entry.timestamp,
        entry.name,
        entry.gender,
        entry.email,
        entry.mobile,
        entry.location,
        entry.areaOfInterest,
        ...entry.responses.map(r => r.answer),
        entry.additionalFeedback || '',
        entry.discountCode || '',
        entry.assignedStall || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSortIcon = (key: keyof FeedbackEntry) => {
    if (sortConfig?.key !== key) {
      return <ChevronDown className="w-4 h-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="text-center py-4">Loading feedback data...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Feedback Responses</h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {['Timestamp', 'Name', 'Location', 'Area of Interest'].map((header) => (
                <th 
                  key={header}
                  className="px-4 py-2 text-left border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(header.toLowerCase().replace(/ /g, '') as keyof FeedbackEntry)}
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {getSortIcon(header.toLowerCase().replace(/ /g, '') as keyof FeedbackEntry)}
                  </div>
                </th>
              ))}
              <th className="px-4 py-2 text-left border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((entry) => (
              <React.Fragment key={entry.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{formatDate(entry.timestamp)}</td>
                  <td className="px-4 py-2 border-b">{entry.name}</td>
                  <td className="px-4 py-2 border-b">{entry.location}</td>
                  <td className="px-4 py-2 border-b">{entry.areaOfInterest}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {expandedRow === entry.id ? 'Hide Details' : 'Show Details'}
                    </button>
                  </td>
                </tr>
                {expandedRow === entry.id && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 bg-gray-50">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold">Contact Information</p>
                            <p>Email: {entry.email}</p>
                            <p>Mobile: {entry.mobile}</p>
                            <p>Gender: {entry.gender}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Discount Details</p>
                            <p>Code: {entry.discountCode}</p>
                            <p>Stall: {entry.assignedStall}</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold mb-2">Survey Responses</p>
                          <div className="grid gap-2">
                            {entry.responses.map((response, index) => (
                              <div key={index} className="grid grid-cols-2">
                                <p className="text-gray-600">{response.question}</p>
                                <p>{response.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        {entry.additionalFeedback && (
                          <div>
                            <p className="font-semibold">Additional Feedback</p>
                            <p className="text-gray-600">{entry.additionalFeedback}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {feedbackData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No feedback data available yet.
          </div>
        )}
      </div>
    </div>
  );
};