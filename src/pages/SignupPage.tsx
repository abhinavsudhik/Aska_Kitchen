import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export default function SignupPage() {
    const { signIn, signOut } = useAuthActions();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
    const user = useQuery(api.verification.getCurrentUser);
    const assignRole = useMutation(api.users.assignDefaultRole);
    const updateWhatsAppNumber = useMutation(api.users.updateWhatsAppNumber);
    const [roleAssigned, setRoleAssigned] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAssigningRole, setIsAssigningRole] = useState(false);
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsappNumber, setWhatsappNumber] = useState("");

    useEffect(() => {
        const assignUserRole = async () => {
            if (isAuthenticated && user && !user.role && !roleAssigned && !isAssigningRole) {
                console.log("Assigning role to authenticated user...");
                setIsAssigningRole(true);
                try {
                    await assignRole();
                    console.log("Role assigned successfully");
                    setRoleAssigned(true);
                } catch (err) {
                    console.error("Failed to assign role:", err);
                    setError("Failed to set up your account. Please try again.");
                    setIsAssigningRole(false);
                }
            }
        };

        assignUserRole();
    }, [isAuthenticated, user, roleAssigned, assignRole, isAssigningRole]);

    // Check if authenticated user needs to provide WhatsApp number
    useEffect(() => {
        if (isAuthenticated && user && user.role && !user.phone && !showWhatsAppModal) {
            setShowWhatsAppModal(true);
        }
    }, [isAuthenticated, user, showWhatsAppModal]);

    // Show loading during initial auth check
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-600">Loading...</div>
            </div>
        );
    }

    // Show loading while waiting for user data after authentication
    if (isAuthenticated && user === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-600">Loading your account...</div>
            </div>
        );
    }

    // Show loading while assigning role to new OAuth user
    if (isAuthenticated && user && !user.role && isAssigningRole) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-600">Setting up your account...</div>
            </div>
        );
    }

    // Redirect authenticated users with roles
    if (isAuthenticated && user && user.role) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-4 p-2 text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                        You are already logged in
                    </h2>
                    <p className="mb-6 text-gray-600">
                        You are currently signed in as <span className="font-semibold">{user.name || "User"}</span> ({user.email}).
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/home')}
                            className="w-full py-2 font-semibold text-white transition-colors bg-[#1B4332] rounded-md hover:bg-[#2E7D32]"
                        >
                            Continue as {user.name ? user.name.split(' ')[0] : 'User'}
                        </button>
                        <button
                            onClick={async () => {
                                await signOut();
                                // State update will trigger re-render, showing the form
                            }}
                            className="w-full py-2 font-semibold text-[#1B4332] transition-colors border-2 border-[#1B4332] rounded-md hover:bg-gray-50"
                        >
                            Log Out & Create New Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        signIn("password", formData)
            .catch((err) => {
                console.error("Sign up error:", err);
                let errorMessage = err instanceof Error ? err.message : "Could not create account";

                // Check for specific "Account already exists" error
                if (errorMessage.includes("Account") && errorMessage.includes("already exists")) {
                    errorMessage = "Account with this email already exists. Please sign in instead.";
                } else {
                    // Clean up duplicate prefixes often seen in Convex/RPC errors
                    // e.g. "Server Error Uncaught Error: Uncaught Error: ..."
                    errorMessage = errorMessage.replace(/^(Server Error\s*)+/i, "");
                    errorMessage = errorMessage.replace(/^(Uncaught Error:\s*)+/i, "");
                    errorMessage = errorMessage.trim();
                }

                setError(errorMessage);
            });
    };

    const handleWhatsAppSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!whatsappNumber.trim()) {
            setError("WhatsApp number is required");
            return;
        }

        try {
            await updateWhatsAppNumber({ phone: whatsappNumber });
            setShowWhatsAppModal(false);
            // Redirect to appropriate page
            navigate(user?.role === 'admin' ? '/admin/dashboard' : '/home');
        } catch (err) {
            console.error("Failed to update WhatsApp number:", err);
            setError("Failed to save WhatsApp number. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {/* WhatsApp Number Modal for Google OAuth users */}
            {showWhatsAppModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-4 text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Complete Your Profile
                        </h2>
                        <p className="mb-4 text-gray-600">
                            Please provide your WhatsApp number to complete registration.
                        </p>
                        {error && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleWhatsAppSubmit} className="flex flex-col gap-4">
                            <input
                                type="tel"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                placeholder="WhatsApp Number (e.g., +919876543210)"
                                className="w-full px-4 py-2 border rounded-md"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full py-2 font-semibold text-white transition-colors bg-[#1B4332] rounded-md hover:bg-[#2E7D32]"
                            >
                                Continue
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h1 className="mb-6 text-2xl font-bold text-center text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>ASKA Sign Up</h1>
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2"
                    >
                        <input
                            name="name"
                            placeholder="Full Name"
                            className="w-full px-4 py-2 border rounded-md"
                            required
                        />
                        <input
                            name="phone"
                            placeholder="WhatsApp Number (e.g., +919876543210)"
                            className="w-full px-4 py-2 border rounded-md"
                            required
                        />
                        <input
                            name="email"
                            placeholder="Email"
                            className="w-full px-4 py-2 border rounded-md"
                            required
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 border rounded-md"
                            required
                        />
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full px-4 py-2 border rounded-md"
                            required
                        />
                        <input name="flow" type="hidden" value="signUp" />
                        <button
                            type="submit"
                            className="w-full py-2 font-semibold text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                        >
                            Sign Up
                        </button>
                    </form>
                    <div className="flex justify-center">
                        <Link
                            to="/"
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
