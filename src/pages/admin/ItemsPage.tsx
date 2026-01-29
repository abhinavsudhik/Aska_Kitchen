import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Plus, Edit2, X, Upload, Image as ImageIcon } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

// Component to display item image from Convex storage
function ItemImage({ storageId, imageUrl, name }: { storageId?: Id<"_storage">, imageUrl?: string, name: string }) {
    const imageUrlFromStorage = useQuery(
        api.files.getImageUrl,
        storageId ? { storageId } : "skip"
    );

    const displayUrl = imageUrlFromStorage || imageUrl;

    if (!displayUrl) {
        return (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
            </div>
        );
    }

    return (
        <img
            src={displayUrl}
            alt={name}
            className="w-12 h-12 object-cover rounded-lg"
        />
    );
}

// Component for image preview in modal
function ImagePreviewInModal({ storageId, imageUrl, onUploadClick }: {
    storageId?: Id<"_storage">,
    imageUrl?: string,
    onUploadClick: () => void
}) {
    const imageUrlFromStorage = useQuery(
        api.files.getImageUrl,
        storageId ? { storageId } : "skip"
    );

    const displayUrl = imageUrlFromStorage || imageUrl;

    if (displayUrl) {
        return (
            <div className="space-y-3">
                <img
                    src={displayUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mx-auto"
                />
                <button
                    type="button"
                    onClick={onUploadClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" /> Change Photo
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
                <button
                    type="button"
                    onClick={onUploadClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" /> Upload Photo
                </button>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
        </div>
    );
}

export default function ItemsPage() {
    const items = useQuery(api.items.list);
    const timeslots = useQuery(api.timeslots.list);
    const createItem = useMutation(api.items.create);
    const updateItem = useMutation(api.items.update);
    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        purchasePrice: 0,
        sellingPrice: 0,
        imageUrl: "",
        imageStorageId: "" as string | undefined,
        availableTimeslotIds: [] as string[],
        isAvailable: true
    });

    const handleOpenModal = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description || "",
                purchasePrice: item.purchasePrice,
                sellingPrice: item.sellingPrice,
                imageUrl: item.imageUrl || "",
                imageStorageId: item.imageStorageId,
                availableTimeslotIds: item.availableTimeslotIds,
                isAvailable: item.isAvailable
            });
            // Set preview if item has an image
            if (item.imageStorageId || item.imageUrl) {
                setImagePreview(item.imageUrl || "");
            } else {
                setImagePreview("");
            }
        } else {
            setEditingItem(null);
            setFormData({
                name: "",
                description: "",
                purchasePrice: 0,
                sellingPrice: 0,
                imageUrl: "",
                imageStorageId: undefined,
                availableTimeslotIds: [],
                isAvailable: true
            });
            setImagePreview("");
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let imageStorageId = formData.imageStorageId;

            // Upload new image if file is selected
            if (selectedFile) {
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });
                const { storageId } = await result.json();
                imageStorageId = storageId;
            }

            const payload = {
                ...formData,
                imageStorageId: imageStorageId as Id<"_storage"> | undefined,
                availableTimeslotIds: formData.availableTimeslotIds as Id<"timeslots">[]
            };

            if (editingItem) {
                await updateItem({ id: editingItem._id, ...payload });
            } else {
                await createItem(payload);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving item:", err);
            alert("Failed to save item");
        }
    };

    const toggleTimeslot = (tsId: string) => {
        setFormData(prev => {
            const ids = prev.availableTimeslotIds.includes(tsId)
                ? prev.availableTimeslotIds.filter(id => id !== tsId)
                : [...prev.availableTimeslotIds, tsId];
            return { ...prev, availableTimeslotIds: ids };
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    if (!items || !timeslots) return <div>Loading Items...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Items Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" /> Add New Item
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Image</th>
                            <th className="px-6 py-3">Item Name</th>
                            <th className="px-6 py-3">Purchase Rate</th>
                            <th className="px-6 py-3">Selling Rate</th>
                            <th className="px-6 py-3">Available Timeslots</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <ItemImage
                                        storageId={item.imageStorageId}
                                        imageUrl={item.imageUrl}
                                        name={item.name}
                                    />
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4">₹{item.purchasePrice}</td>
                                <td className="px-6 py-4 font-bold text-green-600">₹{item.sellingPrice}</td>
                                <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                                    {item.availableTimeslotIds.length} slots
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {item.isAvailable ? "Available" : "Unavailable"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold">{editingItem ? "Edit Item" : "New Item"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input required type="text" className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Purchase Price</label>
                                    <input required type="number" className="w-full border rounded p-2" value={formData.purchasePrice} onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Selling Price</label>
                                    <input required type="number" className="w-full border rounded p-2" value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea className="w-full border rounded p-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Food Item Photo</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <ImagePreviewInModal
                                        storageId={formData.imageStorageId as Id<"_storage"> | undefined}
                                        imageUrl={imagePreview}
                                        onUploadClick={() => fileInputRef.current?.click()}
                                    />
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Available In Timeslots</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {timeslots.map(ts => (
                                        <label key={ts._id} className="flex items-center space-x-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={formData.availableTimeslotIds.includes(ts._id)}
                                                onChange={() => toggleTimeslot(ts._id)}
                                            />
                                            <span>{ts.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })} />
                                <label className="text-sm font-medium">Available for Order</label>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                                    Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
