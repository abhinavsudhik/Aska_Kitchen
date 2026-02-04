
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import { useCart } from "../../context/CartContext";
import type { Id } from "../../../convex/_generated/dataModel";
import { Plus, ShoppingBag, Image as ImageIcon, Minus } from "lucide-react";

// Component to display food item image from Convex storage
function FoodItemImage({ storageId, imageUrl, name }: { storageId?: Id<"_storage">, imageUrl?: string, name: string }) {
    const imageUrlFromStorage = useQuery(
        api.files.getImageUrl,
        storageId ? { storageId } : "skip"
    );

    const displayUrl = imageUrlFromStorage || imageUrl;

    if (!displayUrl) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-400" />
            </div>
        );
    }

    return (
        <img
            src={displayUrl}
            alt={name}
            className="w-full h-full object-cover"
        />
    );
}

export default function HomePage() {
    const { addToCart, updateQuantity, selectedTimeslotId, setSelectedTimeslotId, selectedLocationId, setSelectedLocationId, cartItems, cartItemCount } = useCart();

    const timeslots = useQuery(api.timeslots.list);
    const locations = useQuery(api.locations.list);

    // Conditionally fetch items only if timeslot is selected
    // We can pass null/undefined to useQuery but args object expects types.
    // Actually, we can use "skip" logic or just handle it in the query?
    // Convex query args must match. If timeslotId is null, useQuery(api... { timeslotId: null }) -> might fail if schema expects ID using v.id().
    // v.id() requires a string.
    // So we pass "skip" sentinel to useQuery or just render empty if null.
    const menuItems = useQuery(
        api.items.getItemsByTimeslot,
        selectedTimeslotId ? { timeslotId: selectedTimeslotId } : "skip" as any
    );

    const user = useQuery(api.users.currentUser);

    // Clear selected timeslot if it becomes invalid (e.g. window closes)
    // Clear selected timeslot if it becomes invalid (e.g. window closes)
    useEffect(() => {
        /* 
           Disabled strict validation to allow viewing menu for closed slots.
           Users can verify availability but we shouldn't auto-remove selection just for viewing.
        */
        /*
        if (!selectedTimeslotId || !timeslots) return;

        const selectedTs = timeslots.find(ts => ts._id === selectedTimeslotId);
        if (!selectedTs) return;

        // Legacy check: if no window set, it is valid
        if (!selectedTs.orderStartTime || !selectedTs.orderEndTime) return;

        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        let isValid = false;
        if (selectedTs.orderStartTime <= selectedTs.orderEndTime) {
            isValid = currentTime >= selectedTs.orderStartTime && currentTime <= selectedTs.orderEndTime;
        } else {
            isValid = currentTime >= selectedTs.orderStartTime || currentTime <= selectedTs.orderEndTime;
        }

        if (!isValid) {
            setSelectedTimeslotId(null);
            setSelectedLocationId(null);
        }
        */
    }, [selectedTimeslotId, timeslots, setSelectedTimeslotId, setSelectedLocationId]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Welcome{user?.name ? `, ${user.name}` : ''}
                </h1>
                <p className="text-gray-600 mt-2">Order fresh, homely food for pickup or delivery.</p>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Select Delivery Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                        <select
                            value={selectedTimeslotId || ""}
                            onChange={(e) => {
                                const newTimeslotId = e.target.value as Id<"timeslots">;
                                setSelectedTimeslotId(newTimeslotId);
                                setSelectedLocationId(null); // Reset location when timeslot changes
                            }}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#2E7D32] outline-none bg-gray-50 transition-shadow"
                        >
                            <option value="" disabled>Choose a pickup time...</option>
                            {timeslots
                                ?.map((ts) => {
                                    let isOpen = true;
                                    if (ts.orderStartTime && ts.orderEndTime) {
                                        const now = new Date();
                                        const currentHours = now.getHours().toString().padStart(2, '0');
                                        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
                                        const currentTime = `${currentHours}:${currentMinutes}`;

                                        if (ts.orderStartTime <= ts.orderEndTime) {
                                            isOpen = currentTime >= ts.orderStartTime && currentTime <= ts.orderEndTime;
                                        } else {
                                            isOpen = currentTime >= ts.orderStartTime || currentTime <= ts.orderEndTime;
                                        }
                                    }

                                    return (
                                        <option key={ts._id} value={ts._id}>
                                            {ts.label} ({ts.startTime} - {ts.endTime}) - {isOpen ? 'Open' : 'Closed'}
                                        </option>
                                    );
                                })}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <select
                            value={selectedLocationId || ""}
                            onChange={(e) => setSelectedLocationId(e.target.value as Id<"locations">)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#2E7D32] outline-none bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-shadow"
                            disabled={!selectedTimeslotId}
                        >
                            <option value="" disabled>
                                {!selectedTimeslotId ? "Select a time slot first..." : "Choose a location..."}
                            </option>
                            {locations
                                ?.filter(loc => {
                                    if (!selectedTimeslotId) return false;
                                    const selectedTs = timeslots?.find(ts => ts._id === selectedTimeslotId);
                                    return selectedTs?.availableLocationIds.includes(loc._id);
                                })
                                .map((loc) => (
                                    <option key={loc._id} value={loc._id}>
                                        {loc.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>Menu</h2>
                    {cartItemCount > 0 && (
                        <div className="flex items-center gap-2 bg-[#E8F5E9] px-4 py-2 rounded-full border border-[#C8E6C9]">
                            <ShoppingBag className="w-5 h-5 text-[#2E7D32]" />
                            <span className="font-semibold text-[#1B4332]">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in cart</span>
                        </div>
                    )}
                </div>

                {!selectedTimeslotId ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Please select a Location and Time Slot to view the menu.</p>
                    </div>
                ) : !menuItems ? (
                    <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-[#2E7D32] rounded-full border-t-transparent mx-auto"></div></div>
                ) : menuItems.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl"><p className="text-gray-500">No items available for this time slot.</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {menuItems.map((item) => {
                            const cartItem = cartItems.find(ci => ci.id === item._id);
                            const itemQuantity = cartItem?.quantity || 0;

                            return (
                                <div key={item._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col group">
                                    <div className={`h-48 bg-gray-200 relative overflow-hidden ${item.isAvailable === false ? 'grayscale' : ''}`}>
                                        <FoodItemImage
                                            storageId={item.imageStorageId}
                                            imageUrl={item.imageUrl}
                                            name={item.name}
                                        />
                                        {item.isAvailable === false && (
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                                    Unavailable
                                                </span>
                                            </div>
                                        )}
                                        {itemQuantity > 0 && item.isAvailable !== false && (
                                            <div className="absolute top-2 right-2 bg-[#2E7D32] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                                {itemQuantity} in cart
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h3>
                                            <span className="font-bold text-[#2E7D32]">₹{item.sellingPrice}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                                        <div className="mt-auto">
                                            {item.isAvailable === false ? (
                                                <button
                                                    disabled
                                                    className="w-full py-2 font-semibold rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                                >
                                                    Unavailable
                                                </button>
                                            ) : itemQuantity > 0 ? (
                                                <div className="flex items-center justify-between w-full bg-[#E8F5E9] rounded-lg border border-[#C8E6C9] p-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(item._id, itemQuantity - 1);
                                                        }}
                                                        className="p-2 hover:bg-[#C8E6C9] rounded-md text-[#1B4332] transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="font-bold text-[#1B4332]">{itemQuantity}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateQuantity(item._id, itemQuantity + 1);
                                                        }}
                                                        className="p-2 hover:bg-[#C8E6C9] rounded-md text-[#1B4332] transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart({
                                                            id: item._id,
                                                            name: item.name,
                                                            price: item.sellingPrice,
                                                            quantity: 1
                                                        });
                                                    }}
                                                    className="w-full py-2 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 bg-[#E8F5E9] text-[#1B4332] hover:bg-[#C8E6C9]"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add to Cart
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
