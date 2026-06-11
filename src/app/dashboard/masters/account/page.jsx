"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Home, ChevronRight, Plus, Edit3, Lock, Pencil, Trash2, ArrowUp,
  ChevronLeft, RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { swrFetcher, accountsKey, deleteAccount } from "@/services/api";

const currentYear = new Date().getFullYear();

export default function AccountPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [colId, setColId] = useState("");
  const [colName, setColName] = useState("");
  const [colMailing, setColMailing] = useState("");
  const [colParent, setColParent] = useState("");
  const [colMobile, setColMobile] = useState("");

  const params = useMemo(() => {
    const p = { page, page_size: pageSize };
    if (search) p.search = search;
    if (colId) p.id = colId;
    if (colName) p.name = colName;
    if (colMailing) p.mailing_name = colMailing;
    if (colParent) p.parent = colParent;
    if (colMobile) p.mobile_number = colMobile;
    return p;
  }, [page, pageSize, search, colId, colName, colMailing, colParent, colMobile]);

  const key = useMemo(() => accountsKey(params), [params]);
  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, { revalidateOnFocus: false });
  const accounts = useMemo(() => data?.results || data || [], [data]);
  const totalCount = useMemo(() => data?.count || 0, [data]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);
  const fromItem = useMemo(() => (totalCount === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, totalCount]);
  const toItem = useMemo(() => Math.min(page * pageSize, totalCount), [page, pageSize, totalCount]);

  const handleDelete = useCallback(async (acct) => {
    if (!confirm(t("account.deleteConfirm", { name: acct.name }))) return;
    try { await deleteAccount(acct.id); mutate(); } catch { alert(t("account.deleteFailed")); }
  }, [mutate, t]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">{t("account.title")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{currentYear}</span>
          <button className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"><Edit3 className="size-4" /></button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-rose-700 text-white hover:bg-rose-800"><Lock className="size-4" /></button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"><Plus className="size-4" /></button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/dashboard/masters/account/create" className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
          <Plus className="size-4" />+ ADD
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">{t("account.title")}</h2>
        </div>
        <div className="bg-[#e8edf2] px-4 py-2 text-center text-xs text-gray-500">Drag a column header and drop it here to group by that column</div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-[#dce3ea] text-xs font-semibold uppercase text-[#004080]">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">{t("account.name")}</th>
                <th className="px-3 py-2 text-left">{t("account.mailingName")}</th>
                <th className="px-3 py-2 text-left">{t("account.parent")}</th>
                <th className="px-3 py-2 text-center">{t("account.mobileNumber")}</th>
                <th className="px-3 py-2 text-center">{t("account.bankName")}</th>
                <th className="px-3 py-2 text-center">ACTIONS</th>
              </tr>
              <tr className="border-b bg-[#eef1f5]">
                <td className="px-3 py-1.5">
                  <input className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand" placeholder="Filter ID..." value={colId} onChange={(e) => { setColId(e.target.value); setPage(1); }} />
                </td>
                <td className="px-3 py-1.5">
                  <input className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand" placeholder="Filter name..." value={colName} onChange={(e) => { setColName(e.target.value); setPage(1); }} />
                </td>
                <td className="px-3 py-1.5">
                  <input className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand" placeholder="Filter mailing..." value={colMailing} onChange={(e) => { setColMailing(e.target.value); setPage(1); }} />
                </td>
                <td className="px-3 py-1.5">
                  <input className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand" placeholder="Filter parent..." value={colParent} onChange={(e) => { setColParent(e.target.value); setPage(1); }} />
                </td>
                <td className="px-3 py-1.5">
                  <input className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-brand" placeholder="Filter mobile..." value={colMobile} onChange={(e) => { setColMobile(e.target.value); setPage(1); }} />
                </td>
                <td className="px-3 py-1.5" />
                <td className="px-3 py-1.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={7} className="py-16 text-center text-gray-400">{t("account.loading")}</td></tr>
               : error ? <tr><td colSpan={7} className="py-16 text-center text-red-400">{t("account.failed")}</td></tr>
               : accounts.length === 0 ? <tr><td colSpan={7} className="py-16 text-center text-gray-400">{t("account.noData")}</td></tr>
               : accounts.map((acct) => (
                  <tr key={acct.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-3 text-left font-mono text-xs text-gray-500">{String(acct.id).slice(0, 8)}</td>
                    <td className="px-3 py-3 text-left font-medium text-gray-800">{acct.name || "—"}</td>
                    <td className="px-3 py-3 text-left text-gray-600">{acct.mailing_name || "—"}</td>
                    <td className="px-3 py-3 text-left text-gray-600">{acct.parent_name || "—"}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{acct.mobile_number || "—"}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{acct.bank_name || "—"}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/dashboard/masters/account/create?id=${acct.id}`} className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-slate-800"><Pencil className="size-3.5" /></Link>
                        <button onClick={() => handleDelete(acct)} className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-red-600"><Trash2 className="size-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t bg-white px-4 py-3">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(1)} disabled={page === 1} className="flex size-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"><span className="text-xs">|◄</span></button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex size-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="size-3.5" /></button>
            <div className="flex size-7 items-center justify-center rounded bg-[#004080] text-xs font-bold text-white">{page}</div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex size-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="size-3.5" /></button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="flex size-7 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40"><span className="text-xs">►|</span></button>
            <div className="ml-3 flex items-center gap-1.5">
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700">
                {[5, 10, 20, 50].map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
              <span className="text-xs font-medium text-[#004080]">items per page</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>{fromItem} - {toItem} of {totalCount} items</span>
            <button onClick={() => mutate()} className="flex size-7 items-center justify-center rounded border border-gray-300 bg-gray-100 hover:bg-gray-200"><RefreshCw className="size-3.5" /></button>
          </div>
        </div>
      </div>
      <button onClick={scrollToTop} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
