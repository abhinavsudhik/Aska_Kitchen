
import { useNavigate } from 'react-router-dom';
import muttonBiriyani from '../assets/images/mutton-biriyani-recipe.jpeg';

import { useConvexAuth } from "convex/react";

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useConvexAuth();

    return (
        <div className="min-h-screen font-sans">
            {/* Header/Nav */}
            <header className="bg-[#1B4332] text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>ASKA</h1>
                    <div className="space-x-4">
                        {isAuthenticated ? (
                            <button onClick={() => navigate('/home')} className="bg-white text-[#1B4332] px-4 py-2 rounded hover:bg-gray-100 transition">Order</button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/login')} className="hover:text-gray-200">Login</button>
                                <button onClick={() => navigate('/signup')} className="bg-white text-[#1B4332] px-4 py-2 rounded hover:bg-gray-100 transition">Register</button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Welcome Section */}
            <section className="bg-[#2E7D32] text-white py-20">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold mb-6 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Nostalgic Home Food
                    </h2>
                    <p className="text-xl mb-10 max-w-2xl mx-auto">
                        Food made to make you feel the tradition and culture
                    </p>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate(isAuthenticated ? '/home' : '/signup')}
                            className="bg-white text-[#2E7D32] font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-1"
                        >
                            {isAuthenticated ? "Order Now" : "Get Started"}
                        </button>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 bg-white text-[#36454F]">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-10 md:mb-0">
                            <h3 className="text-4xl font-bold mb-6 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Homely & Trustworthy
                            </h3>
                            <p className="text-lg leading-relaxed mb-6">
                                At ASKA, we believe in the power of good food to bring people together. Our mission is simple: to provide you with the freshest produce while supporting local farmers.
                            </p>
                            <p className="text-lg leading-relaxed">
                                We pride ourselves on transparency and quality. Every item you order is hand-picked and checked to ensure it meets our high standards. Welcome to a community where you can trust what you eat.
                            </p>
                        </div>
                        <div className="md:w-1/2 md:pl-10">

                            {/* Placeholder for About Image */}
                            <div className="bg-gray-200 h-64 md:h-96 rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
                                <img src={muttonBiriyani} alt="Delicious Mutton Biriyani" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Register/Login Section (Call to Action) */}
            <section className="bg-[#1B4332] text-white py-20">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-6 font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Join the ASKA Family
                    </h3>
                    <p className="text-lg mb-8 max-w-xl mx-auto">
                        Ready to start your journey with us? Sign up today for exclusive offers and fresh updates.
                    </p>
                    <div className="flex justify-center space-x-6">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/home')}
                                className="bg-white text-[#1B4332] font-semibold py-3 px-8 rounded hover:bg-gray-100 transition"
                            >
                                Start Ordering
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="bg-white text-[#1B4332] font-semibold py-3 px-8 rounded hover:bg-gray-100 transition"
                                >
                                    Register Now
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="border-2 border-white text-white font-semibold py-3 px-8 rounded hover:bg-white hover:text-[#1B4332] transition"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0D2818] text-gray-400 py-8">
                <div className="container mx-auto px-6 text-center">
                    <div className="mb-4">
                        <p className="text-sm mb-2">Need help with your order?</p>
                        <a
                            href="https://wa.me/919188380514"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 font-semibold"
                        >
                            Contact us on WhatsApp: +91 9188380514
                        </a>
                    </div>
                    <p>&copy; {new Date().getFullYear()} ASKA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
