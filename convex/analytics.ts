import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSettlements = query({
    args: {
        startTime: v.number(),
        endTime: v.number(),
    },
    handler: async (ctx, args) => {
        // 1. Get all orders within the time range
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_orderDate", (q) =>
                q.gte("orderDate", args.startTime).lte("orderDate", args.endTime)
            )
            .collect();

        // 2. Filter for valid orders (paid and not cancelled)
        const validOrders = orders.filter(
            (order) => order.isPaid && order.status !== "cancelled"
        );

        // 3. Process each order to calculate costs
        const processedOrders = await Promise.all(
            validOrders.map(async (order) => {
                let orderHotelPayable = 0;

                // We need to look up the CURRENT purchase price from the items table
                // because the order snapshot only contains the selling price.
                const orderItems = await Promise.all(
                    order.items.map(async (orderItem) => {
                        const itemOriginal = await ctx.db.get(orderItem.itemId);
                        // If item is deleted, we might fall back to 0 or some other logic.
                        // For now, assuming item exists or using 0.
                        const purchasePrice = itemOriginal?.purchasePrice ?? 0;
                        const itemTotalPayable = purchasePrice * orderItem.quantity;

                        orderHotelPayable += itemTotalPayable;

                        return {
                            ...orderItem,
                            purchasePrice, // Current cost price
                            totalPayable: itemTotalPayable,
                        };
                    })
                );

                // Sales = Total Amount (including delivery charge? usually profit is on items, but let's include everything for "Total Sales")
                // However, "Hotel Payable" implies the cost of food.
                // Let's assume Profit = Total Sales - Hotel Payable.
                // If delivery charge is kept by the platform, it adds to profit.
                // If delivery charge is paid to driver, it might needs to be separated. 
                // For this simple version: Profit = Total Collected - Food Cost.

                const orderTotalSales = order.totalAmount;
                const orderProfit = orderTotalSales - orderHotelPayable;

                return {
                    orderId: order._id,
                    invoiceNumber: order.invoiceNumber ?? order._id, // Fallback
                    orderDate: order.orderDate,
                    items: orderItems,
                    totalSales: orderTotalSales,
                    hotelPayable: orderHotelPayable,
                    profit: orderProfit,
                };
            })
        );

        // 4. Calculate Grand Totals
        const totalSales = processedOrders.reduce((sum, o) => sum + o.totalSales, 0);
        const totalHotelPayable = processedOrders.reduce((sum, o) => sum + o.hotelPayable, 0);
        const totalProfit = processedOrders.reduce((sum, o) => sum + o.profit, 0);

        return {
            orders: processedOrders,
            summary: {
                totalSales,
                totalHotelPayable,
                totalProfit,
            },
        };
    },
});
