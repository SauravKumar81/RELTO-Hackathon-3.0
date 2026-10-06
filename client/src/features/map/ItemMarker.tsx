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

  const pinColor = isOwnItem ? '#475569' : (isLost ? '#ef4444' : '#22c55e');
  const pinGlow = isLost ? 'rgba(239,68,68,0.6)' : 'rgba(34,197,94,0.6)';
  const highlightColor = isLost ? 'rgba(255,120,120,0.9)' : 'rgba(120,255,150,0.9)';
  const shadowColor = isLost ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)';

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
        style={{ transformStyle: 'preserve-3d', perspective: '200px' }}
        animate={{
          scale: isSelected ? 1.25 : 1,
          y: isSelected ? -6 : 0,
        }}
        whileHover={{ scale: 1.15, y: -4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      >
        {/* Pulse ring for lost items */}
        {isLost && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 46,
              height: 46,
              top: 0,
              left: '50%',
              translateX: '-50%',
              border: `2.5px solid ${pinColor}`,
              boxShadow: `0 0 12px ${pinGlow}`,
            }}
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* 3D pin body */}
        <svg
          width="38"
          height="52"
          viewBox="0 0 38 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: `drop-shadow(0 6px 8px ${shadowColor}) drop-shadow(0 2px 2px rgba(0,0,0,0.5))` }}
        >
          {/* Ground shadow ellipse */}
          <ellipse cx="19" cy="50" rx="7" ry="2.5" fill="rgba(0,0,0,0.3)" />

          {/* Pin body - dark side */}
          <path
            d="M19 1C9.059 1 1 9.059 1 19C1 29 19 49 19 49C19 49 37 29 37 19C37 9.059 28.941 1 19 1Z"
            fill={pinColor}
          />

          {/* 3D highlight — left bright edge */}
          <path
            d="M8 7C5 10 3 14 3 19C3 24 6 29 10 34L12 36C8 30 5 25 5 19C5 14 6 10 8 7Z"
            fill={highlightColor}
            opacity="0.35"
          />

          {/* Shiny specular top-left highlight */}
          <ellipse
            cx="13"
            cy="12"
            rx="5"
            ry="3.5"
            fill="white"
            opacity="0.25"
            transform="rotate(-30 13 12)"
          />

          {/* Inner white circle for icon */}
          <circle cx="19" cy="18" r="12" fill="white" />

          {/* Subtle inner shadow ring */}
          <circle
            cx="19"
            cy="18"
            r="12"
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Category icon inside pin */}
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            top: '3px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '24px',
            height: '24px',
            backgroundColor: categoryConfig.color,
            boxShadow: `0 2px 6px rgba(0,0,0,0.3)`,
          }}
        >
          <Icon size={12} className="text-white" strokeWidth={2.5} />
        </div>

        {/* Lost / Found dot badge */}
        <div
          className={`absolute w-3.5 h-3.5 rounded-full border-2 border-white ${
            isLost ? 'bg-red-600' : 'bg-green-600'
          }`}
          style={{
            top: '0px',
            right: '1px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}
          title={isLost ? 'Lost' : 'Found'}
        />

        {/* "Your Post" label */}
        {isOwnItem && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-800/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[9px] font-semibold shadow-lg border border-white/10"
          >
            Your Post
          </motion.div>
        )}
      </motion.div>
    </Marker>
  );
};
