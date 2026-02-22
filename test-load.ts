import { db } from './src/lib/db/client';
import { calculateTRIMP, calculateSimpleLoad } from './src/lib/services/metrics.service';

async function run() {
    const acts = await db.query.activities.findMany({
        limit: 10,
        orderBy: (acts, { desc }) => [desc(acts.startDate)]
    });

    console.log("Recent Activities Load Comparison");
    console.log("---------------------------------");

    for (const a of acts) {
        let hr = "No HR stream";
        let streams = a.streamsPayload as any[];
        if (streams && Array.isArray(streams)) {
            const hasHr = streams.find(s => s.type === 'heartrate');
            if (hasHr) hr = "Has HR";
        }

        const simple = calculateSimpleLoad(a as any);
        const trimp = calculateTRIMP(a as any);

        console.log(`[${a.sportType}] ${a.name}`);
        console.log(`  Distance: ${a.distanceMeters ? (Number(a.distanceMeters) / 1000).toFixed(1) : 0}km | Time: ${Math.round(Number(a.movingTimeSeconds) / 60)}min`);
        console.log(`  Simple Load: ${simple}`);
        console.log(`  TRIMP Load:  ${trimp !== null ? trimp : 'N/A'} (${hr})`);
        console.log("---");
    }
}
run();
