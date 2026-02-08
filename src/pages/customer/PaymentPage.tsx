import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function PaymentPage() {
    const { cartItems, totalAmount, deliveryCharge, selectedLocationId, selectedTimeslotId, clearCart } = useCart();
    const user = useQuery(api.verification.getCurrentUser);
    const createOrder = useMutation(api.orders.createOrder);
    const markAsPaid = useMutation(api.orders.markAsPaid);
    const sendOrderNotification = useAction(api.telegram.sendOrderNotification);
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [qrVisible, setQrVisible] = useState(true);

    const finalAmount = totalAmount + deliveryCharge;

    // Get UPI ID from env or fallback (Fallback should be replaced by user)
    const upiId = import.meta.env.VITE_UPI_ID || "example@upi";
    const payeeName = "ASKA"; // Or from env

    // Generate UPI URL
    // Format: upi://pay?pa=<upi_id>&pn=<payee_name>&am=<amount>&cu=INR
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${finalAmount}&cu=INR`;

    const handlePaymentConfirmed = async () => {
        if (!user || !selectedLocationId || !selectedTimeslotId) return;

        try {
            setIsProcessing(true);
            setQrVisible(false); // Hide QR code immediately

            // 1. Create Order as pending
            const orderId = await createOrder({
                userId: user._id,
                items: cartItems.map(item => ({
                    itemId: item.id,
                    quantity: item.quantity,
                    name: item.name,
                    price: item.price
                })),
                totalAmount: finalAmount,
                deliveryCharge,
                timeslotId: selectedTimeslotId,
                locationId: selectedLocationId
            });

            // 2. Mark as paid
            await markAsPaid({ orderId });

            // 3. Send Telegram Notification (Fire and forget, don't await blocking UI)
            sendOrderNotification({
                orderId,
                amount: finalAmount,
                status: "Paid",
                customerName: user.name || "Customer",
                items: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity
                }))
            }).catch(err => console.error("Failed to send telegram notification", err));

            // 4. Clear cart and redirect
            clearCart();

            // Artificial delay for better UX (optional)
            await new Promise(resolve => setTimeout(resolve, 500));

            navigate(`/bill/${orderId}`);

        } catch (error) {
            console.error("Payment failed", error);
            alert("Something went wrong processing your order.");
            setIsProcessing(false);
            setQrVisible(true); // Show QR again if failed
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-10 p-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Complete Payment</h2>
                <p className="text-gray-500 mt-2">Scan the QR code to pay using any UPI app</p>
            </div>

            <div className="flex flex-col items-center justify-center space-y-6">

                {/* Amount Display */}
                <div className="text-center">
                    <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Total Amount</div>
                    <div className="text-4xl font-extrabold text-[#2E7D32] mt-1">₹{finalAmount}</div>
                </div>

                {/* QR Code Section */}
                {qrVisible ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <QRCodeCanvas
                            value={upiUrl}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"Q"}
                            includeMargin={true}
                        />
                        <div className="text-center mt-2 text-xs text-gray-400 font-mono">{upiId}</div>
                    </div>
                ) : (
                    <div className="h-[238px] w-[238px] flex flex-col items-center justify-center bg-green-50 rounded-xl border border-green-100 animate-pulse">
                        <Check className="w-16 h-16 text-green-500 mb-2" />
                        <span className="text-green-700 font-semibold">Processing...</span>
                    </div>
                )}

                {/* Instructions */}
                {qrVisible && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg w-full text-center">
                        <ol className="list-decimal list-inside space-y-1 text-left inline-block">
                            <li>Open Google Pay, PhonePe, or Paytm</li>
                            <li>Scan the QR code above</li>
                            <li>Pay <strong>₹{finalAmount}</strong></li>
                            <li>Come back here and click the button below</li>
                        </ol>
                    </div>
                )}

                {/* Support Contact Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full text-center">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Having trouble?</span> Contact us on WhatsApp:{" "}
                        <a
                            href="https://wa.me/919188380514"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                        >
                            +91 9188380514
                        </a>
                    </p>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handlePaymentConfirmed}
                    disabled={isProcessing || !qrVisible}
                    className={`
                        w-full py-4 px-6 rounded-xl font-bold text-lg shadow-md transition-all transform active:scale-95
                        flex items-center justify-center space-x-2
                        ${isProcessing
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#2E7D32] hover:bg-[#1B4332] text-white hover:shadow-lg"
                        }
                    `}
                >
                    {isProcessing ? (
                        <span>Verifying...</span>
                    ) : (
                        <>
                            <Check className="w-6 h-6" />
                            <span>I Have Paid</span>
                        </>
                    )}
                </button>

                <p className="text-xs text-center text-gray-400 mt-4">
                    By clicking "I Have Paid", you confirm that you have transferred the correct amount.
                </p>
            </div>
        </div>
    );
}
