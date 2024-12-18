import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { Edit2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { indianStates, unionTerritories } from '../../constants/locationConstants';

interface Registration {
  id: string;
  exhibitionId: string;
  stallNumber: string;
  stallName: string;
  stallState: string;
  otherState?: string;
  stallDistrict: string;
  stallBlock: string;
  gramPanchayat?: string;
  organizationType: string;
  otherOrganization?: string;
  stallSponsor: string;
  otherSponsor?: string;
  accommodation: string;
  participants: Array<{
    name: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    profilePhoto: string;
    documents: string[];
  }>;
  inventory: Array<{
    productCategory: string;
    productName: string;
    quantity: number;
    value: number;
    photos: string[];
  }>;
}

export const RegistrationViewer = () => {
  const [exhibitions, setExhibitions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedExhibition, setSelectedExhibition] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [expandedStall, setExpandedStall] = useState<string | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<{
    stallId: string;
    participantIndex: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Registration>>({});

  useEffect(() => {
    fetchExhibitions();
  }, []);

  useEffect(() => {
    if (selectedExhibition) {
      fetchRegistrations();
    }
  }, [selectedExhibition]);

  const fetchExhibitions = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'exhibitions'));
      setExhibitions(snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      })));
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      setError('Failed to fetch exhibitions');
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'registrations'),
        where('exhibitionId', '==', selectedExhibition)
      );
      const snapshot = await getDocs(q);
      const registrationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Registration[];
      setRegistrations(registrationData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantEdit = async (
    registration: Registration,
    participantIndex: number,
    updatedParticipant: Registration['participants'][0]
  ) => {
    try {
      const updatedParticipants = [...registration.participants];
      updatedParticipants[participantIndex] = updatedParticipant;

      await updateDoc(doc(db, 'registrations', registration.id), {
        participants: updatedParticipants
      });

      setRegistrations(prev => prev.map(reg => 
        reg.id === registration.id 
          ? { ...reg, participants: updatedParticipants }
          : reg
      ));

      setEditingParticipant(null);
    } catch (error) {
      console.error('Error updating participant:', error);
      setError('Failed to update participant');
    }
  };

  const handleRegistrationEdit = async (registrationId: string) => {
    try {
      if (!editForm) return;

      await updateDoc(doc(db, 'registrations', registrationId), {
        ...editForm,
        stallNumber: undefined // Ensure stallNumber can't be modified
      });

      setRegistrations(prev => prev.map(reg => 
        reg.id === registrationId 
          ? { ...reg, ...editForm }
          : reg
      ));

      setEditingRegistration(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating registration:', error);
      setError('Failed to update registration');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-800">View Registrations</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Exhibition</label>
        <select
          value={selectedExhibition}
          onChange={(e) => setSelectedExhibition(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">Select Exhibition</option>
          {exhibitions.map(exhibition => (
            <option key={exhibition.id} value={exhibition.id}>
              {exhibition.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="text-center py-4">Loading registrations...</div>}
      {error && <div className="text-red-600 py-4">{error}</div>}

      <div className="space-y-4">
        {registrations.map(registration => (
          <div key={registration.id} className="border rounded-lg overflow-hidden">
            <div
              className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
              onClick={() => setExpandedStall(
                expandedStall === registration.id ? null : registration.id
              )}
            >
              <div>
                <h3 className="font-semibold">
                  Stall {registration.stallNumber} - {registration.stallName}
                </h3>
                <p className="text-sm text-gray-600">
                  {registration.stallState}, {registration.stallDistrict}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingRegistration(registration.id);
                    setEditForm({
                      ...registration,
                      stallNumber: undefined
                    });
                  }}
                  className="text-navy-600 hover:text-navy-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {expandedStall === registration.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            </div>

            {editingRegistration === registration.id ? (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stall Name</label>
                    <input
                      type="text"
                      value={editForm.stallName || ''}
                      onChange={(e) => setEditForm({ ...editForm, stallName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <select
                      value={editForm.stallState || ''}
                      onChange={(e) => {
                        const selectedState = e.target.value;
                        setEditForm(prev => ({
                          ...prev,
                          stallState: selectedState,
                          stallDistrict: '',
                          stallBlock: '',
                          gramPanchayat: '',
                          otherState: ''
                        }));
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">Select State</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Other">Other State</option>
                    </select>
                  </div>

                  {editForm.stallState === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Other State</label>
                      <select
                        value={editForm.otherState || ''}
                        onChange={(e) => setEditForm({ ...editForm, otherState: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select State</option>
                        {[...indianStates, ...unionTerritories]
                          .filter(state => state !== 'Odisha')
                          .map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))
                        }
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <input
                      type="text"
                      value={editForm.stallDistrict || ''}
                      onChange={(e) => setEditForm({ ...editForm, stallDistrict: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Block</label>
                    <input
                      type="text"
                      value={editForm.stallBlock || ''}
                      onChange={(e) => setEditForm({ ...editForm, stallBlock: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  {editForm.stallState === 'Odisha' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gram Panchayat</label>
                      <input
                        type="text"
                        value={editForm.gramPanchayat || ''}
                        onChange={(e) => setEditForm({ ...editForm, gramPanchayat: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Type</label>
                    <select
                      value={editForm.organizationType || ''}
                      onChange={(e) => setEditForm({ ...editForm, organizationType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="SHG">SHG</option>
                      <option value="PG">PG</option>
                      <option value="PC">PC</option>
                      <option value="Proprietor">Proprietor</option>
                      <option value="Pvt Company">Pvt Company</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {editForm.organizationType === 'Others' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specify Organization Type</label>
                      <input
                        type="text"
                        value={editForm.otherOrganization || ''}
                        onChange={(e) => setEditForm({ ...editForm, otherOrganization: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stall Sponsor</label>
                    <select
                      value={editForm.stallSponsor || ''}
                      onChange={(e) => setEditForm({ ...editForm, stallSponsor: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="DRDA/DSMS">DRDA/DSMS</option>
                      <option value="KVIC">KVIC</option>
                      <option value="H&CI">H&CI</option>
                      <option value="NABARD">NABARD</option>
                      <option value="MVSN">MVSN</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {editForm.stallSponsor === 'Others' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specify Sponsor</label>
                      <input
                        type="text"
                        value={editForm.otherSponsor || ''}
                        onChange={(e) => setEditForm({ ...editForm, otherSponsor: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Accommodation Details</label>
                  <textarea
                    value={editForm.accommodation || ''}
                    onChange={(e) => setEditForm({ ...editForm, accommodation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingRegistration(null);
                      setEditForm({});
                    }}
                    className="px-3 py-2 text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRegistrationEdit(registration.id)}
                    className="px-3 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              expandedStall === registration.id && (
                <div className="p-4 space-y-4">
                  <h4 className="font-medium">Participants</h4>
                  <div className="space-y-4">
                    {registration.participants.map((participant, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        {editingParticipant?.stallId === registration.id && 
                         editingParticipant?.participantIndex === index ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={participant.name}
                              onChange={(e) => {
                                const updatedParticipant = {
                                  ...participant,
                                  name: e.target.value
                                };
                                handleParticipantEdit(registration, index, updatedParticipant);
                              }}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                            <input
                              type="tel"
                              value={participant.phone}
                              onChange={(e) => {
                                const updatedParticipant = {
                                  ...participant,
                                  phone: e.target.value
                                };
                                handleParticipantEdit(registration, index, updatedParticipant);
                              }}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                            <select
                              value={participant.gender}
                              onChange={(e) => {
                                const updatedParticipant = {
                                  ...participant,
                                  gender: e.target.value as 'male' | 'female' | 'other'
                                };
                                handleParticipantEdit(registration, index, updatedParticipant);
                              }}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingParticipant(null)}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleParticipantEdit(registration, index, participant)}
                                className="text-green-600"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{participant.name}</p>
                              <p className="text-sm text-gray-600">{participant.phone}</p>
                              <p className="text-sm text-gray-600 capitalize">{participant.gender}</p>
                            </div>
                            <button
                              onClick={() => setEditingParticipant({
                                stallId: registration.id,
                                participantIndex: index
                              })}
                              className="text-navy-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
