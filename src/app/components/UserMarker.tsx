import React, { useEffect } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useGeolocation } from '../hooks/useGeolocation';

// Icono personalizado con tipos de Leaflet
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const UserMarker: React.FC = () => {
  const location = useGeolocation();
  const map = useMap();

  useEffect(() => {
    if (location.loaded && location.coordinates && !location.error) {
      // Centrar el mapa en el usuario la primera vez o seguirlo
      map.flyTo(
        [location.coordinates.lat, location.coordinates.lng], 
        map.getZoom(), 
        { animate: true }
      );
    }
  }, [location, map]);

  if (!location.coordinates) return null;

  return (
    <Marker 
      position={[location.coordinates.lat, location.coordinates.lng]} 
      icon={userIcon}
    >
      <Popup>
        <div className="text-center">
          <strong>Estás aquí</strong><br />
          Explorando la UTEQ
        </div>
      </Popup>
    </Marker>
  );
};

export default UserMarker;