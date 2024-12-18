import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExhibitionConfig } from '../components/data/ExhibitionConfig';
import { ParticipantRegistration } from '../components/data/ParticipantRegistration';
import { DailySales } from '../components/data/DailySales';
import { ArrowLeft, Settings, UserPlus, BarChart3, ClipboardList } from 'lucide-react';
import { RegistrationViewer } from '../components/data/RegistrationViewer';

export const Data = () => {
  const [activeSection, setActiveSection] = useState<string>('');

  const sections = [
    {
      id: 'config',
      title: 'Configure Exhibitions',
      description: 'Manage exhibition settings and status',
      icon: <Settings className="w-6 h-6" />,
      component: <ExhibitionConfig />
    },
    {
      id: 'register',
      title: 'Register Participants',
      description: 'Add new stalls and participants',
      icon: <UserPlus className="w-6 h-6" />,
      component: <ParticipantRegistration />
    },
    {
      id: 'sales',
      title: 'Daily Sales',
      description: 'Record daily sales data',
      icon: <BarChart3 className="w-6 h-6" />,
      component: <DailySales />
    },
    {
      id: 'registrations',
      title: 'View Registrations',
      description: 'View and edit participant registrations',
      icon: <ClipboardList className="w-6 h-6" />,
      component: <RegistrationViewer />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto p-4">
        {!activeSection ? (
          <>
            <h1 className="text-2xl font-bold text-navy-800 mb-6">Data Management</h1>
            <div className="grid gap-4">
              {sections.map(section => (
                <motion.div
                  key={section.id}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-4 rounded-xl shadow-sm cursor-pointer flex items-center gap-4"
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="bg-navy-50 p-3 rounded-lg text-navy-600">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-navy-700">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white min-h-screen">
            <div className="sticky top-0 bg-white border-b z-10 px-4 py-3">
              <button
                onClick={() => setActiveSection('')}
                className="flex items-center gap-2 text-navy-600"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
            <div className="p-4">
              {sections.find(s => s.id === activeSection)?.component}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 