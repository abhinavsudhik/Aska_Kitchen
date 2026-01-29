import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";

export const createOrder = mutation({
    args: {
        userId: v.id("users"),
        items: v.array(
            v.object({
                itemId: v.id("items"),
                quantity: v.number(),
                name: v.string(),
                price: v.number(),
            })
        ),
        totalAmount: v.number(),
        deliveryCharge: v.number(),
        timeslotId: v.id("timeslots"),
        locationId: v.id("locations"),
    },
    handler: async (ctx, args) => {
        // Generate invoice number (Daily sequence: 001, 002, ...)
        const now = Date.now();
        const startOfDay = new Date(now).setHours(0, 0, 0, 0);

        const todayOrders = await ctx.db
            .query("orders")
            .withIndex("by_orderDate", (q) => q.gte("orderDate", startOfDay))
            .collect();

        const nextSequence = todayOrders.length + 1;
        const invoiceNumber = String(nextSequence).padStart(4, '0');

        // Check if ordering is allowed for this timeslot
        const timeslot = await ctx.db.get(args.timeslotId);
        if (!timeslot) {
            throw new Error("Invalid timeslot");
        }

        if (timeslot.orderStartTime && timeslot.orderEndTime) {
            // Get current time in IST (Asia/Kolkata) - Assuming restaurant location
            // In a real app, timezone should be stored in the 'locations' table
            const now = new Date();
            const formatter = new Intl.DateTimeFormat("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Kolkata"
            });
            const currentTime = formatter.format(now);

            let isWindowOpen = false;
            if (timeslot.orderStartTime <= timeslot.orderEndTime) {
                isWindowOpen = currentTime >= timeslot.orderStartTime && currentTime <= timeslot.orderEndTime;
            } else {
                // Overnight window
                isWindowOpen = currentTime >= timeslot.orderStartTime || currentTime <= timeslot.orderEndTime;
            }

            if (!isWindowOpen) {
                throw new Error(`Ordering is currently closed for the ${timeslot.label} slot. Available from ${timeslot.orderStartTime} to ${timeslot.orderEndTime}.`);
            }
        }

        const orderId = await ctx.db.insert("orders", {
            userId: args.userId,
            items: args.items,
            totalAmount: args.totalAmount,
            deliveryCharge: args.deliveryCharge,
            status: "pending",
            timeslotId: args.timeslotId,
            locationId: args.locationId,
            isPaid: false, // Will be updated after payment
            orderDate: now,
            invoiceNumber: invoiceNumber,
        });

        return orderId;
    },
});

export const markAsPaid = mutation({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.orderId, { isPaid: true });
    },
});

export const updateStatus = mutation({
    args: {
        orderId: v.id("orders"),
        status: v.union(
            v.literal("pending"),
            v.literal("confirmed"),
            v.literal("delivered"),
            v.literal("cancelled")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.orderId, { status: args.status });
    },
});

export const getMyOrders = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("orders")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

export const getOrderById = query({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) return null;

        // Fetch related info for display
        const location = await ctx.db.get(order.locationId);
        const timeslot = await ctx.db.get(order.timeslotId);

        return { ...order, location, timeslot };
    },
});

// Admin: Get all orders, filterable by timeslot and/or date
export const listOrders = query({
    args: {
        timeslotId: v.optional(v.id("timeslots")),
        startDate: v.optional(v.number()), // Timestamp for start of day
        endDate: v.optional(v.number()),   // Timestamp for end of day
    },
    handler: async (ctx, args) => {
        let orders;
        if (args.timeslotId) {
            const timeslotId = args.timeslotId;
            orders = await ctx.db
                .query("orders")
                .withIndex("by_timeslot", (q) => q.eq("timeslotId", timeslotId))
                .collect();
        } else {
            orders = await ctx.db.query("orders").collect();
        }

        // Apply date filter if provided
        if (args.startDate !== undefined && args.endDate !== undefined) {
            orders = orders.filter(o =>
                o.orderDate >= args.startDate! && o.orderDate <= args.endDate!
            );
        }

        // Enrich with user name and location name
        const enrichedOrders = await Promise.all(
            orders.map(async (o) => {
                const user = await ctx.db.get(o.userId);
                const location = await ctx.db.get(o.locationId);
                return {
                    ...o,
                    userName: user?.name || "Unknown",
                    locationName: location?.name || "Unknown",
                };
            })
        );

        return enrichedOrders;
    },
});

export const getOrdersByTimeslot = query({
    args: { timeslotId: v.id("timeslots") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("orders")
            .withIndex("by_timeslot", (q) => q.eq("timeslotId", args.timeslotId))
            .collect();
    },
});

