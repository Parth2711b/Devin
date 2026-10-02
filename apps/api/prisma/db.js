import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from './contract.json' with { type: 'json' };
export const db = postgres({
    contractJson,
    url: process.env['DATABASE_URL'],
});
//# sourceMappingURL=db.js.map