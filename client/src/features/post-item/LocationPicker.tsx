import { useState, useEffect, useRef } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '../../components/ui/Button';
import { useItemStore } from '../../store/item.store';
import { useMapStore } from '../../store/map.store';
import { MapPin, Upload, Image as ImageIcon, X } from 'lucide-react';

type Props = {
  type: 'lost' | 'found';
  formData: {
    title: string;
    description: string;
    category: string;
    expiresAt: string;
    radius: number;
  };
  onClose: () => void;
  onBack: () => void;
};

export const LocationPicker = ({
  type,
  formData,
  onClose,
  onBack,
}: Props) => {
  const addItem = useItemStore((s) => s.addItem);
  const loading = useItemStore((s) => s.loading);
  const { latitude, longitude, accuracy, postingLocation, setPostingLocation } =
    useMapStore();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 14,
  });

  useEffect(() => {
    if (mapLat === null && mapLng === null) {
      if (latitude && longitude) {
        setMapLat(latitude);
        setMapLng(longitude);
        setViewState({ latitude, longitude, zoom: 14 });
      } else if (postingLocation) {
        setMapLat(postingLocation.lat);
        setMapLng(postingLocation.lng);
        setViewState({ latitude: postingLocation.lat, longitude: postingLocation.lng, zoom: 14 });
      }
    }
  }, []);

  const handleMapClick = (e: any) => {
    if (e.lngLat) {
      const { lng, lat } = e.lngLat;
      setMapLat(lat);
      setMapLng(lng);
      setPostingLocation(lat, lng);
    }
  };

  const handleUseCurrentLocation = () => {
    if (latitude && longitude) {
      setMapLat(latitude);
      setMapLng(longitude);
      setPostingLocation(latitude, longitude);
      setViewState({ latitude, longitude, zoom: 14 });
    }
  };

  const submit = async () => {
    try {
      setError(null);

      if (!mapLat || !mapLng) {
        setError('Please click on the map to select a location');
        return;
      }

      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('type', type);
      submitFormData.append('description', formData.description || '');
      submitFormData.append('category', formData.category);
      submitFormData.append('latitude', mapLat.toString());
      submitFormData.append('longitude', mapLng.toString());
      submitFormData.append('radius', formData.radius.toString());
      submitFormData.append('expiresAt', formData.expiresAt);
      if (file) submitFormData.append('image', file);

      await addItem(submitFormData);
      useMapStore.getState().clearPostingLocation();
      onClose();
    } catch (error: any) {
      console.error('Error posting item:', error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to post item. Please try again.'
      );
    }
  };

  if (mapLat === null || mapLng === null) {
    return (
      <div className="space-y-4 p-8 text-center text-gray-500">
        <p>Initializing map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
            Pin Location *
          </label>
          <Button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-[10px] h-6 px-2 py-0 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30"
          >
            Use My Location
          </Button>
        </div>
        {accuracy && (
          <div className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-[10px] text-cyan-300">
              GPS accuracy: <span className="font-bold">±{Math.round(accuracy)}m</span> - Drag pin to exact location
            </p>
          </div>
        )}
        <div 
          className="relative h-56 w-full overflow-hidden rounded-lg border border-white/10 shadow-inner group"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Map
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            onClick={handleMapClick}
            onDblClick={(e) => {
              handleMapClick(e);
            }}
            interactive={true}
            cursor="crosshair"
            style={{ width: '100%', height: '100%' }}
          >
            {mapLat !== null && mapLng !== null && (
              <Marker 
                latitude={mapLat} 
                longitude={mapLng}
                draggable={true}
                onDrag={(e) => {
                  setMapLat(e.lngLat.lat);
                  setMapLng(e.lngLat.lng);
                }}
                onDragEnd={(e) => {
                  const newLat = e.lngLat.lat;
                  const newLng = e.lngLat.lng;
                  setMapLat(newLat);
                  setMapLng(newLng);
                  setPostingLocation(newLat, newLng);
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.6)] border-2 border-white cursor-move hover:scale-110 transition-transform">
                  <MapPin size={18} fill="white" />
                </div>
              </Marker>
            )}
          </Map>
          
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-[10px] text-gray-300 px-2 py-1 rounded border border-white/5 pointer-events-none">
             Click map to pin location
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">
          Add Photo (Optional)
        </label>
        
        <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {!file ? (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all group"
            >
                <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload size={20} className="text-gray-400 group-hover:text-cyan-400" />
                </div>
                <p className="text-sm text-gray-400 font-medium group-hover:text-white">Click to upload image</p>
                <p className="text-xs text-gray-600">JPG, PNG up to 5MB</p>
            </div>
        ) : (
            <div className="relative rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                    <ImageIcon size={20} className="text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                    onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors text-gray-400"
                >
                    <X size={18} />
                </button>
            </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-200 flex items-start gap-2">
            <X size={14} className="mt-0.5 shrink-0" />
            {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={submit}
          className="flex-1 shadow-lg shadow-cyan-900/20"
          disabled={loading || !mapLat || !mapLng}
        >
          {loading ? 'Posting...' : 'Post Item'}
        </Button>
      </div>
    </div>
  );
};
