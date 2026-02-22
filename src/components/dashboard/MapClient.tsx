"use client";

import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";

interface MapClientProps {
    coordinates: [number, number][];
}

// Helper to auto-fit the bounds of the polyline
function MapBounds({ coordinates }: { coordinates: [number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, coordinates]);

    return null;
}

export default function MapClient({ coordinates }: MapClientProps) {
    if (coordinates.length === 0) return null;

    return (
        <div className="w-full h-full min-h-[400px] rounded-md overflow-hidden relative z-0">
            <MapContainer
                center={coordinates[0]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline
                    positions={coordinates}
                    pathOptions={{ color: "#ef4444", weight: 4, opacity: 0.8 }}
                />
                <MapBounds coordinates={coordinates} />
            </MapContainer>
        </div>
    );
}
