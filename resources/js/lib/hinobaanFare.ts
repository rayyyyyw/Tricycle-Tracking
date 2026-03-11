/**
 * Municipal Ordinance No. 2023-007 – Tricycle fare structure for Hinobaan.
 * General: P10.00 per 2 km (or fraction); P8.00 for SC, PWD, Students (20% discount).
 * Fixed routes override the general rule when origin/destination match.
 */

export type FareType = 'regular' | 'discounted';

/** Normalize string for matching (lowercase, trim). */
function n(s: string | undefined | null): string {
    return (s ?? '').toLowerCase().trim();
}

/** True if origin is Poblacion (Barangay I or II). */
export function isPoblacionOrigin(
    barangayName: string | undefined | null,
): boolean {
    const name = n(barangayName);
    return (
        name.includes('poblacion') ||
        name === 'barangay i' ||
        name === 'barangay ii'
    );
}

/** True if origin is Bacuyangan. */
export function isBacuyanganOrigin(
    barangayName: string | undefined | null,
): boolean {
    return n(barangayName) === 'bacuyangan';
}

/** Fixed route: from origin, to destination key, regular and discounted fare. */
interface FixedRoute {
    from: 'poblacion' | 'bacuyangan';
    /** Match against destination barangay name or purok/place name (normalized). */
    toKey: string;
    regular: number;
    discounted: number;
}

// Ordinance fixed routes. toKey is matched against destination barangay or purok/place (normalized).
const FIXED_ROUTES: FixedRoute[] = [
    // North bound (Poblacion Proper –)
    { from: 'poblacion', toKey: 'vasquez', regular: 15, discounted: 12 },
    { from: 'poblacion', toKey: 'baybay vasquez', regular: 20, discounted: 16 },
    { from: 'poblacion', toKey: 'ca-ag', regular: 20, discounted: 16 },
    { from: 'poblacion', toKey: 'nauhang', regular: 20, discounted: 16 },
    { from: 'poblacion', toKey: 'bacuyangan', regular: 20, discounted: 16 },
    { from: 'poblacion', toKey: 'olsa', regular: 30, discounted: 24 },
    // South bound (Poblacion)
    { from: 'poblacion', toKey: 'southbend', regular: 30, discounted: 24 },
    { from: 'poblacion', toKey: 'dalagumay', regular: 40, discounted: 32 },
    {
        from: 'poblacion',
        toKey: 'hospital site (ilco)',
        regular: 40,
        discounted: 32,
    },
    { from: 'poblacion', toKey: 'ilco', regular: 40, discounted: 32 },
    {
        from: 'poblacion',
        toKey: 'salvacion/port area',
        regular: 40,
        discounted: 32,
    },
    { from: 'poblacion', toKey: 'salvacion', regular: 40, discounted: 32 },
    { from: 'poblacion', toKey: 'port area', regular: 40, discounted: 32 },
    { from: 'poblacion', toKey: 'talacagay', regular: 40, discounted: 32 },
    {
        from: 'poblacion',
        toKey: 'talacagay (boundary)',
        regular: 50,
        discounted: 40,
    },
    { from: 'poblacion', toKey: 'pasil', regular: 40, discounted: 32 },
    { from: 'poblacion', toKey: 'sitio totong', regular: 40, discounted: 32 },
    { from: 'poblacion', toKey: 'totong', regular: 40, discounted: 32 },
    { from: 'poblacion', toKey: 'sitio obong', regular: 50, discounted: 40 },
    { from: 'poblacion', toKey: 'obong', regular: 50, discounted: 40 },
    // South & East (Poblacion)
    { from: 'poblacion', toKey: 'pecos', regular: 10, discounted: 8 },
    { from: 'poblacion', toKey: 'tompok', regular: 15, discounted: 12 },
    { from: 'poblacion', toKey: 'batilo', regular: 20, discounted: 16 },
    { from: 'poblacion', toKey: 'alim', regular: 23, discounted: 18 },
    { from: 'poblacion', toKey: 'asia', regular: 30, discounted: 24 },
    { from: 'poblacion', toKey: 'bulwangan', regular: 45, discounted: 36 },
    { from: 'poblacion', toKey: 'daug', regular: 60, discounted: 48 },
    { from: 'poblacion', toKey: 'culipapa', regular: 75, discounted: 60 },
    { from: 'poblacion', toKey: 'sangke', regular: 95, discounted: 76 },
    { from: 'poblacion', toKey: 'tayunan', regular: 20, discounted: 16 },
    { from: 'poblacion', toKey: 'san rafael', regular: 25, discounted: 20 },
    { from: 'poblacion', toKey: 'huyab-huyab', regular: 15, discounted: 12 },
    { from: 'poblacion', toKey: 'mahuyabhuyab', regular: 15, discounted: 12 },
    {
        from: 'poblacion',
        toKey: 'tsunami village',
        regular: 25,
        discounted: 20,
    },
    { from: 'poblacion', toKey: 'poroy', regular: 25, discounted: 20 },
    { from: 'poblacion', toKey: 'puroy', regular: 25, discounted: 20 },
    { from: 'poblacion', toKey: 'cansuguimban', regular: 30, discounted: 24 },
    { from: 'poblacion', toKey: 'alanaban', regular: 40, discounted: 32 },
    { from: 'poblacion', toKey: 'lumangog', regular: 30, discounted: 24 },
    { from: 'poblacion', toKey: 'po-ok', regular: 30, discounted: 24 },
    { from: 'poblacion', toKey: 'pook', regular: 30, discounted: 24 },
    // From Bacuyangan
    { from: 'bacuyangan', toKey: 'po-ok', regular: 30, discounted: 24 },
    { from: 'bacuyangan', toKey: 'pook', regular: 30, discounted: 24 },
    { from: 'bacuyangan', toKey: 'cpsu', regular: 30, discounted: 24 },
    { from: 'bacuyangan', toKey: 'batilo', regular: 40, discounted: 32 },
];

