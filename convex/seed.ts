import { mutation } from "./_generated/server";


export const seed = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if data exists
        const existingLocations = await ctx.db.query("locations").collect();
        if (existingLocations.length > 0) return "Already seeded";

        // Create default admin account
        const adminEmail = "admin@aska.com";
        const existingAdmin = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", adminEmail))
            .first();

        if (!existingAdmin) {
            await ctx.db.insert("users", {
                email: adminEmail,
                name: "Admin User",
                role: "admin",
            });
            console.log("Admin account created: admin@aska.com / password123");
        }

        // 1. Create Locations
        const loc1 = await ctx.db.insert("locations", {
            name: "Main Building Lobby",
            address: "Building A, Ground Floor",
        });
        const loc2 = await ctx.db.insert("locations", {
            name: "Cafeteria Entrance",
            address: "Building B, 2nd Floor",
        });

        // 2. Create Timeslots
        const ts1 = await ctx.db.insert("timeslots", {
            label: "Lunch Slot 1",
            startTime: "12:00",
            endTime: "13:00",
            deliveryTime: "12:30",
            availableLocationIds: [loc1, loc2],
        });
        const ts2 = await ctx.db.insert("timeslots", {
            label: "Lunch Slot 2",
            startTime: "13:00",
            endTime: "14:00",
            deliveryTime: "13:30",
            availableLocationIds: [loc1],
        });

        // 3. Create Items
        await ctx.db.insert("items", {
            name: "Veg Burger",
            description: "Classic vegetable patty with fresh lettuce.",
            purchasePrice: 20,
            sellingPrice: 50,
            isAvailable: true,
            availableTimeslotIds: [ts1, ts2],
            imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
        });
        await ctx.db.insert("items", {
            name: "Chicken Wrap",
            description: "Grilled chicken with mayo and veggies.",
            purchasePrice: 40,
            sellingPrice: 90,
            isAvailable: true,
            availableTimeslotIds: [ts1, ts2],
            imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=60",
        });
        await ctx.db.insert("items", {
            name: "Coke",
            description: "Chilled soft drink.",
            purchasePrice: 15,
            sellingPrice: 30,
            isAvailable: true,
            availableTimeslotIds: [ts1, ts2],
            imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=60",
        });

        return "Seeding complete!";
    },
});
