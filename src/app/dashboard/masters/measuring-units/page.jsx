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
  X,
  RefreshCw,
  ChevronLeft,
  Pencil,
  Trash2,
} from "lucide-react";
import { swrFetcher, unitsKey, deleteUnit } from "@/services/api";
import { UnitDialog } from "@/components/masters/unit-dialog";

const currentYear = new Date().getFullYear();

export default function MeasuringUnitsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isChildFilter, setIsChildFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const params = useMemo(() => {
    const p = { page, page_size: pageSize };
    if (search) p.search = search;
    if (isChildFilter !== "") p.is_child = isChildFilter;
    return p;
  }, [page, pageSize, search, isChildFilter]);

  const key = useMemo(() => unitsKey(params), [params]);

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, {
    revalidateOnFocus: false,
  });

  const units = useMemo(() => data?.results || data || [], [data]);
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

  const openAdd = useCallback(() => {
    setEditingUnit(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((u) => {
    setEditingUnit(u);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (u) => {
      if (!confirm(`Delete measuring unit "${u.name}"?`)) return;
      try {
        await deleteUnit(u.id);
        mutate();
      } catch {
        alert("Failed to delete unit.");
      }
    },
    [mutate]
  );

  const handleSaved = useCallback(() => {
    setDialogOpen(false);
    setEditingUnit(null);
    mutate();
  }, [mutate]);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingUnit(null);
  }, []);

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
          <span className="font-medium text-gray-800">Measuring Units</span>
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

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          <Plus className="size-4" /> ADD
        </button>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">
            MEASURING UNITS
          </h2>
        </div>
        <div className="bg-[#e8edf2] px-4 py-2 text-center text-xs text-gray-500">
          Drag a column header and drop it here to group by that column
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-[#dce3ea] text-xs font-semibold uppercase text-[#004080]">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-center">NAME</th>
                <th className="px-3 py-2 text-center">SHORT NAME</th>
                <th className="px-3 py-2 text-center">ARABIC NAME</th>
                <th className="px-3 py-2 text-center">IS CHILD</th>
                <th className="px-3 py-2 text-center">PARENT UNIT</th>
                <th className="px-3 py-2 text-center">QUANTITY</th>
                <th className="px-3 py-2 text-center">ACTIONS</th>
              </tr>
              <tr className="border-b bg-[#eef1f5]">
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5">
                  <input
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand"
                    placeholder="Filter name..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </td>
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-3">
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <input
                        type="radio"
                        name="isChildFilter"
                        value="true"
                        checked={isChildFilter === "true"}
                        onChange={() => {
                          setIsChildFilter("true");
                          setPage(1);
                        }}
                        className="size-3"
                      />
                      TRUE
                    </label>
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                      <input
                        type="radio"
                        name="isChildFilter"
                        value="false"
                        checked={isChildFilter === "false"}
                        onChange={() => {
                          setIsChildFilter("false");
                          setPage(1);
                        }}
                        className="size-3"
                      />
                      FALSE
                    </label>
                    {isChildFilter !== "" && (
                      <button
                        onClick={() => {
                          setIsChildFilter("");
                          setPage(1);
                        }}
                        className="ml-1 text-xs text-red-500 hover:text-red-700"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-red-400">
                    Failed to load measuring units.
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    No measuring units found.
                  </td>
                </tr>
              ) : (
                units.map((u) => (
                  <tr key={u.id} className="border-b transition-colors hover:bg-gray-50">
                    <td className="px-3 py-3 text-left text-gray-700">{u.id}</td>
                    <td className="px-3 py-3 text-center font-medium text-gray-800">
                      {u.name || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {u.short_name || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {u.arabic_name || "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {u.is_child ? (
                        <span className="font-bold text-green-600">✓</span>
                      ) : (
                        <X className="mx-auto size-4 text-red-500" />
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {u.parent_name || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {u.quantity != null ? u.quantity : "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-slate-800"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-red-600"
                        >
                          <Trash2 className="size-3.5" />
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

      <UnitDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSaved={handleSaved}
        unit={editingUnit}
        units={units}
      />
    </div>
  );
}
