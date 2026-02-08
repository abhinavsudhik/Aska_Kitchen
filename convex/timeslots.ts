import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("timeslots").collect();
    },
});

export const getById = query({
    args: { id: v.id("timeslots") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        label: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        deliveryTime: v.string(),
        availableLocationIds: v.array(v.id("locations")),
        orderStartTime: v.optional(v.string()),
        orderEndTime: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("timeslots", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("timeslots"),
        label: v.optional(v.string()),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        deliveryTime: v.optional(v.string()),
        availableLocationIds: v.optional(v.array(v.id("locations"))),
        orderStartTime: v.optional(v.string()),
        orderEndTime: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});
