import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { v } from "convex/values";


export const assignDefaultRole = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        if (user.role) return user.role;

        // Check if any admin exists
        const adminExists = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "admin"))
            .first();

        const role = adminExists ? "customer" : "admin";

        await ctx.db.patch(userId, { role });
        return role;
    },
});


export const updateName = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        await ctx.db.patch(userId, { name: args.name });
    },
});
export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) return null;
        return await ctx.db.get(userId);
    },
});
