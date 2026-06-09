"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { createCategory, updateCategory } from "@/services/api";

export function CategoryDialog({ open, onClose, onSaved, category, categories }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isChild, setIsChild] = useState(false);
    const [parentId, setParentId] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const isEdit = useMemo(() => !!category, [category]);
    const title = useMemo(() => (isEdit ? "Edit Category" : "Add New Category"), [isEdit]);
    const parentOptions = useMemo(
        () => categories.filter((c) => c.id !== category?.id),
        [categories, category]
    );

    useEffect(() => {
        if (open) {
            if (category) {
                setName(category.name || "");
                setDescription(category.description || "");
                setIsChild(category.is_child || false);
                setParentId(category.parent || "");
            } else {
                setName("");
                setDescription("");
                setIsChild(false);
                setParentId("");
            }
            setError("");
        }
    }, [open, category]);

    const handleSave = useCallback(async () => {
        setError("");
        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                is_child: isChild,
                parent: isChild && parentId ? parentId : null,
            };

            if (isEdit) {
                await updateCategory(category.id, payload);
            } else {
                await createCategory(payload);
            }
            onSaved();
        } catch (err) {
            const msg = err?.detail || err?.message || err?.response?.data?.detail || "Failed to save category.";
            setError(typeof msg === "string" ? msg : "Failed to save category.");
        } finally {
            setSaving(false);
        }
    }, [name, description, isChild, parentId, isEdit, category, onSaved]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-black/10">
                <div className="flex items-center justify-between rounded-t-xl bg-[#004080] px-5 py-3">
                    <h2 className="text-base font-bold uppercase tracking-wide text-white">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex size-7 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="space-y-4 px-5 py-5">
                    {error && (
                        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Category name"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isChildCheck"
                            checked={isChild}
                            onChange={(e) => {
                                setIsChild(e.target.checked);
                                if (!e.target.checked) setParentId("");
                            }}
                            className="size-4 accent-brand"
                        />
                        <label
                            htmlFor="isChildCheck"
                            className="text-sm font-semibold text-gray-700"
                        >
                            Is Child Category
                        </label>
                    </div>

                    {isChild && (
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">
                                Parent Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                            >
                                <option value="">-- Select Parent Category --</option>
                                {parentOptions.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} (ID: {c.id})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 rounded-b-xl border-t bg-gray-50 px-5 py-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-[#004080] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003060] disabled:opacity-60"
                    >
                        {saving ? "Saving..." : isEdit ? "Update" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
