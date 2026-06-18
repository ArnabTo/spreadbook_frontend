"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Home, ChevronRight, Plus, Edit3, Lock, Pencil, Trash2, ArrowUp,
  ChevronLeft, RefreshCw, Search, Eraser, FileSpreadsheet, FileText,
  Printer, Copy, Send, Menu,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  swrFetcher, deliveryNotesKey, deleteDeliveryNote, fetchDeliveryNoteOptions,
} from "@/services/api";
import { CreatePermission, UpdatePermission, DeletePermission } from "@/components/permission/action-permission";

const currentYear = new Date().getFullYear();

export default function DeliveryNoteListPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [billNumber, setBillNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [poRef, setPoRef] = useState("");
  const [salesPersonId, setSalesPersonId] = useState("");

  const params = useMemo(() => {
    const p = { page, page_size: pageSize };
    if (billNumber) p.bill_number = billNumber;
    if (fromDate) p.date_from = fromDate;
    if (toDate) p.date_to = toDate;
    if (customerId) p.customer = customerId;
    if (poRef) p.po_ref = poRef;
    if (salesPersonId) p.sales_person = salesPersonId;
    return p;
  }, [page, pageSize, billNumber, fromDate, toDate, customerId, poRef, salesPersonId]);

  const key = useMemo(() => deliveryNotesKey(params), [params]);
  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, { revalidateOnFocus: false });
  const { data: options } = useSWR("delivery-note-options", () => fetchDeliveryNoteOptions(), { revalidateOnFocus: false });

  const notes = useMemo(() => data?.results || data || [], [data]);
  const totalCount = useMemo(() => data?.count || 0, [data]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);
  const fromItem = useMemo(() => (totalCount === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, totalCount]);
  const toItem = useMemo(() => Math.min(page * pageSize, totalCount), [page, pageSize, totalCount]);

  const customers = options?.customers || [];
  const users = options?.users || [];

  const handleDelete = useCallback(async (q) => {
    if (!confirm(t("deliveryNote.deleteConfirm", { name: q.bill_number }))) return;
    try { await deleteDeliveryNote(q.id); mutate(); } catch { alert(t("deliveryNote.deleteFailed")); }
  }, [mutate, t]);

  const clearFilters = useCallback(() => {
    setBillNumber(""); setFromDate(""); setToDate("");
    setCustomerId(""); setPoRef(""); setSalesPersonId("");
    setPage(1);
  }, []);

  const handleSearch = useCallback(() => {
    setPage(1);
  }, []);

  const totals = useMemo(() => {
    return notes.reduce(
      (acc, q) => ({
        total: acc.total + parseFloat(q.total || 0),
        tax: acc.tax + parseFloat(q.tax_total || 0),
        productDiscount: acc.productDiscount + parseFloat(q.product_discount_total || 0),
        cashDiscount: acc.cashDiscount + parseFloat(q.cash_discount_total || 0),
        grandTotal: acc.grandTotal + parseFloat(q.grand_total || 0),
      }),
      { total: 0, tax: 0, productDiscount: 0, cashDiscount: 0, grandTotal: 0 }
    );
  }, [notes]);

  const formatDate = (s) => {
    if (!s) return "—";
    try {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch { return s; }
  };

  const formatNum = (n) => {
    const v = parseFloat(n || 0);
    return v.toFixed(2);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span>
          <span>{"//"}</span>
          <span>Delivery Note</span>
          <span>{"//"}</span>
          <span className="font-medium text-gray-800">{t("deliveryNote.title")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{currentYear}</span>
          <button className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"><Edit3 className="size-4" /></button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-rose-700 text-white hover:bg-rose-800"><Lock className="size-4" /></button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"><Plus className="size-4" /></button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder={t("deliveryNote.filters.billNumber")}
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder={t("deliveryNote.filters.fromDate")}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder={t("deliveryNote.filters.toDate")}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value); setPage(1); }}
            >
              <option value="">{t("deliveryNote.filters.customer")}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              placeholder={t("deliveryNote.filters.poRef")}
              value={poRef}
              onChange={(e) => setPoRef(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              value={salesPersonId}
              onChange={(e) => { setSalesPersonId(e.target.value); setPage(1); }}
            >
              <option value="">{t("deliveryNote.filters.salesPerson")}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div></div>
          <div></div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={handleSearch} className="flex size-9 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700" title={t("deliveryNote.filters.search")}>
            <Search className="size-4" />
          </button>
          <button className="flex size-9 items-center justify-center rounded-md bg-[#003366] text-white hover:bg-[#002855]" title="Toggle view">
            <Menu className="size-4" />
          </button>
          <button onClick={clearFilters} className="flex size-9 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700" title={t("deliveryNote.filters.clear")}>
            <Eraser className="size-4" />
          </button>
          <button className="flex size-9 items-center justify-center rounded-md bg-slate-700 text-white hover:bg-slate-800" title={t("deliveryNote.filters.exportExcel")}>
            <FileSpreadsheet className="size-4" />
          </button>
          <button className="flex size-9 items-center justify-center rounded-md bg-slate-700 text-white hover:bg-slate-800" title={t("deliveryNote.filters.exportPdf")}>
            <FileText className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <CreatePermission module="delivery_note">
          <Link
            href="/dashboard/sales/delivery-note/create"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <Plus className="size-4" /> {t("deliveryNote.actions.add")}
          </Link>
        </CreatePermission>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: "#808000" }}>
          <Printer className="size-4" />{t("deliveryNote.actions.printSelected")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">{t("deliveryNote.title")}</h2>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="bg-[#dce3ea] text-xs font-semibold uppercase text-[#004080]">
                <th className="w-10 px-3 py-2 text-center">
                  <input type="checkbox" className="size-4 accent-[#004080]" />
                </th>
                <th className="px-3 py-2 text-left">{t("deliveryNote.table.billNumber")}</th>
                <th className="px-3 py-2 text-center">{t("deliveryNote.table.date")}</th>
                <th className="px-3 py-2 text-left">{t("deliveryNote.table.customer")}</th>
                <th className="px-3 py-2 text-right">{t("deliveryNote.table.total")}</th>
                <th className="px-3 py-2 text-right">{t("deliveryNote.table.tax")}</th>
                <th className="px-3 py-2 text-right">{t("deliveryNote.table.discount")}</th>
                <th className="px-3 py-2 text-right">{t("deliveryNote.table.grandTotal")}</th>
                <th className="px-3 py-2 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="py-16 text-center text-gray-400">{t("deliveryNote.loading")}</td></tr>
              ) : error ? (
                <tr><td colSpan={9} className="py-16 text-center text-red-400">{t("deliveryNote.failed")}</td></tr>
              ) : notes.length === 0 ? (
                <tr><td colSpan={9} className="py-16 text-center text-gray-400">{t("deliveryNote.noData")}</td></tr>
              ) : (
                <>
                  {notes.map((q) => (
                    <tr key={q.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-3 text-center">
                        <input type="checkbox" className="size-4 accent-[#004080]" style={{ borderColor: "#fb923c" }} />
                      </td>
                      <td className="px-3 py-3 text-left font-medium text-gray-800">{q.bill_number}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{formatDate(q.date)}</td>
                      <td className="px-3 py-3 text-left text-gray-600">{q.customer_name || "—"}</td>
                      <td className="px-3 py-3 text-right text-gray-700">{formatNum(q.total)}</td>
                      <td className="px-3 py-3 text-right text-gray-700">{formatNum(q.tax_total)}</td>
                      <td className="px-3 py-3 text-right text-gray-700">{formatNum(q.product_discount_total)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-800">{formatNum(q.grand_total)}</td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <UpdatePermission module="delivery_note">
                            <Link href={`/dashboard/sales/delivery-note/create?id=${q.id}`} className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-slate-800" title={t("deliveryNote.actions.edit")}>
                              <Pencil className="size-3.5" />
                            </Link>
                          </UpdatePermission>
                          <DeletePermission module="delivery_note">
                            <button onClick={() => handleDelete(q)} className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-red-600" title={t("deliveryNote.actions.delete")}>
                              <Trash2 className="size-3.5" />
                            </button>
                          </DeletePermission>
                          <button className="flex size-7 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700" title={t("deliveryNote.actions.print")}>
                            <Printer className="size-3.5" />
                          </button>
                          <UpdatePermission module="delivery_note">
                            <button className="flex size-7 items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600" title={t("deliveryNote.actions.duplicate")}>
                              <Copy className="size-3.5" />
                            </button>
                          </UpdatePermission>
                          <button className="flex size-7 items-center justify-center rounded bg-blue-400 text-white hover:bg-blue-500" title={t("deliveryNote.actions.print")}>
                            <Printer className="size-3.5" />
                          </button>
                          <UpdatePermission module="delivery_note">
                            <button className="flex size-7 items-center justify-center rounded bg-red-500 text-white hover:bg-red-600" title={t("deliveryNote.actions.send")}>
                              <Send className="size-3.5" />
                            </button>
                          </UpdatePermission>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-y-2 border-gray-200 bg-gray-50">
                    <td colSpan={4} className="px-3 py-3 text-right text-sm font-bold text-gray-700">Total :</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">{totals.total.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">{totals.tax.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">{totals.productDiscount.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">{totals.grandTotal.toFixed(2)}</td>
                    <td className="px-3 py-3"></td>
                  </tr>
                </>
              )}
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
