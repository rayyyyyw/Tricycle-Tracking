import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import PassengerLayout from '@/layouts/PassengerLayout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Anchor,
    Building,
    Car,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Church,
    Clock,
    CreditCard,
    FileText,
    Home,
    Hospital,
    Hotel,
    Landmark as LandmarkIcon,
    Loader2,
    LucideIcon,
    Map as MapIcon,
    MapPin,
    MinusCircle,
    Mountain,
    Navigation2,
    Trees as Park,
    Pin,
    PlusCircle,
    Route,
    Route as RouteIcon,
    School,
    Search,
    Shield,
    ShoppingBag,
    Target as TargetIcon,
    Users,
    Waves,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import BookingConfirmation from './BookingConfirmation';
import ProfileRestrictionScreen from './ProfileRestrictionScreen';

// Import Leaflet for mapping
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
    ._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Type definitions
interface LocationData {
    lat: number;
    lng: number;
    address: string;
    name?: string;
    barangay?: string;
    purok?: string;
    type?: string;
}

interface SavedPlace {
    id: number;
    type: string;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    barangay: string | null;
    purok: string | null;
    is_primary: boolean;
}

interface RideFormData {
    rideType: string;
    passengerName: string;
    passengerPhone: string;
    passengerCount: number;
    specialInstructions: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    destination: LocationData | null;
}

interface RouteInfo {
    distance: string;
    duration: string;
    fare: string;
    totalFare: string;
    estimatedArrival: string;
}

interface UserData {
    name?: string;
    phone?: string;
    address?: string;
    avatar?: string | null;
    emergency_contact?: {
        name?: string;
        phone?: string;
        relationship?: string;
    };
}

interface BarangayData {
    id: string;
    name: string;
    lat: number;
    lng: number;
    population?: number;
    area?: number;
    puroks?: PurokData[];
}

interface PurokData {
    id: string;
    name: string;
    barangayId: string;
    barangayName: string;
}

interface LandmarkData {
    name: string;
    type: string;
    icon: LucideIcon;
    lat: number;
    lng: number;
    barangay: string;
    barangayId: string;
    purok?: string;
}

interface RideType {
    id: string;
    name: string;
    icon: LucideIcon;
    description: string;
    baseFare: number;
    perKmRate: number;
    per5KmRate: number;
}

// Define Hinobaan municipality boundary coordinates with realistic boundaries
const HINOBAAN_BOUNDARY = {
    center: [9.5989, 122.4701] as [number, number], // More accurate center
    bounds: {
        north: 9.65, // 9.65°N
        south: 9.44, // 9.44°N
        east: 122.62, // 122.62°E
        west: 122.46, // 122.46°E
    },
};

// All barangays in Hinobaan municipality with exact coordinates
const HINOBAAN_BARANGAYS: BarangayData[] = [
    {
        id: 'alim',
        name: 'Alim',
        lat: 9.5648,
        lng: 122.4911,
        population: 1200,
        area: 5.2,
    },
    {
        id: 'asia',
        name: 'Asia',
        lat: 9.5506,
        lng: 122.5164,
        population: 800,
        area: 3.8,
    },
    {
        id: 'bacuyangan',
        name: 'Bacuyangan',
        lat: 9.6268,
        lng: 122.4685,
        population: 1500,
        area: 8.5,
    },
    {
        id: 'barangay1',
        name: 'Barangay I (Poblacion)',
        lat: 9.5989,
        lng: 122.4676,
        population: 2000,
        area: 2.1,
    },
    {
        id: 'barangay2',
        name: 'Barangay II (Poblacion)',
        lat: 9.6001,
        lng: 122.4726,
        population: 1800,
        area: 2.3,
    },
    {
        id: 'bulwangan',
        name: 'Bulwangan',
        lat: 9.5165,
        lng: 122.5355,
        population: 600,
        area: 4.7,
    },
    {
        id: 'culipapa',
        name: 'Culipapa',
        lat: 9.4726,
        lng: 122.5616,
        population: 700,
        area: 6.3,
    },
    {
        id: 'damutan',
        name: 'Damutan',
        lat: 9.601,
        lng: 122.6194,
        population: 900,
        area: 7.8,
    },
    {
        id: 'daug',
        name: 'Daug',
        lat: 9.4881,
        lng: 122.5454,
        population: 1100,
        area: 5.9,
    },
    {
        id: 'pook',
        name: 'Po-ok',
        lat: 9.582,
        lng: 122.4776,
        population: 1300,
        area: 4.2,
    },
    {
        id: 'sanrafael',
        name: 'San Rafael',
        lat: 9.6083,
        lng: 122.5137,
        population: 1000,
        area: 6.1,
    },
    {
        id: 'sangke',
        name: 'Sangke',
        lat: 9.4455,
        lng: 122.5888,
        population: 500,
        area: 5.5,
    },
    {
        id: 'talacagay',
        name: 'Talacagay',
        lat: 9.6382,
        lng: 122.4701,
        population: 1400,
        area: 7.2,
    },
];

