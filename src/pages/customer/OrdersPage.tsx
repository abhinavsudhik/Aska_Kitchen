import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

export default function OrdersPage() {
    const user = useQuery(api.verification.getCurrentUser);
    const { results: orders, status, loadMore } = usePaginatedQuery(
        api.orders.getMyOrders,
        user ? { userId: user._id } : "skip",
        { initialNumItems: 5 }
    );
    const updateStatus = useMutation(api.orders.updateStatus);

    const handleCancel = async (orderId: any) => {
        if (confirm("Are you sure you want to cancel this order?")) {
            await updateStatus({ orderId, status: "cancelled" });
        }
    };

    if (!orders && status === "LoadingFirstPage") return <div className="text-center py-12">Loading Orders...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Your Orders</h1>

            {!orders || orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl">
                    <p className="text-gray-500">No past orders found.</p>
                    <Link to="/home" className="text-[#2E7D32] font-semibold mt-2 inline-block hover:underline">Order Now</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                {/* Header */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 text-lg">#{order.invoiceNumber || "Order"}</span>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                                            order.status === "delivered" && "bg-green-100 text-green-700",
                                            order.status === "confirmed" && "bg-blue-100 text-blue-700",
                                            order.status === "pending" && "bg-yellow-100 text-yellow-700",
                                            order.status === "cancelled" && "bg-red-100 text-red-700"
                                        )}>
                                            {order.status === "pending" ? "Pending Confirmation" : order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-[#1B4332]">₹{order.totalAmount}</p>
                                </div>
                            </div>

                            <div className="my-4 border-t border-gray-50"></div>

                            {/* Items Preview */}
                            <div className="space-y-2 mb-4">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm text-gray-600">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-2">
                                {order.status === "pending" && (
                                    <button
                                        onClick={() => handleCancel(order._id)}
                                        className="text-red-500 text-sm font-semibold hover:text-red-600 transition"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                                {order.status !== "pending" && <div></div>}

                                <Link
                                    to={`/bill/${order._id}`}
                                    className="flex items-center text-[#2E7D32] font-semibold text-sm hover:underline"
                                >
                                    View Invoice <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Load More Button */}
                    {status === "CanLoadMore" && (
                        <button
                            onClick={() => loadMore(5)}
                            className="w-full py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition font-medium"
                        >
                            Load More
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
