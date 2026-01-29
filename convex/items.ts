import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("items").collect();
    },
});

export const getByIds = query({
    args: { ids: v.array(v.id("items")) },
    handler: async (ctx, args) => {
        const items = [];
        for (const id of args.ids) {
            const item = await ctx.db.get(id);
            if (item) {
                items.push(item);
            }
        }
        return items;
    },
});

export const getItemsByTimeslot = query({
    args: { timeslotId: v.id("timeslots") },
    handler: async (ctx, args) => {
        const items = await ctx.db.query("items").collect();
        // Filter items that have the timeslotId in their availableTimeslotIds
        return items.filter((item) =>
            item.availableTimeslotIds.includes(args.timeslotId)
        );
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        description: v.optional(v.string()),
        purchasePrice: v.number(),
        sellingPrice: v.number(),
        isAvailable: v.boolean(),
        availableTimeslotIds: v.array(v.id("timeslots")),
        imageUrl: v.optional(v.string()),
        imageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("items", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("items"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        sellingPrice: v.optional(v.number()),
        purchasePrice: v.optional(v.number()),
        availableTimeslotIds: v.optional(v.array(v.id("timeslots"))),
        isAvailable: v.optional(v.boolean()),
        imageUrl: v.optional(v.string()),
        imageStorageId: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});
