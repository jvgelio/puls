import { db } from './src/lib/db/client';
import { getHeatmapData, getTrainingLoadTrend, getPersonalRecords } from './src/lib/services/metrics.service';

async function testPerformance() {
    const user = await db.query.users.findFirst();
    if (!user) {
        console.log("No user found.");
        return;
    }

    console.log(`Testing metrics for user ${user.id}...`);

    console.time("getHeatmapData (180 days)");
    await getHeatmapData(user.id, 180);
    console.timeEnd("getHeatmapData (180 days)");

    console.time("getTrainingLoadTrend (90 days)");
    await getTrainingLoadTrend(user.id, 90);
    console.timeEnd("getTrainingLoadTrend (90 days)");

    console.time("getPersonalRecords");
    await getPersonalRecords(user.id);
    console.timeEnd("getPersonalRecords");

    process.exit(0);
}

testPerformance().catch(console.error);
