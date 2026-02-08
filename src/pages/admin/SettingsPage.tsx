import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Save, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
    const allSettings = useQuery(api.settings.getAllSettings, {});
    const updateSetting = useMutation(api.settings.updateSetting);

    const [deliveryCharge, setDeliveryCharge] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Initialize form with current settings
    useState(() => {
        if (allSettings?.deliveryCharge !== undefined) {
            setDeliveryCharge(String(allSettings.deliveryCharge));
        }
    });

    const handleSave = async () => {
        const chargeValue = parseFloat(deliveryCharge);

        if (isNaN(chargeValue) || chargeValue < 0) {
            setSaveMessage({ type: "error", text: "Please enter a valid delivery charge" });
            return;
        }

        setIsSaving(true);
        setSaveMessage(null);

        try {
            await updateSetting({
                key: "deliveryCharge",
                value: chargeValue,
            });
            setSaveMessage({ type: "success", text: "Settings saved successfully!" });
        } catch (error) {
            setSaveMessage({ type: "error", text: "Failed to save settings" });
        } finally {
            setIsSaving(false);
        }
    };

    if (!allSettings) {
        return <div className="flex items-center justify-center h-64">Loading settings...</div>;
    }

    // Update form when settings load
    if (deliveryCharge === "" && allSettings.deliveryCharge !== undefined) {
        setDeliveryCharge(String(allSettings.deliveryCharge));
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-gray-700" />
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Configuration</h2>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="deliveryCharge" className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Charge (₹)
                        </label>
                        <input
                            id="deliveryCharge"
                            type="number"
                            min="0"
                            step="0.01"
                            value={deliveryCharge}
                            onChange={(e) => setDeliveryCharge(e.target.value)}
                            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter delivery charge"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            This charge will be added to all customer orders
                        </p>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>

                        {saveMessage && (
                            <div
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${saveMessage.type === "success"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {saveMessage.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Note</h3>
                <p className="text-sm text-blue-800">
                    Changes to the delivery charge will apply to all new orders. Existing orders will retain their original delivery charge.
                </p>
            </div>
        </div>
    );
}
