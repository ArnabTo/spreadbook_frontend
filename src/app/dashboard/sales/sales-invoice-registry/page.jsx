"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Home, Plus, Edit3, Lock, ChevronLeft, ChevronRight,
  RefreshCw, Search, Eraser, FileSpreadsheet, FileText, ArrowUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  swrFetcher, salesInvoiceRegistryKey, exportSalesInvoiceRegistry,
} from "@/services/api";
import { API_BASE_URL } from "@/config/api";

const currentYear = new Date().getFullYear();

const TOKEN_KEY = "spreadbook_access_token";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export default function SalesInvoiceRegistryPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [billNumber, setBillNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [salesPersonId, setSalesPersonId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [billwithouttax, setBillwithouttax] = useState(false);

  const params = useMemo(() => {
    const p = { page, page_size: pageSize };
    if (billNumber) p.bill_number = billNumber;
    if (fromDate) p.date_from = fromDate;
    if (toDate) p.date_to = toDate;
    if (customerId) p.customer = customerId;
    if (productId) p.product = productId;
    if (salesPersonId) p.sales_person = salesPersonId;
    if (totalAmount) p.total_amount_min = totalAmount;
    if (billwithouttax) p.billwithouttax = "true";
    return p;
  }, [page, pageSize, billNumber, fromDate, toDate, customerId, productId, salesPersonId, totalAmount, billwithouttax]);

  const key = useMemo(() => salesInvoiceRegistryKey(params), [params]);
  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, { revalidateOnFocus: false });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/sales-invoices/options/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const json = await res.json();
        setCustomers(json.customers || []);
        setProducts(json.products || []);
        setUsers(json.users || []);
      } catch {}
    }
    fetchOptions();
  }, []);

  const rows = useMemo(() => data?.results || [], [data]);
  const totalCount = useMemo(() => data?.count || 0, [data]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize]);
  const fromItem = useMemo(() => (totalCount === 0 ? 0 : (page - 1) * pageSize + 1), [page, pageSize, totalCount]);
  const toItem = useMemo(() => Math.min(page * pageSize, totalCount), [page, pageSize, totalCount]);

  const handleExportExcel = useCallback(async () => {
    try {
      const blob = await exportSalesInvoiceRegistry(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sales_invoice_registry.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch {
      alert("Export failed.");
    }
  }, [params]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const clearFilters = useCallback(() => {
    setBillNumber(""); setFromDate(""); setToDate("");
    setCustomerId(""); setProductId(""); setSalesPersonId("");
    setTotalAmount(""); setBillwithouttax(false);
    setPage(1);
  }, []);

  const handleSearch = useCallback(() => { setPage(1); }, []);

  const formatDate = (s) => {
    if (!s) return "\u2014";
    try {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch { return s; }
  };

  const fmt = (n) => parseFloat(n || 0).toFixed(2);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><span>{"//"}</span><span>Sales</span>{"//"}
          <span className="font-medium text-gray-800">{t("salesInvoiceRegistry.title")}</span>
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
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder={t("salesInvoiceRegistry.filters.billNumber")}
            value={billNumber} onChange={(e) => setBillNumber(e.target.value)} />
          <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            value={customerId} onChange={(e) => { setCustomerId(e.target.value); setPage(1); }}>
            <option value="">{t("salesInvoiceRegistry.filters.customer")}</option>
            {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            value={productId} onChange={(e) => { setProductId(e.target.value); setPage(1); }}>
            <option value="">{t("salesInvoiceRegistry.filters.product")}</option>
            {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
          <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            value={salesPersonId} onChange={(e) => { setSalesPersonId(e.target.value); setPage(1); }}>
            <option value="">{t("salesInvoiceRegistry.filters.salesPerson")}</option>
            {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
          </select>
          <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
            placeholder={t("salesInvoiceRegistry.filters.totalAmount")}
            value={totalAmount} onChange={(e) => { setTotalAmount(e.target.value); setPage(1); }} />
          <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <input type="checkbox" checked={billwithouttax}
              onChange={(e) => { setBillwithouttax(e.target.checked); setPage(1); }}
              className="size-4 accent-[#004080]" />
            {t("salesInvoiceRegistry.filters.billwithouttax")}
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={handleSearch} className="flex size-9 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700" title={t("salesInvoiceRegistry.filters.search")}>
            <Search className="size-4" />
          </button>
          <button onClick={clearFilters} className="flex size-9 items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700" title={t("salesInvoiceRegistry.filters.clear")}>
            <Eraser className="size-4" />
          </button>
          <button onClick={handleExportExcel} className="flex size-9 items-center justify-center rounded-md bg-slate-700 text-white hover:bg-slate-800" title={t("salesInvoiceRegistry.filters.exportExcel")}>
            <FileSpreadsheet className="size-4" />
          </button>
          <button onClick={handlePrint} className="flex size-9 items-center justify-center rounded-md bg-slate-700 text-white hover:bg-slate-800" title={t("salesInvoiceRegistry.filters.exportPdf")}>
            <FileText className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">{t("salesInvoiceRegistry.title")}</h2>
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full min-w-[1600px] text-sm">
            <thead>
              <tr className="bg-[#dce3ea] text-xs font-semibold uppercase text-[#004080]">
                <th className="px-3 py-2 text-center">{t("salesInvoiceRegistry.table.date")}</th>
                <th className="px-3 py-2 text-left">{t("salesInvoiceRegistry.table.billNumber")}</th>
                <th className="px-3 py-2 text-left">{t("salesInvoiceRegistry.table.customer")}</th>
                <th className="px-3 py-2 text-left">{t("salesInvoiceRegistry.table.partyInvoiceNumber")}</th>
                <th className="px-3 py-2 text-left">{t("salesInvoiceRegistry.table.product")}</th>
                <th className="px-3 py-2 text-center">{t("salesInvoiceRegistry.table.unit")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoiceRegistry.table.quantity")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoiceRegistry.table.mrp")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoiceRegistry.table.cost")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoiceRegistry.table.amount")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoiceRegistry.table.totalCost")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoiceRegistry.table.discountPercent")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoiceRegistry.table.taxTotal")}</th>
                <th className="px-3 py-2 text-right">{t("salesInvoiceRegistry.table.totalAmount")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={14} className="py-16 text-center text-gray-400">{t("salesInvoiceRegistry.loading")}</td></tr>
              ) : error ? (
                <tr><td colSpan={14} className="py-16 text-center text-red-400">{t("salesInvoiceRegistry.failed")}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={14} className="py-16 text-center text-gray-400">{t("salesInvoiceRegistry.noData")}</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-3 text-center text-gray-600">{formatDate(row.date)}</td>
                    <td className="px-3 py-3 text-left font-medium text-gray-800">{row.bill_number}</td>
                    <td className="px-3 py-3 text-left text-gray-600">{row.customer_name || "\u2014"}</td>
                    <td className="px-3 py-3 text-left text-gray-600">{row.party_invoice_number || "\u2014"}</td>
                    <td className="px-3 py-3 text-left text-gray-600">{row.product_name || "\u2014"}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{row.unit_name || "\u2014"}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{fmt(row.quantity)}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{fmt(row.mrp)}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{fmt(row.cost)}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{fmt(row.amount)}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{fmt(row.total_cost)}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{fmt(row.discount_percent)}</td>
                    <td className="px-3 py-3 text-right text-gray-700">{fmt(row.tax_total)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-800">{fmt(row.total_amount)}</td>
                  </tr>
                ))
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
                {[10, 20, 50, 100].map((n) => (<option key={n} value={n}>{n}</option>))}
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
