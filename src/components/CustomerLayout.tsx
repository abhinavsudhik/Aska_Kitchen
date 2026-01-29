import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthActions } from "@convex-dev/auth/react";
import { useCart } from "../context/CartContext";

import { ShoppingCart, List, LogOut, Home } from "lucide-react";


export default function CustomerLayout() {
    const { signOut } = useAuthActions();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate("/");
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <nav className="bg-[#1B4332] shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link
                                to="/home"
                                className="text-2xl font-bold text-white font-serif"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                ASKA
                            </Link>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link to="/home" className="p-2 text-white hover:text-green-200 transition-colors">
                                <Home className="w-6 h-6" />
                            </Link>

                            <Link to="/orders" className="p-2 text-white hover:text-green-200 transition-colors">
                                <List className="w-6 h-6" />
                            </Link>
                            <Link to="/cart" className="p-2 text-white hover:text-green-200 transition-colors relative">
                                <ShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-[#1B4332] transform translate-x-1/4 -translate-y-1/4 bg-white rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            <button onClick={handleLogout} className="p-2 text-white hover:text-green-200 transition-colors">
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-[#0D2818] text-gray-400 py-8 mt-auto">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; {new Date().getFullYear()} ASKA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
