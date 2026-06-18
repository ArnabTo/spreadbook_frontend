"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Home, ChevronRight, ChevronDown } from "lucide-react";
import {
  swrFetcher,
  categoriesKey,
  productServicesKey,
  createProductService,
  updateProductService,
  fetchProductServices,
} from "@/services/api";
import { CreatePermission, UpdatePermission, DeletePermission } from "@/components/permission/action-permission";

export default function ProductServiceCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [category, setCategory] = useState("");
  const [isTaxApplied, setIsTaxApplied] = useState(false);
  const [taxRate, setTaxRate] = useState("");
  const [salesPrice, setSalesPrice] = useState("");
  const [qualityApplicable, setQualityApplicable] = useState(false);
  const [minSalesRate, setMinSalesRate] = useState("");
  const [avgQty, setAvgQty] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const { data: categoriesData } = useSWR(categoriesKey({ page_size: 200 }), swrFetcher, {
    revalidateOnFocus: false,
  });
  const categories = useMemo(() => categoriesData?.results || categoriesData || [], [categoriesData]);

  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    fetchProductServices({ id: editId })
      .then((data) => {
        const services = data?.results || data || [];
        const svc = Array.isArray(services) ? services[0] : services;
        if (svc) {
          setName(svc.name || "");
          setCode(svc.code || "");
          setArabicName(svc.arabic_name || "");
          setCategory(svc.category || "");
          setIsTaxApplied(svc.is_tax_applied || false);
          setTaxRate(svc.tax_rate != null ? String(svc.tax_rate) : "");
          setSalesPrice(svc.sales_price != null ? String(svc.sales_price) : "");
          setQualityApplicable(svc.quality_applicable || false);
          setMinSalesRate(svc.minimum_sales_rate != null ? String(svc.minimum_sales_rate) : "");
          setAvgQty(svc.avg_qty != null ? String(svc.avg_qty) : "");
          setIsActive(svc.is_active !== false);
        }
      })
      .catch(() => setError("Failed to load."))
      .finally(() => setLoadingData(false));
  }, [editId]);

  const validateForm = () => {
    if (!name.trim()) return "Name is required.";
    if (!code.trim()) return "Code is required.";
    if (!category) return "Category is required.";
    if (!salesPrice || Number(salesPrice) < 0) return "Valid Sales Price is required.";
    if (isTaxApplied && (!taxRate || Number(taxRate) <= 0)) return "Tax Rate is required when tax is applied.";
    if (minSalesRate && Number(minSalesRate) > Number(salesPrice || 0)) return "Min Sales Rate cannot exceed Sales Price.";
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
      const payload = {
        name: name.trim(),
        code: code.trim(),
        arabic_name: arabicName.trim() || null,
        category: category || null,
        is_tax_applied: isTaxApplied,
        tax_rate: isTaxApplied ? Number(taxRate) : null,
        sales_price: Number(salesPrice),
        quality_applicable: qualityApplicable,
        minimum_sales_rate: minSalesRate ? Number(minSalesRate) : null,
        avg_qty: avgQty ? Number(avgQty) : null,
        is_active: isActive,
      };
      if (isEdit) {
        await updateProductService(editId, payload);
      } else {
        await createProductService(payload);
      }
      router.push("/dashboard/masters/product-services");
    } catch (err) {
      const msg = err?.detail || err?.message || "Failed to save.";
      setError(typeof msg === "string" ? msg : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand">
            <Home className="size-4" />
          </Link>
          <span>Home</span>
          <ChevronRight className="size-3.5" />
          <Link href="/dashboard/masters/product-services" className="hover:text-brand">
            Product Services
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">
            {isEdit ? "Edit Service" : "Add Service"}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 rounded-t-lg bg-[#004080] px-4 py-3">
          <h2 className="text-base font-bold uppercase text-white">
            {isEdit ? "EDIT PRODUCT SERVICE" : "ADD PRODUCT SERVICE"}
          </h2>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Service name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Code <span className="text-red-500">*</span>
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Service code"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Arabic Name</label>
            <input
              value={arabicName}
              onChange={(e) => setArabicName(e.target.value)}
              placeholder="Arabic name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Sales Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={salesPrice}
              onChange={(e) => setSalesPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isTaxApplied"
              checked={isTaxApplied}
              onChange={(e) => {
                setIsTaxApplied(e.target.checked);
                if (!e.target.checked) setTaxRate("");
              }}
              className="size-4 accent-brand"
            />
            <label htmlFor="isTaxApplied" className="text-sm font-semibold text-gray-700">
              Is Tax Applied
            </label>
          </div>

          {isTaxApplied && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">
                Tax Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
          )}

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="qualityApplicable"
              checked={qualityApplicable}
              onChange={(e) => setQualityApplicable(e.target.checked)}
              className="size-4 accent-brand"
            />
            <label htmlFor="qualityApplicable" className="text-sm font-semibold text-gray-700">
              Quality Applicable
            </label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 accent-brand"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
              Active
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Minimum Sales Rate</label>
            <input
              type="number"
              step="0.01"
              value={minSalesRate}
              onChange={(e) => setMinSalesRate(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Avg Qty</label>
            <input
              type="number"
              step="0.01"
              value={avgQty}
              onChange={(e) => setAvgQty(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          href="/dashboard/masters/product-services"
          className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </Link>
        <CreatePermission module="product_service">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[#004080] px-6 py-2 text-sm font-semibold text-white hover:bg-[#003060] disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Update" : "Save"}
        </button>
        </CreatePermission>
      </div>
    </div>
  );
}
