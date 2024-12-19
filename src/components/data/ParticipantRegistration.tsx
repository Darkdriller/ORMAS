import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { db } from '../../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Camera, Plus, X, User, Phone, Package, RotateCw } from 'lucide-react';
import productCategories from '../../data/Product Category.json';
import odishaMapping from '../../data/odisha_mapping.json';
import { indianStates, unionTerritories } from '../../constants/locationConstants';

interface Participant {
  name: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  profilePhoto: string;
  documents: string[];
}

interface InventoryItem {
  productCategory: string;
  productName: string;
  quantity: number;
  value: number;
  photos: string[];
}

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
  organizationType: 'SHG' | 'PG' | 'PC' | 'Proprietor' | 'Pvt Company' | 'Others';
  otherOrganization?: string;
  stallSponsor: 'DRDA/DSMS' | 'KVIC' | 'H&CI' | 'NABARD' | 'MVSN' | 'Mission Shakti' | 'Others';
  otherSponsor?: string;
  accommodation: string;
  stallPhotos: string[];
  documents: string[];
  participants: Participant[];
  inventory: InventoryItem[];
}

interface VillageMapping {
  data: {
    states: Array<{
      name: string;
      districts: Array<{
        name: string;
        blocks: Array<{
          name: string;
          gramPanchayats: string[];
        }>;
      }>;
    }>;
  };
}

const initialRegistration: Registration = {
  id: '',
  exhibitionId: '',
  stallNumber: '',
  stallName: '',
  stallState: '',
  otherState: '',
  stallDistrict: '',
  stallBlock: '',
  gramPanchayat: '',
  organizationType: 'SHG',
  otherOrganization: '',
  stallSponsor: 'DRDA/DSMS',
  otherSponsor: '',
  accommodation: '',
  stallPhotos: [],
  documents: [],
  participants: [],
  inventory: []
};

type CaptureType = 'stall' | 'profile' | 'product' | 'participant-doc' | 'stall-doc';

