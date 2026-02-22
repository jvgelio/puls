"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { decodePolyline } from "@/lib/utils/polyline";

// Dynamically import the Leaflet map component to prevent SSR "window is not defined" error
const Map = dynamic(() => import("./MapClient"), {
    ssr: false,
    loading: () => <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/20 animate-pulse rounded-md"><span className="text-muted-foreground text-sm">Carregando mapa...</span></div>
});

interface ActivityMapProps {
    polyline?: string;
}

export function ActivityMap({ polyline }: ActivityMapProps) {
    const [coordinates, setCoordinates] = useState<[number, number][]>([]);

    useEffect(() => {
        if (polyline) {
            try {
                const decoded = decodePolyline(polyline);
                if (decoded.length > 0) {
                    setCoordinates(decoded);
                }
            } catch (e) {
                console.error("Failed to decode polyline", e);
            }
        }
    }, [polyline]);

    if (!polyline) {
        return (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/10 rounded-md border border-dashed">
                <p className="text-muted-foreground text-sm">Nenhum percurso GPS disponível para esta atividade.</p>
            </div>
        );
    }

    return <Map coordinates={coordinates} />;
}
