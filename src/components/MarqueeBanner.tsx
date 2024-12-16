import React, { useState, useEffect } from 'react';
import { getExhibitionSettings, type ExhibitionSettings } from '../services/settingsService';

export const MarqueeBanner = () => {
  const [settings, setSettings] = useState<ExhibitionSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getExhibitionSettings();
      setSettings(data);
    };
    fetchSettings();
  }, []);

  if (!settings) return null;

  const style = {
    backgroundColor: settings.marqueeColor || '#1e40af'
  };

  // Join all messages with a separator
  const fullText = settings.marqueeMessages.join(' • ');

  // Calculate animation duration using speed/10 as the multiplier
  const duration = fullText.length * ((settings.marqueeSpeed || 5) / 10);

  return (
    <div 
      style={style} 
      className="relative py-3 overflow-hidden shadow-lg"
    >
      <div className="relative max-w-6xl mx-auto overflow-hidden">
        <div 
          className="flex whitespace-nowrap"
          style={{
            animation: `marquee ${duration}s linear infinite`
          }}
        >
          <span className="inline-block px-4 text-white text-lg font-medium">
            {fullText}
          </span>
          <span className="inline-block px-4 text-white text-lg font-medium">
            {fullText}
          </span>
          <span className="inline-block px-4 text-white text-lg font-medium">
            {fullText}
          </span>
        </div>
      </div>
    </div>
  );
};