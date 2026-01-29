import { useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
// import { useReactToPrint } from "react-to-print";
import { Printer, TrendingUp, Filter, X } from "lucide-react";

export default function AdminDashboard() {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTimeslot, setSelectedTimeslot] = useState<Id<"timeslots"> | "">("");
    const [showProfitModal, setShowProfitModal] = useState(false);
    const [profitTab, setProfitTab] = useState<"overview" | "daily" | "monthly">("overview");

    // Fetch timeslots for the dropdown
    const timeslots = useQuery(api.timeslots.list, {});

    // Build filter parameters
    const filterParams = selectedDate || selectedTimeslot ? {
        timeslotId: selectedTimeslot || undefined,
        startDate: selectedDate ? (() => {
            const date = new Date(selectedDate);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        })() : undefined,
        endDate: selectedDate ? (() => {
            const date = new Date(selectedDate);
            date.setHours(23, 59, 59, 999);
            return date.getTime();
        })() : undefined,
    } : {};

    const allOrders = useQuery(api.orders.listOrders, filterParams);
    const profitStats = useQuery(api.orders.getProfitStats, filterParams);

    const updateStatus = useMutation(api.orders.updateStatus);
    const printRef = useRef<HTMLDivElement>(null);

    // const handlePrint = useReactToPrint({
    //   content: () => printRef.current,
    // });

    // Manual print handler for simplicity as react-to-print isn't installed
    const handlePrint = () => {
        window.print();
    };

    const handleStatusChange = async (orderId: any, newStatus: string) => {
        await updateStatus({ orderId, status: newStatus as any });
    };

    const handleClearFilters = () => {
        setSelectedDate("");
        setSelectedTimeslot("");
    };

    // Calculate generic stats
    // const totalRevenue = allOrders?.reduce((acc, o) => acc + o.totalAmount, 0) || 0;
    // const purchaseCost = allOrders?.reduce((acc, o) => acc + o.items.reduce((s, i) => s + (i.price * 0.6) * i.quantity, 0), 0) || 0; // Mock purchase cost logic if not storing purchase price in order snapshot
    // Actually we only stored selling price in order snapshot. Purchase price is in Item. 
    // For exact profit calc, we should've snapshot purchase price too. I'll skip complex profit logic for now and just show totals.

    if (!allOrders || !timeslots) return <div>Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="space-x-4">
                    <button
                        onClick={() => setShowProfitModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
                    >
                        <TrendingUp className="w-4 h-4" /> Profits
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center gap-2 hover:bg-gray-900"
                    >
                        <Printer className="w-4 h-4" /> Print Orders
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 no-print">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <span className="font-semibold text-gray-700">Filter Orders:</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="date-filter" className="text-sm text-gray-600">Date:</label>
                        <input
                            id="date-filter"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label htmlFor="timeslot-filter" className="text-sm text-gray-600">Timeslot:</label>
                        <select
                            id="timeslot-filter"
                            value={selectedTimeslot}
                            onChange={(e) => setSelectedTimeslot(e.target.value as Id<"timeslots"> | "")}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Timeslots</option>
                            {timeslots.map((slot) => (
                                <option key={slot._id} value={slot._id}>
                                    {slot.label} ({slot.startTime} - {slot.endTime})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Show All Orders
                    </button>

                    {(selectedDate || selectedTimeslot) && (
                        <span className="text-sm text-gray-500 ml-auto">
                            Showing {allOrders.length} filtered order{allOrders.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            <div ref={printRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden printable-area">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Today's Orders</h2>
                    <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Order No</th>
                            <th className="px-6 py-3">Customer</th>
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Items</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 no-print">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono font-medium">{order.invoiceNumber}</td>
                                <td className="px-6 py-4">{order.userName}</td>
                                <td className="px-6 py-4">{order.locationName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                </td>
                                <td className="px-6 py-4 text-right font-bold">₹{order.totalAmount}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 no-print">
                                    <div className="flex space-x-2">
                                        {order.status === 'pending' && (
                                            <button onClick={() => handleStatusChange(order._id, 'confirmed')} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Confirm</button>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <button onClick={() => handleStatusChange(order._id, 'delivered')} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Deliver</button>
                                        )}
                                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                            <button onClick={() => handleStatusChange(order._id, 'cancelled')} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Cancel</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Profit Modal */}
            {showProfitModal && profitStats && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                                Profit Statistics
                            </h2>
                            <button
                                onClick={() => setShowProfitModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setProfitTab("overview")}
                                className={`px-4 py-2 font-medium transition-colors ${profitTab === "overview"
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setProfitTab("daily")}
                                className={`px-4 py-2 font-medium transition-colors ${profitTab === "daily"
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setProfitTab("monthly")}
                                className={`px-4 py-2 font-medium transition-colors ${profitTab === "monthly"
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Monthly
                            </button>
                        </div>

                        {/* Overview Tab */}
                        {profitTab === "overview" && (
                            <div className="space-y-4">
                                {/* Order Count Summary */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-500 mb-2">Order Summary</div>
                                    <div className="flex gap-4 text-sm">
                                        <div>
                                            <span className="font-semibold">{profitStats.deliveredOrderCount}</span>
                                            <span className="text-gray-600"> delivered</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">{profitStats.cancelledOrderCount}</span>
                                            <span className="text-gray-600"> cancelled</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">{profitStats.totalOrderCount}</span>
                                            <span className="text-gray-600"> total</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Income */}
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Income</span>
                                        <span className="text-xl font-semibold text-green-600">
                                            ₹{profitStats.totalIncome.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Purchase Costs */}
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Purchase Costs</span>
                                        <span className="text-xl font-semibold text-orange-600">
                                            -₹{profitStats.totalPurchaseCost.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Refunds */}
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Refunds (Cancelled)</span>
                                        <span className="text-xl font-semibold text-red-600">
                                            -₹{profitStats.totalRefunds.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Net Profit */}
                                <div className="bg-purple-50 rounded-lg p-6 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Net Profit</span>
                                        <span className={`text-3xl font-bold ${profitStats.netProfit >= 0 ? 'text-purple-600' : 'text-red-600'
                                            }`}>
                                            ₹{profitStats.netProfit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Filter Info */}
                                {(selectedDate || selectedTimeslot) && (
                                    <div className="text-xs text-gray-500 text-center mt-4">
                                        Showing filtered results
                                        {selectedDate && ` for ${new Date(selectedDate).toLocaleDateString()}`}
                                        {selectedTimeslot && ` for selected timeslot`}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Daily Tab */}
                        {profitTab === "daily" && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Daily Profit Breakdown</h3>
                                {profitStats.dailyBreakdown && profitStats.dailyBreakdown.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">No daily data available</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Date</th>
                                                    <th className="px-4 py-3 text-right">Orders</th>
                                                    <th className="px-4 py-3 text-right">Total Income</th>
                                                    <th className="px-4 py-3 text-right">Costs</th>
                                                    <th className="px-4 py-3 text-right">Refunds</th>
                                                    <th className="px-4 py-3 text-right">Profit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {profitStats.dailyBreakdown?.map((day) => (
                                                    <tr key={day.date} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium">
                                                            {new Date(day.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">{day.orders}</td>
                                                        <td className="px-4 py-3 text-right text-green-600">
                                                            ₹{day.income.toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-orange-600">
                                                            -₹{day.purchaseCost.toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-red-600">
                                                            -₹{day.refunds.toFixed(2)}
                                                        </td>
                                                        <td className={`px-4 py-3 text-right font-bold ${day.profit >= 0 ? 'text-purple-600' : 'text-red-600'
                                                            }`}>
                                                            ₹{day.profit.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Monthly Tab */}
                        {profitTab === "monthly" && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Monthly Profit Breakdown</h3>
                                {profitStats.monthlyBreakdown && profitStats.monthlyBreakdown.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">No monthly data available</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Month</th>
                                                    <th className="px-4 py-3 text-right">Orders</th>
                                                    <th className="px-4 py-3 text-right">Total Income</th>
                                                    <th className="px-4 py-3 text-right">Costs</th>
                                                    <th className="px-4 py-3 text-right">Refunds</th>
                                                    <th className="px-4 py-3 text-right">Profit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {profitStats.monthlyBreakdown?.map((month) => {
                                                    const [year, monthNum] = month.month.split('-');
                                                    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                                                    return (
                                                        <tr key={month.month} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 font-medium">{monthName}</td>
                                                            <td className="px-4 py-3 text-right">{month.orders}</td>
                                                            <td className="px-4 py-3 text-right text-green-600">
                                                                ₹{month.income.toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-orange-600">
                                                                -₹{month.purchaseCost.toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-red-600">
                                                                -₹{month.refunds.toFixed(2)}
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-bold ${month.profit >= 0 ? 'text-purple-600' : 'text-red-600'
                                                                }`}>
                                                                ₹{month.profit.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}
