import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Search, Grid, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StickyNoteCard from '../components/sticky/StickyNoteCard';
import api from '../services/api';

interface StickyNote {
  id: number;
  title?: string;
  content: string;
  color: string;
  posX: number;
  posY: number;
  zIndex: number;
}

const COLORS = [
  '#fff9c4', // Yellow
  '#ffccbc', // Peach
  '#c8e6c9', // Green
  '#b3e5fc', // Blue
  '#f8bbd0', // Pink
  '#e1bee7'  // Purple
];

export default function StickyNotes() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [search, setSearch] = useState('');
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/stickynotes');
      if (Array.isArray(response.data)) {
        setNotes(response.data);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Failed to fetch notes', error);
      // Fallback for development if API is not ready
      setNotes([
        { id: 1, title: 'Welcome', content: 'This is your first sticky note!', color: '#fff9c4', posX: 50, posY: 50, zIndex: 1 }
      ]);
    }
  };

  const addNote = async () => {
    const newNote = {
      title: '',
      content: '',
      color: COLORS[0],
      posX: Math.random() * 200 + 100,
      posY: Math.random() * 200 + 100,
      zIndex: Math.max(0, ...notes.map(n => n.zIndex)) + 1
    };

    // Use a safe temporary ID (negative to distinguish from backend IDs)
    const tempId = -Math.floor(Math.random() * 1000000);
    const localNote = { ...newNote, id: tempId };
    
    setNotes(prev => [...prev, localNote]);

    try {
      const response = await api.post('/stickynotes', newNote);
      setNotes(prev => prev.map(n => n.id === tempId ? response.data : n));
    } catch (error) {
      console.error('Failed to add note', error);
      // Keep the local note if it failed, but maybe mark it as unsaved if needed
    }
  };

  const updateNote = async (id: number, updates: Partial<StickyNote>) => {
    // If it's a temp ID, we might want to wait or handle it differently, 
    // but for now let's update local state immediately.
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    
    // Only attempt to sync with backend if it's not a temporary ID
    if (id > 0) {
      try {
        await api.put(`/stickynotes/${id}`, updates);
      } catch (error) {
        console.error('Failed to update note', error);
      }
    }
  };

  const deleteNote = async (id: number) => {
    setNotes(notes.filter(n => n.id !== id));
    try {
      await api.delete(`/stickynotes/${id}`);
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const bringToFront = (id: number) => {
    const maxZ = Math.max(0, ...notes.map(n => n.zIndex));
    updateNote(id, { zIndex: maxZ + 1 });
  };

  const filteredNotes = Array.isArray(notes) ? notes.filter(n => 
    (n.content.toLowerCase().includes(search.toLowerCase()) || 
     (n.title?.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterColor || n.color === filterColor)
  ) : [];

  return (
    <div style={{ 
      height: 'calc(100vh - 100px)', 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        flexWrap: 'wrap',
        gap: 15
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <button onClick={addNote} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            background: 'var(--accent-primary)', color: 'white', border: 'none',
            borderRadius: 12, cursor: 'pointer', fontWeight: 600, transition: '0.2s',
            boxShadow: '0 4px 12px rgba(var(--accent-primary-rgb), 0.3)'
          }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
             onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <Plus size={20} />
            {t('common.add')}
          </button>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input 
              type="text" 
              placeholder={t('common.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '10px 15px 10px 40px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: 250, outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map(color => (
              <button 
                key={color}
                onClick={() => setFilterColor(filterColor === color ? null : color)}
                style={{
                  width: 24, height: 24, borderRadius: '50%', background: color, border: filterColor === color ? '2px solid white' : 'none',
                  cursor: 'pointer', transition: '0.2s'
                }}
              />
            ))}
          </div>
          
          <button 
            onClick={() => setIsGridView(!isGridView)}
            style={{
              padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer'
            }}>
            {isGridView ? <Maximize2 size={18} /> : <Grid size={18} />}
          </button>
        </div>
      </div>

      {/* Canvas / Grid */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        overflow: 'auto', // Changed from 'hidden' to 'auto' to prevent clipping
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 20,
        border: '1px dashed rgba(255,255,255,0.1)',
        padding: 20,
        minHeight: '500px' // Ensure canvas has a minimum work area
      }}>
        {isGridView ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20
          }}>
            {filteredNotes.map(note => (
              <StickyNoteCard 
                key={note.id} 
                note={note} 
                onUpdate={(updates) => updateNote(note.id, updates)}
                onDelete={() => deleteNote(note.id)}
                isGridView={true}
                onFocus={() => bringToFront(note.id)}
              />
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotes.map(note => (
              <StickyNoteCard 
                key={note.id} 
                note={note} 
                onUpdate={(updates) => updateNote(note.id, updates)}
                onDelete={() => deleteNote(note.id)}
                isGridView={false}
                onFocus={() => bringToFront(note.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
