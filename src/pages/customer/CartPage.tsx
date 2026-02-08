import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Trash2, ShoppingBag, Minus, Plus, AlertTriangle } from "lucide-react";

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, totalAmount, deliveryCharge, selectedLocationId, selectedTimeslotId } = useCart();

    // Fetch detailed item info to check availability
    const cartItemIds = cartItems.map(item => item.id);
    const detailedItems = useQuery(api.items.getByIds, { ids: cartItemIds });

    // Fetch timeslot to check ordering window
    const selectedTimeslot = useQuery(
        api.timeslots.getById,
        selectedTimeslotId ? { id: selectedTimeslotId } : "skip"
    );

    const navigate = useNavigate();

    // Calculate invalid items
    const invalidItems = detailedItems?.filter(item => {
        if (!selectedTimeslotId) return false;
        return !item.availableTimeslotIds.includes(selectedTimeslotId);
    }) || [];

    const hasInvalidItems = invalidItems.length > 0;

    // Check if ordering window is open
    const isOrderingWindowOpen = () => {
        if (!selectedTimeslot?.orderStartTime || !selectedTimeslot?.orderEndTime) {
            return true; // If no window is set, allow ordering
        }

        const now = new Date();
        const formatter = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata"
        });
        const currentTime = formatter.format(now);

        let isOpen = false;
        if (selectedTimeslot.orderStartTime <= selectedTimeslot.orderEndTime) {
            // Normal window (e.g., 06:00 to 11:00)
            isOpen = currentTime >= selectedTimeslot.orderStartTime && currentTime <= selectedTimeslot.orderEndTime;
        } else {
            // Overnight window (e.g., 23:00 to 02:00)
            isOpen = currentTime >= selectedTimeslot.orderStartTime || currentTime <= selectedTimeslot.orderEndTime;
        }

        return isOpen;
    };

    const orderingAllowed = isOrderingWindowOpen();

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                <button
                    onClick={() => navigate("/home")}
                    className="px-6 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B4332] transition"
                >
                    Go to Menu
                </button>
            </div>
        );
    }

    const finalAmount = totalAmount + deliveryCharge;
    const canCheckout = selectedLocationId && selectedTimeslotId && !hasInvalidItems && orderingAllowed;

    const handleRemoveInvalid = () => {
        invalidItems.forEach(item => removeFromCart(item._id));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Your Cart</h1>

            {hasInvalidItems && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-800">Items unavailable for selected time</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                The following items are not available for your selected timeslot:
                                <span className="font-semibold ml-1">
                                    {invalidItems.map(i => i.name).join(", ")}
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemoveInvalid}
                        className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition whitespace-nowrap font-medium text-sm"
                    >
                        Remove Unavailable Items
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    {/* Placeholder if no image in CartItem currently */}
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h3>
                                    <p className="text-sm text-gray-500">₹{item.price} each</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center gap-3 bg-[#E8F5E9] px-3 py-2 rounded-lg border border-[#C8E6C9]">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-[#C8E6C9] text-[#1B4332] rounded-md transition-colors border border-[#C8E6C9]"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-semibold text-[#1B4332] min-w-[2rem] text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-[#C8E6C9] text-[#1B4332] rounded-md transition-colors border border-[#C8E6C9]"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <span className="font-semibold text-gray-900 min-w-[4rem] text-right">₹{item.price * item.quantity}</span>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                    aria-label="Remove item"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-xl font-bold text-[#1B4332] mb-4 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Order Summary</h3>

                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                            <div className="flex justify-between">
                                <span>Items Total</span>
                                <span>₹{totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Charge</span>
                                <span>₹{deliveryCharge}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg text-[#1B4332]">
                                <span>Total</span>
                                <span>₹{finalAmount}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate("/payment")}
                            disabled={!canCheckout}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${canCheckout
                                ? "bg-[#2E7D32] hover:bg-[#1B4332] shadow-lg hover:shadow-xl"
                                : "bg-gray-300 cursor-not-allowed"
                                }`}
                        >
                            {!orderingAllowed && selectedTimeslotId
                                ? "Ordering Window Closed"
                                : canCheckout
                                    ? "Proceed to Payment"
                                    : "Select Location & Time first"
                            }
                        </button>
                        {!canCheckout && (
                            <p className="text-xs text-red-500 mt-2 text-center">
                                {!orderingAllowed && selectedTimeslot
                                    ? `Ordering available from ${selectedTimeslot.orderStartTime} to ${selectedTimeslot.orderEndTime}`
                                    : "Please select details in Menu first."
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
