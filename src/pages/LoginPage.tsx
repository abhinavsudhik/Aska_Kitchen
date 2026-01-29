import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { Navigate, Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export default function LoginPage() {
    const { signIn } = useAuthActions();
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
        console.log("Redirecting user with role:", user.role);
        if (user.role === "admin") {
            return <Navigate to="/admin/dashboard" />;
        }
        return <Navigate to="/home" />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h1 className="mb-6 text-2xl font-bold text-center text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>ASKA Login</h1>
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setError(null);
                            const formData = new FormData(e.currentTarget);
                            signIn("password", formData)
                                .catch((err) => {
                                    console.error(err);
                                    setError("Invalid email or password");
                                });
                        }}
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
                        <input name="flow" type="hidden" value="signIn" />
                        <button
                            type="submit"
                            className="w-full py-2 font-semibold text-white transition-colors bg-green-600 rounded-md hover:bg-green-700"
                        >
                            Sign In
                        </button>
                    </form>
                    <div className="flex justify-center">
                        <Link
                            to="/signup"
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Don't have an account? Sign up
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
                                console.error("Google sign-in error:", err);
                                setError("Failed to sign in with Google. Please try again.");
                            });
                        }}
                        className="w-full py-2 font-semibold text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        Sign in with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