export const getProfitStats = query({
    args: {
        timeslotId: v.optional(v.id("timeslots")),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Fetch orders with the same filtering logic as listOrders
        let orders;
        if (args.timeslotId) {
            const timeslotId = args.timeslotId;
            orders = await ctx.db
                .query("orders")
                .withIndex("by_timeslot", (q) => q.eq("timeslotId", timeslotId))
                .collect();
        } else {
            orders = await ctx.db.query("orders").collect();
        }

        // Apply date filter if provided
        if (args.startDate !== undefined && args.endDate !== undefined) {
            orders = orders.filter(o =>
                o.orderDate >= args.startDate! && o.orderDate <= args.endDate!
            );
        }

        // Separate orders by status
        const deliveredOrders = orders.filter(o => o.status === "delivered");
        const cancelledOrders = orders.filter(o => o.status === "cancelled");

        // Calculate totals
        const totalIncome = deliveredOrders.reduce((acc, o) => acc + o.totalAmount, 0) + cancelledOrders.reduce((acc, o) => acc + o.totalAmount, 0);
        const totalRefunds = cancelledOrders.reduce((acc, o) => acc + o.totalAmount, 0);

        // Calculate purchase costs for delivered orders
        let totalPurchaseCost = 0;
        for (const order of deliveredOrders) {
            for (const orderItem of order.items) {
                // Fetch the actual item to get purchase price
                const item = await ctx.db.get(orderItem.itemId);
                if (item) {
                    totalPurchaseCost += item.purchasePrice * orderItem.quantity;
                }
            }
        }

        // Calculate net profit
        const netProfit = totalIncome - totalPurchaseCost - totalRefunds;

        // Helper function to format date as YYYY-MM-DD
        const formatDate = (timestamp: number) => {
            const date = new Date(timestamp);
            return date.toISOString().split('T')[0];
        };

        // Helper function to format month as YYYY-MM
        const formatMonth = (timestamp: number) => {
            const date = new Date(timestamp);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        };

        // Calculate daily breakdown
        const dailyMap = new Map<string, {
            income: number,
            refunds: number,
            purchaseCost: number,
            orders: number
        }>();

        // Process all orders for daily breakdown
        for (const order of orders) {
            const dateKey = formatDate(order.orderDate);
            if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, { income: 0, refunds: 0, purchaseCost: 0, orders: 0 });
            }

            const dayData = dailyMap.get(dateKey)!;
            dayData.orders++;

            if (order.status === "delivered") {
                dayData.income += order.totalAmount;

                // Calculate purchase cost for this order
                for (const orderItem of order.items) {
                    const item = await ctx.db.get(orderItem.itemId);
                    if (item) {
                        dayData.purchaseCost += item.purchasePrice * orderItem.quantity;
                    }
                }
            } else if (order.status === "cancelled") {
                dayData.income += order.totalAmount; // Add to income
                dayData.refunds += order.totalAmount; // And record as refund
            }
        }

        // Convert daily map to array and sort by date descending
        const dailyBreakdown = Array.from(dailyMap.entries())
            .map(([date, data]) => ({
                date,
                income: data.income,
                refunds: data.refunds,
                purchaseCost: data.purchaseCost,
                profit: data.income - data.purchaseCost - data.refunds,
                orders: data.orders
            }))
            .sort((a, b) => b.date.localeCompare(a.date));

        // Calculate monthly breakdown
        const monthlyMap = new Map<string, {
            income: number,
            refunds: number,
            purchaseCost: number,
            orders: number
        }>();

        // Process all orders for monthly breakdown
        for (const order of orders) {
            const monthKey = formatMonth(order.orderDate);
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { income: 0, refunds: 0, purchaseCost: 0, orders: 0 });
            }

            const monthData = monthlyMap.get(monthKey)!;
            monthData.orders++;

            if (order.status === "delivered") {
                monthData.income += order.totalAmount;

                // Calculate purchase cost for this order
                for (const orderItem of order.items) {
                    const item = await ctx.db.get(orderItem.itemId);
                    if (item) {
                        monthData.purchaseCost += item.purchasePrice * orderItem.quantity;
                    }
                }
            } else if (order.status === "cancelled") {
                monthData.income += order.totalAmount; // Add to income
                monthData.refunds += order.totalAmount; // And record as refund
            }
        }

        // Convert monthly map to array and sort by month descending
        const monthlyBreakdown = Array.from(monthlyMap.entries())
            .map(([month, data]) => ({
                month,
                income: data.income,
                refunds: data.refunds,
                purchaseCost: data.purchaseCost,
                profit: data.income - data.purchaseCost - data.refunds,
                orders: data.orders
            }))
            .sort((a, b) => b.month.localeCompare(a.month));

        return {
            totalIncome,
            totalRefunds,
            totalPurchaseCost,
            netProfit,
            deliveredOrderCount: deliveredOrders.length,
            cancelledOrderCount: cancelledOrders.length,
            totalOrderCount: orders.length,
            dailyBreakdown,
            monthlyBreakdown,
        };
    },
});


// Internal query for fetching order by ID (used by actions)
export const getOrderInternal = internalQuery({
    args: { orderId: v.id("orders") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.orderId);
    },
});
