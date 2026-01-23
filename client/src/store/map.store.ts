import { create } from 'zustand';

type LightPreset = 'dawn' | 'day' | 'dusk' | 'night';
type MapStyleType = 'standard' | 'satellite';

type MapState = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  zoom: number;
  pitch: number;
  bearing: number;
  selectedItemId: string | null;
  postingLocation: { lat: number; lng: number } | null;
  animationComplete: boolean;
  mapStyle: MapStyleType;
  lightPreset: LightPreset;
  show3dObjects: boolean;
  setLocation: (lat: number, lng: number) => void;
  setAccuracy: (accuracy: number | null) => void;
  setZoom: (zoom: number) => void;
  setPitch: (pitch: number) => void;
  setBearing: (bearing: number) => void;
  selectItem: (id: string | null) => void;
  setPostingLocation: (lat: number, lng: number) => void;
  clearPostingLocation: () => void;
  setAnimationComplete: (complete: boolean) => void;
  toggleMapStyle: () => void;
  setLightPreset: (preset: LightPreset) => void;
  toggle3dObjects: () => void;
};

export const useMapStore = create<MapState>((set) => ({
  latitude: null,
  longitude: null,
  accuracy: null,
  zoom: 15.5,
  pitch: 45,
  bearing: -17.6,
  selectedItemId: null,
  postingLocation: null,
  animationComplete: false,
  mapStyle: 'standard',
  lightPreset: 'night',
  show3dObjects: true,

  setLocation: (lat, lng) => set({ latitude: lat, longitude: lng }),
  setAccuracy: (accuracy) => set({ accuracy }),
  setZoom: (zoom) => set({ zoom }),
  setPitch: (pitch) => set({ pitch }),
  setBearing: (bearing) => set({ bearing }),
  selectItem: (id) => set({ selectedItemId: id, animationComplete: false }),
  setPostingLocation: (lat, lng) => set({ postingLocation: { lat, lng } }),
  clearPostingLocation: () => set({ postingLocation: null }),
  setAnimationComplete: (complete) => set({ animationComplete: complete }),
  toggleMapStyle: () => set((state) => ({ mapStyle: state.mapStyle === 'standard' ? 'satellite' : 'standard' })),
  setLightPreset: (preset) => set({ lightPreset: preset }),
  toggle3dObjects: () => set((state) => ({ show3dObjects: !state.show3dObjects })),
}));
