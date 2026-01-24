import { Marker } from 'react-map-gl';
import { motion } from 'framer-motion';
import type { Item } from '../../types/item';
import { useMapStore } from '../../store/map.store';
import { useAuthStore } from '../../store/auth.store';
import { getCategoryConfig } from '../../types/categories';

export const ItemMarker = ({ item }: { item: Item }) => {
  const selectItem = useMapStore((s) => s.selectItem);
  const selectedItemId = useMapStore((s) => s.selectedItemId);
  const currentUser = useAuthStore((s) => s.user);
  const categoryConfig = getCategoryConfig(item.category);
  const Icon = categoryConfig.icon;
  const isSelected = selectedItemId === item._id;
  const isLost = item.type === 'lost';
  
  const ownerId = typeof item.owner === 'string' ? item.owner : (item.owner?._id || null);
  const isOwnItem = currentUser && ownerId && ownerId === currentUser._id;

  const markerColor = isLost ? '#ef4444' : '#22c55e';

  return (
    <Marker
      latitude={item.location.coordinates[1]}
      longitude={item.location.coordinates[0]}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        selectItem(item._id);
      }}
    >
      <motion.div
        className="relative cursor-pointer"
        animate={{
          scale: isSelected ? 1.2 : 1,
        }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' }}
      >
        {isLost && (
          <motion.div
            className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full"
            style={{
              width: 40,
              height: 40,
              border: `3px solid ${markerColor}`,
            }}
            animate={{
              scale: [1, 1.6],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}

        <div className="relative">
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="18" cy="42" rx="6" ry="2" fill="rgba(0,0,0,0.25)" />
            
            <path
              d="M18 0C8.059 0 0 8.059 0 18C0 28 18 44 18 44C18 44 36 28 36 18C36 8.059 27.941 0 18 0Z"
              fill={isOwnItem ? '#475569' : markerColor}
            />
            
            <circle cx="18" cy="16" r="11" fill="white" />
          </svg>
          
          <div 
            className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[22px] h-[22px] flex items-center justify-center rounded-full"
            style={{ backgroundColor: categoryConfig.color }}
          >
            <Icon size={12} className="text-white" strokeWidth={2.5} />
          </div>

          <div
            className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              isLost ? 'bg-red-600' : 'bg-green-600'
            }`}
            title={isLost ? 'Lost' : 'Found'}
          />
        </div>
        
        {isOwnItem && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800 text-white px-1.5 py-0.5 rounded text-[8px] font-medium shadow">
            Your Post
          </div>
        )}
      </motion.div>
    </Marker>
  );
};
