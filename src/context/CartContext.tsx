import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import type { Id } from "../../convex/_generated/dataModel";

export interface CartItem {
    id: Id<"items">;
    name: string;
    price: number;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    selectedLocationId: Id<"locations"> | null;
    setSelectedLocationId: (id: Id<"locations"> | null) => void;
    selectedTimeslotId: Id<"timeslots"> | null;
    setSelectedTimeslotId: (id: Id<"timeslots"> | null) => void;
    totalAmount: number;
    deliveryCharge: number;
    cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<Id<"locations"> | null>(null);
    const [selectedTimeslotId, setSelectedTimeslotId] = useState<Id<"timeslots"> | null>(null);
    const deliveryCharge = 50; // Fixed delivery charge for now

    // Persist cart to local storage
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCartItems(JSON.parse(savedCart));

        const savedLoc = localStorage.getItem("loc");
        if (savedLoc) setSelectedLocationId(savedLoc as Id<"locations">);

        const savedTime = localStorage.getItem("time");
        if (savedTime) setSelectedTimeslotId(savedTime as Id<"timeslots">);

    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        if (selectedLocationId) localStorage.setItem("loc", selectedLocationId);
        if (selectedTimeslotId) localStorage.setItem("time", selectedTimeslotId);
    }, [selectedLocationId, selectedTimeslotId]);


    const addToCart = (item: CartItem) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCartItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                selectedLocationId,
                setSelectedLocationId,
                selectedTimeslotId,
                setSelectedTimeslotId,
                totalAmount,
                deliveryCharge,
                cartItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};
