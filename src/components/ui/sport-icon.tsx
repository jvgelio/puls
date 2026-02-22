import { Activity, Bike, Footprints, Waves, Dumbbell } from "lucide-react";

export function SportIcon({ sportType, className }: { sportType?: string | null, className?: string }) {
    if (!sportType) return <Activity className={className} />;
    const type = sportType.toLowerCase();

    if (type.includes("run")) return <Footprints className={className} />;
    if (type.includes("ride") || type.includes("cycling")) return <Bike className={className} />;
    if (type.includes("swim")) return <Waves className={className} />;
    if (type.includes("weight") || type.includes("workout")) return <Dumbbell className={className} />;

    return <Activity className={className} />;
}
