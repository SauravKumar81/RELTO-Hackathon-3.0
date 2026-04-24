import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import { Locate } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useMapStore } from '../../store/map.store';
import { useNearbyItems } from '../../hooks/useItems';
import { ItemMarker } from './ItemMarker';
import { UserMarker } from './UserMarker';

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
    searchLocation,
    setSearchLocation,
    setAnimationComplete, 
    mapStyle,
    lightPreset,
    show3dObjects
  } = useMapStore();
  const { data: items = [] } = useNearbyItems(searchLocation?.lat || 0, searchLocation?.lng || 0, 5000, undefined, undefined, undefined, !!searchLocation);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const mapRef = useRef<any>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
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

  useEffect(() => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setLocationError(null);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Unable to get your location. Please enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 5000
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [setLocation]);

  useEffect(() => {
    setIsStyleLoaded(false);
  }, [mapStyle]);

  useEffect(() => {
    if (latitude && longitude && !searchLocation) {
      setSearchLocation(latitude, longitude);
    }
  }, [latitude, longitude, searchLocation, setSearchLocation]);

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
      setSearchLocation(newLat, newLng);
    }, 1000);
  };

  const handleMapLoad = (e: any) => {
    const map = e.target;
    setIsStyleLoaded(true);
    
    map.setFog({
      color: 'rgb(186, 210, 235)',
      'high-color': 'rgb(36, 92, 223)',
      'horizon-blend': 0.02,
      'space-color': 'rgb(11, 11, 25)',
      'star-intensity': 0.6
    });

    if (!map.getSource('mapbox-dem')) {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
    }
    
    map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

    try {
      map.setConfigProperty('basemap', 'lightPreset', lightPreset);
      map.setConfigProperty('basemap', 'show3dObjects', show3dObjects);
    } catch (err) {}
  };

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      if (map && map.isStyleLoaded()) {
        try {
          map.setConfigProperty('basemap', 'lightPreset', lightPreset);
        } catch (err) {}
      }
    }
  }, [lightPreset]);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      if (map && map.isStyleLoaded()) {
        try {
          map.setConfigProperty('basemap', 'show3dObjects', show3dObjects);
        } catch (err) {}
      }
    }
  }, [show3dObjects]);

  if (locationError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100">
        <div className="text-center p-6">
          <p className="text-red-600 mb-2">{locationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (latitude === null || longitude === null) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-slate-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  const styleUrl = mapStyle === 'satellite' 
    ? 'mapbox://styles/mapbox/standard-satellite' 
    : 'mapbox://styles/mapbox/standard';

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
    const mapboxSource = mapRef.current?.getMap().getSource('items');

    mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
      if (err) return;

      mapRef.current?.getMap().easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500,
      });
    });
  };

  return (
    <Map
      key={mapStyle}
      ref={mapRef}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      initialViewState={{
        latitude,
        longitude,
        zoom,
        pitch,
        bearing,
      }}
      mapStyle={styleUrl}
      onMove={handleMapMove}
      onLoad={handleMapLoad}
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
      projection={{ name: 'globe' }}
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
      
      {isStyleLoaded && accuracyCircleData && (
        <Source
          id="accuracy-circle"
          type="geojson"
          data={accuracyCircleData as any}
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
      )}
      
      <UserMarker lat={latitude} lng={longitude} accuracy={accuracy} />

      {isStyleLoaded && (
        <Source
          id="items"
          type="geojson"
          data={geojsonData as any}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      )}

      {isStyleLoaded && zoom > 15 && items.map((item) => (
        <ItemMarker key={item._id} item={item} />
      ))}
    </Map>
  );
};


