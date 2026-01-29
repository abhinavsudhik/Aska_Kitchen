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
    const [roleAssigned, setRoleAssigned] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAssigningRole, setIsAssigningRole] = useState(false);

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
                setError("Could not create account");
                console.error(err);
            });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
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
                    <div className="relative flex items-center justify-center my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <span className="relative z-10 px-2 bg-white text-sm text-gray-500">OR</span>
                    </div>
                    <button
                        onClick={() => {
                            setError(null);
                            signIn("google").catch((err) => {
                                console.error("Google sign-up error:", err);
                                setError("Failed to sign up with Google. Please try again.");
                            });
                        }}
                        className="w-full py-2 font-semibold text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        Sign up with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
