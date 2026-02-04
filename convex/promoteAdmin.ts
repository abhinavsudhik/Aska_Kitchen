import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const promote = internalMutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error(`User with email ${args.email} not found`);
        }

        await ctx.db.patch(user._id, { role: "admin" });
        console.log(`User ${args.email} promoted to admin.`);
    },
});
