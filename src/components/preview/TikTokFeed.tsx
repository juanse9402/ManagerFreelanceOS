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
import { Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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
      className={`relative aspect-[3/4] bg-gray-900 group cursor-grab active:cursor-grabbing`}
    >
      <img src={item.image} alt="TikTok content" className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${item.pending ? 'opacity-50' : ''}`} />
      
      <div className="absolute bottom-2 left-2 flex items-center text-xs font-semibold drop-shadow-md z-10">
        <Play size={12} fill="white" className="mr-1" />
        {item.views}
      </div>

      {item.pending && (
        <div className="absolute inset-0 border-2 border-amber-500/50 pointer-events-none flex items-center justify-center z-10">
            <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase pointer-events-auto">
            Draft
          </div>
        </div>
      )}
    </div>
  );
};

export const TikTokFeed: React.FC = () => {
  const { activeClientId } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  React.useEffect(() => {
    if (activeClientId) {
      fetchItems();
    }
  }, [activeClientId]);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('content_posts')
      .select('*')
      .eq('client_id', activeClientId)
      .eq('platform', 'Tiktok')
      .order('date', { ascending: false });

    if (data && data.length > 0) {
      const formatted = data.map(p => ({
        id: p.id,
        image: p.image_url || 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=400&q=80',
        views: '0',
        pending: p.status !== 'Aprobado'
      }));
      setItems(formatted);
    } else {
      // Dummy fallback if no data
      setItems([
        { id: '1', image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=400&q=80', views: '1.2M', status: 'Pendiente' },
        { id: '2', image: 'https://images.unsplash.com/photo-1611162618758-6a4fd45025ea?auto=format&fit=crop&w=400&q=80', views: '850K', status: 'Aprobado' },
        { id: '3', image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=400&q=80', views: '2.4M', status: 'Aprobado' },
      ]);
    }
  };

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
    <div className="bg-black text-white rounded-xl shadow-[var(--shadow-card)] overflow-hidden max-w-sm mx-auto">
      {/* Mock Header TikTok */}
      <div className="flex flex-col items-center p-6 border-b border-gray-800">
        <div className="w-20 h-20 rounded-full bg-gray-800 overflow-hidden mb-3 border-2 border-gray-700">
          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" alt="Avatar" />
        </div>
        <h3 className="font-bold text-lg">@nexusdigital</h3>
        <p className="text-sm text-gray-400 mb-4">Marketing para empresas 🚀</p>
        
        <div className="flex space-x-6 text-center">
            <div className="text-center">
              <div className="font-bold text-white text-sm">125</div>
              <div className="text-[10px] text-gray-500">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white text-sm">14.2K</div>
              <div className="text-[10px] text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-white text-sm">250K</div>
              <div className="text-[10px] text-gray-500">Likes</div>
            </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <div className="flex-1 flex justify-center py-3 border-b-2 border-white">
          <span className="font-semibold text-sm">Videos</span>
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
