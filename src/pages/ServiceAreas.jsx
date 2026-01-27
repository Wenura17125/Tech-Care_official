import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
    MapPin,
    Search,
    Navigation,
    Phone,
    Clock,
    Star,
    ChevronRight,
    Loader2,
    CheckCircle,
    Building,
    Users,
    RefreshCw,
    Sparkles,
    Activity,
    AlertCircle,
    Wifi,
    WifiOff,
    UserCheck,
    UserX,
    Circle
} from 'lucide-react';
import SEO from '../components/SEO';
import { fetchRepairShops, getDistrictStatistics } from '../lib/googleSheetsService';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup, Circle as LeafletCircle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons with activity status
const createActivityIcon = (status) => {
    const colors = {
        active: '#22c55e',      // Green - Active (logged in within 30 days)
        inactive: '#ef4444',    // Red - Inactive (no login for 30+ days)
        busy: '#eab308',        // Yellow - Busy (currently handling a job)
        away: '#6b7280',        // Gray - Away
    };

    const color = colors[status] || colors.inactive;

    return L.divIcon({
        className: 'custom-marker-activity',
        html: `
            <div style="
                position: relative;
                width: 28px;
                height: 28px;
            ">
                <div style="
                    background: ${color};
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    position: absolute;
                    top: 2px;
                    left: 2px;
                "></div>
                ${status === 'active' ? `
                    <div style="
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 10px;
                        height: 10px;
                        background: #22c55e;
                        border-radius: 50%;
                        border: 2px solid white;
                        animation: pulse 2s infinite;
                    "></div>
                ` : ''}
            </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
};

// Custom marker icons for coverage
const createCustomIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Map controller to fly to selected district
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, { duration: 1 });
        }
    }, [center, zoom, map]);
    return null;
};

const ServiceAreas = () => {
    const navigate = useNavigate();
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [serviceCenters, setServiceCenters] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [mapCenter, setMapCenter] = useState([7.8731, 80.7718]); // Sri Lanka center
    const [mapZoom, setMapZoom] = useState(8);
    const [technicians, setTechnicians] = useState([]);
    const [technicianStats, setTechnicianStats] = useState({
        active: 0,
        inactive: 0,
        busy: 0,
        total: 0
    });
    const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive', 'busy'

    // Default district coordinates for Sri Lanka
    const districtCoords = {
        'colombo': [6.9271, 79.8612],
        'gampaha': [7.0917, 80.0156],
        'kalutara': [6.5854, 79.9607],
        'kandy': [7.2906, 80.6337],
        'galle': [6.0535, 80.2210],
        'matara': [5.9549, 80.5550],
        'jaffna': [9.6615, 80.0255],
        'kurunegala': [7.4863, 80.3647],
        'ratnapura': [6.6828, 80.4028],
        'anuradhapura': [8.3114, 80.4037],
        'badulla': [6.9934, 81.0550],
        'trincomalee': [8.5874, 81.2152],
        'negombo': [7.2094, 79.8358],
        'batticaloa': [7.7310, 81.6747],
        'nuwara eliya': [6.9497, 80.7891],
    };

    // Calculate if a technician is active (logged in within last 30 days)
    const calculateTechnicianStatus = useCallback((lastLogin, isCurrentlyBusy = false) => {
        if (isCurrentlyBusy) return 'busy';
        if (!lastLogin) return 'inactive';

        const lastLoginDate = new Date(lastLogin);
        const now = new Date();
        const daysDiff = Math.floor((now - lastLoginDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 30) return 'active';
        return 'inactive';
    }, []);

    // Fetch technicians from Supabase with real-time updates
    const fetchTechnicians = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, phone, district, address, last_login, is_busy, avatar_url, created_at')
                .eq('role', 'technician');

            if (error) {
                console.error('Error fetching technicians:', error);
                return;
            }

            if (data) {
                const processedTechnicians = data.map(tech => {
                    const status = calculateTechnicianStatus(tech.last_login, tech.is_busy);
                    const district = tech.district?.toLowerCase() || 'colombo';
                    const coords = districtCoords[district] || districtCoords['colombo'];

                    // Add some randomization to coordinates so markers don't overlap
                    const randomOffset = () => (Math.random() - 0.5) * 0.05;

                    return {
                        ...tech,
                        status,
                        coords: [coords[0] + randomOffset(), coords[1] + randomOffset()],
                        districtName: tech.district || 'Colombo'
                    };
                });

                setTechnicians(processedTechnicians);

                // Calculate stats
                const stats = processedTechnicians.reduce((acc, tech) => {
                    acc.total++;
                    acc[tech.status] = (acc[tech.status] || 0) + 1;
                    return acc;
                }, { active: 0, inactive: 0, busy: 0, total: 0 });

                setTechnicianStats(stats);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Error fetching technicians:', error);
        }
    }, [calculateTechnicianStatus]);

    // Set up real-time subscription for technician updates
    useEffect(() => {
        fetchTechnicians();

        // Subscribe to real-time changes on users table
        const channel = supabase
            .channel('technicians-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users',
                    filter: 'role=eq.technician'
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchTechnicians(); // Refresh data on any change
                    setIsRealTimeConnected(true);
                }
            )
            .subscribe((status) => {
                setIsRealTimeConnected(status === 'SUBSCRIBED');
            });

        // Refresh data every 30 seconds as fallback
        const interval = setInterval(fetchTechnicians, 30000);

        return () => {
            channel.unsubscribe();
            clearInterval(interval);
        };
    }, [fetchTechnicians]);

    // Fetch real data from Google Sheets
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [shops, districtStats] = await Promise.all([
                    fetchRepairShops(),
                    getDistrictStatistics()
                ]);

                setServiceCenters(shops);

                const formattedDistricts = districtStats.map(d => {
                    const id = d.name.toLowerCase().replace(/\s+/g, '-');
                    const coords = districtCoords[d.name.toLowerCase()] || [7.8731, 80.7718];
                    const coverage = d.coverage || Math.min(100, d.shops * 10 + 50);

                    return {
                        id,
                        name: d.name,
                        coords,
                        technicians: d.technicians || d.shops * 2,
                        shops: d.shops,
                        coverage,
                        color: coverage >= 85 ? '#22c55e' : coverage >= 70 ? '#eab308' : '#f97316'
                    };
                });

                setDistricts(formattedDistricts.length > 0 ? formattedDistricts : getDefaultDistricts());
            } catch (error) {
                console.error('Error loading data:', error);
                setDistricts(getDefaultDistricts());
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchRepairShops(true).then(setServiceCenters),
                fetchTechnicians()
            ]);
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const getDefaultDistricts = () => [
        { id: 'colombo', name: 'Colombo', coords: [6.9271, 79.8612], technicians: 45, shops: 23, coverage: 100, color: '#22c55e' },
        { id: 'gampaha', name: 'Gampaha', coords: [7.0917, 80.0156], technicians: 32, shops: 18, coverage: 95, color: '#22c55e' },
        { id: 'kalutara', name: 'Kalutara', coords: [6.5854, 79.9607], technicians: 18, shops: 9, coverage: 85, color: '#22c55e' },
        { id: 'kandy', name: 'Kandy', coords: [7.2906, 80.6337], technicians: 28, shops: 15, coverage: 90, color: '#22c55e' },
        { id: 'galle', name: 'Galle', coords: [6.0535, 80.2210], technicians: 22, shops: 12, coverage: 88, color: '#22c55e' },
        { id: 'matara', name: 'Matara', coords: [5.9549, 80.5550], technicians: 15, shops: 8, coverage: 80, color: '#eab308' },
        { id: 'jaffna', name: 'Jaffna', coords: [9.6615, 80.0255], technicians: 12, shops: 6, coverage: 75, color: '#eab308' },
        { id: 'kurunegala', name: 'Kurunegala', coords: [7.4863, 80.3647], technicians: 20, shops: 11, coverage: 82, color: '#22c55e' },
        { id: 'ratnapura', name: 'Ratnapura', coords: [6.6828, 80.4028], technicians: 10, shops: 5, coverage: 70, color: '#eab308' },
        { id: 'anuradhapura', name: 'Anuradhapura', coords: [8.3114, 80.4037], technicians: 14, shops: 7, coverage: 72, color: '#eab308' },
        { id: 'badulla', name: 'Badulla', coords: [6.9934, 81.0550], technicians: 8, shops: 4, coverage: 65, color: '#f97316' },
        { id: 'trincomalee', name: 'Trincomalee', coords: [8.5874, 81.2152], technicians: 6, shops: 3, coverage: 55, color: '#f97316' },
    ];

    const filteredDistricts = districts.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter technicians by status and district
    const filteredTechnicians = useMemo(() => {
        return technicians.filter(tech => {
            const matchesStatus = statusFilter === 'all' || tech.status === statusFilter;
            const matchesDistrict = !selectedDistrict ||
                tech.districtName?.toLowerCase() === selectedDistrict.name?.toLowerCase();
            return matchesStatus && matchesDistrict;
        });
    }, [technicians, statusFilter, selectedDistrict]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(loc);
                    setMapCenter([loc.lat, loc.lng]);
                    setMapZoom(11);
                },
                (error) => console.error('Geolocation error:', error)
            );
        }
    };

    const getCoverageColor = (coverage) => {
        if (coverage >= 85) return 'text-green-400 bg-green-500/20 border-green-500/30';
        if (coverage >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
            case 'inactive': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'busy': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return UserCheck;
            case 'inactive': return UserX;
            case 'busy': return Activity;
            default: return Circle;
        }
    };

    const selectedCenters = selectedDistrict
        ? serviceCenters.filter(c =>
            c.district?.toLowerCase() === selectedDistrict.name?.toLowerCase() ||
            c.district?.toLowerCase() === selectedDistrict.id?.toLowerCase()
        )
        : [];

    const handleDistrictSelect = (district) => {
        setSelectedDistrict(district);
        setMapCenter(district.coords);
        setMapZoom(11);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <SEO
                title="Service Areas - TechCare"
                description="Find TechCare device repair services near you. Real-time technician activity tracking across Sri Lanka."
                keywords="service areas, locations, Sri Lanka, Colombo, repair centers, active technicians"
            />

            {/* Add CSS for pulse animation */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>

            {/* Hero Section - Compact */}
            <section className="relative py-12 bg-gradient-to-b from-green-900/20 to-black">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                            <Badge variant="outline" className="border-green-500/50 text-green-400">
                                <MapPin className="w-3 h-3 mr-1" />
                                Island-wide Coverage
                            </Badge>
                            <Badge variant="outline" className={`${isRealTimeConnected ? 'border-blue-500/50 text-blue-400' : 'border-gray-500/50 text-gray-400'}`}>
                                {isRealTimeConnected ? (
                                    <>
                                        <Wifi className="w-3 h-3 mr-1" />
                                        Live Updates
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-3 h-3 mr-1" />
                                        Connecting...
                                    </>
                                )}
                            </Badge>
                            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                <Activity className="w-3 h-3 mr-1" />
                                {technicianStats.active} Active Now
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            Service Areas & Live Technicians
                        </h1>
                        <p className="text-zinc-400 mb-2">
                            Real-time tracking of {technicianStats.total} technicians and {serviceCenters.length}+ service centers across Sri Lanka
                        </p>
                        <p className="text-xs text-zinc-500 mb-6">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>

                        {/* Search & Actions */}
                        <div className="flex gap-2 max-w-lg mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="text"
                                    placeholder="Search districts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-10"
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} className="h-10 w-10">
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button variant="outline" size="icon" onClick={getUserLocation} className="h-10 w-10">
                                <Navigation className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-4 border-y border-zinc-800 bg-zinc-900/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-400">{districts.length || 12}</div>
                            <div className="text-xs text-zinc-500">Districts</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-400">{technicianStats.total || '200+'}</div>
                            <div className="text-xs text-zinc-500">Total Technicians</div>
                        </div>
                        <div className="relative cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}>
                            <div className="text-2xl font-bold text-green-400">{technicianStats.active}</div>
                            <div className="text-xs text-zinc-500 flex items-center justify-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Active
                            </div>
                            {statusFilter === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500"></div>}
                        </div>
                        <div className="relative cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'inactive' ? 'all' : 'inactive')}>
                            <div className="text-2xl font-bold text-red-400">{technicianStats.inactive}</div>
                            <div className="text-xs text-zinc-500 flex items-center justify-center gap-1">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Inactive (30d+)
                            </div>
                            {statusFilter === 'inactive' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"></div>}
                        </div>
                        <div className="relative cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'busy' ? 'all' : 'busy')}>
                            <div className="text-2xl font-bold text-yellow-400">{technicianStats.busy}</div>
                            <div className="text-xs text-zinc-500 flex items-center justify-center gap-1">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                Busy
                            </div>
                            {statusFilter === 'busy' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500"></div>}
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-400">{serviceCenters.length || '100+'}</div>
                            <div className="text-xs text-zinc-500">Centers</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map and Districts - Main Content */}
            <section className="py-6">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* District List */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Districts</h2>
                                {statusFilter !== 'all' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setStatusFilter('all')}
                                        className="text-xs text-zinc-400"
                                    >
                                        Clear Filter
                                    </Button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredDistricts.map((district) => {
                                        // Count technicians by status in this district
                                        const districtTechs = technicians.filter(t =>
                                            t.districtName?.toLowerCase() === district.name?.toLowerCase()
                                        );
                                        const activeTechs = districtTechs.filter(t => t.status === 'active').length;
                                        const inactiveTechs = districtTechs.filter(t => t.status === 'inactive').length;

                                        return (
                                            <button
                                                key={district.id}
                                                onClick={() => handleDistrictSelect(district)}
                                                className={`w-full p-3 rounded-lg border transition-all text-left ${selectedDistrict?.id === district.id
                                                    ? 'bg-green-500/10 border-green-500'
                                                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2.5 h-2.5 rounded-full"
                                                            style={{ backgroundColor: district.color }}
                                                        />
                                                        <span className="font-medium text-sm">{district.name}</span>
                                                    </div>
                                                    <Badge variant="outline" className={`text-xs ${getCoverageColor(district.coverage)}`}>
                                                        {district.coverage}%
                                                    </Badge>
                                                </div>
                                                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {districtTechs.length || district.technicians}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-green-400">
                                                        <UserCheck className="h-3 w-3" />
                                                        {activeTechs}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-red-400">
                                                        <UserX className="h-3 w-3" />
                                                        {inactiveTechs}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Building className="h-3 w-3" />
                                                        {district.shops}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Interactive Map */}
                        <div className="lg:col-span-2">
                            <Card className="overflow-hidden h-full border-zinc-800">
                                <CardHeader className="py-3 border-b border-zinc-800">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-green-400" />
                                            {selectedDistrict ? `${selectedDistrict.name} District` : 'Sri Lanka Coverage Map'}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                                            <span>Showing {filteredTechnicians.length} technicians</span>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Leaflet Map */}
                                    <div className="h-[400px] w-full">
                                        <MapContainer
                                            center={mapCenter}
                                            zoom={mapZoom}
                                            style={{ height: '100%', width: '100%' }}
                                            className="z-0"
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                            />
                                            <MapController center={mapCenter} zoom={mapZoom} />

                                            {/* Technician Markers with Activity Status */}
                                            {filteredTechnicians.map((tech) => (
                                                <Marker
                                                    key={tech.id}
                                                    position={tech.coords}
                                                    icon={createActivityIcon(tech.status)}
                                                >
                                                    <Popup className="custom-popup">
                                                        <div className="text-black p-1 min-w-[180px]">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div
                                                                    className={`w-3 h-3 rounded-full ${tech.status === 'active' ? 'bg-green-500' :
                                                                            tech.status === 'busy' ? 'bg-yellow-500' :
                                                                                'bg-red-500'
                                                                        }`}
                                                                />
                                                                <span className="font-bold">{tech.name}</span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{tech.districtName}</p>
                                                            <p className="text-sm">
                                                                Status: <span className={`font-medium ${tech.status === 'active' ? 'text-green-600' :
                                                                        tech.status === 'busy' ? 'text-yellow-600' :
                                                                            'text-red-600'
                                                                    }`}>
                                                                    {tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
                                                                </span>
                                                            </p>
                                                            {tech.phone && (
                                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                    <Phone className="h-3 w-3" /> {tech.phone}
                                                                </p>
                                                            )}
                                                            {tech.last_login && (
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    Last active: {new Date(tech.last_login).toLocaleDateString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}

                                            {/* District Markers (smaller, for reference) */}
                                            {!selectedDistrict && districts.map((district) => (
                                                <Marker
                                                    key={district.id}
                                                    position={district.coords}
                                                    icon={createCustomIcon(district.color)}
                                                    eventHandlers={{
                                                        click: () => handleDistrictSelect(district),
                                                    }}
                                                >
                                                    <Popup className="custom-popup">
                                                        <div className="text-black p-1">
                                                            <h3 className="font-bold">{district.name}</h3>
                                                            <p className="text-sm">{district.technicians} technicians</p>
                                                            <p className="text-sm">{district.shops} service centers</p>
                                                            <p className="text-sm font-medium text-green-600">{district.coverage}% coverage</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}

                                            {/* Coverage circles for selected district */}
                                            {selectedDistrict && (
                                                <LeafletCircle
                                                    center={selectedDistrict.coords}
                                                    radius={20000}
                                                    pathOptions={{
                                                        color: selectedDistrict.color,
                                                        fillColor: selectedDistrict.color,
                                                        fillOpacity: 0.15,
                                                        weight: 2
                                                    }}
                                                />
                                            )}

                                            {/* User location marker */}
                                            {userLocation && (
                                                <Marker
                                                    position={[userLocation.lat, userLocation.lng]}
                                                    icon={createCustomIcon('#3b82f6')}
                                                >
                                                    <Popup>Your Location</Popup>
                                                </Marker>
                                            )}
                                        </MapContainer>
                                    </div>

                                    {/* Legend - Updated with Activity Status */}
                                    <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
                                        <div className="flex flex-wrap items-center gap-4 text-xs">
                                            <span className="text-zinc-500 font-medium">Status:</span>
                                            <div className="flex items-center gap-1 cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                                <span className={statusFilter === 'active' ? 'text-green-400' : 'text-zinc-400'}>Active (≤30d)</span>
                                            </div>
                                            <div className="flex items-center gap-1 cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'busy' ? 'all' : 'busy')}>
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                                <span className={statusFilter === 'busy' ? 'text-yellow-400' : 'text-zinc-400'}>Busy</span>
                                            </div>
                                            <div className="flex items-center gap-1 cursor-pointer" onClick={() => setStatusFilter(statusFilter === 'inactive' ? 'all' : 'inactive')}>
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                                <span className={statusFilter === 'inactive' ? 'text-red-400' : 'text-zinc-400'}>Inactive (&gt;30d)</span>
                                            </div>
                                            <span className="text-zinc-700">|</span>
                                            <span className="text-zinc-500 font-medium">Coverage:</span>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                                <span className="text-zinc-400">Full (85%+)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                                <span className="text-zinc-400">Partial (70-84%)</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                                <span className="text-zinc-400">Limited (&lt;70%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected District Details */}
                                    {selectedDistrict && (
                                        <div className="p-4 border-t border-zinc-800">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-bold">{selectedDistrict.name}</h3>
                                                    <p className="text-sm text-zinc-400">{selectedDistrict.coverage}% coverage</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor('active')}>
                                                        <UserCheck className="h-3 w-3 mr-1" />
                                                        {filteredTechnicians.filter(t => t.status === 'active').length} Active
                                                    </Badge>
                                                    <Badge className={getStatusColor('inactive')}>
                                                        <UserX className="h-3 w-3 mr-1" />
                                                        {filteredTechnicians.filter(t => t.status === 'inactive').length} Inactive
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                                                    <div className="text-xl font-bold text-green-400">
                                                        {filteredTechnicians.filter(t => t.status === 'active').length}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">Active Techs</div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                                                    <div className="text-xl font-bold text-red-400">
                                                        {filteredTechnicians.filter(t => t.status === 'inactive').length}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">Inactive (30d+)</div>
                                                </div>
                                                <div className="p-3 rounded-lg bg-zinc-800/50 text-center">
                                                    <div className="text-xl font-bold text-blue-400">
                                                        {selectedCenters.length || selectedDistrict.shops}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">Centers</div>
                                                </div>
                                            </div>

                                            {/* Active Technicians List */}
                                            {filteredTechnicians.length > 0 && (
                                                <div className="space-y-2 mb-4">
                                                    <h4 className="text-sm font-medium text-zinc-300">
                                                        {statusFilter === 'all' ? 'All Technicians' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Technicians`}
                                                    </h4>
                                                    {filteredTechnicians.slice(0, 5).map((tech) => {
                                                        const StatusIcon = getStatusIcon(tech.status);
                                                        return (
                                                            <div key={tech.id} className="p-2 rounded bg-zinc-800/50 text-sm">
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2.5 h-2.5 rounded-full ${tech.status === 'active' ? 'bg-green-500' :
                                                                                tech.status === 'busy' ? 'bg-yellow-500' :
                                                                                    'bg-red-500'
                                                                            }`} />
                                                                        <span className="font-medium">{tech.name}</span>
                                                                    </div>
                                                                    <Badge variant="outline" className={`text-xs ${getStatusColor(tech.status)}`}>
                                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                                        {tech.status}
                                                                    </Badge>
                                                                </div>
                                                                {tech.phone && (
                                                                    <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2 ml-4">
                                                                        <Phone className="h-3 w-3" /> {tech.phone}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {filteredTechnicians.length > 5 && (
                                                        <p className="text-xs text-zinc-500 text-center">
                                                            + {filteredTechnicians.length - 5} more technicians
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Service Centers */}
                                            {selectedCenters.length > 0 && (
                                                <div className="space-y-2 mb-4">
                                                    <h4 className="text-sm font-medium text-zinc-300">Top Service Centers</h4>
                                                    {selectedCenters.slice(0, 3).map((center) => (
                                                        <div key={center.id} className="p-2 rounded bg-zinc-800/50 text-sm">
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-medium">{center.name}</span>
                                                                <div className="flex items-center gap-1 text-yellow-400 text-xs">
                                                                    <Star className="h-3 w-3 fill-current" />
                                                                    {center.rating}
                                                                </div>
                                                            </div>
                                                            {center.phone ? (
                                                                <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                                    <Phone className="h-3 w-3" /> {center.phone}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-zinc-600 mt-1 italic">
                                                                    No phone available
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700 h-9 text-sm"
                                                onClick={() => navigate('/technicians', { state: { district: selectedDistrict.name } })}
                                            >
                                                Find Technicians in {selectedDistrict.name}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 border-t border-zinc-800">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-3">Don't See Your Area?</h2>
                    <p className="text-zinc-400 mb-6 max-w-xl mx-auto text-sm">
                        We're rapidly expanding across Sri Lanka. Register your interest and we'll notify you when we launch in your district.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            className="bg-white text-black hover:bg-gray-200"
                            onClick={() => navigate('/support')}
                        >
                            Request Coverage
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/register')}
                        >
                            Become a Technician
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ServiceAreas;
