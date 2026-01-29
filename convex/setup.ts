import { mutation } from "./_generated/server";


/**
 * Creates a default admin account for testing purposes.
 * Email: admin@aska.com
 * Password: password123
 * 
 * Run this mutation from the Convex dashboard to create the admin account.
 */
export const createDefaultAdmin = mutation({
    args: {},
    handler: async (ctx) => {
        const adminEmail = "admin@aska.com";

        // Check if admin already exists
        const existingAdmin = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", adminEmail))
            .first();

        if (existingAdmin) {
            return {
                success: false,
                message: "Admin account already exists",
                email: adminEmail,
            };
        }

        // Create admin user
        const userId = await ctx.db.insert("users", {
            email: adminEmail,
            name: "Admin User",
            role: "admin",
        });

        return {
            success: true,
            message: "Admin account created successfully! You need to set the password by signing up with this email.",
            email: adminEmail,
            userId: userId,
            instructions: [
                "1. Go to /signup page",
                "2. Use email: admin@aska.com",
                "3. Use password: password123",
                "4. This will link the password to the admin account"
            ]
        };
    },
});
