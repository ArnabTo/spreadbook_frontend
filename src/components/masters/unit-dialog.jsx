"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { createUnit, updateUnit } from "@/services/api";

export function UnitDialog({ open, onClose, onSaved, unit, units }) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [isChild, setIsChild] = useState(false);
  const [parentId, setParentId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = useMemo(() => !!unit, [unit]);
  const title = useMemo(() => (isEdit ? "Edit Measuring Unit" : "Add Measuring Unit"), [isEdit]);

  const parentOptions = useMemo(() => {
    return units.filter(
      (u) => !u.is_child && u.id !== unit?.id
    );
  }, [units, unit]);

  useEffect(() => {
    if (open) {
      if (unit) {
        setName(unit.name || "");
        setShortName(unit.short_name || "");
        setArabicName(unit.arabic_name || "");
        setIsChild(unit.is_child || false);
        setParentId(unit.parent || "");
        setQuantity(unit.quantity != null ? String(unit.quantity) : "");
      } else {
        setName("");
        setShortName("");
        setArabicName("");
        setIsChild(false);
        setParentId("");
        setQuantity("");
      }
      setError("");
    }
  }, [open, unit]);

  const handleSave = useCallback(async () => {
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!shortName.trim()) {
      setError("Short Name is required.");
      return;
    }
    if (!arabicName.trim()) {
      setError("Arabic Name is required.");
      return;
    }
    if (isChild && !parentId) {
      setError("Parent Unit is required when Is Child is enabled.");
      return;
    }
    if (isChild && (!quantity || Number(quantity) <= 0)) {
      setError("Quantity is required and must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        short_name: shortName.trim(),
        arabic_name: arabicName.trim(),
        is_child: isChild,
        parent: isChild && parentId ? parentId : null,
        quantity: isChild && quantity ? Number(quantity) : null,
      };

      if (isEdit) {
        await updateUnit(unit.id, payload);
      } else {
        await createUnit(payload);
      }
      onSaved();
    } catch (err) {
      const msg =
        err?.detail ||
        err?.message ||
        err?.response?.data?.detail ||
        (typeof err === "object" ? JSON.stringify(err) : err) ||
        "Failed to save unit.";
      setError(typeof msg === "string" ? msg : "Failed to save unit.");
    } finally {
      setSaving(false);
    }
  }, [name, shortName, arabicName, isChild, parentId, quantity, isEdit, unit, onSaved]);

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
          <h2 className="text-base font-bold uppercase tracking-wide text-white">{title}</h2>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unit name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Short Name <span className="text-red-500">*</span>
            </label>
            <input
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Short name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Arabic Name <span className="text-red-500">*</span>
            </label>
            <input
              value={arabicName}
              onChange={(e) => setArabicName(e.target.value)}
              placeholder="Arabic name"
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
                if (!e.target.checked) {
                  setParentId("");
                  setQuantity("");
                }
              }}
              className="size-4 accent-brand"
            />
            <label htmlFor="isChildCheck" className="text-sm font-semibold text-gray-700">
              Is Child
            </label>
          </div>

          {isChild && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Parent Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  <option value="">-- Select Parent Unit --</option>
                  {parentOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Conversion quantity"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
            </>
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
