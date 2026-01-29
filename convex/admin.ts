import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const checkRoles = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users.map((u) => ({ email: u.email, role: u.role, id: u._id }));
    },
});

export const setAdmin = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            return "User not found";
        }

        await ctx.db.patch(user._id, { role: "admin" });
        return `User ${args.email} is now an admin`;
    },
});
