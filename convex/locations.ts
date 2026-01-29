import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("locations").collect();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        address: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("locations", args);
    },
});
