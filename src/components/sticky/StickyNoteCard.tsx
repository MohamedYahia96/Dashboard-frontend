import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Bold, Italic, List } from 'lucide-react';

interface StickyNote {
  id: number;
  title?: string;
  content: string;
  color: string;
  posX: number;
  posY: number;
  zIndex: number;
}

interface StickyNoteCardProps {
  note: StickyNote;
  onUpdate: (updates: Partial<StickyNote>) => void;
  onDelete: () => void;
  onFocus: () => void;
  isGridView: boolean;
}

const COLORS = [
  '#fff9c4', // Yellow
  '#ffccbc', // Peach
  '#c8e6c9', // Green
  '#b3e5fc', // Blue
  '#f8bbd0', // Pink
  '#e1bee7'  // Purple
];

export default function StickyNoteCard({ note, onUpdate, onDelete, onFocus, isGridView }: StickyNoteCardProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastSavedContent = useRef(note.content);

  const handleContentChange = () => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerHTML;
      if (newContent !== lastSavedContent.current) {
        lastSavedContent.current = newContent;
        onUpdate({ content: newContent });
      }
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    handleContentChange();
  };

  return (
    <motion.div
      onFocus={onFocus}
      initial={false}
      animate={{
        scale: 1,
        zIndex: note.zIndex
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: isGridView ? 'relative' : 'absolute',
        left: isGridView ? 0 : note.posX,
        top: isGridView ? 0 : note.posY,
        width: 250,
        minHeight: 250,
        background: note.color,
        borderRadius: 2,
        boxShadow: '0 10px 25px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        color: '#333',
        cursor: 'default',
        overflow: 'hidden',
        zIndex: note.zIndex
      }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Note Header / Drag Handle */}
      <div 
        style={{
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          background: 'rgba(0,0,0,0.05)',
          opacity: showToolbar ? 1 : 0.6,
          transition: '0.2s'
        }}
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => setShowToolbar(false)}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <Palette size={14} color="#333" />
          </button>
        </div>
        <button 
          onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <X size={14} color="#333" />
        </button>
      </div>

      {/* Color Picker Overlay */}
      {showColorPicker && (
        <div style={{
          position: 'absolute', top: 32, left: 8, zIndex: 10,
          background: 'white', borderRadius: 8, padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex', gap: 6
        }}>
          {COLORS.map(c => (
            <div 
              key={c}
              onClick={() => { onUpdate({ color: c }); setShowColorPicker(false); }}
              style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)' }}
            />
          ))}
        </div>
      )}

      {/* Formatting Toolbar */}
      {showToolbar && (
        <div style={{
          display: 'flex', gap: 4, padding: '4px 8px', background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          {[
            { icon: <Bold size={14} />, cmd: 'bold' },
            { icon: <Italic size={14} />, cmd: 'italic' },
            { icon: <List size={14} />, cmd: 'insertUnorderedList' }
          ].map((btn, i) => (
            <button 
              key={i}
              onMouseDown={(e) => { e.preventDefault(); execCommand(btn.cmd); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      )}

      {/* Note Content */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleContentChange}
        dangerouslySetInnerHTML={{ __html: note.content }}
        style={{
          flex: 1,
          padding: '12px 16px',
          outline: 'none',
          fontSize: 15,
          lineHeight: 1.5,
          fontFamily: 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowY: 'auto'
        }}
      />
      
      {/* Note Date Footer */}
      <div style={{
        padding: '4px 8px', fontSize: 10, opacity: 0.4, textAlign: 'right', fontWeight: 600
      }}>
        {new Date().toLocaleDateString()}
      </div>
    </motion.div>
  );
}