// All 13 barangays and their respective puroks (Hinobaan)
const PUROKS_RAW: PurokData[] = [
    // Alim
    { id: 'alim-1', name: 'Purok 1 (Proper)', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-2', name: 'Purok 2 (Bay2x)', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-3', name: 'Purok 3 (Isam)', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-4', name: 'Purok 5 (Palo2x)', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-5', name: 'Purok 4 (Ma-abon)', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-6a', name: 'Candali-an', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-6b', name: 'Tulagbo', barangayId: 'alim', barangayName: 'Alim' },
    { id: 'alim-6c', name: 'Pamali-an', barangayId: 'alim', barangayName: 'Alim' },
    // Asia
    { id: 'asia-1', name: 'Purok 1/14', barangayId: 'asia', barangayName: 'Asia' },
    { id: 'asia-2', name: 'Purok 8 (Pantalan)', barangayId: 'asia', barangayName: 'Asia' },
    { id: 'asia-3', name: 'Purok 2', barangayId: 'asia', barangayName: 'Asia' },
    { id: 'asia-4', name: 'Purok 3', barangayId: 'asia', barangayName: 'Asia' },
    { id: 'asia-5', name: 'Purok 4/15', barangayId: 'asia', barangayName: 'Asia' },
    { id: 'asia-6', name: 'Purok 6', barangayId: 'asia', barangayName: 'Asia' },
    { id: 'asia-7', name: 'Purok 5', barangayId: 'asia', barangayName: 'Asia' },
    // Bacuyangan
    { id: 'bacuyangan-1a', name: 'Canlabac', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-1b', name: 'Bungyod', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-1c', name: 'Zone 10', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-2', name: 'Zone I', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-3', name: 'Zone II', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-4a', name: 'Zone III', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-4b', name: 'Dalaguit', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-5', name: 'Zone IV', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-6a', name: 'Catmon', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-6b', name: 'Obong', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-6c', name: 'Zone 13', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    { id: 'bacuyangan-6d', name: 'Zone V', barangayId: 'bacuyangan', barangayName: 'Bacuyangan' },
    // Barangay I (Poblacion)
    { id: 'barangay1-1', name: 'Purok 1', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    { id: 'barangay1-2', name: 'Purok 2', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    { id: 'barangay1-3', name: 'Purok 3', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    { id: 'barangay1-4', name: 'Purok 4', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    { id: 'barangay1-5', name: 'Purok 5', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    { id: 'barangay1-7', name: 'Purok 6', barangayId: 'barangay1', barangayName: 'Barangay I (Poblacion)' },
    // Barangay II (Poblacion)
    { id: 'barangay2-1', name: 'Purok 4/ Relocation', barangayId: 'barangay2', barangayName: 'Barangay II (Poblacion)' },
    { id: 'barangay2-2', name: 'Purok 3', barangayId: 'barangay2', barangayName: 'Barangay II (Poblacion)' },
    { id: 'barangay2-3', name: 'Purok 2', barangayId: 'barangay2', barangayName: 'Barangay II (Poblacion)' },
    { id: 'barangay2-4', name: 'Purok 1 (Poblacion)', barangayId: 'barangay2', barangayName: 'Barangay II (Poblacion)' },
    { id: 'barangay2-5', name: 'Purok 1 (TabokSuba)', barangayId: 'barangay2', barangayName: 'Barangay II (Poblacion)' },
    { id: 'barangay2-7', name: 'Purok 5', barangayId: 'barangay2', barangayName: 'Barangay II (Poblacion)' },
    // Bulwangan
    { id: 'bulwangan-1', name: 'Purok 1', barangayId: 'bulwangan', barangayName: 'Bulwangan' },
    { id: 'bulwangan-2', name: 'Purok 2', barangayId: 'bulwangan', barangayName: 'Bulwangan' },
    { id: 'bulwangan-3', name: 'Purok 3', barangayId: 'bulwangan', barangayName: 'Bulwangan' },
    { id: 'bulwangan-4', name: 'Purok 4 (Bagtic)', barangayId: 'bulwangan', barangayName: 'Bulwangan' },
    { id: 'bulwangan-6', name: 'Purok 5 (Cabanbanan)', barangayId: 'bulwangan', barangayName: 'Bulwangan' },
    { id: 'bulwangan-7', name: 'Purok 6 (Ma-uti)', barangayId: 'bulwangan', barangayName: 'Bulwangan' },
    { id: 'bulwangan-8', name: 'Purok 7 (Manlaw-an)', barangayId: 'bulwangan', barangayName: 'Bulwangan' },
    // Culipapa
    { id: 'culipapa-1', name: 'Purok 1', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-2', name: 'Purok 2', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-3', name: 'Purok 3', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-4', name: 'Purok 4A (Camandagan)', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-5', name: 'Purok 4B', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-6a', name: 'Purok 5 (Taliptipon)', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-6b', name: 'Canlinday', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-7', name: 'Purok 6 (Chapter)', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-8a', name: 'Purok 7 (Fortugaleza)', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-8b', name: 'Purok 7 (Magcalapay)', barangayId: 'culipapa', barangayName: 'Culipapa' },
    { id: 'culipapa-9', name: 'Purok 8 /9 (Cimico)', barangayId: 'culipapa', barangayName: 'Culipapa' },
    // Damutan
    { id: 'damutan-1a', name: 'Purok 1 (Bugtong Lubi)', barangayId: 'damutan', barangayName: 'Damutan' },
    { id: 'damutan-1b', name: 'Purok 1 (Malipayon)', barangayId: 'damutan', barangayName: 'Damutan' },
    { id: 'damutan-1c', name: 'Purok 1 (KM 30)', barangayId: 'damutan', barangayName: 'Damutan' },
    { id: 'damutan-1d', name: 'Purok 1 (Hilltop)', barangayId: 'damutan', barangayName: 'Damutan' },
    { id: 'damutan-1e', name: 'Purok 1 (13-7)', barangayId: 'damutan', barangayName: 'Damutan' },
    { id: 'damutan-2a', name: 'Purok 2 (Matag)', barangayId: 'damutan', barangayName: 'Damutan' },
    { id: 'damutan-2b', name: 'Purok 2 (Soso)', barangayId: 'damutan', barangayName: 'Damutan' },
    { id: 'damutan-2c', name: 'Purok 2 (Proper)', barangayId: 'damutan', barangayName: 'Damutan' },
    // Daug
    { id: 'daug-1', name: 'Purok 1 (Cabalaringan)', barangayId: 'daug', barangayName: 'Daug' },
    { id: 'daug-2', name: 'Purok 2 (Proper)', barangayId: 'daug', barangayName: 'Daug' },
    { id: 'daug-3', name: 'Purok 3 (Badyang)', barangayId: 'daug', barangayName: 'Daug' },
    { id: 'daug-4', name: 'Purok 4 (Kalag2x)', barangayId: 'daug', barangayName: 'Daug' },
    // Po-ok
    { id: 'pook-1a', name: 'Hda. Paz', barangayId: 'pook', barangayName: 'Po-ok' },
    { id: 'pook-1b', name: 'Happy Valley', barangayId: 'pook', barangayName: 'Po-ok' },
    { id: 'pook-1c', name: 'Hillside', barangayId: 'pook', barangayName: 'Po-ok' },
    { id: 'pook-2a', name: 'Cadal-ogan', barangayId: 'pook', barangayName: 'Po-ok' },
    { id: 'pook-2b', name: 'Cansaghaw', barangayId: 'pook', barangayName: 'Po-ok' },
    { id: 'pook-2c', name: 'Labao', barangayId: 'pook', barangayName: 'Po-ok' },
    { id: 'pook-2d', name: 'Mahanayhanay', barangayId: 'pook', barangayName: 'Po-ok' },
    { id: 'pook-3', name: 'Batilo', barangayId: 'pook', barangayName: 'Po-ok' },
    { id: 'pook-4', name: 'Manalimsim', barangayId: 'pook', barangayName: 'Po-ok' },
    // San Rafael
    { id: 'sanrafael-1a', name: 'Mindoro', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-1b', name: 'Iilihan', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-2', name: 'Tayunan', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-3a', name: 'Alanaban', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-3b', name: 'Canmalaybay', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-3c', name: 'Ga-as', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-3d', name: 'Alingadion', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-4a', name: 'Linayugan', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-4b', name: 'Cansuguimban', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-4c', name: 'Calapayan', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-5', name: 'San Rafael Proper', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-6a', name: 'Cubay', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-6b', name: 'Mahuyabhuyab', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    { id: 'sanrafael-6c', name: 'Puroy', barangayId: 'sanrafael', barangayName: 'San Rafael' },
    // Sangke
    { id: 'sangke-1a', name: 'Purok 3', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-1b', name: 'Panganawan', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-1c', name: 'Balogo', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-1d', name: 'Camandagan', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-2a', name: 'Purok 2', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-2b', name: 'Talo-os', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-2c', name: 'Camulhay', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-2d', name: 'Langob', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-3a', name: 'Purok 1', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-3b', name: 'Proper', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-4a', name: 'Ma-atop', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-4b', name: 'Ilaya', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-4c', name: 'Matil-is', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-4d', name: 'Gahit', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-4e', name: 'Dao2x', barangayId: 'sangke', barangayName: 'Sangke' },
    { id: 'sangke-4f', name: 'Bang2x', barangayId: 'sangke', barangayName: 'Sangke' },
    // Talacagay
    { id: 'talacagay-1', name: 'Daisy', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-2a', name: 'Waling2x', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-2b', name: 'Orchids', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-3a', name: 'Dalagumay', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-3b', name: 'Rose', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-3c', name: 'Everlasting', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-4a', name: 'Totong', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-4b', name: 'Pasil', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-4c', name: 'Gumamela', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-4d', name: 'Santan', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-4e', name: 'Sampaguita', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-4f', name: 'Esmeralda', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-5', name: 'Bungyod', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-7a', name: 'Bato', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-7b', name: 'Calachuchi', barangayId: 'talacagay', barangayName: 'Talacagay' },
    { id: 'talacagay-7c', name: 'Bungyog', barangayId: 'talacagay', barangayName: 'Talacagay' },
];

// Deduplicate by (barangayId, name) and sort alphabetically by barangay then name
const PUROKS: PurokData[] = (() => {
    const seen = new Set<string>();
    return PUROKS_RAW.filter((p) => {
        const key = `${p.barangayId}|${p.name.toLowerCase().trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).sort((a, b) => {
        if (a.barangayId !== b.barangayId) return a.barangayId.localeCompare(b.barangayId);
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
})();

// Popular landmarks with exact coordinates - Grouped by barangay and purok
const POPULAR_LANDMARKS: LandmarkData[] = [
    // Barangay I Landmarks
    {
        name: 'Hinobaan Municipal Hall',
        type: 'government',
        icon: Building,
        lat: 9.5989,
        lng: 122.4676,
        barangay: 'Barangay I (Poblacion)',
        barangayId: 'barangay1',
        purok: 'Purok 1',
    },
    {
        name: 'Public Market',
        type: 'store',
        icon: ShoppingBag,
        lat: 9.5995,
        lng: 122.468,
        barangay: 'Barangay I (Poblacion)',
        barangayId: 'barangay1',
        purok: 'Purok 2',
    },
    {
        name: 'Rural Health Unit',
        type: 'hospital',
        icon: Hospital,
        lat: 9.599,
        lng: 122.469,
        barangay: 'Barangay I (Poblacion)',
        barangayId: 'barangay1',
        purok: 'Purok 1',
    },
    {
        name: 'Police Station',
        type: 'government',
        icon: Shield,
        lat: 9.5985,
        lng: 122.4685,
        barangay: 'Barangay I (Poblacion)',
        barangayId: 'barangay1',
        purok: 'Purok 1',
    },

    // Barangay II Landmarks
    {
        name: 'St. Joseph Parish Church',
        type: 'church',
        icon: Church,
        lat: 9.6001,
        lng: 122.4726,
        barangay: 'Barangay II (Poblacion)',
        barangayId: 'barangay2',
        purok: 'Purok 1',
    },
    {
        name: 'Hinobaan National High School',
        type: 'school',
        icon: School,
        lat: 9.6008,
        lng: 122.473,
        barangay: 'Barangay II (Poblacion)',
        barangayId: 'barangay2',
        purok: 'Purok 2',
    },

    // Talacagay Landmarks
    {
        name: 'Talacagay Elementary School',
        type: 'school',
        icon: School,
        lat: 9.6385,
        lng: 122.4705,
        barangay: 'Talacagay',
        barangayId: 'talacagay',
        purok: 'Purok 1',
    },
    {
        name: 'Salvacion Cave',
        type: 'cave',
        icon: Mountain,
        lat: 9.639,
        lng: 122.471,
        barangay: 'Talacagay',
        barangayId: 'talacagay',
        purok: 'Purok 1',
    },
    {
        name: 'Eden Island Resort & Spa',
        type: 'resort',
        icon: Hotel,
        lat: 9.6388,
        lng: 122.4708,
        barangay: 'Talacagay',
        barangayId: 'talacagay',
        purok: 'Purok 1',
    },

    // Bacuyangan Landmarks
    {
        name: 'Bacuyangan Beach',
        type: 'park',
        icon: Park,
        lat: 9.6275,
        lng: 122.469,
        barangay: 'Bacuyangan',
        barangayId: 'bacuyangan',
        purok: 'Purok 1',
    },
    {
        name: 'Ubong Caves / Punta Ubong',
        type: 'cave',
        icon: Mountain,
        lat: 9.628,
        lng: 122.4695,
        barangay: 'Bacuyangan',
        barangayId: 'bacuyangan',
        purok: 'Purok 1',
    },
    {
        name: 'Salvacion Port',
        type: 'port',
        icon: Anchor,
        lat: 9.627,
        lng: 122.4688,
        barangay: 'Bacuyangan',
        barangayId: 'bacuyangan',
        purok: 'Purok 1',
    },

    // Culipapa Landmarks
    {
        name: 'Culipapa Beach',
        type: 'park',
        icon: Park,
        lat: 9.473,
        lng: 122.562,
        barangay: 'Culipapa',
        barangayId: 'culipapa',
        purok: 'Purok 1',
    },

    // Sangke Landmarks
    {
        name: 'Sangke Barangay Hall',
        type: 'government',
        icon: Building,
        lat: 9.4455,
        lng: 122.5888,
        barangay: 'Sangke',
        barangayId: 'sangke',
        purok: 'Purok 1',
    },

    // Damutan Landmarks
    {
        name: 'Damutan Barangay Hall',
        type: 'government',
        icon: Building,
        lat: 9.601,
        lng: 122.6194,
        barangay: 'Damutan',
        barangayId: 'damutan',
        purok: 'Purok 1',
    },

    // San Rafael Landmarks
    {
        name: 'San Rafael Chapel',
        type: 'church',
        icon: Church,
        lat: 9.6083,
        lng: 122.5137,
        barangay: 'San Rafael',
        barangayId: 'sanrafael',
        purok: 'Purok 1',
    },

    // Alim Landmarks
    {
        name: 'Alim Elementary School',
        type: 'school',
        icon: School,
        lat: 9.5648,
        lng: 122.4911,
        barangay: 'Alim',
        barangayId: 'alim',
        purok: 'Purok 1',
    },

    // Asia Landmarks
    {
        name: 'Asia Beach',
        type: 'park',
        icon: Park,
        lat: 9.551,
        lng: 122.517,
        barangay: 'Asia',
        barangayId: 'asia',
        purok: 'Purok 1',
    },
    {
        name: 'Bolila Island',
        type: 'island',
        icon: Waves,
        lat: 9.5515,
        lng: 122.5175,
        barangay: 'Asia',
        barangayId: 'asia',
        purok: 'Purok 1',
    },

    // Po-ok Landmarks
    {
        name: 'Po-ok Barangay Hall',
        type: 'government',
        icon: Building,
        lat: 9.582,
        lng: 122.4776,
        barangay: 'Po-ok',
        barangayId: 'pook',
        purok: 'Purok 1',
    },
    {
        name: 'Alfe Coral Reef Beach Resort',
        type: 'resort',
        icon: Hotel,
        lat: 9.5825,
        lng: 122.478,
        barangay: 'Po-ok',
        barangayId: 'pook',
        purok: 'Purok 1',
    },

    // Bulwangan Landmarks
    {
        name: 'Bulwangan Elementary School',
        type: 'school',
        icon: School,
        lat: 9.5165,
        lng: 122.5355,
        barangay: 'Bulwangan',
        barangayId: 'bulwangan',
        purok: 'Purok 1',
    },
    {
        name: 'Century Tree Beach Resort',
        type: 'resort',
        icon: Hotel,
        lat: 9.517,
        lng: 122.536,
        barangay: 'Bulwangan',
        barangayId: 'bulwangan',
        purok: 'Purok 1',
    },

    // Daug Landmarks
    {
        name: 'Daug Elementary School',
        type: 'school',
        icon: School,
        lat: 9.4881,
        lng: 122.5454,
        barangay: 'Daug',
        barangayId: 'daug',
        purok: 'Purok 1',
    },
];

// Ride types with FIXED pricing: ₱20 for first 5km
const RIDE_TYPES: RideType[] = [
    {
        id: 'regular',
        name: 'Regular Ride',
        icon: Car,
        description: 'Standard tricycle ride within Hinobaan',
        baseFare: 20,
        perKmRate: 4,
        per5KmRate: 20,
    },
    {
        id: 'express',
        name: 'Express Ride',
        icon: Zap,
        description: 'Direct route, no stops',
        baseFare: 25,
        perKmRate: 5,
        per5KmRate: 25,
    },
    {
        id: 'group',
        name: 'Group Ride',
        icon: Users,
        description: 'For 3+ passengers',
        baseFare: 30,
        perKmRate: 6,
        per5KmRate: 30,
    },
    {
        id: 'night',
        name: 'Night Ride',
        icon: Shield,
        description: 'After 8 PM service',
        baseFare: 25,
        perKmRate: 5,
        per5KmRate: 25,
    },
];

// Get nearest barangay name from ALL 13 barangays
const getNearestBarangayName = (lat: number, lng: number): string => {
    let nearest = '';
    let minDistance = Infinity;

    HINOBAAN_BARANGAYS.forEach((barangay) => {
        const R = 6371;
        const dLat = ((barangay.lat - lat) * Math.PI) / 180;
        const dLng = ((barangay.lng - lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat * Math.PI) / 180) *
                Math.cos((barangay.lat * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        if (distance < minDistance) {
            minDistance = distance;
            nearest = barangay.name;
        }
    });

    return nearest || 'Hinobaan Area';
};

// Check if point is within Hinobaan bounds
const checkIfInHinobaan = (lat: number, lng: number): boolean => {
    const tolerance = 0.01; // Reduced tolerance for more accuracy

    return (
        lat >= HINOBAAN_BOUNDARY.bounds.south - tolerance &&
        lat <= HINOBAAN_BOUNDARY.bounds.north + tolerance &&
        lng >= HINOBAAN_BOUNDARY.bounds.west - tolerance &&
        lng <= HINOBAAN_BOUNDARY.bounds.east + tolerance
    );
};

// Calculate realistic distance for Hinobaan
const calculateHinobaanDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
): number => {
    // Haversine formula for straight-line distance
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistance = R * c;

    // For Hinobaan's small area, road distance multiplier is lower (1.2x for most routes)
    // Maximum distance within Hinobaan should not exceed 25km
    const roadDistance = Math.min(straightDistance * 1.2, 25);

    return Math.max(roadDistance, 0.1); // Minimum 0.1km
};

// Calculate realistic travel time for Hinobaan
const calculateHinobaanTravelTime = (distanceKm: number): number => {
    // Average tricycle speed in Hinobaan: 30-40 km/h
    const avgSpeed = 35; // km/h (average of 30-40)
    const timeHours = distanceKm / avgSpeed;
    const timeMinutes = Math.round(timeHours * 60);

    // Within Hinobaan's 13 barangays, maximum travel time should be 50 minutes
    // Minimum 5 minutes for very short distances
    return Math.min(Math.max(timeMinutes, 5), 50);
};

// Calculate fare based on Hinobaan pricing: ₱20 for first 5km
const calculateHinobaanFare = (
    distanceKm: number,
    rideType: string,
    passengerCount: number,
): { fare: number; totalFare: number } => {
    // Get ride type details
    const selectedRideType =
        RIDE_TYPES.find((r) => r.id === rideType) || RIDE_TYPES[0];
    const per5KmRate = selectedRideType.per5KmRate; // ₱20 for first 5km
    const perKmRate = selectedRideType.perKmRate; // Additional km rate after 5km

    // Calculate fare: ₱20 for first 5km
    let fare = per5KmRate;

    // Add additional distance charge if beyond 5km
    if (distanceKm > 5) {
        const additionalKm = distanceKm - 5;
        fare += Math.ceil(additionalKm * perKmRate);
    }

    // Calculate total fare with passengers
    let totalFare = fare;
    if (passengerCount > 1) {
        // Additional passengers pay additional fare
        if (passengerCount <= 2) {
            totalFare += Math.round(passengerCount * 5); // ₱5 per additional passenger
        } else {
            totalFare += Math.round(passengerCount * 8); // ₱8 per passenger for groups
        }
    }

    return { fare, totalFare };
};

// Group landmarks by barangay and purok
const groupLandmarksByBarangayAndPurok = () => {
    const grouped: Record<string, Record<string, LandmarkData[]>> = {};

    // Initialize structure
    HINOBAAN_BARANGAYS.forEach((barangay) => {
        grouped[barangay.id] = {};
    });

    // Group landmarks
    POPULAR_LANDMARKS.forEach((landmark) => {
        if (!grouped[landmark.barangayId]) {
            grouped[landmark.barangayId] = {};
        }

        const purok = landmark.purok || 'General';
        if (!grouped[landmark.barangayId][purok]) {
            grouped[landmark.barangayId][purok] = [];
        }

        grouped[landmark.barangayId][purok].push(landmark);
    });

    return grouped;
};

// Route Map Component for Step 3
interface RouteMapProps {
    pickupLocation: LocationData | null;
    destination: LocationData | null;
}

const RouteMap = ({ pickupLocation, destination }: RouteMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const routingControlRef = useRef<L.Control | L.Polyline | null>(null);
    const pickupMarkerRef = useRef<L.Marker | null>(null);
    const destinationMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapRef.current || !pickupLocation || !destination) return;

        const initializeMap = async () => {
            try {
                // Initialize map if not already done
                if (!mapInstanceRef.current) {
                    const map = L.map(mapRef.current!).setView(
                        [pickupLocation.lat, pickupLocation.lng],
                        13,
                    );

                    L.tileLayer(
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        {
                            attribution:
                                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            maxZoom: 19,
                        },
                    ).addTo(map);

                    mapInstanceRef.current = map;
                }

                const map = mapInstanceRef.current;

                // Clear existing markers and route
                if (pickupMarkerRef.current) {
                    map.removeLayer(pickupMarkerRef.current);
                    pickupMarkerRef.current = null;
                }
                if (destinationMarkerRef.current) {
                    map.removeLayer(destinationMarkerRef.current);
                    destinationMarkerRef.current = null;
                }

                // Clear all existing route lines and controls
                if (routingControlRef.current) {
                    if (routingControlRef.current instanceof L.Control) {
                        map.removeControl(routingControlRef.current);
                    } else if (routingControlRef.current instanceof L.Layer) {
                        map.removeLayer(routingControlRef.current);
                    }
                    routingControlRef.current = null;
                }

                // Also remove any polylines that might be on the map (cleanup any orphaned routes)
                map.eachLayer((layer) => {
                    if (
                        layer instanceof L.Polyline &&
                        layer.options.color === '#10b981'
                    ) {
                        map.removeLayer(layer);
                    }
                });

                // Create custom icons for pickup and destination
                const pickupIcon = L.divIcon({
                    className: 'custom-pickup-marker',
                    html: `<div style="
                        background-color: #10b981;
                        width: 32px;
                        height: 32px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    "></div><div style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        transform: rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                    ">A</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                const destinationIcon = L.divIcon({
                    className: 'custom-destination-marker',
                    html: `<div style="
                        background-color: #ef4444;
                        width: 32px;
                        height: 32px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        border: 3px solid white;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    "></div><div style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        transform: rotate(45deg);
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                    ">B</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                });

                // Add pickup marker
                const pickupMarker = L.marker(
                    [pickupLocation.lat, pickupLocation.lng],
                    {
                        icon: pickupIcon,
                    },
                ).addTo(map);
                pickupMarker.bindPopup(
                    `<strong>Pickup:</strong><br>${pickupLocation.address}`,
                );
                pickupMarkerRef.current = pickupMarker;

                // Add destination marker
                const destMarker = L.marker(
                    [destination.lat, destination.lng],
                    {
                        icon: destinationIcon,
                    },
                ).addTo(map);
                destMarker.bindPopup(
                    `<strong>Destination:</strong><br>${destination.address}`,
                );
                destinationMarkerRef.current = destMarker;

                // Fit map to show both markers
                const group = new L.FeatureGroup([pickupMarker, destMarker]);
                map.fitBounds(group.getBounds().pad(0.1));

                // Add routing using OSRM to follow roads, constrained to Hinobaan
                try {
                    // Use OSRM API directly from point A to point B (no intermediate waypoints)
                    const response = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${pickupLocation.lng},${pickupLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`,
                    );
                    const data = await response.json();

                    if (data.code === 'Ok' && data.routes && data.routes[0]) {
                        const route = data.routes[0];
                        // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
                        const coordinates = route.geometry.coordinates.map(
                            (coord: [number, number]) => [coord[1], coord[0]],
                        );

                        // Filter coordinates to ensure they stay within Hinobaan bounds
                        // Only keep coordinates that are within bounds
                        const filteredCoordinates = coordinates.filter(
                            (coord: [number, number]) => {
                                const [lat, lng] = coord;
                                return (
                                    lat >= HINOBAAN_BOUNDARY.bounds.south &&
                                    lat <= HINOBAAN_BOUNDARY.bounds.north &&
                                    lng >= HINOBAAN_BOUNDARY.bounds.west &&
                                    lng <= HINOBAAN_BOUNDARY.bounds.east
                                );
                            },
                        );

                        // Always include start and end points, even if slightly outside bounds
                        const startPoint: [number, number] = [
                            pickupLocation.lat,
                            pickupLocation.lng,
                        ];
                        const endPoint: [number, number] = [
                            destination.lat,
                            destination.lng,
                        ];

                        // Build final coordinates: start + filtered middle + end
                        const finalCoordinates: [number, number][] = [
                            startPoint,
                        ];

                        // Add filtered coordinates (excluding start and end if they're in the list)
                        filteredCoordinates.forEach(
                            (coord: [number, number]) => {
                                const [lat, lng] = coord;
                                // Skip if it's too close to start or end point
                                const isStart =
                                    Math.abs(lat - startPoint[0]) < 0.001 &&
                                    Math.abs(lng - startPoint[1]) < 0.001;
                                const isEnd =
                                    Math.abs(lat - endPoint[0]) < 0.001 &&
                                    Math.abs(lng - endPoint[1]) < 0.001;
                                if (!isStart && !isEnd) {
                                    finalCoordinates.push(coord);
                                }
                            },
                        );

                        finalCoordinates.push(endPoint);

                        // Create single route line from A to B
                        const routeLine = L.polyline(finalCoordinates, {
                            color: '#10b981',
                            weight: 6,
                            opacity: 0.8,
                        }).addTo(map);

                        routingControlRef.current = routeLine;

                        // Fit map to show the route, but constrain to Hinobaan bounds
                        const bounds = routeLine.getBounds();
                        const hinobaanBounds = L.latLngBounds(
                            [
                                HINOBAAN_BOUNDARY.bounds.south,
                                HINOBAAN_BOUNDARY.bounds.west,
                            ],
                            [
                                HINOBAAN_BOUNDARY.bounds.north,
                                HINOBAAN_BOUNDARY.bounds.east,
                            ],
                        );
                        // Constrain bounds to Hinobaan
                        const constrainedBounds = L.latLngBounds(
                            [
                                Math.max(
                                    bounds.getSouth(),
                                    hinobaanBounds.getSouth(),
                                ),
                                Math.max(
                                    bounds.getWest(),
                                    hinobaanBounds.getWest(),
                                ),
                            ],
                            [
                                Math.min(
                                    bounds.getNorth(),
                                    hinobaanBounds.getNorth(),
                                ),
                                Math.min(
                                    bounds.getEast(),
                                    hinobaanBounds.getEast(),
                                ),
                            ],
                        );
                        map.fitBounds(constrainedBounds.pad(0.1));
                    } else {
                        throw new Error('No route found from OSRM');
                    }
                } catch (error) {
                    console.error('Error fetching route from OSRM:', error);
                    // Fallback: Try using leaflet-routing-machine if available (adds L.routing)
                    try {
                        await import('leaflet-routing-machine');
                        const routing = (
                            L as {
                                routing?: {
                                    control: (opts?: object) => L.Control;
                                    osrmv1: (opts?: {
                                        serviceUrl?: string;
                                        profile?: string;
                                    }) => object;
                                };
                            }
                        ).routing;
                        if (routing?.control && routing?.osrmv1) {
                            const router = routing.osrmv1({
                                serviceUrl: 'https://router.project-osrm.org',
                                profile: 'driving',
                            });
                            const routingControl = routing.control({
                                waypoints: [
                                    L.latLng(
                                        pickupLocation.lat,
                                        pickupLocation.lng,
                                    ),
                                    L.latLng(destination.lat, destination.lng),
                                ],
                                router: router,
                                routeWhileDragging: false,
                                showAlternatives: false,
                                addWaypoints: false,
                                fitSelectedRoutes: true,
                                lineOptions: {
                                    styles: [
                                        {
                                            color: '#10b981',
                                            opacity: 0.8,
                                            weight: 6,
                                        },
                                    ],
                                },
                                createMarker: () => null,
                            });

                            routingControl.addTo(map);
                            routingControlRef.current = routingControl;
                        } else {
                            throw new Error('Routing library not available');
                        }
                    } catch (routingError) {
                        console.error(
                            'Error using routing library:',
                            routingError,
                        );
                        // Final fallback: draw a simple line
                        const polyline = L.polyline(
                            [
                                [pickupLocation.lat, pickupLocation.lng],
                                [destination.lat, destination.lng],
                            ],
                            {
                                color: '#10b981',
                                weight: 5,
                                opacity: 0.8,
                                dashArray: '10, 5',
                            },
                        ).addTo(map);
                        routingControlRef.current = polyline;
                    }
                }
            } catch (error) {
                console.error('Error initializing map:', error);
            }
        };

        initializeMap();

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                // Remove route line/control
                if (routingControlRef.current) {
                    if (routingControlRef.current instanceof L.Control) {
                        mapInstanceRef.current.removeControl(
                            routingControlRef.current,
                        );
                    } else if (routingControlRef.current instanceof L.Layer) {
                        mapInstanceRef.current.removeLayer(
                            routingControlRef.current,
                        );
                    }
                    routingControlRef.current = null;
                }

                // Remove any orphaned route polylines (cleanup any duplicates)
                mapInstanceRef.current.eachLayer((layer) => {
                    const opts = layer.options as L.PolylineOptions;
                    if (
                        layer instanceof L.Polyline &&
                        opts.color === '#10b981'
                    ) {
                        mapInstanceRef.current!.removeLayer(layer);
                    }
                });

                // Remove markers
                if (pickupMarkerRef.current) {
                    mapInstanceRef.current.removeLayer(pickupMarkerRef.current);
                    pickupMarkerRef.current = null;
                }
                if (destinationMarkerRef.current) {
                    mapInstanceRef.current.removeLayer(
                        destinationMarkerRef.current,
                    );
                    destinationMarkerRef.current = null;
                }
            }
        };
    }, [pickupLocation, destination]);

    if (!pickupLocation || !destination) {
        return (
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <MapIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>Select pickup and destination to view route</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-6 overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <MapIcon className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
                    Route Map
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Visual route from pickup to destination
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div
                    ref={mapRef}
                    className="h-64 w-full rounded-b-lg sm:h-96"
                />
            </CardContent>
        </Card>
    );
};

// Step 1: Ride Details Component (Simplified - removed personal info)
interface Step1RideDetailsProps {
    formData: RideFormData;
    setFormData: (data: RideFormData) => void;
    user: UserData;
}

const Step1RideDetails = ({ formData, setFormData }: Step1RideDetailsProps) => {
    const [passengers, setPassengers] = useState(formData.passengerCount || 1);

    const handlePassengerChange = (type: 'increment' | 'decrement') => {
        const minPassengers = formData.rideType === 'group' ? 2 : 1;
        const newCount =
            type === 'increment'
                ? Math.min(passengers + 1, 6)
                : Math.max(passengers - 1, minPassengers);

        setPassengers(newCount);
        setFormData({ ...formData, passengerCount: newCount });
    };

    return (
        <div className="space-y-5">
            <div>
                <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                    Select Ride Type
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {RIDE_TYPES.map((ride) => {
                        const Icon = ride.icon;
                        const isSelected = formData.rideType === ride.id;

                        return (
                            <button
                                key={ride.id}
                                onClick={() => {
                                    const newPassengerCount =
                                        ride.id === 'group' ? 2 : 1;
                                    setPassengers(newPassengerCount);
                                    setFormData({
                                        ...formData,
                                        rideType: ride.id,
                                        passengerCount: newPassengerCount,
                                    });
                                }}
                                className={`rounded-lg border-2 p-3 text-left transition-all duration-200 hover:shadow-md ${
                                    isSelected
                                        ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500/20 dark:bg-emerald-500/10'
                                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-emerald-700 dark:hover:bg-gray-800/50'
                                } `}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className={`rounded-lg p-2 transition-colors ${isSelected ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-gray-100 dark:bg-gray-800'}`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-0.5 flex items-center justify-between">
                                            <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                {ride.name}
                                            </h4>
                                            {isSelected && (
                                                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                                            )}
                                        </div>
                                        <p className="mb-1 line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
                                            {ride.description}
                                        </p>
                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            ₱{ride.per5KmRate} for first 5km
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <Separator className="my-4" />

            <div>
                <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                    Passenger Details
                </h3>
                <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                        <Label className="mb-3 block text-sm font-semibold text-gray-900 dark:text-white">
                            Number of Passengers
                        </Label>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        handlePassengerChange('decrement')
                                    }
                                    className="h-9 w-9 border-2 border-gray-300 transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:border-gray-700 dark:hover:bg-emerald-500/10"
                                >
                                    <MinusCircle className="h-4 w-4" />
                                </Button>
                                <div className="w-16 text-center">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {passengers}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        handlePassengerChange('increment')
                                    }
                                    className="h-9 w-9 border-2 border-gray-300 transition-colors hover:border-emerald-500 hover:bg-emerald-50 dark:border-gray-700 dark:hover:bg-emerald-500/10"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {passengers === 1
                                        ? '1 passenger'
                                        : `${passengers} passengers`}
                                </div>
                                <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                                    Max 6 passengers per ride
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label
                                htmlFor="specialInstructions"
                                className="text-sm font-semibold text-gray-900 dark:text-white"
                            >
                                Special Instructions
                            </Label>
                            <Badge
                                variant="outline"
                                className="border-gray-300 text-xs font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400"
                            >
                                Optional
                            </Badge>
                        </div>
                        <Textarea
                            id="specialInstructions"
                            value={formData.specialInstructions || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    specialInstructions: e.target.value,
                                })
                            }
                            placeholder="E.g., waiting at specific landmark, need assistance with luggage, prefer a specific route, etc."
                            className="min-h-[100px] resize-none rounded-lg border-2 border-gray-300 bg-white transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900"
                            maxLength={500}
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Provide any special requests or instructions for
                                the driver
                            </p>
                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                {formData.specialInstructions?.length || 0}/500
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Location Selector Component (List View Only - No Map)
interface LocationSelectorProps {
    onLocationSelect: (location: LocationData) => void;
    currentLocation: LocationData | null;
    selectedLocation: LocationData | null;
    userLocation: LocationData | null;
}

const LocationSelector = ({
    onLocationSelect,
    selectedLocation,
}: LocationSelectorProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedBarangays, setExpandedBarangays] = useState<
        Record<string, boolean>
    >({});
    const [filteredBarangays, setFilteredBarangays] =
        useState<BarangayData[]>(HINOBAAN_BARANGAYS);
    const [selectedBarangayFilter, setSelectedBarangayFilter] = useState<
        string | null
    >(null);
    const [additionalAddressDetails, setAdditionalAddressDetails] =
        useState('');
    // Kept for future address parsing feature
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [baseAddress, setBaseAddress] = useState<string>('');
    const [customDestinations, setCustomDestinations] = useState<
        Record<string, string>
    >({});
    // When a barangay is expanded: which section is active (puroks | landmarks)
    const [barangaySectionTab, setBarangaySectionTab] = useState<
        Record<string, 'puroks' | 'landmarks'>
    >({});
    const groupedLandmarks = groupLandmarksByBarangayAndPurok();

    // Update base address when a new location is selected (not from manual input)
    useEffect(() => {
        if (selectedLocation && !additionalAddressDetails) {
            // Check if address looks like it has user input prepended
            // Standard addresses start with location name, landmark name, or purok name
            const locationName =
                selectedLocation.name || selectedLocation.barangay || '';
            const startsWithLocation =
                selectedLocation.address.startsWith(locationName);
            const hasStandardPattern = selectedLocation.address.match(
                /^[^,]+,\s*(Barangay|Hinobaan)/,
            );

            // If it starts with location name or matches standard pattern, it's the base address
            if (startsWithLocation || hasStandardPattern) {
                setBaseAddress(selectedLocation.address);
            } else {
                // Might have user input, try to extract base address
                const match = selectedLocation.address.match(/^[^,]+,\s*(.+)$/);
                if (match && match[1].includes('Hinobaan')) {
                    setBaseAddress(match[1]);
                } else {
                    setBaseAddress(selectedLocation.address);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedLocation?.name,
        selectedLocation?.barangay,
        selectedLocation?.purok,
    ]);

    // Filter barangays based on search and selected barangay filter
    useEffect(() => {
        let filtered = HINOBAAN_BARANGAYS;

        // Apply barangay filter first
        if (selectedBarangayFilter) {
            filtered = filtered.filter(
                (barangay) => barangay.id === selectedBarangayFilter,
            );
        }

        // Then apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((barangay) => {
                // Check barangay name
                if (barangay.name.toLowerCase().includes(query)) return true;

                // Check landmarks in this barangay
                const landmarksInBarangay = Object.values(
                    groupedLandmarks[barangay.id] || {},
                )
                    .flat()
                    .filter(
                        (landmark) =>
                            landmark.name.toLowerCase().includes(query) ||
                            landmark.purok?.toLowerCase().includes(query),
                    );

                // Check puroks in this barangay
                const puroksInBarangay = PUROKS.filter(
                    (p) =>
                        p.barangayId === barangay.id &&
                        p.name.toLowerCase().includes(query),
                );

                return (
                    landmarksInBarangay.length > 0 ||
                    puroksInBarangay.length > 0
                );
            });
        }

        setFilteredBarangays(filtered);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, selectedBarangayFilter]);

    const handleBarangaySelect = (barangay: BarangayData) => {
        const location: LocationData = {
            lat: barangay.lat,
            lng: barangay.lng,
            address: `${barangay.name}, Hinobaan, Negros Occidental`,
            name: barangay.name,
            barangay: barangay.name,
            type: 'barangay',
        };

        setAdditionalAddressDetails(''); // Reset manual input
        setBaseAddress(location.address); // Store base address
        setCustomDestinations((prev) => ({ ...prev, [barangay.id]: '' })); // Clear custom destination for this barangay
        onLocationSelect(location);
    };

    const handleLandmarkSelect = (landmark: LandmarkData) => {
        const location: LocationData = {
            lat: landmark.lat,
            lng: landmark.lng,
            address: `${landmark.name}, ${landmark.barangay}, Hinobaan, Negros Occidental`,
            name: landmark.name,
            barangay: landmark.barangay,
            purok: landmark.purok,
            type: 'landmark',
        };

        setAdditionalAddressDetails(''); // Reset manual input
        setBaseAddress(location.address); // Store base address
        // Clear custom destination for the barangay
        const barangayId = HINOBAAN_BARANGAYS.find(
            (b) => b.name === landmark.barangay,
        )?.id;
        if (barangayId) {
            setCustomDestinations((prev) => ({ ...prev, [barangayId]: '' }));
        }
        onLocationSelect(location);
    };

    const handlePurokSelect = (purok: PurokData, barangay: BarangayData) => {
        const location: LocationData = {
            lat: barangay.lat,
            lng: barangay.lng,
            address: `${purok.name}, ${barangay.name}, Hinobaan, Negros Occidental`,
            name: purok.name,
            barangay: barangay.name,
            purok: purok.name,
            type: 'purok',
        };

        setAdditionalAddressDetails(''); // Reset manual input
        setBaseAddress(location.address); // Store base address
        setCustomDestinations((prev) => ({ ...prev, [barangay.id]: '' })); // Clear custom destination for this barangay
        onLocationSelect(location);
    };

    const toggleBarangay = (barangayId: string) => {
        setExpandedBarangays((prev) => ({
            ...prev,
            [barangayId]: !prev[barangayId],
        }));
    };

    return (
        <div className="space-y-4">
            <div className="mb-1 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-2">
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 sm:text-lg dark:text-white">
                        Select Destination in Hinobaan
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                        Choose your destination from the options below
                    </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                    <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-xs font-semibold whitespace-nowrap text-emerald-600 dark:border-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                        {HINOBAAN_BARANGAYS.length} barangays
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-xs font-semibold whitespace-nowrap text-blue-600 dark:border-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    >
                        {POPULAR_LANDMARKS.length} landmarks
                    </Badge>
                </div>
            </div>

            {/* Search Bar */}
            <div>
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 sm:h-4 sm:w-4" />
                    <Input
                        placeholder="Search barangay, purok, or landmark..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-lg border-2 border-gray-300 bg-white pr-10 pl-10 text-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 sm:h-10 sm:text-base dark:border-gray-700 dark:bg-gray-900"
                    />
                    {searchQuery && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform rounded-lg hover:bg-gray-100 sm:h-7 sm:w-7 dark:hover:bg-gray-800"
                            onClick={() => setSearchQuery('')}
                        >
                            <X className="h-4 w-4 sm:h-3 sm:w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Barangay Filter Chips */}
            <div>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Label className="text-xs font-bold text-gray-900 sm:text-sm dark:text-white">
                            Filter by Barangay
                        </Label>
                        <Badge
                            variant="outline"
                            className="border-gray-300 bg-gray-100 text-xs font-semibold whitespace-nowrap dark:border-gray-700 dark:bg-gray-800"
                        >
                            {HINOBAAN_BARANGAYS.length} barangays
                        </Badge>
                    </div>
                    {selectedBarangayFilter && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setSelectedBarangayFilter(null);
                                setSearchQuery('');
                            }}
                            className="h-9 w-full border-gray-300 px-3 text-xs font-medium hover:bg-gray-50 sm:h-7 sm:w-auto sm:px-2.5 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            <X className="mr-1 h-3.5 w-3.5 sm:h-3 sm:w-3" />
                            Clear Filter
                        </Button>
                    )}
                </div>
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-2 sm:p-3 dark:border-gray-800 dark:bg-gray-900/50">
                    <ScrollArea className="w-full -mx-0.5 sm:mx-0">
                        <div
                            className="grid grid-cols-2 gap-2 pr-2 sm:grid-cols-3 sm:pr-4 md:grid-cols-4 lg:grid-cols-5"
                            style={{ maxHeight: 'clamp(140px, 40vh, 200px)' }}
                        >
                            {HINOBAAN_BARANGAYS.map((barangay) => {
                                const isSelected =
                                    selectedBarangayFilter === barangay.id;
                                const purokCount = PUROKS.filter(
                                    (p) => p.barangayId === barangay.id,
                                ).length;
                                const landmarkCount = Object.values(
                                    groupedLandmarks[barangay.id] || {},
                                ).flat().length;
                                const totalItems = purokCount + landmarkCount;

                                return (
                                    <button
                                        key={barangay.id}
                                        onClick={() => {
                                            setSelectedBarangayFilter(
                                                isSelected ? null : barangay.id,
                                            );
                                            setSearchQuery('');
                                            // Auto-expand the selected barangay
                                            if (!isSelected) {
                                                setExpandedBarangays(
                                                    (prev) => ({
                                                        ...prev,
                                                        [barangay.id]: true,
                                                    }),
                                                );
                                            }
                                        }}
                                        className={`relative flex min-h-14 flex-col justify-center rounded-lg px-2.5 py-2.5 text-left text-xs font-semibold transition-all sm:min-h-12 sm:px-3 ${
                                            isSelected
                                                ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-500/30'
                                                : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-500/10'
                                        } `}
                                    >
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <span className="flex-1 truncate text-left leading-tight font-bold">
                                                {barangay.name}
                                            </span>
                                            {totalItems > 0 && (
                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold whitespace-nowrap ${
                                                        isSelected
                                                            ? 'bg-white/30 text-white'
                                                            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                    } `}
                                                >
                                                    {totalItems}
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div className="absolute top-1.5 right-1.5">
                                                <CheckCircle className="h-3.5 w-3.5 text-white" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Barangays List with Expandable Sections */}
            <div className="space-y-3">
                {filteredBarangays.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
                        <LandmarkIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                        <h4 className="font-medium text-gray-900 dark:text-white">
                            No results found
                        </h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {selectedBarangayFilter
                                ? 'Try selecting a different barangay or clear the filter'
                                : 'Try a different search term'}
                        </p>
                        {selectedBarangayFilter && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setSelectedBarangayFilter(null);
                                    setSearchQuery('');
                                }}
                                className="mt-3"
                            >
                                Clear Filter
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredBarangays.map((barangay) => {
                        const isExpanded = expandedBarangays[barangay.id];
                        const barangayPuroks = PUROKS.filter(
                            (p) => p.barangayId === barangay.id,
                        );
                        const barangayLandmarks = Object.entries(
                            groupedLandmarks[barangay.id] || {},
                        );
                        const hasContent =
                            barangayPuroks.length > 0 ||
                            barangayLandmarks.length > 0;
                        const isFiltered =
                            selectedBarangayFilter === barangay.id;

                        return (
                            <div
                                key={barangay.id}
                                className={`overflow-hidden rounded-lg border bg-white transition-all dark:bg-gray-900 ${
                                    isFiltered
                                        ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                                        : 'border-gray-200 dark:border-gray-800'
                                } `}
                            >
                                {/* Barangay Header */}
                                <div
                                    onClick={() => toggleBarangay(barangay.id)}
                                    className={`flex w-full cursor-pointer items-start justify-between gap-2 p-3 text-left transition-colors sm:items-center sm:gap-0 sm:p-4 ${
                                        selectedLocation?.barangay ===
                                            barangay.name &&
                                        selectedLocation?.type === 'barangay'
                                            ? 'border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                            : isFiltered
                                              ? 'bg-emerald-50/30 hover:bg-emerald-50/50 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10'
                                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    } `}
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10 ${
                                                selectedLocation?.barangay ===
                                                    barangay.name &&
                                                selectedLocation?.type ===
                                                    'barangay'
                                                    ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                                    : isFiltered
                                                      ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                                      : 'bg-gray-100 dark:bg-gray-800'
                                            } `}
                                        >
                                            <MapPin
                                                className={`h-5 w-5 ${
                                                    selectedLocation?.barangay ===
                                                        barangay.name &&
                                                    selectedLocation?.type ===
                                                        'barangay'
                                                        ? 'text-emerald-500'
                                                        : isFiltered
                                                          ? 'text-emerald-500'
                                                          : 'text-gray-600 dark:text-gray-400'
                                                } `}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="truncate text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                                                    {barangay.name}
                                                </h4>
                                                {isFiltered && (
                                                    <Badge className="h-4 shrink-0 bg-emerald-500 px-1.5 py-0 text-[10px] text-white">
                                                        Filtered
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    👥{' '}
                                                    {barangay.population?.toLocaleString()}{' '}
                                                    • 📏 {barangay.area} km²
                                                </p>
                                                {hasContent && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                                        •{' '}
                                                        {barangayPuroks.length}{' '}
                                                        purok
                                                        {barangayPuroks.length !==
                                                        1
                                                            ? 's'
                                                            : ''}{' '}
                                                        •{' '}
                                                        {
                                                            Object.values(
                                                                groupedLandmarks[
                                                                    barangay.id
                                                                ] || {},
                                                            ).flat().length
                                                        }{' '}
                                                        landmark
                                                        {Object.values(
                                                            groupedLandmarks[
                                                                barangay.id
                                                            ] || {},
                                                        ).flat().length !== 1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                                        {selectedLocation?.barangay ===
                                            barangay.name &&
                                            selectedLocation?.type ===
                                                'barangay' && (
                                                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                                            )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBarangaySelect(barangay);
                                                // Auto-expand to show custom destination
                                                if (!isExpanded) {
                                                    setExpandedBarangays(
                                                        (prev) => ({
                                                            ...prev,
                                                            [barangay.id]: true,
                                                        }),
                                                    );
                                                }
                                            }}
                                            className="h-8 border-emerald-300 px-3 text-xs whitespace-nowrap text-emerald-600 hover:bg-emerald-50 sm:h-7 sm:px-2 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                                        >
                                            Select
                                        </Button>
                                        <div
                                            className={`hidden sm:block ${isFiltered ? 'text-emerald-500' : 'text-gray-400'} `}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Custom Destination - Shows when barangay is selected */}
                                {selectedLocation?.barangay === barangay.name &&
                                    selectedLocation?.type === 'barangay' && (
                                        <div className="border-t border-emerald-200 bg-emerald-50/50 p-3 sm:p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                                            <div className="mb-3 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 shrink-0 text-purple-500" />
                                                <h5 className="text-xs font-semibold text-gray-900 sm:text-sm dark:text-white">
                                                    Add Custom Destination
                                                </h5>
                                            </div>
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="E.g., House 123, School name, Building name, Street name..."
                                                    value={
                                                        customDestinations[
                                                            barangay.id
                                                        ] || ''
                                                    }
                                                    className="h-11 border-purple-300 bg-white text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 sm:h-10 sm:text-base dark:border-purple-700 dark:bg-gray-900"
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        setCustomDestinations(
                                                            (prev) => ({
                                                                ...prev,
                                                                [barangay.id]:
                                                                    value,
                                                            }),
                                                        );

                                                        if (value.trim()) {
                                                            const location: LocationData =
                                                                {
                                                                    lat: barangay.lat,
                                                                    lng: barangay.lng,
                                                                    address: `${value.trim()}, ${barangay.name}, Hinobaan, Negros Occidental`,
                                                                    name: value.trim(),
                                                                    barangay:
                                                                        barangay.name,
                                                                    type: 'custom',
                                                                };
                                                            setAdditionalAddressDetails(
                                                                '',
                                                            );
                                                            setBaseAddress(
                                                                `${barangay.name}, Hinobaan, Negros Occidental`,
                                                            );
                                                            onLocationSelect(
                                                                location,
                                                            );
                                                        } else {
                                                            // If input is cleared, restore barangay selection
                                                            handleBarangaySelect(
                                                                barangay,
                                                            );
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                                <p className="px-1 text-xs text-gray-500 dark:text-gray-500">
                                                    Enter your specific address
                                                    within {barangay.name}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div
                                        className={`space-y-4 border-t p-4 transition-all ${
                                            isFiltered
                                                ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                                                : 'border-gray-200 dark:border-gray-800'
                                        } `}
                                    >
                                        {/* Tab bar: Puroks | Landmarks (styled like General / Landing Page) */}
                                        {(barangayPuroks.length > 0 || barangayLandmarks.length > 0) && (
                                            <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-100/60 p-1 dark:border-gray-700 dark:bg-gray-800/60">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setBarangaySectionTab((prev) => ({
                                                            ...prev,
                                                            [barangay.id]: 'puroks',
                                                        }))
                                                    }
                                                    className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:gap-2 sm:px-3 ${
                                                        (barangaySectionTab[barangay.id] ?? 'puroks') === 'puroks'
                                                            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                                    }`}
                                                >
                                                    <Pin className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">Puroks</span>
                                                    {barangayPuroks.length > 0 && (
                                                        <span className="ml-0.5 shrink-0 text-xs opacity-80">
                                                            {barangayPuroks.length}
                                                        </span>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setBarangaySectionTab((prev) => ({
                                                            ...prev,
                                                            [barangay.id]: 'landmarks',
                                                        }))
                                                    }
                                                    className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:gap-2 sm:px-3 ${
                                                        barangaySectionTab[barangay.id] === 'landmarks'
                                                            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                                                    }`}
                                                >
                                                    <LandmarkIcon className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">Landmarks</span>
                                                    {Object.values(groupedLandmarks[barangay.id] || {}).flat().length > 0 && (
                                                        <span className="ml-0.5 shrink-0 text-xs opacity-80">
                                                            {Object.values(groupedLandmarks[barangay.id] || {}).flat().length}
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Puroks Section - visible when Puroks tab is active */}
                                        {barangayPuroks.length > 0 && (barangaySectionTab[barangay.id] ?? 'puroks') === 'puroks' && (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                    {barangayPuroks.map(
                                                        (purok) => (
                                                            <button
                                                                key={purok.id}
                                                                onClick={() =>
                                                                    handlePurokSelect(
                                                                        purok,
                                                                        barangay,
                                                                    )
                                                                }
                                                                className={`rounded-lg border p-2.5 text-left transition-all hover:shadow-sm sm:p-3 ${
                                                                    selectedLocation?.purok ===
                                                                        purok.name &&
                                                                    selectedLocation?.barangay ===
                                                                        barangay.name
                                                                        ? 'border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-500/20 dark:bg-blue-500/10'
                                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-blue-700 dark:hover:bg-gray-800/50'
                                                                } `}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                                                        <div
                                                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                                                selectedLocation?.purok ===
                                                                                    purok.name &&
                                                                                selectedLocation?.barangay ===
                                                                                    barangay.name
                                                                                    ? 'bg-blue-100 dark:bg-blue-500/20'
                                                                                    : 'bg-gray-100 dark:bg-gray-800'
                                                                            } `}
                                                                        >
                                                                            <Pin
                                                                                className={`h-4 w-4 ${
                                                                                    selectedLocation?.purok ===
                                                                                        purok.name &&
                                                                                    selectedLocation?.barangay ===
                                                                                        barangay.name
                                                                                        ? 'text-blue-500'
                                                                                        : 'text-gray-600 dark:text-gray-400'
                                                                                } `}
                                                                            />
                                                                        </div>
                                                                        <span className="truncate text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                                                                            {
                                                                                purok.name
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {selectedLocation?.purok ===
                                                                        purok.name &&
                                                                        selectedLocation?.barangay ===
                                                                            barangay.name && (
                                                                            <CheckCircle className="h-4 w-4 shrink-0 text-blue-500" />
                                                                        )}
                                                                </div>
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Landmarks Section - visible when Landmarks tab is active */}
                                        {barangaySectionTab[barangay.id] === 'landmarks' && (
                                            barangayLandmarks.length > 0 ? (
                                            <div className="space-y-3">
                                                <div className="space-y-3">
                                                    {barangayLandmarks.map(
                                                        ([
                                                            purok,
                                                            landmarks,
                                                        ]) => (
                                                            <div
                                                                key={`${barangay.id}-${purok}`}
                                                                className="space-y-2"
                                                            >
                                                                {purok !==
                                                                    'General' && (
                                                                    <h6 className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold tracking-wide text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-400">
                                                                        {purok}
                                                                    </h6>
                                                                )}
                                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                                    {landmarks.map(
                                                                        (
                                                                            landmark,
                                                                        ) => {
                                                                            const Icon =
                                                                                landmark.icon;
                                                                            const isSelected =
                                                                                selectedLocation?.name ===
                                                                                landmark.name;

                                                                            return (
                                                                                <button
                                                                                    key={`${barangay.id}-${purok}-${landmark.name}`}
                                                                                    onClick={() =>
                                                                                        handleLandmarkSelect(
                                                                                            landmark,
                                                                                        )
                                                                                    }
                                                                                    className={`rounded-lg border p-2.5 text-left transition-all hover:shadow-sm sm:p-3 ${
                                                                                        isSelected
                                                                                            ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/20 dark:bg-emerald-500/10'
                                                                                            : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 dark:border-gray-800 dark:hover:border-emerald-700 dark:hover:bg-gray-800/50'
                                                                                    } `}
                                                                                >
                                                                                    <div className="flex items-center justify-between gap-2">
                                                                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                                                                            <div
                                                                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                                                                    isSelected
                                                                                                        ? 'bg-emerald-100 dark:bg-emerald-500/20'
                                                                                                        : 'bg-gray-100 dark:bg-gray-800'
                                                                                                } `}
                                                                                            >
                                                                                                <Icon
                                                                                                    className={`h-4 w-4 ${
                                                                                                        isSelected
                                                                                                            ? 'text-emerald-500'
                                                                                                            : 'text-gray-600 dark:text-gray-400'
                                                                                                    } `}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="min-w-0 flex-1">
                                                                                                <span className="block truncate text-xs font-medium text-gray-900 sm:text-sm dark:text-white">
                                                                                                    {
                                                                                                        landmark.name
                                                                                                    }
                                                                                                </span>
                                                                                                <span className="block truncate text-[10px] text-gray-600 capitalize sm:text-xs dark:text-gray-400">
                                                                                                    {
                                                                                                        landmark.type
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                        </div>
                                                                                        {isSelected && (
                                                                                            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                                                                                        )}
                                                                                    </div>
                                                                                </button>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
                                                    <LandmarkIcon className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">No landmarks in this barangay</p>
                                                </div>
                                            )
                                        )}

                                        {/* Custom Destination Section */}
                                        <div className="space-y-3 border-t border-gray-200 pt-2 dark:border-gray-800">
                                            <div className="flex items-center justify-between">
                                                <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    <MapPin className="h-4 w-4 text-purple-500" />
                                                    Custom Destination
                                                </h5>
                                            </div>
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="E.g., House 123, School name, Building name..."
                                                    value={
                                                        customDestinations[
                                                            barangay.id
                                                        ] || ''
                                                    }
                                                    className="h-10 border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-900"
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        setCustomDestinations(
                                                            (prev) => ({
                                                                ...prev,
                                                                [barangay.id]:
                                                                    value,
                                                            }),
                                                        );

                                                        if (value.trim()) {
                                                            const location: LocationData =
                                                                {
                                                                    lat: barangay.lat,
                                                                    lng: barangay.lng,
                                                                    address: `${value.trim()}, ${barangay.name}, Hinobaan, Negros Occidental`,
                                                                    name: value.trim(),
                                                                    barangay:
                                                                        barangay.name,
                                                                    type: 'custom',
                                                                };
                                                            setAdditionalAddressDetails(
                                                                '',
                                                            );
                                                            setBaseAddress(
                                                                `${barangay.name}, Hinobaan, Negros Occidental`,
                                                            );
                                                            onLocationSelect(
                                                                location,
                                                            );
                                                        } else {
                                                            // If input is cleared, restore barangay selection
                                                            handleBarangaySelect(
                                                                barangay,
                                                            );
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.currentTarget.blur();
                                                        }
                                                    }}
                                                />
                                                <p className="px-1 text-xs text-gray-500 dark:text-gray-500">
                                                    Enter a custom address
                                                    within {barangay.name}{' '}
                                                    (house, school, building,
                                                    etc.)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Step 2: Location Selection Component (List View Only)
interface Step2LocationProps {
    formData: RideFormData;
    setFormData: (data: RideFormData) => void;
    userLocation: LocationData | null;
    savedPlaces?: SavedPlace[];
}

const Step2Location = ({
    formData,
    setFormData,
    userLocation,
    savedPlaces = [],
}: Step2LocationProps) => {
    const getPlaceIcon = (type: string) => {
        switch (type) {
            case 'home':
                return Home;
            case 'school':
                return School;
            case 'work':
                return Building;
            default:
                return MapPin;
        }
    };

    const handleSavedPlaceSelect = (place: SavedPlace) => {
        // Convert saved place to LocationData format
        if (place.latitude && place.longitude) {
            const locationData: LocationData = {
                lat: place.latitude,
                lng: place.longitude,
                address: place.address,
                name: place.name,
                barangay: place.barangay || undefined,
                purok: place.purok || undefined,
                type: place.type,
            };
            setFormData({ ...formData, destination: locationData });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-4 text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
                    Current Location
                </h3>
                <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start gap-3 sm:items-center">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12 dark:bg-emerald-500/20">
                                <Navigation2 className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="warp-break-words text-sm leading-relaxed font-medium text-gray-900 sm:text-base dark:text-white">
                                    {userLocation?.address ||
                                        'Getting your location...'}
                                </p>
                                <p className="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                    Your pickup location
                                </p>
                            </div>
                            <Badge className="shrink-0 bg-emerald-500 text-xs whitespace-nowrap text-white sm:text-sm">
                                Auto-detected
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-6" />

            {/* Quick Select Saved Places */}
            {savedPlaces.length > 0 && (
                <div className="mb-6">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
                            <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                            <span className="truncate">Quick Select</span>
                        </h3>
                        <Badge variant="outline" className="shrink-0 text-xs">
                            {savedPlaces.length} saved
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                        {savedPlaces.map((place) => {
                            const IconComponent = getPlaceIcon(place.type);
                            const isSelected =
                                formData.destination?.address === place.address;

                            return (
                                <Button
                                    key={place.id}
                                    variant="outline"
                                    onClick={() =>
                                        handleSavedPlaceSelect(place)
                                    }
                                    className={`flex h-auto flex-col items-start gap-2 p-3 transition-all ${
                                        isSelected
                                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 dark:bg-emerald-500/10'
                                            : 'hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5'
                                    }`}
                                >
                                    <div className="flex w-full items-center gap-2">
                                        <div
                                            className={`rounded-lg p-1.5 ${
                                                isSelected
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                        >
                                            <IconComponent className="h-3.5 w-3.5" />
                                        </div>
                                        <span
                                            className={`truncate text-sm font-semibold ${
                                                isSelected
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : ''
                                            }`}
                                        >
                                            {place.name}
                                        </span>
                                    </div>
                                    <p className="line-clamp-2 w-full text-left text-xs text-muted-foreground">
                                        {place.barangay &&
                                        !place.address.includes(
                                            'Negros Occidental',
                                        )
                                            ? `${place.address}, ${place.barangay}, Hinobaan, Negros Occidental`
                                            : place.address}
                                    </p>
                                    <span className="w-full text-left text-xs font-medium text-muted-foreground">
                                        {place.type === 'home'
                                            ? 'Home'
                                            : place.type === 'school'
                                              ? 'School'
                                              : place.type === 'work'
                                                ? 'Work'
                                                : 'Other'}
                                    </span>
                                    {isSelected && (
                                        <Badge className="w-full justify-center bg-emerald-500 text-xs text-white">
                                            Selected
                                        </Badge>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            <Separator className="my-6" />

            <div>
                <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Select Destination
                    </h3>
                    <Badge
                        variant="outline"
                        className="bg-emerald-50 text-xs text-emerald-600 sm:text-sm dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                        Service Area: All 13 Barangays
                    </Badge>
                </div>

                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <MapPin className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
                            Hinobaan Destination Selector
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Browse through Hinobaan's 13 barangays, puroks, and
                            landmarks to select your destination
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="p-4 sm:p-6">
                            <LocationSelector
                                onLocationSelect={(location) =>
                                    setFormData({
                                        ...formData,
                                        destination: location,
                                    })
                                }
                                currentLocation={userLocation}
                                selectedLocation={formData.destination}
                                userLocation={userLocation}
                            />
                        </div>
                    </CardContent>
                </Card>

                {formData.destination && (
                    <Card className="mt-6 border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex w-full min-w-0 flex-1 items-start gap-2 sm:gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12 dark:bg-emerald-500/20">
                                        <TargetIcon className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="w-full min-w-0 flex-1">
                                        <p
                                            className="warp-break-words text-xs leading-relaxed font-medium text-gray-900 sm:text-sm md:text-base dark:text-white"
                                            style={{
                                                wordBreak: 'break-word',
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {formData.destination.barangay &&
                                            !formData.destination.address.includes(
                                                'Negros Occidental',
                                            )
                                                ? `${formData.destination.address}, ${formData.destination.barangay}, Hinobaan, Negros Occidental`
                                                : formData.destination.address}
                                        </p>
                                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 px-2 py-1 text-xs sm:px-2.5 sm:py-1"
                                            >
                                                {formData.destination.type ===
                                                'home'
                                                    ? '🏠 Home'
                                                    : formData.destination
                                                            .type === 'school'
                                                      ? '🏫 School'
                                                      : formData.destination
                                                              .type === 'work'
                                                        ? '🏢 Work'
                                                        : formData.destination
                                                                .type ===
                                                            'other'
                                                          ? '📍 Other'
                                                          : formData.destination
                                                                  .type ===
                                                              'landmark'
                                                            ? '🏛️ Landmark'
                                                            : formData
                                                                    .destination
                                                                    .type ===
                                                                'barangay'
                                                              ? '📍 Barangay'
                                                              : formData
                                                                      .destination
                                                                      .type ===
                                                                  'purok'
                                                                ? '📌 Purok'
                                                                : '🏠 Address'}
                                            </Badge>
                                            {formData.destination.purok && (
                                                <Badge
                                                    variant="outline"
                                                    className="shrink-0 bg-blue-50 px-2 py-1 text-xs text-blue-600 sm:px-2.5 dark:bg-blue-500/10 dark:text-blue-400"
                                                >
                                                    {formData.destination.purok}
                                                </Badge>
                                            )}
                                            {formData.destination.barangay && (
                                                <Badge
                                                    variant="outline"
                                                    className="max-w-full bg-emerald-50 px-2 py-1 text-xs text-emerald-600 sm:px-2.5 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                    style={{
                                                        wordBreak: 'break-word',
                                                        overflowWrap:
                                                            'anywhere',
                                                    }}
                                                >
                                                    {
                                                        formData.destination
                                                            .barangay
                                                    }
                                                    , Hinobaan, Negros
                                                    Occidental
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            destination: null,
                                        });
                                    }}
                                    className="mt-2 h-10 w-full shrink-0 justify-center sm:mt-0 sm:h-9 sm:w-auto sm:justify-start"
                                >
                                    Change
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

// Step Navigation Component
interface StepNavigationProps {
    currentStep: number;
    onStepChange: (step: number) => void;
    stepsLocked?: boolean;
}

const StepNavigation = ({
    currentStep,
    onStepChange,
    stepsLocked = false,
}: StepNavigationProps) => {
    const steps = [
        { number: 1, label: 'Ride Details', icon: FileText },
        { number: 2, label: 'Location', icon: MapPin },
        { number: 3, label: 'Confirmation', icon: CheckCircle },
        { number: 4, label: 'Payment', icon: CreditCard },
    ];

    // Responsive: mobile (compact) and desktop (full) via CSS
    return (
        <div className="mb-4 sm:mb-6">
            {/* Mobile: compact step dots + short labels */}
            <div className="flex items-center justify-between px-1 sm:hidden">
                {steps.map((step) => {
                    const isActive = step.number === currentStep;
                    const isCompleted = step.number < currentStep;
                    return (
                        <div
                            key={step.number}
                            className="flex flex-1 flex-col items-center"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    !stepsLocked &&
                                    (isCompleted || isActive) &&
                                    onStepChange(step.number)
                                }
                                disabled={stepsLocked}
                                className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-xs font-semibold transition-all ${stepsLocked ? 'pointer-events-none cursor-default' : ''} ${
                                    isCompleted
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : isActive
                                          ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-500/30'
                                          : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                }`}
                            >
                                {isCompleted ? '✓' : step.number}
                            </button>
                            <span
                                className={`mt-1 text-center text-[10px] leading-tight font-medium ${isActive || isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                {step.label.split(' ')[0]}
                            </span>
                        </div>
                    );
                })}
            </div>
            {/* Desktop: full step labels and connectors */}
            <div className="hidden items-center justify-between px-2 sm:flex">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.number === currentStep;
                    const isCompleted = step.number < currentStep;

                    return (
                        <div
                            key={step.number}
                            className="flex flex-1 items-center"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    !stepsLocked &&
                                    (isCompleted || isActive) &&
                                    onStepChange(step.number)
                                }
                                className={`flex flex-1 flex-col items-center transition-all ${stepsLocked ? 'pointer-events-none cursor-default' : isCompleted ? 'cursor-pointer hover:opacity-90' : isActive ? '' : 'opacity-60'}`}
                                disabled={
                                    stepsLocked || (!isCompleted && !isActive)
                                }
                            >
                                <div
                                    className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                                        isCompleted
                                            ? 'bg-emerald-500 text-white shadow-sm'
                                            : isActive
                                              ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-500/20'
                                              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                    } `}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Icon className="h-4 w-4" />
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-semibold sm:text-sm ${isActive || isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'} `}
                                >
                                    {step.label}
                                </span>
                            </button>

                            {index < steps.length - 1 && (
                                <div
                                    className={`mx-3 h-0.5 flex-1 transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'} `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Main BookRide Component
export default function BookRide() {
    const props = usePage().props as unknown as SharedData & {
        activeBooking?: {
            id?: number;
            booking_id?: string;
            status?: string;
            driver?: unknown;
            review?: unknown;
        };
        savedPlaces?: SavedPlace[];
    };
    const { auth, activeBooking, savedPlaces = [] } = props;

    const user = auth.user as UserData;

    // State for wizard
    const [currentStep, setCurrentStep] = useState(() => {
        // If there's an active booking that is not completed (or completed without review), go directly to step 4
        // Otherwise, start from step 1 for a new booking
        if (activeBooking && activeBooking.status !== 'completed') {
            return 4;
        }
        // If activeBooking is completed, only go to step 4 if it hasn't been reviewed yet
        if (
            activeBooking &&
            activeBooking.status === 'completed' &&
            !activeBooking.review
        ) {
            return 4;
        }
        return 1;
    });
    const [formData, setFormData] = useState<RideFormData>({
        rideType: 'regular',
        passengerName: user?.name || '',
        passengerPhone: user?.phone || '',
        passengerCount: 1,
        specialInstructions: '',
        emergencyContactName: user?.emergency_contact?.name || '',
        emergencyContactPhone: user?.emergency_contact?.phone || '',
        emergencyContactRelationship:
            user?.emergency_contact?.relationship || '',
        destination: null,
    });
    const [userLocation, setUserLocation] = useState<LocationData | null>(null);
    // Kept for future error handling
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [locationError, setLocationError] = useState<string | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [shouldCheckProfile, setShouldCheckProfile] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    // Kept for future location permission handling
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [locationAccessDenied, setLocationAccessDenied] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [useSimulatedLocation, setUseSimulatedLocation] = useState(false);

    // Get passenger info status
    const getPassengerInfoStatus = () => {
        const emergencyContact = user?.emergency_contact || {};
        const hasEmergencyName = !!emergencyContact.name;
        const hasEmergencyPhone = !!emergencyContact.phone;

        const hasPhone = !!user?.phone;
        const hasAddress = !!user?.address;
        const hasEmergencyContact = hasEmergencyName && hasEmergencyPhone;
        const hasAvatar = !!user?.avatar;
        const isComplete =
            hasPhone && hasAddress && hasEmergencyContact && hasAvatar;

        return {
            hasPhone,
            hasAddress,
            hasEmergencyContact,
            hasAvatar,
            isComplete,
            missingFields: [] as string[],
        };
    };

    const infoStatus = getPassengerInfoStatus();

    // Check profile completion
    useEffect(() => {
        if (infoStatus.isComplete && shouldCheckProfile) {
            const timer = setTimeout(() => {
                setShouldCheckProfile(false);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [infoStatus.isComplete, shouldCheckProfile]);

    // Get user location
    useEffect(() => {
        if (infoStatus.isComplete) {
            const getLocation = async () => {
                setIsGettingLocation(true);
                setLocationError(null);
                setLocationAccessDenied(false);

                // For testing, use simulated location in Hinobaan
                const simulateLocation = useSimulatedLocation || false;

                if (simulateLocation) {
                    const simulatedLocation: LocationData = {
                        lat: 9.5989,
                        lng: 122.4676,
                        address:
                            'Barangay I (Poblacion), Hinobaan, Negros Occidental',
                        barangay: 'Barangay I (Poblacion)',
                    };

                    setUserLocation(simulatedLocation);
                    setIsGettingLocation(false);
                    return;
                }

                if (!navigator.geolocation) {
                    const fallbackLocation: LocationData = {
                        lat: HINOBAAN_BOUNDARY.center[0],
                        lng: HINOBAAN_BOUNDARY.center[1],
                        address:
                            'Barangay I (Poblacion), Hinobaan, Negros Occidental',
                        barangay: 'Barangay I (Poblacion)',
                    };

                    setUserLocation(fallbackLocation);
                    setLocationError(
                        'Geolocation not supported. Using central Hinobaan location.',
                    );
                    setIsGettingLocation(false);
                    return;
                }

                const options = {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                };

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        const clampedLat = Math.max(
                            HINOBAAN_BOUNDARY.bounds.south,
                            Math.min(HINOBAAN_BOUNDARY.bounds.north, latitude),
                        );
                        const clampedLng = Math.max(
                            HINOBAAN_BOUNDARY.bounds.west,
                            Math.min(HINOBAAN_BOUNDARY.bounds.east, longitude),
                        );

                        const isWithinHinobaan = checkIfInHinobaan(
                            latitude,
                            longitude,
                        );
                        const barangayName = getNearestBarangayName(
                            clampedLat,
                            clampedLng,
                        );

                        let address;
                        if (isWithinHinobaan) {
                            address = `${barangayName}, Hinobaan, Negros Occidental`;
                        } else {
                            address = `${barangayName}, Hinobaan, Negros Occidental`;
                            setLocationError(
                                `Your location has been adjusted to stay within Hinobaan municipality. Using nearest barangay: ${barangayName}`,
                            );
                        }

                        setUserLocation({
                            lat: clampedLat,
                            lng: clampedLng,
                            address,
                            barangay: barangayName,
                        });

                        setIsGettingLocation(false);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);

                        const fallbackLocation: LocationData = {
                            lat: HINOBAAN_BOUNDARY.center[0],
                            lng: HINOBAAN_BOUNDARY.center[1],
                            address:
                                'Barangay I (Poblacion), Hinobaan, Negros Occidental',
                            barangay: 'Barangay I (Poblacion)',
                        };

                        setUserLocation(fallbackLocation);
                        setLocationError(
                            'Using default Hinobaan location. You can manually select your location.',
                        );
                        setIsGettingLocation(false);
                    },
                    options,
                );
            };

            getLocation();
        }
    }, [infoStatus.isComplete, useSimulatedLocation]);

    // Calculate route when destination changes
    useEffect(() => {
        if (userLocation && formData.destination) {
            const distanceKm = calculateHinobaanDistance(
                userLocation.lat,
                userLocation.lng,
                formData.destination.lat,
                formData.destination.lng,
            );

            const durationMinutes = calculateHinobaanTravelTime(distanceKm);

            const { fare, totalFare } = calculateHinobaanFare(
                distanceKm,
                formData.rideType,
                formData.passengerCount,
            );

            const calculateETA = (durationMinutes: number) => {
                const now = new Date();
                now.setMinutes(now.getMinutes() + durationMinutes + 5);
                return now.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                });
            };

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRouteInfo({
                distance: `${distanceKm.toFixed(1)} km`,
                duration: `${durationMinutes} mins`,
                fare: `₱${fare}.00`,
                totalFare: `₱${totalFare}.00`,
                estimatedArrival: calculateETA(durationMinutes),
            });
        }
    }, [
        userLocation,
        formData.destination,
        formData.rideType,
        formData.passengerCount,
    ]);

    const handleNextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // handleBookRide is now handled in BookingConfirmation component

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Book a Ride', href: '/BookRide' },
    ];

    // Show profile restriction screen if profile is not complete
    if (!infoStatus.isComplete) {
        return (
            <PassengerLayout breadcrumbs={breadcrumbs}>
                <Head title="Complete Your Profile" />
                <ProfileRestrictionScreen
                    infoStatus={infoStatus}
                    user={
                        user
                            ? { ...user, avatar: user.avatar ?? undefined }
                            : undefined
                    }
                    onProfileCompleted={() => setShouldCheckProfile(true)}
                />
            </PassengerLayout>
        );
    }

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1RideDetails
                        formData={formData}
                        setFormData={setFormData}
                        user={user}
                    />
                );
            case 2:
                return (
                    <Step2Location
                        formData={formData}
                        setFormData={setFormData}
                        userLocation={userLocation}
                        savedPlaces={savedPlaces}
                    />
                );
            case 3:
                return (
                    <div className="space-y-6">
                        {/* Route Map */}
                        <RouteMap
                            pickupLocation={userLocation}
                            destination={formData.destination}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                            <Card className="col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <FileText className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
                                        Ride Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Ride Type
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                                            {RIDE_TYPES.find(
                                                (r) =>
                                                    r.id === formData.rideType,
                                            )?.name || 'Regular Ride'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Passengers
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 sm:text-base dark:text-white">
                                            {formData.passengerCount}{' '}
                                            {formData.passengerCount === 1
                                                ? 'person'
                                                : 'people'}
                                        </span>
                                    </div>
                                    {formData.specialInstructions && (
                                        <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
                                            <span className="mb-2 block text-sm text-gray-600 dark:text-gray-400">
                                                Special Instructions:
                                            </span>
                                            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-900 dark:bg-gray-900/50 dark:text-white">
                                                {formData.specialInstructions}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <MapPin className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
                                        Route Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 sm:space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-500 sm:h-8 sm:w-8 sm:text-sm dark:bg-emerald-500/20 dark:text-emerald-400">
                                                A
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Pickup Location
                                                </p>
                                                <p className="truncate text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                                    {userLocation?.address ||
                                                        'Loading...'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-xs font-bold text-emerald-500 sm:h-8 sm:w-8 sm:text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                B
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Destination
                                                </p>
                                                <p className="truncate text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                                    {formData.destination
                                                        ?.address ||
                                                        'Not selected'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {routeInfo && (
                            <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <RouteIcon className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
                                        Route Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-800 dark:bg-gray-900">
                                            <div className="mb-1 flex items-center gap-1 sm:mb-2 sm:gap-2">
                                                <Route className="h-3 w-3 text-emerald-500 sm:h-4 sm:w-4" />
                                                <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                                                    Distance
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                                                {routeInfo.distance}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                                Within Hinobaan
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-800 dark:bg-gray-900">
                                            <div className="mb-1 flex items-center gap-1 sm:mb-2 sm:gap-2">
                                                <Clock className="h-3 w-3 text-emerald-500 sm:h-4 sm:w-4" />
                                                <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                                                    Duration
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                                                {routeInfo.duration}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                                Approximate travel time
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-800 dark:bg-gray-900">
                                            <div className="mb-1 flex items-center gap-1 sm:mb-2 sm:gap-2">
                                                <Car className="h-3 w-3 text-emerald-500 sm:h-4 sm:w-4" />
                                                <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                                                    Base Fare
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                                                {routeInfo.fare}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                                For first 5km
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-800 dark:bg-gray-900">
                                            <div className="mb-1 flex items-center gap-1 sm:mb-2 sm:gap-2">
                                                <CreditCard className="h-3 w-3 text-emerald-500 sm:h-4 sm:w-4" />
                                                <span className="text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300">
                                                    Total Fare
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold text-gray-900 sm:text-2xl dark:text-white">
                                                {routeInfo.totalFare}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                                For {formData.passengerCount}{' '}
                                                {formData.passengerCount === 1
                                                    ? 'person'
                                                    : 'people'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 border-t border-gray-200 pt-4 sm:mt-6 sm:pt-6 dark:border-gray-800">
                                        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Estimated Arrival
                                                </p>
                                                <p className="text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                                                    Driver will arrive by:
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-emerald-500 sm:text-xl">
                                                    {routeInfo.estimatedArrival}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                );
            case 4:
                return (
                    <BookingConfirmation
                        key={activeBooking?.id ?? 'no-booking'}
                        formData={formData}
                        userLocation={userLocation}
                        routeInfo={routeInfo}
                        onBookingComplete={() => {
                            // This is now handled by the buttons in BookingConfirmation
                            // Keep for backward compatibility but buttons handle navigation
                        }}
                        onCancel={() => {
                            // Reset booking form to start fresh
                            localStorage.removeItem('activeBookingId');
                            localStorage.removeItem('activeBookingStatus');
                            setCurrentStep(1);
                            setFormData({
                                rideType: 'regular',
                                passengerName: user?.name || '',
                                passengerPhone: user?.phone || '',
                                passengerCount: 1,
                                specialInstructions: '',
                                emergencyContactName:
                                    user?.emergency_contact?.name || '',
                                emergencyContactPhone:
                                    user?.emergency_contact?.phone || '',
                                emergencyContactRelationship:
                                    user?.emergency_contact?.relationship || '',
                                destination: null,
                            });
                            setRouteInfo(null);
                            // Reload so server sends fresh props (activeBooking = null for cancelled)
                            router.reload();
                        }}
                    />
                );
            default:
                return null;
        }
    };

    // Check if step is valid
    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return true; // Only requires ride type and passenger count
            case 2:
                return formData.destination !== null;
            case 3:
                return routeInfo !== null;
            case 4:
                return true;
            default:
                return false;
        }
    };

    return (
        <PassengerLayout breadcrumbs={breadcrumbs}>
            <Head title="Book a Ride - Hinobaan Tricycle Service" />

            <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col overflow-x-hidden p-3 sm:p-6">
                {/* Header Banner */}
                <Card className="mb-4 overflow-hidden border-0 bg-linear-to-r from-emerald-500 to-emerald-600 shadow-sm sm:mb-6">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12">
                                    <Car className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                                </div>
                                <div>
                                    <h1 className="mb-0.5 text-lg font-bold text-white sm:text-xl">
                                        Book a Tricycle Ride
                                    </h1>
                                    <p className="text-xs text-white/95 sm:text-sm">
                                        Affordable rides within Hinobaan's 13
                                        barangays
                                    </p>
                                </div>
                            </div>
                            <Badge className="border-0 bg-white/25 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                                Step {currentStep} of 4
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Cancellation policy banner */}
                <Card className="mb-3 overflow-hidden border-0 bg-linear-to-r from-amber-500 to-amber-600 shadow-sm sm:mb-4">
                    <CardContent className="p-2.5 sm:p-3">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm sm:h-9 sm:w-9">
                                <AlertTriangle className="h-4 w-4 text-white sm:h-4 sm:w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs leading-snug text-white/95 sm:text-sm">
                                    <span className="font-semibold">
                                        Cancellation policy:
                                    </span>{' '}
                                    Cancelling while we search does not count.
                                    Only after a driver is assigned. After{' '}
                                    <strong>3 consecutive</strong> such
                                    cancellations, your account may be
                                    restricted.
                                </p>
                            </div>
                            <Badge className="shrink-0 border-0 bg-white/25 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md sm:text-xs">
                                Policy
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Wizard Navigation */}
                <StepNavigation
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                    stepsLocked={
                        !!(
                            activeBooking &&
                            (activeBooking.status === 'accepted' ||
                                activeBooking.status === 'in-progress') &&
                            activeBooking.driver
                        )
                    }
                />

                {/* Main Content */}
                <Card className="mb-4 flex-1 border-0 shadow-sm sm:mb-6">
                    <CardContent className="p-4 sm:p-5">
                        {isGettingLocation ? (
                            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:mb-6 sm:p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500 sm:h-5 sm:w-5" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-800 sm:text-base dark:text-blue-400">
                                            Getting Your Location
                                        </h4>
                                        <p className="mt-1 text-xs text-blue-700 sm:text-sm dark:text-blue-300">
                                            Please wait while we detect your
                                            location within Hinobaan...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {renderStepContent()}
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4 pb-2 sm:pt-3 sm:pb-0 dark:border-gray-800">
                    <div className="flex-1 sm:flex-none">
                        {currentStep > 1 && currentStep < 4 && (
                            <Button
                                variant="outline"
                                onClick={handlePrevStep}
                                className="h-11 w-full rounded-lg border-2 border-gray-300 px-4 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 sm:h-10 sm:w-auto sm:px-4 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                            >
                                <ChevronLeft className="mr-1.5 h-4 w-4 sm:h-4 sm:w-4" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
                        {currentStep < 4 ? (
                            <Button
                                onClick={handleNextStep}
                                disabled={!isStepValid()}
                                className="h-11 w-full rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-auto sm:px-5"
                            >
                                Continue
                                <ChevronRight className="ml-1.5 h-4 w-4 sm:h-4 sm:w-4" />
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}
