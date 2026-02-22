/**
 * Decodes a Google Maps encoded polyline string into an array of coordinates [latitude, longitude].
 * Based on the algorithm from Google Maps API.
 * 
 * @param str Encoded polyline string
 * @param precision Precision of the encoding (default 5 for standard Google Maps, some Strava is 5)
 * @returns Array of [latitude, longitude] arrays
 */
export function decodePolyline(str: string, precision: number = 5): [number, number][] {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates: [number, number][] = [];
    const shift = Math.pow(10, precision);

    while (index < str.length) {
        let b;
        let shiftCount = 0;
        let result = 0;
        do {
            b = str.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shiftCount;
            shiftCount += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shiftCount = 0;
        result = 0;
        do {
            b = str.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shiftCount;
            shiftCount += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        coordinates.push([lat / shift, lng / shift]);
    }

    return coordinates;
}
