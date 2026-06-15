"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Home, Plus, Edit3, Lock, Pencil, Trash2, ArrowUp,
  ChevronLeft, ChevronRight, RefreshCw, Search, Eraser,
  FileSpreadsheet, FileText, Eye, Download, Printer,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  swrFetcher, salesInvoicesKey, deleteSalesInvoice, fetchSalesInvoiceOptions,
} from "@/services/api";

const currentYear = new Date().getFullYear();

const STATUS_BADGE = {
  Pending: "bg-red-500 text-white",
  Draft: "bg-red-500 text-white",
  Approved: "bg-green-500 text-white",
  Rejected: "bg-gray-500 text-white",
  Sent: "bg-blue-500 text-white",
  Generated: "bg-purple-500 text-white",
};

export default function SalesInvoiceListPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [billNumber, setBillNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [poRef, setPoRef] = useState("");
  const [productId, setProductId] = useState("");
  const [grandTotal, setGrandTotal] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [soRef, setSoRef] = useState("");
  const [hideDraft, setHideDraft] = useState(false);
  const [hideApproved, setHideApproved] = useState(false);
  const [siteName, setSiteName] = useState("");

  const params = useMemo(() => {
    const p = { page, page_size: pageSize };
    if (billNumber) p.bill_number = billNumber;
    if (fromDate) p.date_from = fromDate;
    if (toDate) p.date_to = toDate;
    if (customerId) p.customer = customerId;
    if (poRef) p.po_ref = poRef;
    if (productId) p.product = productId;
    if (grandTotal) p.grand_total = grandTotal;
    if (dueDate) { p.due_date_from = dueDate; p.due_date_to = dueDate; }
    if (soRef) p.so_ref = soRef;
    if (hideDraft) p.hide_draft = "1";
    if (hideApproved) p.hide_approved = "1";
    if (siteName) p.site_name = siteName;
    return p;
  }, [page, pageSize, billNumber, fromDate, toDate, customerId, poRef, productId, grandTotal, dueDate, soRef, hideDraft, hideApproved, siteName]);

  const key = useMemo(() => salesInvoicesKey(params), [params]);
  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, { revalidateOnFocus: false });
  const { data: options } = useSWR("sales-invoice-options", () => fetchSalesInvoiceOptions(), { revalidateOnFocus: false });

  const invoices = useMemo(() => data?.results || data || [], [data]);
  const totalCount = useMemo(() => data?.count || 0, [data]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);
  const fromItem = useMemo(() => (totalCount === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, totalCount]);
  const toItem = useMemo(() => Math.min(page * pageSize, totalCount), [page, pageSize, totalCount]);
  const customers = options?.customers || [];
  const products = options?.products || [];

  const handleDelete = useCallback(async (q) => {
    if (!confirm(t("salesInvoice.deleteConfirm", { name: q.bill_number }))) return;
    try { await deleteSalesInvoice(q.id); mutate(); } catch { alert(t("salesInvoice.deleteFailed")); }
  }, [mutate, t]);

  const clearFilters = useCallback(() => {
    setBillNumber(""); setFromDate(""); setToDate("");
    setCustomerId(""); setPoRef(""); setProductId("");
    setGrandTotal(""); setDueDate(""); setSoRef("");
    setHideDraft(false); setHideApproved(false); setSiteName("");
    setPage(1);
  }, []);

  const totals = useMemo(() => invoices.reduce((acc, q) => ({
    total: acc.total + parseFloat(q.total || 0),
    tax: acc.tax + parseFloat(q.tax_total || 0),
    grandTotal: acc.grandTotal + parseFloat(q.grand_total || 0),
  }), { total: 0, tax: 0, grandTotal: 0 }), [invoices]);

  const formatDate = (s) => {
    if (!s) return "\u2014";
    try {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch { return s; }
  };

  const formatNum = (n) => parseFloat(n || 0).toFixed(2);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><span>//</span><span>Sales</span>
          <span className="font-medium text-gray-800">{t("salesInvoice.title")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{currentYear}</span>
          <button className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"><Edit3 className="size-4" /></button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-rose-700 text-white hover:bg-rose-800"><Lock className="size-4" /></button>
          <button className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"><Plus className="size-4" /></button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-4">
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("salesInvoice.filters.billNumber")} value={billNumber} onChange={(e) => setBillNumber(e.target.value)} />
          <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" value={customerId} onChange={(e) => { setCustomerId(e.target.value); setPage(1); }}>
            <option value="">{t("salesInvoice.filters.customer")}</option>
            {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>

          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("salesInvoice.filters.poRef")} value={poRef} onChange={(e) => setPoRef(e.target.value)} />
          <select className="w-full rounded-lg border border-dashed border-gray-400 px-3 py-2 text-sm outline-none focus:border-brand" value={productId} onChange={(e) => { setProductId(e.target.value); setPage(1); }}>
            <option value="">{t("salesInvoice.filters.products")}</option>
            {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("salesInvoice.filters.grandTotal")} value={grandTotal} onChange={(e) => setGrandTotal(e.target.value)} />
          <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand">
            <option value="">{t("salesInvoice.filters.emptySelect")}</option>
          </select>
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("salesInvoice.filters.soRef")} value={soRef} onChange={(e) => setSoRef(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="size-4 accent-red-500" checked={hideDraft} onChange={(e) => setHideDraft(e.target.checked)} />
            {t("salesInvoice.filters.hideDraft")}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="size-4 accent-red-500" checked={hideApproved} onChange={(e) => setHideApproved(e.target.checked)} />
            {t("salesInvoice.filters.hideApproved")}
          </label>

          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("salesInvoice.filters.siteName")} value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          <div></div>
          <div className="col-span-2 flex items-end justify-end gap-2">
            <button onClick={() => setPage(1)} className="flex size-9 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700"><Search className="size-4" /></button>
            <button className="flex size-9 items-center justify-center rounded-md bg-[#003366] text-white hover:bg-[#002855]"><Eye className="size-4" /></button>
            <button onClick={clearFilters} className="flex size-9 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700"><Eraser className="size-4" /></button>
            <button className="flex size-9 items-center justify-center rounded-md bg-slate-700 text-white hover:bg-slate-800"><FileSpreadsheet className="size-4" /></button>
            <button className="flex size-9 items-center justify-center rounded-md bg-slate-700 text-white hover:bg-slate-800"><FileText className="size-4" /></button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Link href="/dashboard/sales/sales-invoice/create" className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
          <Plus className="size-4" /> {t("salesInvoice.actions.add")}
        </Link>
        <button className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          <Download className="size-4" />{t("salesInvoice.actions.import")}
        </button>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: "#2c3e6b" }}>
          <FileText className="size-4" />{t("salesInvoice.actions.printAll")}
        </button>
        <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90" style={{ backgroundColor: "#2c3e6b" }}>
          <Printer className="size-4" />{t("salesInvoice.actions.printSelected")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">{t("salesInvoice.title")}</h2>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="bg-[#dce3ea] text-xs font-semibold uppercase text-[#004080]">
                <th className="w-10 px-3 py-2 text-center"><input type="checkbox" className="size-4 accent-[#004080]" /></th>
                <th className="px-3 py-2 text-left">{t("salesInvoice.table.billNumber")}</th>
                <th className="px-3 py-2 text-center">{t("salesInvoice.table.date")}</th>
                <th className="px-3 py-2 text-left">{t("salesInvoice.table.customer")}</th>
                <th className="px-3 py-2 text-center">{t("salesInvoice.table.poRef")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoice.table.total")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoice.table.tax")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoice.table.grandTotal")}</th>
                <th className="px-3 py-2 text-center">{t("salesInvoice.table.billStatus")}</th>
                <th className="px-3 py-2 text-center">{t("salesInvoice.table.eInvoiceStatus")}</th>
                <th className="px-3 py-2 text-center">{t("salesInvoice.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (<tr><td colSpan={11} className="py-16 text-center text-gray-400">{t("salesInvoice.loading")}</td></tr>)
              : error ? (<tr><td colSpan={11} className="py-16 text-center text-red-400">{t("salesInvoice.failed")}</td></tr>)
              : invoices.length === 0 ? (<tr><td colSpan={11} className="py-16 text-center text-gray-400">{t("salesInvoice.noData")}</td></tr>)
              : (<>
                  {invoices.map((q) => (
                    <tr key={q.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-3 text-center"><input type="checkbox" className="size-4 accent-[#004080]" style={{ borderColor: "#fb923c" }} /></td>
                      <td className="px-3 py-3 text-left font-medium text-gray-800">{q.bill_number}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{formatDate(q.date)}</td>
                      <td className="px-3 py-3 text-left text-gray-600">{q.customer_name || "\u2014"}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{q.po_ref || "\u2014"}</td>
                      <td className="px-3 py-3 text-right text-gray-700">{formatNum(q.total)}</td>
                      <td className="px-3 py-3 text-right text-gray-700">{formatNum(q.tax_total)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-800">{formatNum(q.grand_total)}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[q.bill_status] || "bg-gray-200 text-gray-700"}`}>{q.bill_status || "\u2014"}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[q.e_invoice_status] || "bg-gray-200 text-gray-700"}`}>{q.e_invoice_status || "\u2014"}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link href={`/dashboard/sales/sales-invoice/create?id=${q.id}`} className="flex size-7 items-center justify-center rounded bg-slate-700 text-white hover:bg-slate-800"><Pencil className="size-3.5" /></Link>
                          <button onClick={() => handleDelete(q)} className="flex size-7 items-center justify-center rounded bg-[#4a5b7a] text-white hover:bg-red-600"><Trash2 className="size-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-y-2 border-gray-200 bg-gray-50">
                    <td colSpan={5} className="px-3 py-3 text-right text-sm font-bold text-gray-700">Total :</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">{totals.total.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">{totals.tax.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">{totals.grandTotal.toFixed(2)}</td>
                    <td colSpan={3} className="px-3 py-3"></td>
                  </tr>
                </>)}
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
