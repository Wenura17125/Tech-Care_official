import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in React Leaflet with Vite/Webpack
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

// Component to handle map center updates
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const MapComponent = ({ technicians, center, onTechnicianClick }) => {
    // Default to Colombo, Sri Lanka if no center provided
    const defaultCenter = center ? [center.lat, center.lng] : [6.9271, 79.8612];

    const mapContainerStyle = {
        width: '100%',
        height: '500px',
        borderRadius: '0.5rem',
        zIndex: 10
    };

    return (
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200 shadow-sm z-0">
            <MapContainer
                center={defaultCenter}
                zoom={12}
                style={mapContainerStyle}
                scrollWheelZoom={false}
            >
                <ChangeView center={defaultCenter} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {technicians && technicians.map((tech) => (
                    tech.location && tech.location.coordinates && (
                        <Marker
                            key={tech._id || tech.id}
                            position={[tech.location.coordinates[1], tech.location.coordinates[0]]}
                            eventHandlers={{
                                click: () => {
                                    if (onTechnicianClick) onTechnicianClick(tech);
                                },
                            }}
                        >
                            <Popup>
                                <div className="p-1 min-w-[200px]">
                                    <h3 className="font-bold text-base mb-1">{tech.name}</h3>
                                    <div className="flex items-center gap-1 mb-2 text-sm">
                                        <span className="text-yellow-500">★</span>
                                        <span className="font-medium">{tech.rating || 'New'}</span>
                                        <span className="text-gray-500 text-xs">({tech.reviews?.length || 0} reviews)</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        {tech.specialties?.join(', ') || 'Expert Technician'}
                                    </p>
                                    <button
                                        onClick={() => onTechnicianClick && onTechnicianClick(tech)}
                                        className="w-full mt-1 px-3 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-colors"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>

            <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-[10px] text-gray-500 z-[1000] pointer-events-none">
                Powered by OpenStreetMap
            </div>
        </div>
    );
};

export default MapComponent;
