import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import { Locate } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useMemo } from 'react';
import { useMapStore } from '../../store/map.store';
import { useItemStore } from '../../store/item.store';
import { ItemMarker } from './ItemMarker';
import { UserMarker } from './UserMarker';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
try {
  if (MAPBOX_TOKEN) {
    mapboxgl.accessToken = MAPBOX_TOKEN;
  }
} catch (e) {}

export const MapView = () => {
  const { 
    latitude, 
    longitude, 
    accuracy,
    zoom, 
    pitch, 
    bearing,
    setLocation, 
    setAccuracy,
    setZoom, 
    setPitch,
    setBearing,
    selectedItemId, 
    setAnimationComplete, 
    mapStyle
  } = useMapStore();
  const { items, fetchNearby } = useItemStore();
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const mapRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const geojsonData = useMemo(() => ({
    type: 'FeatureCollection',
    features: items.map(item => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: item.location.coordinates,
      },
      properties: {
        id: item._id,
        category: item.category,
        type: item.type,
      },
    })),
  }), [items]);

  const accuracyCircleData = useMemo(() => {
    if (!latitude || !longitude || !accuracy) return null;
    
    const radiusInKm = accuracy / 1000;
    const points = 64;
    const coords = [];
    
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dx = radiusInKm * Math.cos(angle);
      const dy = radiusInKm * Math.sin(angle);
      
      const newLat = latitude + (dy / 111.32);
      const newLng = longitude + (dx / (111.32 * Math.cos(latitude * Math.PI / 180)));
      
      coords.push([newLng, newLat]);
    }
    
    coords.push(coords[0]);
    
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords],
        },
        properties: {},
      }],
    };
  }, [latitude, longitude, accuracy]);

  const hasPannedToUserRef = useRef(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation(lat, lng);
        setAccuracy(pos.coords.accuracy);

        if (!hasPannedToUserRef.current && mapRef.current) {
          hasPannedToUserRef.current = true;
          try {
            mapRef.current.getMap()?.flyTo({
              center: [lng, lat],
              zoom: 15.5,
              duration: 1500,
              essential: true
            });
          } catch (e) {}
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [setLocation, setAccuracy]);

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearby(latitude, longitude, 5000);
    }
  }, [latitude, longitude, fetchNearby]);

  useEffect(() => {
    if (selectedItemId && mapRef.current) {
      const selectedItem = items.find(item => item._id === selectedItemId);
      if (selectedItem) {
        const map = mapRef.current.getMap();
        
        const onMoveEnd = () => {
          setAnimationComplete(true);
          map.off('moveend', onMoveEnd);
        };
        
        map.on('moveend', onMoveEnd);
        
        map.flyTo({
          center: [selectedItem.location.coordinates[0], selectedItem.location.coordinates[1]],
          zoom: 17,
          pitch: 60,
          bearing: map.getBearing(),
          duration: 1500,
          essential: true,
        });
      }
    }
  }, [selectedItemId, items, setAnimationComplete]);

  const handleMapMove = (e: any) => {
    const { latitude: newLat, longitude: newLng, zoom: newZoom, pitch: newPitch, bearing: newBearing } = e.viewState;
    setZoom(newZoom);
    setPitch(newPitch);
    setBearing(newBearing);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchNearby(newLat, newLng, 5000);
    }, 1000);
  };

  const currentLat = latitude ?? 28.6139;
  const currentLng = longitude ?? 77.2090;

  const styleUrl = mapStyle === 'satellite' 
    ? 'mapbox://styles/mapbox/satellite-streets-v12' 
    : 'mapbox://styles/mapbox/dark-v11';

  const clusterLayer: any = {
    id: 'clusters',
    type: 'circle' as const,
    source: 'items',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#3b82f6', 10, '#8b5cf6', 30, '#ec4899'],
      'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
      'circle-emissive-strength': 1
    },
  };

  const clusterCountLayer = {
    id: 'cluster-count',
    type: 'symbol' as const,
    source: 'items',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 14,
    },
    paint: {
      'text-color': '#ffffff',
    },
  };

  const unclusteredPointLayer: any = {
    id: 'unclustered-point',
    type: 'circle',
    source: 'items',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': [
        'case',
        ['==', ['get', 'type'], 'lost'],
        '#ef4444',
        '#22c55e'
      ],
      'circle-radius': 12,
      'circle-stroke-width': 3,
      'circle-stroke-color': '#fff',
      'circle-emissive-strength': 1
    },
  };

  const handleClusterClick = (e: any) => {
    const feature = e.features[0];
    const clusterId = feature.properties.cluster_id;
    const mapboxSource = mapRef.current?.getMap()?.getSource('items');

    if (mapboxSource) {
      mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;

        mapRef.current?.getMap().easeTo({
          center: feature.geometry.coordinates,
          zoom,
          duration: 500,
        });
      });
    }
  };

  const emptyGeojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: []
  }), []);

  return (
    <Map
      key={mapStyle}
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        latitude: currentLat,
        longitude: currentLng,
        zoom,
        pitch,
        bearing,
      }}
      mapStyle={styleUrl}
      style={{ width: '100%', height: '100%' }}
      onMove={handleMapMove}
      collectResourceTiming={false}
      interactiveLayerIds={['clusters', 'unclustered-point']}
      onClick={(e) => {
        if (e.features && e.features.length > 0) {
          const layerId = e.features[0]?.layer?.id;
          if (layerId === 'clusters') {
            handleClusterClick(e);
          } else if (layerId === 'unclustered-point') {
            const itemId = e.features[0]?.properties?.id;
            if (itemId) {
              useMapStore.getState().selectItem(itemId);
            }
          }
        }
      }}
      maxPitch={85}
      antialias={true}
    >
      <NavigationControl position="bottom-left" showCompass={true} showZoom={true} />
      
      <button
        onClick={() => {
          if (latitude && longitude && mapRef.current) {
            mapRef.current.getMap().flyTo({
              center: [longitude, latitude],
              zoom: 17,
              pitch: 60,
              bearing: 0,
              duration: 1500,
              essential: true
            });
          }
        }}
        className="absolute bottom-80 right-6 z-10 p-3 rounded-xl glass-panel chamfered-box bg-black/40 border border-white/10 text-cyan-400 hover:bg-white/10 hover:text-white shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all group backdrop-blur-md"
        title="Fly to My Location"
      >
        <Locate size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      
      <Source
        id="accuracy-circle"
        type="geojson"
        data={(accuracyCircleData || emptyGeojson) as any}
      >
        <Layer
          id="accuracy-circle-fill"
          type="fill"
          paint={{
            'fill-color': '#3b82f6',
            'fill-opacity': 0.15,
          }}
        />
        <Layer
          id="accuracy-circle-outline"
          type="line"
          paint={{
            'line-color': '#3b82f6',
            'line-width': 1.5,
            'line-opacity': 0.4,
          }}
        />
      </Source>
      
      <UserMarker lat={currentLat} lng={currentLng} accuracy={accuracy} />

      <Source
        id="items"
        type="geojson"
        data={(geojsonData || emptyGeojson) as any}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredPointLayer} />
      </Source>

      {zoom > 15 && items.map((item) => (
        <ItemMarker key={item._id} item={item} />
      ))}
    </Map>
  );
};
