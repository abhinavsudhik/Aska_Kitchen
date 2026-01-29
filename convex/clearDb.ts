import { internalMutation } from "./_generated/server";

export const clearAll = internalMutation({
    args: {},
    handler: async (ctx) => {
        const tables = ["users", "items", "locations", "timeslots", "orders"];

        for (const table of tables) {
            const documents = await ctx.db.query(table as any).collect();
            for (const doc of documents) {
                await ctx.db.delete(doc._id);
            }
        }

        console.log("Database cleared");
    },
});
