import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        role: v.optional(v.union(v.literal("admin"), v.literal("customer"))),
        image: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
    }).index("by_email", ["email"]),

    items: defineTable({
        name: v.string(),
        description: v.optional(v.string()),
        purchasePrice: v.number(),
        sellingPrice: v.number(),
        isAvailable: v.boolean(),
        availableTimeslotIds: v.array(v.id("timeslots")), // Many-to-Many: Items available in specific timeslots
        imageUrl: v.optional(v.string()), // Legacy support
        imageStorageId: v.optional(v.id("_storage")), // New: Convex file storage
    }),

    locations: defineTable({
        name: v.string(),
        address: v.string(),
    }),

    timeslots: defineTable({
        label: v.string(), // e.g. "Lunch"
        startTime: v.string(), // e.g. "12:00"
        endTime: v.string(),   // e.g. "13:00"
        deliveryTime: v.string(), // e.g. "13:30"
        availableLocationIds: v.array(v.id("locations")), // Locations served in this timeslot
        orderStartTime: v.optional(v.string()), // e.g. "06:00"
        orderEndTime: v.optional(v.string()), // e.g. "11:00"
    }),

    orders: defineTable({
        userId: v.id("users"),
        items: v.array(
            v.object({
                itemId: v.id("items"),
                quantity: v.number(),
                name: v.string(), // Snapshot name in case it changes
                price: v.number(), // Snapshot price
            })
        ),
        totalAmount: v.number(),
        deliveryCharge: v.number(),
        status: v.union(
            v.literal("pending"),
            v.literal("confirmed"),
            v.literal("delivered"),
            v.literal("cancelled")
        ),
        timeslotId: v.id("timeslots"),
        locationId: v.id("locations"),
        isPaid: v.boolean(),
        orderDate: v.number(), // Timestamp
        invoiceNumber: v.optional(v.string()),
    })
        .index("by_userId", ["userId"])
        .index("by_timeslot", ["timeslotId"])
        .index("by_orderDate", ["orderDate"])
        .index("by_timeslot_orderDate", ["timeslotId", "orderDate"]),
});
