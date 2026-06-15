"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import { swrFetcher, deleteSalesQuotationCurrency } from "@/services/api";
import { endpoints } from "@/utils/axios";
import { CurrencyDialog } from "@/components/settings/currency-dialog";

const currenciesKey = (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
    });
    const qs = searchParams.toString();
    return qs ? `${endpoints.salesQuotationCurrencies}?${qs}` : endpoints.salesQuotationCurrencies;
};

export default function CurrencyPage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState(null);

    const params = useMemo(() => {
        const p = { page, page_size: pageSize };
        if (search) p.search = search;
        return p;
    }, [page, pageSize, search]);

    const key = useMemo(() => currenciesKey(params), [params]);
    const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, { revalidateOnFocus: false });
    const currencies = useMemo(() => data?.results || data || [], [data]);
    const totalCount = useMemo(() => data?.count || 0, [data]);
    const totalPages = useMemo(() => {
        if (data?.total_pages) return data.total_pages;
        return Math.ceil(totalCount / pageSize) || 1;
    }, [data, totalCount, pageSize]);

    const handleDelete = useCallback(async (id) => {
        if (!confirm("Are you sure you want to delete this currency?")) return;
        await deleteSalesQuotationCurrency(id);
        mutate();
    }, [mutate]);

    const handleSaved = useCallback(() => {
        setDialogOpen(false);
        setEditingCurrency(null);
        mutate();
    }, [mutate]);

    const openEdit = useCallback((currency) => {
        setEditingCurrency(currency);
        setDialogOpen(true);
    }, []);

    const openCreate = useCallback(() => {
        setEditingCurrency(null);
        setDialogOpen(true);
    }, []);

    return (
        <div className="mx-auto max-w-6xl space-y-4 py-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800">Currencies</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => mutate()} className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100"><RefreshCw className="size-4" /></button>
                    <button onClick={openCreate} className="flex items-center gap-1 rounded-lg bg-[#004080] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003060]"><Plus className="size-4" /> Add New</button>
                </div>
            </div>

            <div className="flex gap-3">
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or code..." className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
            </div>

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Failed to load currencies.</div>}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Code</th>
                            <th className="px-4 py-3 font-semibold">Symbol</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : currencies.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No currencies found.</td></tr>
                        ) : currencies.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                                <td className="px-4 py-3 text-gray-600">{c.code || "—"}</td>
                                <td className="px-4 py-3 text-gray-600">{c.symbol || "—"}</td>
                                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => openEdit(c)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50"><Pencil className="size-4" /></button>
                                        <button onClick={() => handleDelete(c.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{totalCount} item{totalCount !== 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-1">
                        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-100">Previous</button>
                        <span className="px-2 font-medium">{page} / {totalPages}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-100">Next</button>
                    </div>
                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded border px-2 py-1 text-sm">
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            )}

            <CurrencyDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingCurrency(null); }} onSaved={handleSaved} currency={editingCurrency} />
        </div>
    );
}
