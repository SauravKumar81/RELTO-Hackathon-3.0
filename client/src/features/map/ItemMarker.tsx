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

  // Colors
  const baseColor = isOwnItem ? '#475569' : (isLost ? '#ef4444' : '#22c55e');
  const darkFace  = isOwnItem ? '#2d3748' : (isLost ? '#991b1b' : '#15803d');  // right/bottom face
  const topFace   = isOwnItem ? '#64748b' : (isLost ? '#f87171' : '#4ade80');  // top face (lighter)
  const glowColor = isLost ? '239,68,68' : '34,197,94';

  // Building dimensions (CSS px)
  const W = 34;   // face width
  const H = 36;   // face height (how tall the building is)
  const D = 12;   // depth (isometric side extrusion)

  const totalW = W + D;
  const totalH = H + D;

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
        style={{ width: totalW, height: totalH + 8 }}
        animate={{
          scale: isSelected ? 1.3 : 1,
          y: isSelected ? -10 : 0,
        }}
        whileHover={{ scale: 1.2, y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      >
        {/* Glow pulse for lost items */}
        {isLost && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: totalW + 12,
              height: 10,
              bottom: 2,
              left: -6,
              background: `radial-gradient(ellipse, rgba(${glowColor},0.5) 0%, transparent 70%)`,
            }}
            animate={{ opacity: [0.8, 0.2, 0.8], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Ground shadow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            left: 2,
            width: totalW - 4,
            height: 8,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 75%)',
            borderRadius: '50%',
            filter: 'blur(2px)',
          }}
        />

        {/* ── 3D Isometric Building Box ── */}
        <svg
          width={totalW}
          height={totalH}
          viewBox={`0 0 ${totalW} ${totalH}`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Right face (darker) */}
          <polygon
            points={`
              ${W},${D}
              ${W + D},${0}
              ${W + D},${H}
              ${W},${H + D}
            `}
            fill={darkFace}
          />

          {/* Front face (base color) */}
          <polygon
            points={`
              0,${D}
              ${W},${D}
              ${W},${H + D}
              0,${H + D}
            `}
            fill={baseColor}
          />

          {/* Front face gradient sheen (left-to-right lighting) */}
          <defs>
            <linearGradient id={`shine-${item._id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="white" stopOpacity="0.18" />
              <stop offset="100%" stopColor="black" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <polygon
            points={`
              0,${D}
              ${W},${D}
              ${W},${H + D}
              0,${H + D}
            `}
            fill={`url(#shine-${item._id})`}
          />

          {/* Top face (lightest) */}
          <polygon
            points={`
              0,${D}
              ${D},${0}
              ${W + D},${0}
              ${W},${D}
            `}
            fill={topFace}
          />

          {/* Top face highlight shimmer */}
          <polygon
            points={`
              0,${D}
              ${D},${0}
              ${W + D},${0}
              ${W},${D}
            `}
            fill="white"
            opacity="0.18"
          />

          {/* Outline edges for crispness */}
          <polygon
            points={`
              0,${D}
              ${D},${0}
              ${W + D},${0}
              ${W + D},${H}
              ${W},${H + D}
              0,${H + D}
              0,${D}
            `}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.8"
          />

          {/* Inner vertical edge line */}
          <line x1={W} y1={D} x2={W} y2={H + D} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
        </svg>

        {/* Category icon on the front face */}
        <div
          className="absolute flex items-center justify-center rounded-md"
          style={{
            left: 4,
            top: D + (H - 26) / 2,
            width: W - 8,
            height: 26,
            backgroundColor: categoryConfig.color,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.4)`,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <Icon size={13} color="white" strokeWidth={2.5} />
        </div>

        {/* Lost / Found dot on top-right corner */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: isLost ? '#ef4444' : '#22c55e',
            border: '2px solid white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
          }}
          title={isLost ? 'Lost' : 'Found'}
        />

        {/* "Your Post" label */}
        {isOwnItem && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              top: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              background: 'rgba(15,23,42,0.9)',
              backdropFilter: 'blur(6px)',
              color: 'white',
              fontSize: 8,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              letterSpacing: '0.05em',
            }}
          >
            Your Post
          </motion.div>
        )}
      </motion.div>
    </Marker>
  );
};
