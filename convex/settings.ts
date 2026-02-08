import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a specific setting by key
export const getSetting = query({
    args: { key: v.string() },
    handler: async (ctx, args) => {
        const setting = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();
        return setting?.value ?? null;
    },
});

// Get all settings
export const getAllSettings = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("settings").collect();
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string | number | boolean>);
    },
});

// Update or create a setting
export const updateSetting = mutation({
    args: {
        key: v.string(),
        value: v.union(v.string(), v.number(), v.boolean()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", args.key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { value: args.value });
        } else {
            await ctx.db.insert("settings", {
                key: args.key,
                value: args.value,
            });
        }
    },
});

// Initialize default settings
export const initializeSettings = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if deliveryCharge setting exists
        const deliveryChargeSetting = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", "deliveryCharge"))
            .first();

        if (!deliveryChargeSetting) {
            await ctx.db.insert("settings", {
                key: "deliveryCharge",
                value: 0, // Default delivery charge
            });
        }
    },
});
