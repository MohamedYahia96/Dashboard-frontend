import React from 'react';
import { CloudRain, Waves, Coffee, Music, VolumeX } from 'lucide-react';
import { useStudySession } from '../../contexts/StudySessionContext';

const AMBIENT_PATCHES = [
  { id: 'lofi', name: 'Lo-fi Music', icon: <Music size={18} />, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'rain', name: 'Soft Rain', icon: <CloudRain size={18} />, url: 'https://assets.mixkit.co/active_storage/sfx/2439/2439-preview.mp3' },
  { id: 'waves', name: 'Ocean Waves', icon: <Waves size={18} />, url: 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3' },
  { id: 'coffee', name: 'Coffee Shop', icon: <Coffee size={18} />, url: 'https://assets.mixkit.co/active_storage/sfx/228/228-preview.mp3' },
];

const AmbientSounds: React.FC = () => {
  const { ambientSound, setAmbientSound } = useStudySession();

  return (
    <div className="ambient-sounds-panel">
      <h4 className="panel-title">Ambient Sounds</h4>
      <div className="ambient-grid">
        <button 
          className={`ambient-btn ${ambientSound === null ? 'active' : ''}`}
          onClick={() => setAmbientSound(null)}
        >
          <VolumeX size={18} />
          <span>None</span>
        </button>
        {AMBIENT_PATCHES.map(patch => (
          <button 
            key={patch.id}
            className={`ambient-btn ${ambientSound === patch.url ? 'active' : ''}`}
            onClick={() => setAmbientSound(patch.url)}
          >
            {patch.icon}
            <span>{patch.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AmbientSounds;
