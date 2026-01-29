
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

export default function CompleteProfilePage() {
    const [name, setName] = useState("");
    const updateName = useMutation(api.users.updateName);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateName({ name });
        navigate("/home");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1B4332] font-serif" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Complete your profile
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Please enter your name to continue
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#2E7D32] focus:border-[#2E7D32] focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#2E7D32] hover:bg-[#1B4332] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E7D32]"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
