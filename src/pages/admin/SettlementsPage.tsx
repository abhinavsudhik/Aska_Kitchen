import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import clsx from "clsx";

export default function SettlementsPage() {
    // Default to "Today"
    const [dateRange, setDateRange] = useState<"today" | "month">("today");

    // Calculate start and end times
    const now = new Date();
    let startTime = 0;
    let endTime = 0;

    if (dateRange === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startTime = startOfDay.getTime();
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1;
    } else {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startTime = startOfMonth.getTime();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        endTime = nextMonth.getTime() - 1;
    }

    const settlements = useQuery(api.analytics.getSettlements, { startTime, endTime });

    if (!settlements) {
        return <div className="p-8">Loading settlements data...</div>;
    }

    const { summary, orders } = settlements;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Settlements & Profit</h1>

                {/* Date Controls */}
                <div className="bg-white p-1 rounded-lg border shadow-sm flex">
                    <button
                        onClick={() => setDateRange("today")}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            dateRange === "today"
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        Today
                    </button>
                    <button
                        onClick={() => setDateRange("month")}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            dateRange === "month"
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        This Month
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Sales</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">
                                ₹{summary.totalSales.toFixed(2)}
                            </h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-full">
                            <Wallet className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Hotel Payable (Cost)</p>
                            <h3 className="text-2xl font-bold text-orange-600 mt-1">
                                ₹{summary.totalHotelPayable.toFixed(2)}
                            </h3>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-full">
                            <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Profit</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-1">
                                ₹{summary.totalProfit.toFixed(2)}
                            </h3>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Order Interactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-4 px-6 font-medium text-gray-500">Date/Time</th>
                                <th className="py-4 px-6 font-medium text-gray-500">Order ID</th>
                                <th className="py-4 px-6 font-medium text-gray-500">Items</th>
                                <th className="py-4 px-6 font-medium text-gray-500 text-right">Sales</th>
                                <th className="py-4 px-6 font-medium text-gray-500 text-right">Payable</th>
                                <th className="py-4 px-6 font-medium text-gray-500 text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        No orders found for this period.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-gray-900">
                                            {format(new Date(order.orderDate), "MMM d, h:mm a")}
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 font-mono text-xs">
                                            #{order.invoiceNumber ? order.invoiceNumber.slice(-6) : order.orderId.slice(-6)}
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">
                                            <ul className="list-disc list-inside">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="truncate max-w-xs">
                                                        {item.quantity}x {item.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-gray-900">
                                            ₹{order.totalSales.toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-orange-600">
                                            ₹{order.hotelPayable.toFixed(2)}
                                        </td>
                                        <td className="py-4 px-6 text-right font-medium text-green-600">
                                            ₹{order.profit.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
