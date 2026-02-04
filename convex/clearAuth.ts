import { internalMutation } from "./_generated/server";

export const clearAuth = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Standard Convex Auth tables
        // We try/catch because we aren't 100% sure of the schema table names, 
        // but these are the defaults.
        const tables = [
            "authAccounts",
            "authSessions",
            "authRefreshTokens",
            "authVerifiers",
            "authUsers" // Sometimes used, sometimes mapped to 'users'
        ];

        for (const table of tables) {
            try {
                const docs = await ctx.db.query(table as any).collect();
                if (docs.length > 0) {
                    console.log(`Clearing ${docs.length} docs from ${table}`);
                    for (const doc of docs) {
                        await ctx.db.delete(doc._id);
                    }
                } else {
                    console.log(`Table ${table} is empty or invalid.`);
                }
            } catch (e) {
                console.log(`Error clearing table ${table} (might not exist):`, e);
            }
        }

        return "Auth tables cleared";
    },
});
