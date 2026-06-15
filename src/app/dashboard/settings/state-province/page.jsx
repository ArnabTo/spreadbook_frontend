"use client";

import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import { RefreshCw, Plus, Pencil, Trash2 } from "lucide-react";
import { swrFetcher, statesKey, deleteState } from "@/services/api";
import { StateProvinceDialog } from "@/components/settings/state-province-dialog";
import { endpoints } from "@/utils/axios";

export default function StateProvincePage() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [countryFilter, setCountryFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingState, setEditingState] = useState(null);

    const params = useMemo(() => {
        const p = { page, page_size: pageSize };
        if (search) p.search = search;
        if (countryFilter) p.country_id = countryFilter;
        return p;
    }, [page, pageSize, search, countryFilter]);

    const key = useMemo(() => statesKey(params), [params]);
    const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, { revalidateOnFocus: false });
    const states = useMemo(() => data?.results || data || [], [data]);
    const totalCount = useMemo(() => data?.count || 0, [data]);
    const totalPages = useMemo(() => {
        if (data?.total_pages) return data.total_pages;
        return Math.ceil(totalCount / pageSize) || 1;
    }, [data, totalCount, pageSize]);

    const { data: countriesData } = useSWR(endpoints.countries, swrFetcher, { revalidateOnFocus: false });
    const countries = useMemo(() => countriesData?.results || countriesData || [], [countriesData]);

    const handleDelete = useCallback(async (id) => {
        if (!confirm("Are you sure you want to delete this state/province?")) return;
        await deleteState(id);
        mutate();
    }, [mutate]);

    const handleSaved = useCallback(() => {
        setDialogOpen(false);
        setEditingState(null);
        mutate();
    }, [mutate]);

    const openEdit = useCallback((state) => {
        setEditingState(state);
        setDialogOpen(true);
    }, []);

    const openCreate = useCallback(() => {
        setEditingState(null);
        setDialogOpen(true);
    }, []);

    return (
        <div className="mx-auto max-w-6xl space-y-4 py-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-800">States / Provinces</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => mutate()} className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100"><RefreshCw className="size-4" /></button>
                    <button onClick={openCreate} className="flex items-center gap-1 rounded-lg bg-[#004080] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003060]"><Plus className="size-4" /> Add New</button>
                </div>
            </div>

            <div className="flex gap-3">
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name..." className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
                <select value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand">
                    <option value="">All Countries</option>
                    {countries.filter(c => c.is_active !== false).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">Failed to load states/provinces.</div>}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Name</th>
                            <th className="px-4 py-3 font-semibold">Arabic Name</th>
                            <th className="px-4 py-3 font-semibold">Country</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : states.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No states/provinces found.</td></tr>
                        ) : states.map((s) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                                <td className="px-4 py-3 text-gray-600">{s.arabic_name || "—"}</td>
                                <td className="px-4 py-3 text-gray-600">{s.country_name || "—"}</td>
                                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{s.is_active ? "Active" : "Inactive"}</span></td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => openEdit(s)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50"><Pencil className="size-4" /></button>
                                        <button onClick={() => handleDelete(s.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button>
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

            <StateProvinceDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditingState(null); }} onSaved={handleSaved} stateProvince={editingState} endpointCountries={endpoints.countries} />
        </div>
    );
}
