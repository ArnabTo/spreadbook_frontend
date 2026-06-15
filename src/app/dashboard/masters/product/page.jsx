"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Home,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit3,
  Lock,
  Search,
  Eraser,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  ChevronLeft,
  Pencil,
  Trash2,
  ArrowUp,
} from "lucide-react";
import { swrFetcher, productsKey, fetchProducts, deleteProduct } from "@/services/api";

const currentYear = new Date().getFullYear();

export default function ProductPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [nameFilter, setNameFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [arabicNameFilter, setArabicNameFilter] = useState("");

  const params = useMemo(() => {
    const p = { page, page_size: pageSize };
    if (nameFilter) p.search = nameFilter;
    if (codeFilter) p.code = codeFilter;
    if (categoryFilter) p.category = categoryFilter;
    if (arabicNameFilter) p.arabic_name = arabicNameFilter;
    return p;
  }, [page, pageSize, nameFilter, codeFilter, categoryFilter, arabicNameFilter]);

  const key = useMemo(() => productsKey(params), [params]);

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, {
    revalidateOnFocus: false,
  });

  const products = useMemo(() => data?.results || data || [], [data]);
  const totalCount = useMemo(() => data?.count || 0, [data]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  );
  const fromItem = useMemo(
    () => (totalCount === 0 ? 0 : (page - 1) * pageSize + 1),
    [page, pageSize, totalCount]
  );
  const toItem = useMemo(
    () => Math.min(page * pageSize, totalCount),
    [page, pageSize, totalCount]
  );

  const handleSearch = useCallback(() => {
    setPage(1);
    mutate();
  }, [mutate]);

  const handleClear = useCallback(() => {
    setNameFilter("");
    setCodeFilter("");
    setCategoryFilter("");
    setArabicNameFilter("");
    setPage(1);
  }, []);

  const handleDelete = useCallback(
    async (prod) => {
      if (!confirm(`Delete product "${prod.name}"?`)) return;
      try {
        await deleteProduct(prod.id);
        mutate();
      } catch {
        alert("Failed to delete product.");
      }
    },
    [mutate]
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <ChevronDown className="size-3.5" />
          <span className="font-medium text-gray-800">Product</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {currentYear}
          </span>
          <button className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600">
            <Edit3 className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-rose-700 text-white hover:bg-rose-800">
            <Lock className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700">
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* PRODUCT SEARCH Panel */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 text-center text-base font-bold uppercase tracking-wide text-[#004080]">
          PRODUCT SEARCH
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Search By Name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              placeholder="Search By Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Search By Code</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              placeholder="Search By Code"
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Search By Category</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">-- Search By Category --</option>
              <option value="Default">Default</option>
              <option value="Accessories">Accessories</option>
              <option value="Apparel">Apparel</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Admin.SearchByArabicName</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              placeholder="Admin.SearchByArabicName"
              value={arabicNameFilter}
              onChange={(e) => setArabicNameFilter(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleSearch}
            className="flex size-8 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            <Search className="size-4" />
          </button>
          <button
            onClick={handleClear}
            className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            <Eraser className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-[#004080] text-white hover:bg-[#003060]">
            <FileSpreadsheet className="size-4" />
          </button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-[#004080] text-white hover:bg-[#003060]">
            <Printer className="size-4" />
          </button>
        </div>
      </div>

      {/* + ADD & Import Buttons */}
      <div className="flex justify-end gap-2">
        <Link
          href="/dashboard/masters/product/create"
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          <Plus className="size-4" />ADD
        </Link>
        <button className="flex items-center gap-2 rounded-lg bg-[#004080] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#003060]">
          Import <ChevronDown className="size-3.5" />
        </button>
      </div>

      {/* Main Products Data Table */}
      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">PRODUCTS</h2>
        </div>
        <div className="bg-[#e8edf2] px-4 py-2 text-center text-xs text-gray-500">
          Drag a column header and drop it here to group by that column
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-[#dce3ea] text-xs font-semibold uppercase text-[#004080]">
                <th className="px-3 py-2 text-left">NAME</th>
                <th className="px-3 py-2 text-center">CATEGORY</th>
                <th className="px-3 py-2 text-center">CODE</th>
                <th className="px-3 py-2 text-center">TAX</th>
                <th className="px-3 py-2 text-center">PURCHASE PRICE</th>
                <th className="px-3 py-2 text-center">SALES PRICE</th>
                <th className="px-3 py-2 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-red-400">
                    Failed to load products.
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="border-b transition-colors hover:bg-gray-50">
                    <td className="px-3 py-3 text-left font-medium text-gray-800">
                      {prod.name || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {prod.category || "Default"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {prod.code || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {prod.taxes != null ? prod.taxes.toFixed(2) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {prod.supplier_price != null ? prod.supplier_price : "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {prod.price != null ? prod.price : "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/masters/product/create?id=${prod.id}`}
                          className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-slate-800"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod)}
                          className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <button className="flex size-7 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700">
                          <Printer className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t bg-white px-4 py-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="flex size-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <span className="text-xs">|◄</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex size-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <div className="flex size-7 items-center justify-center rounded bg-[#004080] text-xs font-bold text-white">
              {page}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex size-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="size-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="flex size-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <span className="text-xs">►|</span>
            </button>
            <div className="ml-3 flex items-center gap-1.5">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700"
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-xs font-medium text-[#004080]">items per page</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>
              {fromItem} - {toItem} of {totalCount} items
            </span>
            <button
              onClick={() => mutate()}
              className="flex size-7 items-center justify-center rounded border border-gray-300 bg-gray-100 hover:bg-gray-200"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"
      >
        <ArrowUp className="size-5" />
      </button>
    </div>
  );
}
