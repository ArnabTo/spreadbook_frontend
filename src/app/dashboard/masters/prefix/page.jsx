"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import { useTranslation } from "react-i18next";
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
import {
  swrFetcher,
  prefixesKey,
  deletePrefix,
  fetchFinancialYears,
} from "@/services/api";
import { PrefixDialog } from "@/components/masters/prefix-dialog";

const currentYear = new Date().getFullYear();

export default function PrefixPage() {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchSelectService, setSearchSelectService] = useState("");
  const [searchSelectMode, setSearchSelectMode] = useState("");
  const [searchPrefix, setSearchPrefix] = useState("");
  const [searchCurrentIndex, setSearchCurrentIndex] = useState("");
  const [searchNarration, setSearchNarration] = useState("");
  const [searchPrefixSeries, setSearchPrefixSeries] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrefix, setEditingPrefix] = useState(null);

  const params = useMemo(() => {
    const p = { page, page_size: pageSize };
    if (searchSelectService) p.search_select_service = searchSelectService;
    if (searchSelectMode) p.search_select_mode = searchSelectMode;
    if (searchPrefix) p.search_prefix = searchPrefix;
    if (searchCurrentIndex) p.search_current_index = searchCurrentIndex;
    if (searchNarration) p.search_narration = searchNarration;
    if (searchPrefixSeries) p.search_prefix_series = searchPrefixSeries;
    return p;
  }, [
    page, pageSize,
    searchSelectService, searchSelectMode,
    searchPrefix, searchCurrentIndex,
    searchNarration, searchPrefixSeries,
  ]);

  const key = useMemo(() => prefixesKey(params), [params]);

  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, {
    revalidateOnFocus: false,
  });

  const { data: financialYears } = useSWR("/api/financial-years/?page_size=200", swrFetcher, {
    revalidateOnFocus: false,
  });

  const prefixes = useMemo(() => data?.results || data || [], [data]);
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

  const fyList = useMemo(() => financialYears?.results || financialYears || [], [financialYears]);

  const openAdd = useCallback(() => {
    setEditingPrefix(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((prefix) => {
    setEditingPrefix(prefix);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (prefix) => {
      if (!confirm(t("prefix.deleteConfirm", { prefix: prefix.prefix }))) return;
      try {
        await deletePrefix(prefix.id);
        mutate();
      } catch {
        alert(t("prefix.deleteFailed"));
      }
    },
    [mutate, t]
  );

  const handleSaved = useCallback(() => {
    setDialogOpen(false);
    setEditingPrefix(null);
    mutate();
  }, [mutate]);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingPrefix(null);
  }, []);

  const ec = useCallback((cfg, key) => cfg?.[key] || "—", []);

  const resetPage = useCallback((fn) => {
    fn();
    setPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchSelectService("");
    setSearchSelectMode("");
    setSearchPrefix("");
    setSearchCurrentIndex("");
    setSearchNarration("");
    setSearchPrefixSeries("");
    setPage(1);
  }, []);

  const anyFilterActive =
    searchSelectService || searchSelectMode || searchPrefix ||
    searchCurrentIndex || searchNarration || searchPrefixSeries;

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
          <span className="font-medium text-gray-800">{t("prefix.title")}</span>
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
          <Plus className="size-4" />+ ADD
        </button>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">
            {t("prefix.title")}
          </h2>
        </div>
        <div className="bg-[#e8edf2] px-4 py-2 text-center text-xs text-gray-500">
          Drag a column header and drop it here to group by that column
        </div>

        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[1400px] text-sm">
            <thead>
              <tr className="bg-[#dce3ea] text-xs font-semibold uppercase text-[#004080]">
                <th className="px-3 py-2 text-center">{t("prefix.type")}</th>
                <th className="px-3 py-2 text-center">{t("prefix.billType")}</th>
                <th className="px-3 py-2 text-center">{t("prefix.voucherType")}</th>
                <th className="px-3 py-2 text-center">{t("prefix.selectService")}</th>
                <th className="px-3 py-2 text-center">{t("prefix.selectMode")}</th>
                <th className="px-3 py-2 text-center">DYNAMIC TYPE</th>
                <th className="px-3 py-2 text-center">{t("prefix.prefix")}</th>
                <th className="px-3 py-2 text-center">{t("prefix.currentIndex")}</th>
                <th className="px-3 py-2 text-center">{t("prefix.narration")}</th>
                <th className="px-3 py-2 text-center">{t("prefix.prefixSeries")}</th>
                <th className="px-3 py-2 text-center">{t("prefix.actions")}</th>
              </tr>
              <tr className="border-b bg-[#eef1f5]">
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5">
                  <input
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand"
                    placeholder="Filter Select Service..."
                    value={searchSelectService}
                    onChange={(e) => resetPage(() => setSearchSelectService(e.target.value))}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand"
                    placeholder="Filter Select Mode..."
                    value={searchSelectMode}
                    onChange={(e) => resetPage(() => setSearchSelectMode(e.target.value))}
                  />
                </td>
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5">
                  <input
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand"
                    placeholder="Filter Prefix..."
                    value={searchPrefix}
                    onChange={(e) => resetPage(() => setSearchPrefix(e.target.value))}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand"
                    placeholder="Filter Current Index..."
                    value={searchCurrentIndex}
                    onChange={(e) => resetPage(() => setSearchCurrentIndex(e.target.value))}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand"
                    placeholder="Filter Narration..."
                    value={searchNarration}
                    onChange={(e) => resetPage(() => setSearchNarration(e.target.value))}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1">
                    <input
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand"
                      placeholder="Filter Prefix Series..."
                      value={searchPrefixSeries}
                      onChange={(e) => resetPage(() => setSearchPrefixSeries(e.target.value))}
                    />
                    {anyFilterActive && (
                      <button
                        onClick={clearAllFilters}
                        className="flex size-5 shrink-0 items-center justify-center rounded text-red-500 hover:bg-red-50"
                        title="Clear all filters"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-gray-400">
                    {t("prefix.loading")}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-red-400">
                    {t("prefix.failed")}
                  </td>
                </tr>
              ) : prefixes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-gray-400">
                    {t("prefix.noData")}
                  </td>
                </tr>
              ) : (
                prefixes.map((prefix) => (
                  <tr key={prefix.id} className="border-b transition-colors hover:bg-gray-50">
                    <td className="px-3 py-3 text-center font-medium text-gray-800">
                      {prefix.type || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {ec(prefix.extra_config, "bill_type")}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {ec(prefix.extra_config, "voucher_type")}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {ec(prefix.extra_config, "select_service")}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {ec(prefix.extra_config, "select_mode")}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">—</td>
                    <td className="px-3 py-3 text-center font-medium text-gray-800">
                      {prefix.prefix || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {prefix.current_index != null ? prefix.current_index : "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {prefix.narration || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-gray-600">
                      {prefix.prefix_series || "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(prefix)}
                          className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-slate-800"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(prefix)}
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

      <PrefixDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSaved={handleSaved}
        prefix={editingPrefix}
        financialYears={fyList}
      />
    </div>
  );
}
