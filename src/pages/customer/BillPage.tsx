import { useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Printer, CheckCircle, ArrowLeft } from "lucide-react";

export default function BillPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const order = useQuery(api.orders.getOrderById, { orderId: orderId as Id<"orders"> });
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // In a real app, uses react-to-print or window.print styles
        window.print();
    };

    if (!order) return <div className="text-center py-20">Loading Invoice...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center no-print">
                <Link to="/home" className="flex items-center text-gray-600 hover:text-[#2E7D32] transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Link>
                <button
                    onClick={handlePrint}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B4332] transition"
                >
                    <Printer className="w-4 h-4" /> <span>Print Invoice</span>
                </button>
            </div>

            {/* Invoice Container */}
            <div
                ref={printRef}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 printable-area"
                id="invoice"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b pb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>ASKA</h1>
                        <p className="text-sm text-gray-500 mt-1">Order Invoice</p>
                    </div>
                    <div className="text-right">
                        {order.status === "pending" && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold mb-2">
                                <CheckCircle className="w-4 h-4 mr-1" /> Pending Confirmation
                            </div>
                        )}
                        {order.status === "confirmed" && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-2">
                                <CheckCircle className="w-4 h-4 mr-1" /> Order Confirmed
                            </div>
                        )}
                        {order.status === "delivered" && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-2">
                                <CheckCircle className="w-4 h-4 mr-1" /> Delivered
                            </div>
                        )}
                        {order.status === "cancelled" && (
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold mb-2">
                                <CheckCircle className="w-4 h-4 mr-1" /> Cancelled
                            </div>
                        )}
                        <p className="text-gray-900 font-mono font-bold text-lg">{order.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Pickup Location</h3>
                        <p className="font-semibold text-gray-800">{order.location?.name}</p>
                        <p className="text-sm text-gray-600">{order.location?.address}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Time Slot</h3>
                        <p className="font-semibold text-gray-800">{order.timeslot?.label}</p>
                        <p className="text-sm text-gray-600">
                            {order.timeslot?.startTime} - {order.timeslot?.endTime}
                        </p>
                        <p className="text-sm text-[#2E7D32] font-semibold mt-1">
                            Expected Delivery: {order.timeslot?.deliveryTime}
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase border-b">
                                <th className="pb-3">Item</th>
                                <th className="pb-3 text-center">Qty</th>
                                <th className="pb-3 text-right">Price</th>
                                <th className="pb-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {order.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 text-gray-800">{item.name}</td>
                                    <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                                    <td className="py-4 text-right text-gray-600">₹{item.price}</td>
                                    <td className="py-4 text-right font-medium text-gray-900">₹{item.price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end border-t pt-6">
                    <div className="w-48 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{order.totalAmount - order.deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Delivery</span>
                            <span>₹{order.deliveryCharge}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-[#1B4332] pt-2 border-t">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-400">
                    <p>Thank you for ordering with ASKA!</p>
                </div>
            </div>

            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none;
          }
          #invoice, #invoice * {
            visibility: visible;
          }
          #invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
        </div>
    );
}
