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
  createSalesReturn, updateSalesReturn,
  fetchSalesReturnOptions,
} from "@/services/api";
import axiosInstance from "@/utils/axios";

const EMPTY_ROW = () => ({
  product: "", unit: "", qty: "0", rate: "0", discount_amount: "0", tax_percent: "0",
});

const currentYear = new Date().getFullYear();
const today = new Date().toISOString().slice(0, 10);

export default function SalesReturnCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const { register, control, handleSubmit, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      customer: "", currency: "", date: today, currency_rate: "1",
      sales_person: "", type: "CASH", si_ref: "", narration: "",
      tax_mode: "TAX_EXCLUDED", enable_seal_and_sign: false,
      bank_account: "",
      product_discount_total: "0", cash_discount_total: "0", paid_amount: "0",
      payment: { paying_date: today, paying_amount: "0" },
      products: Array.from({ length: 4 }, () => EMPTY_ROW()),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });
  const [tick, forceUpdate] = useReducer(x => x + 1, 0);
  const setVal = useCallback((name, value) => { setValue(name, value); forceUpdate(); }, [setValue]);
  const productDiscountTotal = watch("product_discount_total");
  const cashDiscountTotal = watch("cash_discount_total");
  const paidAmount = watch("paid_amount");

  const payingAmount = watch("payment.paying_amount");

  useEffect(() => {
    const val = parseFloat(payingAmount || 0) || 0;
    setValue("paid_amount", String(val));
  }, [payingAmount, setValue]);

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

  useEffect(() => { if (error && error.startsWith("salesReturn.")) setError(t(error)); }, [t, error]);

  useEffect(() => {
    let active = true;
    (async () => {
      try { const data = await fetchSalesReturnOptions(); if (active) setOptions(data); }
      catch (e) { } finally {
        if (!active) return;
        setLoadingOptions(false);
        if (editId) {
          setLoadingData(true);
          axiosInstance.get(`/api/sales-returns/${editId}/`).then((res) => {
            if (!active) return;
            const q = res.data;
            setBillNumber(q.bill_number || "");
            setExistingAttachmentName(q.attachment_name || "");
            reset({
              customer: q.customer || "", currency: q.currency || "",
              date: q.date || today, currency_rate: q.currency_rate ? String(q.currency_rate) : "1",
              sales_person: q.sales_person || "", type: q.type || "CASH",
              si_ref: q.si_ref || "", narration: q.narration || "",
              tax_mode: q.tax_mode || "TAX_EXCLUDED",
              enable_seal_and_sign: q.enable_seal_and_sign || false,
              bank_account: q.bank_account || "",
              product_discount_total: q.product_discount_total ? String(q.product_discount_total) : "0",
              cash_discount_total: q.cash_discount_total ? String(q.cash_discount_total) : "0",
              paid_amount: q.paid_amount ? String(q.paid_amount) : "0",
              payment: {
                paying_date: (q.payments?.[0]?.paying_date) || today,
                paying_amount: q.payments?.[0]?.paying_amount ? String(q.payments[0].paying_amount) : "0",
              },
              products: (() => {
                const loaded = (q.items || []).map((it) => ({
                  product: it.product || "", unit: it.unit || "",
                  qty: it.qty ? String(it.qty) : "0", rate: it.rate ? String(it.rate) : "0",
                  discount_amount: it.discount_amount ? String(it.discount_amount) : "0",
                  tax_percent: it.tax_percent ? String(it.tax_percent) : "0",
                }));
                while (loaded.length < 4) loaded.push(EMPTY_ROW());
                return loaded;
              })(),
            });
          }).catch(() => { if (active) setError("salesReturn.failed"); })
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
      const discAmt = parseFloat(r.discount_amount || 0) || 0, taxPct = parseFloat(r.tax_percent || 0) || 0;
      const pt = qty * rate, amt = pt - discAmt, taxAmt = (amt * taxPct) / 100, total = amt + taxAmt;
      return { ...r, si_no: idx + 1, productTotal: pt, amount: amt, taxAmount: taxAmt, total };
    });
  }, [tick]);

  const totals = useMemo(() => {
    const total = computedRows.reduce((acc, r) => acc + r.amount, 0);
    const tax = computedRows.reduce((acc, r) => acc + r.taxAmount, 0);
    const prodDisc = parseFloat(productDiscountTotal || 0) || 0;
    const cashDisc = parseFloat(cashDiscountTotal || 0) || 0;
    const paid = parseFloat(paidAmount || 0) || 0;
    const grandTotal = total + tax - prodDisc - cashDisc;
    const pending = Math.max(0, grandTotal - paid);
    return { total, tax, grandTotal, pending };
  }, [computedRows, productDiscountTotal, cashDiscountTotal, paidAmount]);

  const clearAll = useCallback(() => {
    reset({
      customer: "", currency: "", date: today, currency_rate: "1",
      sales_person: "", type: "CASH", si_ref: "", narration: "",
      tax_mode: "TAX_EXCLUDED", enable_seal_and_sign: false,
      bank_account: "",
      product_discount_total: "0", cash_discount_total: "0", paid_amount: "0",
      payment: { paying_date: today, paying_amount: "0" },
      products: Array.from({ length: 4 }, () => EMPTY_ROW()),
    });
    setBillNumber(""); setAttachmentFile(null); setExistingAttachmentName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  }, [reset, today]);

  const validate = useCallback((data) => {
    if (!data.customer) return t("salesReturn.validation.customerRequired");
    if (!data.sales_person) return t("salesReturn.validation.salesPersonRequired");
    if (!data.currency) return t("salesReturn.validation.currencyRequired");
    if (!data.date) return t("salesReturn.validation.dateRequired");
    if (!data.type) return t("salesReturn.validation.typeRequired");
    const cr = parseFloat(data.currency_rate || 0);
    if (cr <= 0) return t("salesReturn.validation.currencyRatePositive");
    const validRows = (data.products || []).filter((r) => r.product);
    if (validRows.length === 0) return t("salesReturn.validation.productRequired");
    for (const r of validRows) {
      if (parseFloat(r.qty || 0) <= 0) return t("salesReturn.validation.qtyPositive");
      if (parseFloat(r.rate || 0) < 0) return t("salesReturn.validation.rateNonNegative");
      if (parseFloat(r.discount_amount || 0) < 0) return t("salesReturn.validation.discountNonNegative");
      if (parseFloat(r.tax_percent || 0) < 0) return t("salesReturn.validation.taxNonNegative");
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
      fd.append("type", data.type);
      fd.append("tax_mode", data.tax_mode);
      fd.append("sales_person", data.sales_person);
      if (data.si_ref) fd.append("si_ref", data.si_ref);
      if (data.narration) fd.append("narration", data.narration);
      fd.append("enable_seal_and_sign", data.enable_seal_and_sign ? "true" : "false");
      if (data.bank_account) fd.append("bank_account", data.bank_account);
      fd.append("product_discount_total", data.product_discount_total || "0");
      fd.append("cash_discount_total", data.cash_discount_total || "0");
      fd.append("paid_amount", data.paid_amount || "0");
      if (attachmentFile) { fd.append("attachment", attachmentFile); fd.append("attachment_name", attachmentFile.name); }

      // Payment
      const payingAmt = parseFloat(data.payment?.paying_amount || 0) || 0;
      if (payingAmt > 0 || data.payment?.paying_date) {
        fd.append("payments_data", JSON.stringify([{
          paying_date: data.payment.paying_date || today,
          paying_amount: String(payingAmt),
        }]));
      } else {
        fd.append("payments_data", JSON.stringify([]));
      }

      const raw = data.products || [];
      const payload = raw.filter((r) => r.product).map((r, idx) => ({
        product: r.product, unit: r.unit || null,
        qty: String(parseFloat(r.qty || 0) || 0), rate: String(parseFloat(r.rate || 0) || 0),
        discount_amount: String(parseFloat(r.discount_amount || 0) || 0),
        tax_percent: String(parseFloat(r.tax_percent || 0) || 0), si_no: idx + 1,
      }));
      fd.append("products", JSON.stringify(payload));

      if (isEdit) await updateSalesReturn(editId, fd);
      else await createSalesReturn(fd);
      router.push("/dashboard/sales/sales-return");
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

  if (loadingData) return <div className="flex h-screen items-center justify-center text-gray-500">{t("salesReturn.loading")}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><span>//</span><span>Sales Return</span><span>//</span>
          <span className="font-medium text-gray-800">{isEdit ? t("salesReturn.editTitle") : t("salesReturn.createTitle")}</span>
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
        <div className="bg-[#004080] py-3 text-center"><h2 className="text-lg font-bold uppercase tracking-wider text-white">{t("salesReturn.title")}</h2></div>

        {/* Col1: Bill/Customer/Sales Person/Currency/Bank Account, Col2: Date/Type/SI Ref/Currency Rate, Col3: Narration/Tax Mode/Enable Seal */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 lg:grid-cols-3">
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.billNumber")}</label>
              <input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={billNumber || "(auto)"} disabled readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.customer")}</label>
              <div className="flex gap-1">
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("customer")}>
                  <option value="">{t("salesReturn.selectCustomer")}</option>
                  {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <button type="button" className="flex size-9 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700"><Plus className="size-4" /></button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.salesPerson")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("sales_person")}>
                <option value="">{t("salesReturn.selectSalesPerson")}</option>
                {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.currency")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("currency")}>
                <option value="">{t("salesReturn.selectCurrency")}</option>
                {currencies.map((c) => (<option key={c.id} value={c.id}>{c.code} - {c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.bankAccount")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("bank_account")}>
                <option value="">{t("salesReturn.selectBankAccount")}</option>
                {bankAccounts.map((ba) => (<option key={ba.id} value={ba.id}>{ba.name}</option>))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.date")}</label>
              <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("date")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.type")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("type")}>
                <option value="CASH">{t("salesReturn.typeCash")}</option>
                <option value="CREDIT">{t("salesReturn.typeCredit")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.siRef")}</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("salesReturn.siRefPlaceholder")} {...register("si_ref")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.currencyRate")}</label>
              <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("currency_rate")} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.narration")}</label>
              <textarea rows={3} className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" placeholder={t("salesReturn.narrationPlaceholder")} {...register("narration")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.tax")}</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("tax_mode")}>
                <option value="TAX_INCLUDED">{t("salesReturn.taxIncluded")}</option>
                <option value="TAX_EXCLUDED">{t("salesReturn.taxExcluded")}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="size-4 accent-[#004080]" {...register("enable_seal_and_sign")} />
              <label className="text-sm font-semibold text-[#004080]">{t("salesReturn.enableSealAndSign")}</label>
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
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.siNo")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.product")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.unit")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.qty")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.rate")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.discountAmount")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.productTotal")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.amount")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.taxPercent")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.tax")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.total")}</th>
                  <th className="px-2 py-2 text-center">{t("salesReturn.items.actions")}</th>
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
                          <option value="">{t("salesReturn.items.selectProduct")}</option>
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
                      <td className="px-2 py-2"><input type="number" step="0.01" min="0" className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand" value={getValues(`products.${index}.discount_amount`) || "0"} onChange={(e) => setVal(`products.${index}.discount_amount`, e.target.value)} /></td>
                      <td className="px-2 py-2 text-right text-xs text-gray-700">{cr ? cr.productTotal.toFixed(2) : "0.00"}</td>
                      <td className="px-2 py-2 text-right text-xs text-gray-700">{cr ? cr.amount.toFixed(2) : "0.00"}</td>
                      <td className="px-2 py-2"><input type="number" step="0.01" min="0" className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand" value={getValues(`products.${index}.tax_percent`) || "0"} onChange={(e) => setVal(`products.${index}.tax_percent`, e.target.value)} /></td>
                      <td className="px-2 py-2 text-right text-xs text-gray-700">{cr ? cr.taxAmount.toFixed(2) : "0.00"}</td>
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

        {/* Footer: 3-col per TASK.md */}
        <div className="grid grid-cols-1 gap-6 border-t p-6 lg:grid-cols-4">
          {/* Col 1: Total, Paid Amount, Product Discount Total, Grand Total */}
          <div className="flex flex-col gap-3">
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.total")}</label><input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={totals.total.toFixed(2)} disabled readOnly /></div>
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.paidAmount")}</label><input type="number" step="0.01" min="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("paid_amount")} /></div>
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.productDiscountTotal")}</label><input type="number" step="0.01" min="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("product_discount_total")} /></div>
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.grandTotal")}</label><input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={totals.grandTotal.toFixed(2)} disabled readOnly /></div>
          </div>
          {/* Col 2: Tax, Pending Amount, Cash Discount Total */}
          <div className="flex flex-col gap-3">
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.tax")}</label><input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={totals.tax.toFixed(2)} disabled readOnly /></div>
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.pendingAmount")}</label><input className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none" value={totals.pending.toFixed(2)} disabled readOnly /></div>
            <div><label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.cashDiscountTotal")}</label><input type="number" step="0.01" min="0" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" {...register("cash_discount_total")} /></div>
          </div>
          {/* Col 3: Attach File + Payment Details */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.attachFile")}</label>
              <div className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-sm text-gray-500 hover:border-brand hover:text-brand" onClick={() => fileInputRef.current?.click()}>
                {attachmentFile ? attachmentFile.name : existingAttachmentName || t("salesReturn.selectFiles")}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={handleFileChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesReturn.paymentDetails")}</label>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">{t("salesReturn.payingDate")}</label>
                  <input type="date" className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand" {...register("payment.paying_date")} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">{t("salesReturn.payingAmount")}</label>
                  <input type="number" step="0.01" min="0" className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand" {...register("payment.paying_amount")} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t px-6 py-4">
          <button type="button" onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"><Save className="size-4" /> {t("salesReturn.save")}</button>
          <button type="button" className="flex items-center gap-2 rounded-lg bg-[#003366] px-6 py-2 text-sm font-semibold text-white hover:bg-[#002855]">{t("salesReturn.more")} <ChevronDown className="size-4" /></button>
          <button type="button" onClick={clearAll} className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"><Brush className="size-4" /> {t("salesReturn.clear")}</button>
        </div>
      </div>
      <button onClick={scrollToTop} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