const GENERAL_PER_2KM_REGULAR = 10;
const GENERAL_PER_2KM_DISCOUNTED = 8;

/** Get destination keys to try: barangay name, purok, place name. */
function getDestinationKeys(
    destBarangay: string | undefined | null,
    destPurok: string | undefined | null,
    destName: string | undefined | null,
): string[] {
    const keys = new Set<string>();
    if (destBarangay) keys.add(n(destBarangay));
    if (destPurok) keys.add(n(destPurok));
    if (destName) keys.add(n(destName));
    return [...keys];
}

/** Resolve origin key for fixed-route lookup. */
function getOriginKey(
    originBarangay: string | undefined | null,
): 'poblacion' | 'bacuyangan' | null {
    if (isPoblacionOrigin(originBarangay)) return 'poblacion';
    if (isBacuyanganOrigin(originBarangay)) return 'bacuyangan';
    return null;
}

/**
 * Find fixed fare for route, if any.
 * Returns null if no fixed route matches.
 */
export function getFixedFare(
    originBarangay: string | undefined | null,
    destBarangay: string | undefined | null,
    destPurok: string | undefined | null,
    destName: string | undefined | null,
    isDiscounted: boolean,
): number | null {
    const from = getOriginKey(originBarangay);
    if (!from) return null;
    const destKeys = getDestinationKeys(destBarangay, destPurok, destName);
    for (const route of FIXED_ROUTES) {
        if (route.from !== from) continue;
        const match = destKeys.some(
            (k) =>
                k === route.toKey ||
                k.includes(route.toKey) ||
                route.toKey.includes(k),
        );
        if (match) return isDiscounted ? route.discounted : route.regular;
    }
    return null;
}

/**
 * General fare: P10 per 2 km (or fraction), P8 for discounted.
 * Distance is rounded up to next 2 km for billing.
 */
export function getGeneralFare(
    distanceKm: number,
    isDiscounted: boolean,
): number {
    const per2Km = isDiscounted
        ? GENERAL_PER_2KM_DISCOUNTED
        : GENERAL_PER_2KM_REGULAR;
    const twoKmUnits = Math.ceil(Math.max(0, distanceKm) / 2);
    return twoKmUnits * per2Km;
}

export interface OrdinanceFareInput {
    originBarangay: string | undefined | null;
    destBarangay: string | undefined | null;
    destPurok: string | undefined | null;
    destName: string | undefined | null;
    distanceKm: number;
    isDiscounted: boolean;
    /** Number of passengers; total fare = per-person fare × passenger count. */
    passengerCount: number;
    /** Ride type: 'express' = direct ride, no pickup leg → apply discount. */
    rideType?: string;
}

/** Express premium: driver can't pick up other rides (direct trip), so fare is higher than regular. */
const EXPRESS_PREMIUM_PERCENT = 25;
/** Minimum per-person fare for first 5km: Express & Group ₱25, Night ₱30 (ordinance-based). */
const MIN_FARE_EXPRESS_GROUP = 25;
const MIN_FARE_NIGHT = 30;

/**
 * Compute fare per Municipal Ordinance: fixed route if matched, else general (P10/P8 per 2 km).
 * Ordinance fare is the per-person rate. Total = per-person fare × number of passengers.
 * Express/Group: minimum ₱25 per person for first 5km; Night: minimum ₱30 per person.
 * Express: premium (25% more) because tricycle can't pick up other rides on the way.
 */
export function calculateOrdinanceFare(input: OrdinanceFareInput): {
    fare: number;
    totalFare: number;
} {
    const {
        originBarangay,
        destBarangay,
        destPurok,
        destName,
        distanceKm,
        isDiscounted,
        passengerCount,
        rideType,
    } = input;

    const fixed = getFixedFare(
        originBarangay,
        destBarangay,
        destPurok,
        destName,
        isDiscounted,
    );
    let farePerPerson =
        fixed !== null ? fixed : getGeneralFare(distanceKm, isDiscounted);

    // Minimum per-person for first 5km by ride type (still ordinance-based)
    if (rideType === 'express' || rideType === 'group') {
        farePerPerson = Math.max(farePerPerson, MIN_FARE_EXPRESS_GROUP);
    } else if (rideType === 'night') {
        farePerPerson = Math.max(farePerPerson, MIN_FARE_NIGHT);
    }

    // Express/direct ride: driver can't take other passengers, so premium (more than regular)
    if (rideType === 'express') {
        farePerPerson = Math.round(
            farePerPerson * (1 + EXPRESS_PREMIUM_PERCENT / 100),
        );
    }

    // Total = per-person fare × number of passengers (stacks per person)
    const totalFare = farePerPerson * Math.max(1, passengerCount);

    return { fare: farePerPerson, totalFare };
}
