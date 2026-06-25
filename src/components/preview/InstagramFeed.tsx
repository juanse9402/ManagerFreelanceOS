import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Grid, Play, Layers } from 'lucide-react';

interface FeedItemProps {
  item: any;
}

const SortableFeedItem: React.FC<FeedItemProps> = ({ item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`relative aspect-square cursor-grab active:cursor-grabbing bg-gray-100 group overflow-hidden ${item.status !== 'Aprobado' ? 'ring-2 ring-amber-400' : ''}`}
    >
      <img src={item.image} alt="Feed content" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      
      {/* Type Icon */}
      {item.type === 'Reel' && <Play size={16} className="absolute top-2 right-2 text-white drop-shadow-md" fill="white" />}
      {item.type === 'Carrusel' && <Layers size={16} className="absolute top-2 right-2 text-white drop-shadow-md" />}
      
      {/* Pending Overlay */}
      {item.status !== 'Aprobado' && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
          <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            PENDIENTE
          </span>
        </div>
      )}
    </div>
  );
};

export const InstagramFeed: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', status: 'Pendiente', type: 'Reel' },
    { id: '2', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80', status: 'Aprobado', type: 'Post' },
    { id: '3', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80', status: 'Aprobado', type: 'Carrusel' },
    { id: '4', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80', status: 'En revisión', type: 'Post' },
    { id: '5', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80', status: 'Aprobado', type: 'Post' },
    { id: '6', image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80', status: 'Aprobado', type: 'Reel' },
    { id: '7', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80', status: 'Pendiente', type: 'Post' },
    { id: '8', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80', status: 'Aprobado', type: 'Carrusel' },
    { id: '9', image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80', status: 'Aprobado', type: 'Post' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-sm mx-auto">
      {/* Mock Header IG */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" alt="Avatar" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">nexusdigital.hq</h3>
            <p className="text-xs text-[var(--text-muted)]">Agencia de Marketing</p>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-t border-gray-100 mb-1">
        <div className="flex-1 flex justify-center py-2 border-t-2 border-[var(--text-primary)]">
          <span className="text-[10px] font-semibold text-[var(--text-primary)] tracking-widest uppercase">Posts</span>
        </div>
        <div className="flex-1 flex justify-center py-2 text-gray-400">
          <span className="text-[10px] font-semibold tracking-widest uppercase">Reels</span>
        </div>
        <div className="flex-1 flex justify-center py-2 text-gray-400">
          <span className="text-[10px] font-semibold tracking-widest uppercase">Tagged</span>
        </div>
      </div>

      {/* Grid Drag and Drop */}
      <div className="p-0.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-0.5">
              {items.map(item => (
                <SortableFeedItem key={item.id} item={item} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
