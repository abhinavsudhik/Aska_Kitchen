import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const sendOrderNotification = action({
    args: {
        orderId: v.id("orders"),
        amount: v.number(),
        status: v.string(),
        customerName: v.string(),
        items: v.array(v.object({
            name: v.string(),
            quantity: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        // 1. Get secrets from environment variables
        //    These must be set in the Convex dashboard or via `npx convex env set`
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        console.log("Attempting to send Telegram notification...");
        console.log(`Bot Token present: ${!!botToken}`);
        console.log(`Chat ID present: ${!!chatId}`);

        if (!botToken || !chatId) {
            console.error("Telegram credentials not found in environment variables. Make sure to run `npx convex env set TELEGRAM_BOT_TOKEN ...`");
            return;
        }

        // Fetch the order to get the invoiceNumber
        const order = await ctx.runQuery(internal.orders.getOrderInternal, { orderId: args.orderId });
        if (!order) {
            console.error(`Order not found for Telegram notification: ${args.orderId}`);
            return;
        }

        // 2. Construct the message
        const itemsList = args.items
            .map((item) => `- ${item.quantity}x ${item.name}`)
            .join("\n");

        const message = `
🔔 *New Order Received!*
------------------------
🆔 Order ID: #${order.invoiceNumber}
👤 Customer: ${args.customerName}
💰 Amount: ₹${args.amount}
📦 Status: ${args.status}

🛒 *Items:*
${itemsList}

------------------------
_Check the dashboard for more details._
    `;

        // 3. Send to Telegram API
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        try {
            console.log("Sending request to Telegram API...");
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: "Markdown",
                }),
            });

            console.log(`Telegram API Status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to send Telegram notification. API Response:", errorText);
            } else {
                console.log("Telegram notification sent successfully.");
            }
        } catch (error) {
            console.error("Error sending Telegram notification:", error);
        }
    },
});
