import { db } from './lib/db/client';
db.query.activities.findFirst().then(console.log).then(() => process.exit(0)).catch(console.error);
