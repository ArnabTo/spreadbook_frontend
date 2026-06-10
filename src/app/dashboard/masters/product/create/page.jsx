"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import {
  Home,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  X,
  Upload,
} from "lucide-react";
import { swrFetcher, unitsKey, productsKey, categoriesKey, createProduct, updateProduct, fetchUnits, fetchProducts } from "@/services/api";

export default function ProductCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;
  const fileInputRef = useRef(null);

  // Form state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [isTaxApplied, setIsTaxApplied] = useState(false);
  const [taxRate, setTaxRate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [minStockQty, setMinStockQty] = useState("");
  const [minSalesRate, setMinSalesRate] = useState("");
  const [mrp, setMrp] = useState("");
  const [lowStockNotification, setLowStockNotification] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [primaryMeasuringUnit, setPrimaryMeasuringUnit] = useState("");
  const [isMultipleUnitEnabled, setIsMultipleUnitEnabled] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [rmElementUsed, setRmElementUsed] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [avgQty, setAvgQty] = useState("");

  // Unit prices table
  const [unitPriceRows, setUnitPriceRows] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  // Fetch units for dropdowns
  const { data: unitsData } = useSWR(unitsKey({ page_size: 200 }), swrFetcher, {
    revalidateOnFocus: false,
  });
  const units = useMemo(() => unitsData?.results || unitsData || [], [unitsData]);

  // Fetch categories from backend
  const { data: categoriesData } = useSWR(categoriesKey({ page_size: 200 }), swrFetcher, {
    revalidateOnFocus: false,
  });
  const categories = useMemo(() => categoriesData?.results || categoriesData || [], [categoriesData]);

  // Fetch product for edit
  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    fetchProducts({ id: editId }).then((data) => {
      const products = data?.results || data || [];
      const prod = Array.isArray(products) ? products[0] : products;
      if (prod) {
        setName(prod.name || "");
        setArabicName(prod.arabic_name || "");
        setDescription(prod.description || "");
        setCategory(prod.category || "");
        setSalesPrice(prod.price != null ? String(prod.price) : "");
        setIsTaxApplied(prod.is_tax_applied || false);
        setTaxRate(prod.tax_rate != null ? String(prod.tax_rate) : "");
        setPurchasePrice(prod.supplier_price != null ? String(prod.supplier_price) : "");
        setMinStockQty(prod.low_stock_threshold != null ? String(prod.low_stock_threshold) : "");
        setMinSalesRate(prod.min_sales_rate != null ? String(prod.min_sales_rate) : "");
        setMrp(prod.mrp != null ? String(prod.mrp) : "");
        setLowStockNotification(prod.low_stock_threshold != null && prod.low_stock_threshold > 0);
        setIsActive(prod.is_active !== false);
        setPrimaryMeasuringUnit(prod.unit || "");
        setIsMultipleUnitEnabled(prod.is_multiple_unit_enabled || false);
        setRemarks(prod.remarks || "");
        setRmElementUsed(prod.rm_element_used || "");
        setHsnCode(prod.hsn_code || "");
        setAvgQty(prod.avg_qty != null ? String(prod.avg_qty) : "");
        if (prod.unit_prices_data && prod.unit_prices_data.length > 0) {
          setUnitPriceRows(
            prod.unit_prices_data.map((up) => ({
              key: up.id || crypto.randomUUID(),
              measuring_unit: up.measuring_unit || "",
              sales_price: up.sales_price != null ? String(up.sales_price) : "",
              purchase_price: up.purchase_price != null ? String(up.purchase_price) : "",
            }))
          );
        }
        if (prod.image) setImagePreview(prod.image);
      }
    }).catch(() => setError("Failed to load product."))
      .finally(() => setLoadingData(false));
  }, [editId]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Auto-add primary measuring unit to unit prices table when changed
  const prevPrimaryUnit = useRef(primaryMeasuringUnit);
  useEffect(() => {
    if (!isMultipleUnitEnabled || !primaryMeasuringUnit) return;
    if (primaryMeasuringUnit === prevPrimaryUnit.current) return;
    prevPrimaryUnit.current = primaryMeasuringUnit;
    const alreadyInTable = unitPriceRows.some(
      (r) => String(r.measuring_unit) === String(primaryMeasuringUnit)
    );
    if (!alreadyInTable) {
      setUnitPriceRows((prev) => [
        ...prev,
        {
          key: crypto.randomUUID(),
          measuring_unit: primaryMeasuringUnit,
          sales_price: salesPrice || "0",
          purchase_price: purchasePrice || "0",
        },
      ]);
    }
  }, [primaryMeasuringUnit, isMultipleUnitEnabled, unitPriceRows, salesPrice, purchasePrice]);

  const addUnitPriceRow = () => {
    setUnitPriceRows((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        measuring_unit: "",
        sales_price: salesPrice || "0",
        purchase_price: purchasePrice || "0",
      },
    ]);
  };

  const removeUnitPriceRow = (key) => {
    setUnitPriceRows((prev) => prev.filter((r) => r.key !== key));
  };

  const updateUnitPriceRow = (key, field, value) => {
    setUnitPriceRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r))
    );
  };

  const validateForm = () => {
    if (!name.trim()) return "Name is required.";
    if (!arabicName.trim()) return "Arabic Name is required.";
    if (!primaryMeasuringUnit) return "Primary Measuring Unit is required.";
    if (isTaxApplied && (!taxRate || Number(taxRate) < 0)) return "Valid Tax Rate is required.";
    if (isMultipleUnitEnabled && unitPriceRows.length === 0) return "At least one unit price row is required when multiple units is enabled.";
    const unitIds = unitPriceRows.map((r) => r.measuring_unit).filter(Boolean);
    if (new Set(unitIds).size !== unitIds.length) return "Duplicate measuring units in unit prices table.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      if (image) formData.append("image", image);
      formData.append("name", name.trim());
      formData.append("arabic_name", arabicName.trim());
      formData.append("description", description || "");
      formData.append("category", category || "");
      formData.append("price", salesPrice || "0");
      formData.append("is_tax_applied", isTaxApplied ? "true" : "false");
      if (isTaxApplied) formData.append("tax_rate", taxRate || "0");
      formData.append("supplier_price", purchasePrice || "0");
      formData.append("low_stock_threshold", lowStockNotification ? "20" : "0");
      formData.append("min_sales_rate", minSalesRate || "0");
      formData.append("mrp", mrp || "0");
      formData.append("is_active", isActive ? "true" : "false");
      formData.append("unit", primaryMeasuringUnit);
      formData.append("is_multiple_unit_enabled", isMultipleUnitEnabled ? "true" : "false");
      formData.append("remarks", remarks || "");
      formData.append("rm_element_used", rmElementUsed || "");
      formData.append("hsn_code", hsnCode || "");
      formData.append("avg_qty", avgQty || "0");

      if (isMultipleUnitEnabled && unitPriceRows.length > 0) {
        const unitPrices = unitPriceRows.map((r) => ({
          measuring_unit: r.measuring_unit,
          sales_price: Number(r.sales_price) || 0,
          purchase_price: Number(r.purchase_price) || 0,
        }));
        formData.append("unit_prices", JSON.stringify(unitPrices));
      }

      if (isEdit) {
        await updateProduct(editId, formData);
      } else {
        await createProduct(formData);
      }
      router.push("/dashboard/masters/product");
    } catch (err) {
      const msg = err?.detail || err?.message || "Failed to save product.";
      setError(typeof msg === "string" ? msg : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        Loading product...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb Bar */}
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand">
            <Home className="size-4" />
          </Link>
          <span>Home</span>
          <ChevronRight className="size-3.5" />
          <Link href="/dashboard/masters/product" className="hover:text-brand">
            Product
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">
            {isEdit ? "Edit Product" : "Add Product"}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 rounded-t-lg bg-[#004080] px-4 py-3">
          <h2 className="text-base font-bold uppercase text-white">
            {isEdit ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}
          </h2>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Image Upload */}
          <div className="space-y-1 md:col-span-3">
            <label className="text-sm font-semibold text-gray-700">Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="size-20 rounded-lg border object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <Upload className="size-4" /> {imagePreview ? "Change" : "Upload"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Arabic Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Arabic Name <span className="text-red-500">*</span>
            </label>
            <input value={arabicName} onChange={(e) => setArabicName(e.target.value)} placeholder="Arabic name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand">
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sales Price */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Sales Price</label>
            <input type="number" step="0.01" value={salesPrice} onChange={(e) => setSalesPrice(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Purchase Price */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Purchase Price</label>
            <input type="number" step="0.01" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* MRP */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">MRP</label>
            <input type="number" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Is Tax Applied */}
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="isTaxApplied" checked={isTaxApplied} onChange={(e) => { setIsTaxApplied(e.target.checked); if (!e.target.checked) setTaxRate(""); }} className="size-4 accent-brand" />
            <label htmlFor="isTaxApplied" className="text-sm font-semibold text-gray-700">Is Tax Applied</label>
          </div>

          {/* Tax Rate (conditional) */}
          {isTaxApplied && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Tax Rate (%)</label>
              <input type="number" step="0.01" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>
          )}

          {/* Min Stock Qty */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Minimum Stock Quantity</label>
            <input type="number" value={minStockQty} onChange={(e) => setMinStockQty(e.target.value)} placeholder="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Min Sales Rate */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Minimum Sales Rate</label>
            <input type="number" step="0.01" value={minSalesRate} onChange={(e) => setMinSalesRate(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Low Stock Notification */}
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="lowStockNotification" checked={lowStockNotification} onChange={(e) => setLowStockNotification(e.target.checked)} className="size-4 accent-brand" />
            <label htmlFor="lowStockNotification" className="text-sm font-semibold text-gray-700">Low Stock Notification</label>
          </div>

          {/* RM / Element Used */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">RM / Element Used</label>
            <input value={rmElementUsed} onChange={(e) => setRmElementUsed(e.target.value)} placeholder="Raw materials" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* HSN Code */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">HSN Code</label>
            <input value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="HSN Code" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Avg Qty */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Avg Qty</label>
            <input type="number" step="0.01" value={avgQty} onChange={(e) => setAvgQty(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          {/* Primary Measuring Unit */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Primary Measuring Unit <span className="text-red-500">*</span>
            </label>
            <select value={primaryMeasuringUnit} onChange={(e) => setPrimaryMeasuringUnit(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand">
              <option value="">-- Select --</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Is Multiple Measuring Unit Enable */}
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="isMultiUnit" checked={isMultipleUnitEnabled} onChange={(e) => { setIsMultipleUnitEnabled(e.target.checked); if (!e.target.checked) { setUnitPriceRows([]); } else if (primaryMeasuringUnit && unitPriceRows.length === 0) { setUnitPriceRows([{ key: crypto.randomUUID(), measuring_unit: primaryMeasuringUnit, sales_price: salesPrice || "0", purchase_price: purchasePrice || "0" }]); } }} className="size-4 accent-brand" />
            <label htmlFor="isMultiUnit" className="text-sm font-semibold text-gray-700">Is Multiple Measuring Unit Enable</label>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 accent-brand" />
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">Is Active</label>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 space-y-1">
          <label className="text-sm font-semibold text-gray-700">Product Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Product description" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>

        {/* Remarks */}
        <div className="mt-4 space-y-1">
          <label className="text-sm font-semibold text-gray-700">Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} placeholder="Remarks" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
      </div>

      {/* Unit Prices Table (conditional) */}
      {isMultipleUnitEnabled && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="rounded-t-xl bg-[#004080] px-4 py-3 text-center">
            <h3 className="text-base font-bold uppercase text-white">UNIT PRICES</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="bg-[#dce3ea] text-xs font-semibold uppercase text-[#004080]">
                  <th className="px-3 py-2 text-center">MEASURING UNIT</th>
                  <th className="px-3 py-2 text-center">SALES PRICE</th>
                  <th className="px-3 py-2 text-center">PURCHASE PRICE</th>
                  <th className="px-3 py-2 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {unitPriceRows.map((row) => (
                  <tr key={row.key} className="border-b">
                    <td className="px-3 py-2">
                      <select
                        value={row.measuring_unit}
                        onChange={(e) => updateUnitPriceRow(row.key, "measuring_unit", e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand"
                      >
                        <option value="">-- Select Unit --</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={row.sales_price}
                        onChange={(e) => updateUnitPriceRow(row.key, "sales_price", e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={row.purchase_price}
                        onChange={(e) => updateUnitPriceRow(row.key, "purchase_price", e.target.value)}
                        placeholder="0.00"
                        className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeUnitPriceRow(row.key)}
                        className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-red-600"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {unitPriceRows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                      No unit price rows. Click &quot;Add Row&quot; to add.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t bg-gray-50 px-4 py-2">
            <button
              type="button"
              onClick={addUnitPriceRow}
              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              <Plus className="size-3.5" /> Add Row
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/masters/product"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#004080] px-6 py-2 text-sm font-semibold text-white hover:bg-[#003060] disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
