import { mutation } from "./_generated/server";

// Run this once to initialize settings in production
export const initializeProdSettings = mutation({
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
                value: 0, // Default delivery charge as per user's preference
            });
            return "Delivery charge setting initialized to ₹0";
        }

        return "Delivery charge setting already exists";
    },
});