export const ParticipantRegistration = () => {
  const [exhibitions, setExhibitions] = useState<Array<{ id: string; name: string }>>([]);
  const [registration, setRegistration] = useState<Registration>(initialRegistration);
  const [showWebcam, setShowWebcam] = useState(false);
  const [captureType, setCaptureType] = useState<CaptureType | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isOdisha, setIsOdisha] = useState(true);
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);
  const [availableGPs, setAvailableGPs] = useState<string[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    fetchExhibitions();
  }, []);

  useEffect(() => {
    if (registration.stallState === 'Odisha') {
      const odishaData = odishaMapping.data.states.find(state => state.name === 'Odisha');
      if (odishaData) {
        const districts = odishaData.districts.map(d => d.name);
        setAvailableDistricts(districts);
      }
    }
  }, [registration.stallState]);

  useEffect(() => {
    if (registration.stallState === 'Odisha' && registration.stallDistrict) {
      const odishaData = odishaMapping.data.states.find(state => state.name === 'Odisha');
      const district = odishaData?.districts.find(d => d.name === registration.stallDistrict);
      if (district) {
        const blocks = district.blocks.map(b => b.name);
        setAvailableBlocks(blocks);
      }
    }
  }, [registration.stallState, registration.stallDistrict]);

  useEffect(() => {
    if (registration.stallState === 'Odisha' && registration.stallDistrict && registration.stallBlock) {
      const odishaData = odishaMapping.data.states.find(state => state.name === 'Odisha');
      const district = odishaData?.districts.find(d => d.name === registration.stallDistrict);
      const block = district?.blocks.find(b => b.name === registration.stallBlock);
      if (block) {
        setAvailableGPs(block.gramPanchayats);
      }
    }
  }, [registration.stallState, registration.stallDistrict, registration.stallBlock]);

  const fetchExhibitions = async () => {
    const snapshot = await getDocs(collection(db, 'exhibitions'));
    setExhibitions(snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name
    })));
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      switch (captureType) {
        case 'stall':
          setRegistration(prev => ({
            ...prev,
            stallPhotos: [...prev.stallPhotos, imageSrc]
          }));
          break;
        case 'profile':
          updateParticipantPhoto(currentIndex, imageSrc);
          break;
        case 'product':
          updateInventoryPhoto(currentIndex, imageSrc);
          break;
        case 'participant-doc':
          updateParticipantDocument(currentIndex, imageSrc);
          break;
        case 'stall-doc':
          setRegistration(prev => ({
            ...prev,
            documents: [...prev.documents, imageSrc]
          }));
          break;
      }
      setShowWebcam(false);
      setCaptureType(undefined);
    }
  };

  const updateParticipantPhoto = (index: number, photo: string) => {
    const updatedParticipants = [...registration.participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      profilePhoto: photo
    };
    setRegistration(prev => ({ ...prev, participants: updatedParticipants }));
  };

  const updateInventoryPhoto = (index: number, photo: string) => {
    const updatedInventory = [...registration.inventory];
    updatedInventory[index] = {
      ...updatedInventory[index],
      photos: [...(updatedInventory[index].photos || []), photo]
    };
    setRegistration(prev => ({ ...prev, inventory: updatedInventory }));
  };

  const updateParticipantDocument = (index: number, document: string) => {
    const updatedParticipants = [...registration.participants];
    updatedParticipants[index] = {
      ...updatedParticipants[index],
      documents: [...(updatedParticipants[index].documents || []), document]
    };
    setRegistration(prev => ({ ...prev, participants: updatedParticipants }));
  };

  const addParticipant = () => {
    setRegistration(prev => ({
      ...prev,
      participants: [...prev.participants, { name: '', phone: '', gender: 'male', profilePhoto: '', documents: [] }]
    }));
  };

  const removeParticipant = (index: number) => {
    setRegistration(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const addInventoryItem = () => {
    setRegistration(prev => ({
      ...prev,
      inventory: [...prev.inventory, {
        productName: '',
        productCategory: '',
        photos: [],
        quantity: 0,
        value: 0
      }]
    }));
  };

  const removeInventoryItem = (index: number) => {
    setRegistration(prev => ({
      ...prev,
      inventory: prev.inventory.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!registration.exhibitionId) {
      setError('Please select an exhibition');
      return false;
    }
    if (!registration.stallNumber) {
      setError('Please enter a stall number');
      return false;
    }
    if (!registration.stallName) {
      setError('Please enter a stall name');
      return false;
    }
    if (!registration.stallState) {
      setError('Please select a state');
      return false;
    }
    if (registration.stallState === 'Other' && !registration.otherState) {
      setError('Please select other state');
      return false;
    }
    if (!registration.stallDistrict) {
      setError('Please enter district');
      return false;
    }
    if (!registration.stallBlock) {
      setError('Please enter block');
      return false;
    }
    if (isOdisha && !registration.gramPanchayat) {
      setError('Please select gram panchayat');
      return false;
    }
    if (registration.organizationType === 'Others' && !registration.otherOrganization) {
      setError('Please specify organization type');
      return false;
    }
    if (registration.stallSponsor === 'Others' && !registration.otherSponsor) {
      setError('Please specify sponsor');
      return false;
    }
    if (registration.participants.length === 0) {
      setError('Please add at least one participant');
      return false;
    }
    
    // Validate participants
    for (let i = 0; i < registration.participants.length; i++) {
      const participant = registration.participants[i];
      if (!participant.name) {
        setError(`Please enter name for participant ${i + 1}`);
        return false;
      }
      if (!participant.phone) {
        setError(`Please enter phone for participant ${i + 1}`);
        return false;
      }
      if (!participant.gender) {
        setError(`Please select gender for participant ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'registrations'), registration);
      setSuccess(true);
      // Reset form after successful submission
      setRegistration(initialRegistration);
      setIsOdisha(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to submit registration. Please try again.');
      console.error('Error submitting registration:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    return Array.from(new Set(productCategories.Products.map(p => p['Product Category '].trim())));
  };

  const getProductsByCategory = (category: string) => {
    return productCategories.Products
      .filter(p => p['Product Category '].trim() === category)
      .map(p => p['Product Sub Category '].trim());
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const startCapture = (type: CaptureType, index: number = 0) => {
    setCaptureType(type);
    setCurrentIndex(index);
    setShowWebcam(true);
  };

  return (
    <div className="space-y-6">
      {showWebcam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }}
                className="w-full rounded-lg"
              />
              <button
                onClick={toggleCamera}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg"
              >
                <RotateCw className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowWebcam(false);
                  setCaptureType(undefined);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-navy-800">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Exhibition</label>
            <select
              value={registration.exhibitionId}
              onChange={(e) => setRegistration(prev => ({ ...prev, exhibitionId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
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
            <label className="block text-sm font-medium text-gray-600 mb-1">Stall Number</label>
            <input
              type="text"
              required
              value={registration.stallNumber}
              onChange={(e) => setRegistration(prev => ({ ...prev, stallNumber: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Enter stall number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Stall Name</label>
            <input
              type="text"
              required
              value={registration.stallName}
              onChange={(e) => setRegistration(prev => ({ ...prev, stallName: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Enter stall name"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
              <select
                value={registration.stallState}
                onChange={(e) => {
                  const selectedState = e.target.value;
                  const isOdishaSelected = selectedState === 'Odisha';
                  setIsOdisha(isOdishaSelected);
                  setRegistration(prev => ({
                    ...prev,
                    stallState: selectedState,
                    stallDistrict: '',
                    stallBlock: '',
                    gramPanchayat: '',
                    otherState: ''
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              >
                <option value="">Select State</option>
                <option value="Odisha">Odisha</option>
                <option value="Other">Other State</option>
              </select>
            </div>

            {registration.stallState === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Select Other State/UT</label>
                <select
                  value={registration.otherState}
                  onChange={(e) => setRegistration(prev => ({
                    ...prev,
                    otherState: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  <option value="">Select State/UT</option>
                  <optgroup label="States">
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories">
                    {unionTerritories.map(ut => (
                      <option key={ut} value={ut}>{ut}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
              {isOdisha ? (
                <select
                  value={registration.stallDistrict}
                  onChange={(e) => setRegistration(prev => ({
                    ...prev,
                    stallDistrict: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  <option value="">Select District</option>
                  {availableDistricts.map(district => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={registration.stallDistrict}
                  onChange={(e) => setRegistration(prev => ({
                    ...prev,
                    stallDistrict: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Enter district name"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Block</label>
              {isOdisha ? (
                <select
                  value={registration.stallBlock}
                  onChange={(e) => setRegistration(prev => ({
                    ...prev,
                    stallBlock: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                  disabled={!registration.stallDistrict}
                >
                  <option value="">Select Block</option>
                  {availableBlocks.map(block => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={registration.stallBlock}
                  onChange={(e) => setRegistration(prev => ({
                    ...prev,
                    stallBlock: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Enter block name"
                  required
                />
              )}
            </div>

            {isOdisha && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Gram Panchayat</label>
                <select
                  value={registration.gramPanchayat}
                  onChange={(e) => setRegistration(prev => ({
                    ...prev,
                    gramPanchayat: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                  disabled={!registration.stallBlock}
                >
                  <option value="">Select Gram Panchayat</option>
                  {availableGPs.map(gp => (
                    <option key={gp} value={gp}>
                      {gp}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Organization Type</label>
              <select
                required
                value={registration.organizationType}
                onChange={(e) => setRegistration(prev => ({ ...prev, organizationType: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {['SHG', 'PG', 'PC', 'Proprietor', 'Pvt Company', 'Others'].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {registration.organizationType === 'Others' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Specify Organization Type
                </label>
                <input
                  type="text"
                  required
                  value={registration.otherOrganization || ''}
                  onChange={(e) => setRegistration(prev => ({
                    ...prev,
                    otherOrganization: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Please specify organization type"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Stall Sponsor</label>
              <select
                required
                value={registration.stallSponsor}
                onChange={(e) => setRegistration(prev => ({ ...prev, stallSponsor: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="DRDA/DSMS">DRDA/DSMS</option>
                <option value="KVIC">KVIC</option>
                <option value="H&CI">H&CI</option>
                <option value="NABARD">NABARD</option>
                <option value="MVSN">MVSN</option>
                <option value="Mission Shakti">Mission Shakti</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {registration.stallSponsor === 'Others' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Please Specify Sponsor
                </label>
                <input
                  type="text"
                  required
                  value={registration.otherSponsor || ''}
                  onChange={(e) => setRegistration(prev => ({
                    ...prev,
                    otherSponsor: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Enter sponsor name"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Accommodation Details</label>
            <textarea
              value={registration.accommodation}
              onChange={(e) => setRegistration(prev => ({ ...prev, accommodation: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Stall Photos</label>
            <div className="flex flex-wrap gap-2">
              {registration.stallPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img src={photo} alt="Stall" className="w-20 h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setRegistration(prev => ({
                      ...prev,
                      stallPhotos: prev.stallPhotos.filter((_, i) => i !== index)
                    }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => startCapture('stall')}
                className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-gray-500"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-navy-800">Participants</h3>
            <button
              type="button"
              onClick={addParticipant}
              className="text-navy-600 hover:text-navy-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {registration.participants.map((participant, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm text-gray-600">Participant {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  className="text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={participant.name}
                    onChange={(e) => {
                      const updatedParticipants = [...registration.participants];
                      updatedParticipants[index] = { ...participant, name: e.target.value };
                      setRegistration(prev => ({ ...prev, participants: updatedParticipants }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={participant.phone}
                    onChange={(e) => {
                      const updatedParticipants = [...registration.participants];
                      updatedParticipants[index] = { ...participant, phone: e.target.value };
                      setRegistration(prev => ({ ...prev, participants: updatedParticipants }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                  <select
                    required
                    value={participant.gender}
                    onChange={(e) => {
                      const updatedParticipants = [...registration.participants];
                      updatedParticipants[index] = { ...participant, gender: e.target.value as any };
                      setRegistration(prev => ({ ...prev, participants: updatedParticipants }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Photo</label>
                  {participant.profilePhoto ? (
                    <div className="relative inline-block">
                      <img
                        src={participant.profilePhoto}
                        alt="Profile"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => updateParticipantPhoto(index, '')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startCapture('profile', index)}
                      className="flex items-center gap-2 text-navy-600 border border-navy-600 px-3 py-2 rounded-lg text-sm"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Participant Documents</span>
                  <button
                    type="button"
                    onClick={() => startCapture('participant-doc', index)}
                    className="flex items-center gap-2 px-3 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Document</span>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {participant.documents?.map((doc, idx) => (
                    <div key={idx} className="relative">
                      <img src={doc} alt={`Document ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedParticipants = [...registration.participants];
                          updatedParticipants[index] = {
                            ...updatedParticipants[index],
                            documents: updatedParticipants[index].documents.filter((_, i) => i !== idx)
                          };
                          setRegistration(prev => ({ ...prev, participants: updatedParticipants }));
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-navy-800">Inventory</h3>
            <button
              type="button"
              onClick={addInventoryItem}
              className="text-navy-600 hover:text-navy-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {registration.inventory.map((item, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm text-gray-600">Item {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeInventoryItem(index)}
                  className="text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Product Category</label>
                  <select
                    required
                    value={item.productCategory}
                    onChange={(e) => {
                      const updatedInventory = [...registration.inventory];
                      updatedInventory[index] = {
                        ...item,
                        productCategory: e.target.value,
                        productName: '' // Reset product name when category changes
                      };
                      setRegistration(prev => ({ ...prev, inventory: updatedInventory }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">Select Category</option>
                    {getUniqueCategories().map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Product</label>
                  <select
                    required
                    value={item.productName}
                    onChange={(e) => {
                      const updatedInventory = [...registration.inventory];
                      updatedInventory[index] = {
                        ...item,
                        productName: e.target.value
                      };
                      setRegistration(prev => ({ ...prev, inventory: updatedInventory }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    disabled={!item.productCategory}
                  >
                    <option value="">Select Product</option>
                    {item.productCategory && getProductsByCategory(item.productCategory).map((product) => (
                      <option key={product} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={item.quantity}
                    onChange={(e) => {
                      const updatedInventory = [...registration.inventory];
                      updatedInventory[index] = { ...item, quantity: parseInt(e.target.value) };
                      setRegistration(prev => ({ ...prev, inventory: updatedInventory }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={item.value}
                    onChange={(e) => {
                      const updatedInventory = [...registration.inventory];
                      updatedInventory[index] = { ...item, value: parseInt(e.target.value) };
                      setRegistration(prev => ({ ...prev, inventory: updatedInventory }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Product Photos</label>
                <div className="flex flex-wrap gap-2">
                  {item.photos.map((photo, photoIndex) => (
                    <div key={photoIndex} className="relative">
                      <img src={photo} alt="Product" className="w-20 h-20 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedInventory = [...registration.inventory];
                          updatedInventory[index] = {
                            ...item,
                            photos: item.photos.filter((_, i) => i !== photoIndex)
                          };
                          setRegistration(prev => ({ ...prev, inventory: updatedInventory }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => startCapture('product', index)}
                    className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-gray-500"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-navy-800">Additional Documents</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stall Documents</span>
              <button
                type="button"
                onClick={() => startCapture('stall-doc')}
                className="flex items-center gap-2 px-3 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Document</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {registration.documents.map((doc, idx) => (
                <div key={idx} className="relative">
                  <img src={doc} alt={`Document ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setRegistration(prev => ({
                        ...prev,
                        documents: prev.documents.filter((_, i) => i !== idx)
                      }));
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-navy-600 text-white py-3 rounded-lg font-medium ${
            loading ? 'opacity-50' : 'hover:bg-navy-700'
          }`}
        >
          {loading ? 'Saving...' : 'Submit Registration'}
        </button>

        {success && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center">
              <div className="text-green-500 mb-4">✓</div>
              <p className="text-lg font-medium">Registration Successful!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
            <button
              className="absolute top-0 right-0 p-4"
              onClick={() => setError(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
              <p className="mt-2">Saving registration...</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}; 