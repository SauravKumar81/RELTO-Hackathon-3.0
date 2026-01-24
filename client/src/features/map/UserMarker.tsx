import { Marker } from 'react-map-gl';
import { motion } from 'framer-motion';

type Props = {
  lat: number;
  lng: number;
  accuracy?: number | null;
};

export const UserMarker = ({ lat, lng, accuracy }: Props) => {
  return (
    <Marker latitude={lat} longitude={lng}>
      <div className="relative pointer-events-none">
        <motion.div
          className="absolute rounded-full bg-blue-500"
          style={{
            width: '40px',
            height: '40px',
            left: '-20px',
            top: '-20px',
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute rounded-full bg-blue-500"
          style={{
            width: '40px',
            height: '40px',
            left: '-20px',
            top: '-20px',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        
        <div className="relative h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
        
        {accuracy && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/20">
              <span className="text-[10px] font-medium text-cyan-400">
                ±{Math.round(accuracy)}m
              </span>
            </div>
          </div>
        )}
      </div>
    </Marker>
  );
};
