"use client";

import { useState, useEffect, useMemo, useRef, useCallback, useReducer } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Home, ArrowUp, Plus, Trash2, Save, Brush, ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createProformaInvoice, updateProformaInvoice,
  fetchProformaInvoiceOptions,
} from "@/services/api";
import axiosInstance from "@/utils/axios";
import { CreatePermission, UpdatePermission, DeletePermission } from "@/components/permission/action-permission";

const EMPTY_ROW = () => ({
  product: "", unit: "", qty: "0", rate: "0", discount_percent: "0", tax_percent: "0",
});

const currentYear = new Date().getFullYear();
const today = new Date().toISOString().slice(0, 10);

export default function ProformaInvoiceCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const { register, control, handleSubmit, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      customer: "", currency: "", date: today, due_date: "", currency_rate: "1",
      sales_person: "", type: "CASH", po_ref: "", location: "", attention: "",
      narration: "", tax_mode: "TAX_EXCLUDED",
      invoice_period: "", supply_date: "", bank_account: "", payment_terms: "",
      project_ref_no: "", enable_seal_and_sign: false,
      discount: "0",
      products: Array.from({ length: 4 }, () => EMPTY_ROW()),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });
  const [tick, forceUpdate] = useReducer(x => x + 1, 0);
  const setVal = useCallback((name, value) => { setValue(name, value); forceUpdate(); }, [setValue]);
  const discount = watch("discount");

  const [attachmentFile, setAttachmentFile] = useState(null);
  const [existingAttachmentName, setExistingAttachmentName] = useState("");
  const fileInputRef = useRef(null);
  const [options, setOptions] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [billNumber, setBillNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const customers = options?.customers || [];
  const currencies = options?.currencies || [];
  const users = options?.users || [];
  const products = options?.products || [];
  const bankAccounts = options?.bank_accounts || [];

  useEffect(() => { if (error && error.startsWith("proformaInvoice.")) setError(t(error)); }, [t, error]);

  useEffect(() => {
    let active = true;
    (async () => {
      try { const data = await fetchProformaInvoiceOptions(); if (active) setOptions(data); }
      catch (e) { } finally {
        if (!active) return;
        setLoadingOptions(false);
        if (editId) {
          setLoadingData(true);
          axiosInstance.get(`/api/proforma-invoices/${editId}/`).then((res) => {
            if (!active) return;
            const q = res.data;
            setBillNumber(q.bill_number || "");
            setExistingAttachmentName(q.attachment_name || "");
            reset({
              customer: q.customer || "", currency: q.currency || "", date: q.date || today,
              due_date: q.due_date || "",
              currency_rate: q.currency_rate ? String(q.currency_rate) : "1",
              sales_person: q.sales_person || "", type: q.type || "CASH",
              po_ref: q.po_ref || "", location: q.location || "",
              attention: q.attention || "", narration: q.narration || "",
              tax_mode: q.tax_mode || "TAX_EXCLUDED",
              invoice_period: q.invoice_period || "", supply_date: q.supply_date || "",
              bank_account: q.bank_account || "", payment_terms: q.payment_terms || "",
              project_ref_no: q.project_ref_no || "",
              enable_seal_and_sign: q.enable_seal_and_sign || false,
              discount: q.discount ? String(q.discount) : "0",
              products: (() => {
                const loaded = (q.items || []).map((it) => ({
                  product: it.product || "", unit: it.unit || "",
                  qty: it.qty ? String(it.qty) : "0", rate: it.rate ? String(it.rate) : "0",
                  discount_percent: it.discount_percent ? String(it.discount_percent) : "0",
                  tax_percent: it.tax_percent ? String(it.tax_percent) : "0",
                }));
                while (loaded.length < 4) loaded.push(EMPTY_ROW());
                return loaded;
              })(),
            });
          }).catch(() => { if (active) setError("proformaInvoice.failed"); })
            .finally(() => { if (active) setLoadingData(false); });
        }
      }
    })();
    return () => { active = false; };
  }, [editId, reset, today]);

  const handleProductChange = useCallback((index, productId) => {
    setVal(`products.${index}.product`, productId);
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) { setVal(`products.${index}.unit`, ""); setVal(`products.${index}.rate`, "0"); return; }
    const productUnits = product.product_units || [];
    let newUnit = "", newRate = "0";
    if (productUnits.length > 0) {
      const chosen = productUnits.find((pu) => pu.is_default_selling) || productUnits.find((pu) => pu.is_selling_unit) || productUnits[0];
      newUnit = String(chosen.unit_id);
    } else if (product.selling_unit_id) { newUnit = String(product.selling_unit_id); }
    else if (product.unit_prices?.length) { newUnit = String(product.unit_prices[0].unit_id); }
    const matched = (product.unit_prices || []).find((up) => String(up.unit_id) === String(newUnit));
    if (matched) newRate = matched.sales_price;
    else if (product.default_rate) newRate = product.default_rate;
    setVal(`products.${index}.unit`, newUnit);
    setVal(`products.${index}.rate`, newRate);
    const taxRate = product.is_tax_applied ? (product.tax_rate || "0") : "0";
    setVal(`products.${index}.tax_percent`, taxRate);
  }, [products, setVal]);

  const handleUnitChange = useCallback((index, unitId) => {
    setVal(`products.${index}.unit`, unitId);
    const pid = getValues(`products.${index}.product`);
    const product = products.find((p) => String(p.id) === String(pid));
    const matched = product?.unit_prices?.find((up) => String(up.unit_id) === String(unitId));
    if (matched) setVal(`products.${index}.rate`, matched.sales_price);
  }, [products, setVal, getValues]);

  const unitsForProduct = useCallback((productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    if (!product) return [];
    if (product.product_units?.length) return product.product_units.map((pu) => ({ id: pu.unit_id, name: pu.unit_name }));
    if (product.unit_prices?.length) return product.unit_prices.map((up) => ({ id: up.unit_id, name: up.unit_name }));
    return [];
  }, [products]);

  const computedRows = useMemo(() => {
    const prods = getValues("products") || [];
    return prods.map((r, idx) => {
      const qty = parseFloat(r.qty || 0) || 0, rate = parseFloat(r.rate || 0) || 0;
      const discPct = parseFloat(r.discount_percent || 0) || 0, taxPct = parseFloat(r.tax_percent || 0) || 0;
      const pt = qty * rate;
      const discAmt = pt * discPct / 100;
      const amt = pt - discAmt;
      const taxAmt = (amt * taxPct) / 100;
      const total = amt + taxAmt;
      return { ...r, si_no: idx + 1, productTotal: pt, discountAmount: discAmt, amount: amt, taxAmount: taxAmt, total };
    });
  }, [tick]);

  const totals = useMemo(() => {
    const total = computedRows.reduce((acc, r) => acc + r.amount, 0);
    const tax = computedRows.reduce((acc, r) => acc + r.taxAmount, 0);
    const disc = parseFloat(discount || 0) || 0;
    return { total, tax, grandTotal: total + tax - disc };
  }, [computedRows, discount]);

  const clearAll = useCallback(() => {
    reset({
      customer: "", currency: "", date: today, due_date: "", currency_rate: "1",
      sales_person: "", type: "CASH", po_ref: "", location: "", attention: "",
      narration: "", tax_mode: "TAX_EXCLUDED",
      invoice_period: "", supply_date: "", bank_account: "", payment_terms: "",
      project_ref_no: "", enable_seal_and_sign: false,
      discount: "0",
      products: Array.from({ length: 4 }, () => EMPTY_ROW()),
    });
    setBillNumber(""); setAttachmentFile(null); setExistingAttachmentName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  }, [reset, today]);

  const validate = useCallback((data) => {
    if (!data.customer) return t("proformaInvoice.validation.customerRequired");
    if (!data.currency) return t("proformaInvoice.validation.currencyRequired");
    if (!data.date) return t("proformaInvoice.validation.dateRequired");
    if (!data.type) return t("proformaInvoice.validation.typeRequired");
    const cr = parseFloat(data.currency_rate || 0);
    if (cr <= 0) return t("proformaInvoice.validation.currencyRatePositive");
    const validRows = (data.products || []).filter((r) => r.product);
    if (validRows.length === 0) return t("proformaInvoice.validation.productRequired");
    for (const r of validRows) {
      if (parseFloat(r.qty || 0) <= 0) return t("proformaInvoice.validation.qtyPositive");
      if (parseFloat(r.rate || 0) < 0) return t("proformaInvoice.validation.rateNonNegative");
      const dp = parseFloat(r.discount_percent || 0);
      if (dp < 0 || dp > 100) return t("proformaInvoice.validation.discPercentRange");
    }
    return "";
  }, [t]);

  const onSave = handleSubmit(async (data) => {
    const err = validate(data);
    if (err) { setError(err); return; }
    setError(""); setSaving(true);
    try {
      const fd = new FormData();
      fd.append("customer", data.customer);
      fd.append("currency", data.currency);
      fd.append("currency_rate", data.currency_rate || "1");
      fd.append("date", data.date);
      if (data.due_date) fd.append("due_date", data.due_date);
      fd.append("type", data.type);
      fd.append("tax_mode", data.tax_mode);
      fd.append("sales_person", data.sales_person);
      if (data.po_ref) fd.append("po_ref", data.po_ref);
      if (data.location) fd.append("location", data.location);
      if (data.attention) fd.append("attention", data.attention);
      if (data.narration) fd.append("narration", data.narration);
      if (data.invoice_period) fd.append("invoice_period", data.invoice_period);
      if (data.supply_date) fd.append("supply_date", data.supply_date);
      if (data.bank_account) fd.append("bank_account", data.bank_account);
      if (data.payment_terms) fd.append("payment_terms", data.payment_terms);
      if (data.project_ref_no) fd.append("project_ref_no", data.project_ref_no);
      fd.append("enable_seal_and_sign", data.enable_seal_and_sign ? "true" : "false");
      fd.append("discount", data.discount || "0");
      if (attachmentFile) { fd.append("attachment", attachmentFile); fd.append("attachment_name", attachmentFile.name); }

      const raw = data.products || [];
      const payload = raw.filter((r) => r.product).map((r, idx) => ({
        product: r.product, unit: r.unit || null,
        qty: String(parseFloat(r.qty || 0) || 0), rate: String(parseFloat(r.rate || 0) || 0),
        discount_percent: String(parseFloat(r.discount_percent || 0) || 0),
        tax_percent: String(parseFloat(r.tax_percent || 0) || 0), si_no: idx + 1,
      }));
      fd.append("products", JSON.stringify(payload));

      if (isEdit) await updateProformaInvoice(editId, fd);
      else await createProformaInvoice(fd);
      router.push("/dashboard/sales/proforma-invoice");
    } catch (e) {
      const resp = e?.response?.data;
      let msg = resp?.detail || resp?.error || "";
      if (!msg && resp) msg = JSON.stringify(resp);
      setError(typeof msg === "string" && msg ? msg : "Failed to save");
    } finally { setSaving(false); }
  });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f) {
      const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpeg", "image/jpg", "image/png"];
      const ext = (f.name || "").toLowerCase().split(".").pop();
      const okExts = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"];
      if (allowed.includes(f.type) || okExts.includes(ext)) { setAttachmentFile(f); setExistingAttachmentName(""); }
      else { alert("Unsupported file type"); if (fileInputRef.current) fileInputRef.current.value = ""; }
    } else setAttachmentFile(null);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (loadingData) return <div className="flex h-screen items-center justify-center text-gray-500">{t("proformaInvoice.loading")}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><span>//</span><span>Proforma Invoice</span><span>//</span>
          <span className="font-medium text-gray-800">{isEdit ? t("proformaInvoice.editTitle") : t("proformaInvoice.createTitle")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{currentYear}</span>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"><Plus className="size-4" /></button>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg bg-rose-700 text-white hover:bg-rose-800"><Save className="size-4" /></button>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"><Plus className="size-4" /></button>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="bg-[#004080] py-3 text-center"><h2 className="text-lg font-bold uppercase tracking-wider text-white">{t("proformaInvoice.title")}</h2></div>

        {/* Column 1: Bill Number, Customer, Currency, Invoice Period, Supply Date, Bank Account */}
        {/* Column 2: Date, Type, Currency Rate, Due Date, Payment Terms */}
        {/* Column 3: Narration, Tax Mode, PO Ref, Project/Reference No, Enable Seal and Sign */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.billNumber")}</label>
              <input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={billNumber || "(auto)"} disabled readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.customer")}</label>
              <div className="flex gap-1">
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("customer")}>
                  <option value="">{t("proformaInvoice.selectCustomer")}</option>
                  {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <button type="button" className="flex size-9 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700"><Plus className="size-4" /></button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.currency")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("currency")}>
                <option value="">{t("proformaInvoice.selectCurrency")}</option>
                {currencies.map((c) => (<option key={c.id} value={c.id}>{c.code} - {c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.invoicePeriod")}</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("proformaInvoice.invoicePeriodPlaceholder")} {...register("invoice_period")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.supplyDate")}</label>
              <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("supply_date")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.bankAccount")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("bank_account")}>
                <option value="">{t("proformaInvoice.selectBankAccount")}</option>
                {bankAccounts.map((ba) => (<option key={ba.id} value={ba.id}>{ba.name}</option>))}
              </select>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.date")}</label>
              <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("date")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.type")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("type")}>
                <option value="CASH">{t("proformaInvoice.typeCash")}</option>
                <option value="CREDIT">{t("proformaInvoice.typeCredit")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.currencyRate")}</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("currency_rate")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.dueDate")}</label>
              <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("due_date")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.paymentTerms")}</label>
              <textarea rows={3} className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("proformaInvoice.paymentTermsPlaceholder")} {...register("payment_terms")} />
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.narration")}</label>
              <textarea rows={3} className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("proformaInvoice.narrationPlaceholder")} {...register("narration")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.tax")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("tax_mode")}>
                <option value="TAX_INCLUDED">{t("proformaInvoice.taxIncluded")}</option>
                <option value="TAX_EXCLUDED">{t("proformaInvoice.taxExcluded")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.poRef")}</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("proformaInvoice.poRefPlaceholder")} {...register("po_ref")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.projectRefNo")}</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("proformaInvoice.projectRefNoPlaceholder")} {...register("project_ref_no")} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="size-4 accent-[#004080]" {...register("enable_seal_and_sign")} />
              <label className="text-sm font-semibold text-[#004080]">{t("proformaInvoice.enableSealAndSign")}</label>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="px-6 pb-2">
          <div className="mb-2 flex justify-start">
            <button type="button" onClick={() => append(EMPTY_ROW())} className="flex size-9 items-center justify-center rounded-md bg-purple-700 text-white shadow hover:bg-purple-800"><Plus className="size-4" /></button>
          </div>
          <div className="overflow-x-auto rounded-lg ring-1 ring-purple-200">
            <table className="w-full min-w-[1200px] text-sm">
              <thead>
                <tr className="bg-[#004080] text-xs font-semibold uppercase text-white">
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.siNo")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.product")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.unit")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.qty")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.rate")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.discPercent")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.amount")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.taxPercent")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.total")}</th>
                  <th className="px-2 py-2 text-center">{t("proformaInvoice.items.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const prodVal = getValues(`products.${index}.product`);
                  const productUnits = unitsForProduct(prodVal);
                  const cr = computedRows[index];
                  return (
                    <tr key={field.id} className="border-b">
                      <td className="bg-purple-100 px-2 py-2 text-center font-bold text-gray-800">{index + 1}</td>
                      <td className="px-2 py-2">
                        <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand" value={prodVal} onChange={(e) => handleProductChange(index, e.target.value)}>
                          <option value="">{t("proformaInvoice.items.selectProduct")}</option>
                          {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand disabled:bg-purple-50" value={getValues(`products.${index}.unit`)} onChange={(e) => handleUnitChange(index, e.target.value)} disabled={!prodVal}>
                          <option value="">--</option>
                          {productUnits.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
                        </select>
                      </td>
                      <td className="px-2 py-2"><input type="number" step="0.01" min="0" className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand" value={getValues(`products.${index}.qty`) || "0"} onChange={(e) => setVal(`products.${index}.qty`, e.target.value)} /></td>
                      <td className="px-2 py-2"><input type="number" step="0.01" min="0" className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand" value={getValues(`products.${index}.rate`) || "0"} onChange={(e) => setVal(`products.${index}.rate`, e.target.value)} /></td>
                      <td className="px-2 py-2"><input type="number" step="0.01" min="0" max="100" className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand" value={getValues(`products.${index}.discount_percent`) || "0"} onChange={(e) => setVal(`products.${index}.discount_percent`, e.target.value)} /></td>
                      <td className="px-2 py-2 text-right text-xs text-gray-700">{cr ? cr.amount.toFixed(2) : "0.00"}</td>
                      <td className="px-2 py-2"><input type="number" step="0.01" min="0" className="w-full rounded border border-gray-300 bg-gray-50 px-2 py-1.5 text-right text-xs outline-none" value={getValues(`products.${index}.tax_percent`) || "0"} readOnly tabIndex={-1} /></td>
                      <td className="px-2 py-2 text-right text-xs font-semibold text-gray-800">{cr ? cr.total.toFixed(2) : "0.00"}</td>
                      <td className="px-2 py-2 text-center">
                        <button type="button" onClick={() => { if (fields.length > 1) remove(index); }} className="flex size-7 items-center justify-center rounded bg-purple-700 text-white hover:bg-red-600"><Trash2 className="size-3.5" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer: 2-column per TASK.md */}
        <div className="grid grid-cols-1 gap-6 border-t p-6 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.total")}</label><input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={totals.total.toFixed(2)} disabled readOnly /></div>
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.discount")}</label><input type="number" step="0.01" min="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("discount")} /></div>
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.grandTotal")}</label><input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={totals.grandTotal.toFixed(2)} disabled readOnly /></div>
          </div>
          <div className="flex flex-col gap-3">
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.tax")}</label><input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={totals.tax.toFixed(2)} disabled readOnly /></div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("proformaInvoice.attachFile")}</label>
              <div className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-500 hover:border-brand hover:text-brand" onClick={() => fileInputRef.current?.click()}>
                {attachmentFile ? attachmentFile.name : existingAttachmentName || t("proformaInvoice.selectFiles")}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t px-6 py-4">
          <CreatePermission module="proforma_invoice">
          <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"><Save className="size-4" /> {t("proformaInvoice.save")}</button>
          </CreatePermission>
          <button type="button" className="flex items-center gap-2 rounded-lg bg-[#003366] px-6 py-2 text-sm font-semibold text-white hover:bg-[#002855]">{t("proformaInvoice.more")} <ChevronDown className="size-4" /></button>
          <button type="button" onClick={clearAll} className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"><Brush className="size-4" /> {t("proformaInvoice.clear")}</button>
        </div>
      </div>
      <button onClick={scrollToTop} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
