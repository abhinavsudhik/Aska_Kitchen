import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Edit2, Check, X } from "lucide-react";

export default function LocationTimeslotPage() {
    const locations = useQuery(api.locations.list);
    const timeslots = useQuery(api.timeslots.list);

    const createLocation = useMutation(api.locations.create);
    const createTimeslot = useMutation(api.timeslots.create);
    const updateTimeslot = useMutation(api.timeslots.update);

    const [newLocName, setNewLocName] = useState("");
    const [newLocAddress, setNewLocAddress] = useState("");

    const [newTsLabel, setNewTsLabel] = useState("");
    const [newTsStart, setNewTsStart] = useState("");
    const [newTsEnd, setNewTsEnd] = useState("");
    const [newTsDelivery, setNewTsDelivery] = useState("");
    const [newTsOrderStart, setNewTsOrderStart] = useState("");
    const [newTsOrderEnd, setNewTsOrderEnd] = useState("");
    const [selectedLocationIds, setSelectedLocationIds] = useState<Id<"locations">[]>([]);

    const [editingTimeslotId, setEditingTimeslotId] = useState<Id<"timeslots"> | null>(null);
    const [editLocationIds, setEditLocationIds] = useState<Id<"locations">[]>([]);
    const [editOrderStart, setEditOrderStart] = useState("");
    const [editOrderEnd, setEditOrderEnd] = useState("");

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        await createLocation({ name: newLocName, address: newLocAddress });
        setNewLocName(""); setNewLocAddress("");
    };

    const handleToggleLocation = (locationId: Id<"locations">) => {
        setSelectedLocationIds(prev =>
            prev.includes(locationId)
                ? prev.filter(id => id !== locationId)
                : [...prev, locationId]
        );
    };

    const handleToggleEditLocation = (locationId: Id<"locations">) => {
        setEditLocationIds(prev =>
            prev.includes(locationId)
                ? prev.filter(id => id !== locationId)
                : [...prev, locationId]
        );
    };

    const handleAddTimeslot = async (e: React.FormEvent) => {
        e.preventDefault();

        await createTimeslot({
            label: newTsLabel,
            startTime: newTsStart,
            endTime: newTsEnd,
            deliveryTime: newTsDelivery,
            availableLocationIds: selectedLocationIds,
            orderStartTime: newTsOrderStart,
            orderEndTime: newTsOrderEnd
        });
        setNewTsLabel("");
        setNewTsStart("");
        setNewTsEnd("");
        setNewTsDelivery("");
        setNewTsOrderStart("");
        setNewTsOrderEnd("");
        setSelectedLocationIds([]);
    };

    const startEditTimeslot = (timeslot: any) => {
        setEditingTimeslotId(timeslot._id);
        setEditLocationIds(timeslot.availableLocationIds);
        setEditOrderStart(timeslot.orderStartTime || "");
        setEditOrderEnd(timeslot.orderEndTime || "");
    };

    const saveEditTimeslot = async () => {
        if (editingTimeslotId) {
            await updateTimeslot({
                id: editingTimeslotId,
                availableLocationIds: editLocationIds,
                orderStartTime: editOrderStart,
                orderEndTime: editOrderEnd
            });
            setEditingTimeslotId(null);
            setEditLocationIds([]);
        }
    };

    const cancelEdit = () => {
        setEditingTimeslotId(null);
        setEditLocationIds([]);
    };

    if (!locations || !timeslots) return <div>Loading...</div>;

    return (
        <div className="space-y-12">
            {/* Locations Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Locations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 grid grid-cols-1 gap-4">
                        {locations.map(loc => (
                            <div key={loc._id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{loc.name}</h3>
                                    <p className="text-gray-500 text-sm">{loc.address}</p>
                                </div>
                                {/* <button className="text-red-400 hover:text-red-600"><Trash2/></button> */}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                        <h3 className="font-semibold mb-4">Add New Location</h3>
                        <form onSubmit={handleAddLocation} className="space-y-3">
                            <input placeholder="Location Name" required className="w-full border p-2 rounded" value={newLocName} onChange={e => setNewLocName(e.target.value)} />
                            <input placeholder="Address" required className="w-full border p-2 rounded" value={newLocAddress} onChange={e => setNewLocAddress(e.target.value)} />
                            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Location</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Timeslots Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Time Slots</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 grid grid-cols-1 gap-4">
                        {timeslots.map(ts => {
                            const isEditing = editingTimeslotId === ts._id;

                            return (
                                <div key={ts._id} className="bg-white p-4 rounded-lg shadow-sm border">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-blue-800">{ts.label}</h3>
                                            <p className="text-gray-600 text-sm">Order: <span className="font-mono">{ts.startTime} - {ts.endTime}</span></p>
                                            <p className="text-gray-600 text-sm">Delivery: <span className="font-mono font-bold">{ts.deliveryTime}</span></p>
                                            {ts.orderStartTime && ts.orderEndTime && (
                                                <p className="text-green-700 text-xs mt-1">
                                                    Ordering Window: <span className="font-mono font-bold">{ts.orderStartTime} - {ts.orderEndTime}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {!isEditing ? (
                                                <button
                                                    onClick={() => startEditTimeslot(ts)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                                                    title="Edit locations"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={saveEditTimeslot}
                                                        className="text-green-600 hover:text-green-800 p-2 rounded hover:bg-green-50"
                                                        title="Save"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {!isEditing ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {ts.availableLocationIds.length === 0 ? (
                                                <span className="text-xs text-red-500 italic">No locations assigned</span>
                                            ) : (
                                                ts.availableLocationIds.map(locId => {
                                                    const location = locations?.find(l => l._id === locId);
                                                    return (
                                                        <span
                                                            key={locId}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                                        >
                                                            {location?.name || "Unknown"}
                                                        </span>
                                                    );
                                                })
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Ordering Window:</p>
                                            <div className="flex gap-2 mb-3">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500">Start</label>
                                                    <input type="time" className="w-full border p-1 rounded text-sm" value={editOrderStart} onChange={e => setEditOrderStart(e.target.value)} />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500">End</label>
                                                    <input type="time" className="w-full border p-1 rounded text-sm" value={editOrderEnd} onChange={e => setEditOrderEnd(e.target.value)} />
                                                </div>
                                            </div>

                                            <p className="text-xs font-medium text-gray-700 mb-2">Available Locations:</p>
                                            <div className="space-y-2">
                                                {locations?.map(loc => (
                                                    <label key={loc._id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={editLocationIds.includes(loc._id)}
                                                            onChange={() => handleToggleEditLocation(loc._id)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{loc.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                        <h3 className="font-semibold mb-4">Add New Time Slot</h3>
                        <form onSubmit={handleAddTimeslot} className="space-y-3">
                            <input placeholder="Label (e.g. Lunch 1)" required className="w-full border p-2 rounded" value={newTsLabel} onChange={e => setNewTsLabel(e.target.value)} />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500">Start Time</label>
                                    <input type="time" required className="w-full border p-2 rounded" value={newTsStart} onChange={e => setNewTsStart(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">End Time</label>
                                    <input type="time" required className="w-full border p-2 rounded" value={newTsEnd} onChange={e => setNewTsEnd(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Delivery Time</label>
                                <input type="time" required className="w-full border p-2 rounded" value={newTsDelivery} onChange={e => setNewTsDelivery(e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t pt-2 mt-2">
                                <div className="col-span-2 text-xs font-semibold text-gray-700">Ordering Window</div>
                                <div>
                                    <label className="text-xs text-gray-500">Start</label>
                                    <input type="time" className="w-full border p-2 rounded" value={newTsOrderStart} onChange={e => setNewTsOrderStart(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">End</label>
                                    <input type="time" className="w-full border p-2 rounded" value={newTsOrderEnd} onChange={e => setNewTsOrderEnd(e.target.value)} />
                                </div>
                            </div>

                            <div className="border-t pt-3">
                                <label className="text-xs font-medium text-gray-700 mb-2 block">Available Locations</label>
                                {locations && locations.length > 0 ? (
                                    <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded border">
                                        {locations.map(loc => (
                                            <label key={loc._id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLocationIds.includes(loc._id)}
                                                    onChange={() => handleToggleLocation(loc._id)}
                                                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                                />
                                                <span className="text-sm text-gray-700">{loc.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">No locations available. Add locations first.</p>
                                )}
                                {selectedLocationIds.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-2">⚠️ Select at least one location</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={selectedLocationIds.length === 0}
                            >
                                Add Time Slot
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
