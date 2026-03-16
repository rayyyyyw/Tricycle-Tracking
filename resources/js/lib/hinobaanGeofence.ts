/**
 * Hinobaan municipality geofence.
 *
 * The polygon approximates the boundary of the 13 barangays of Hinobaan,
 * Negros Occidental.  The three border barangays are Talacagay (north),
 * Damutan (east) and Sangke (south).  A ~2 km buffer is added around the
 * outermost barangay center‐points so that normal road travel near the
 * edge does not trigger false positives.
 *
 * Coordinates are [lat, lng] pairs (Leaflet convention).
 */

// Convex‐hull of the 13 barangay centers + ~0.02° (~2.2 km) buffer,
// ordered counter‐clockwise (standard for geofence winding).
export const HINOBAAN_GEOFENCE: [number, number][] = [
    // — West coast (south → north) —
    [9.425, 122.445], // SW corner – south of Sangke, coast
    [9.460, 122.440], // W of Culipapa
    [9.500, 122.440], // W of Bulwangan
    [9.545, 122.440], // W of Alim / Po‑ok
    [9.575, 122.445], // W of Po‑ok
    [9.595, 122.445], // W of Barangay I
    [9.625, 122.445], // W of Bacuyangan
    // — North (west → east) —
    [9.660, 122.450], // NW – above Talacagay
    [9.660, 122.495], // N of Talacagay
    [9.650, 122.540], // NE – above San Rafael
    // — East (north → south) —
    [9.630, 122.580], // between San Rafael & Damutan
    [9.625, 122.645], // NE of Damutan
    [9.585, 122.645], // E of Damutan
    // — Southeast / South (east → west) —
    [9.520, 122.630], // between Damutan & Sangke
    [9.425, 122.610], // S of Sangke
    // closes back to first point automatically
];

/**
 * Ray‐casting point‐in‐polygon test.
 * Returns `true` when (lat, lng) is inside `HINOBAAN_GEOFENCE`.
 */
export function isInsideGeofence(
    lat: number,
    lng: number,
    polygon: [number, number][] = HINOBAAN_GEOFENCE,
): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [yi, xi] = polygon[i];
        const [yj, xj] = polygon[j];
        if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * Convenience: returns `true` when the point is **outside** the geofence.
 */
export function isOutsideGeofence(
    lat: number,
    lng: number,
    polygon: [number, number][] = HINOBAAN_GEOFENCE,
): boolean {
    return !isInsideGeofence(lat, lng, polygon);
}
