"use client";

import { useState, useEffect, useMemo, useRef, useCallback, useReducer } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Home, ArrowUp, Plus, Trash2, Save, Brush, ChevronDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createSalesQuotation, updateSalesQuotation,
  fetchSalesQuotationOptions,
} from "@/services/api";
import axiosInstance from "@/utils/axios";
import { CreatePermission, UpdatePermission, DeletePermission } from "@/components/permission/action-permission";

const EMPTY_ROW = () => ({
  product: "",
  unit: "",
  qty: "0",
  rate: "0",
  discount_amount: "0",
  tax_percent: "0",
});

const currentYear = new Date().getFullYear();
const today = new Date().toISOString().slice(0, 10);

export default function SalesQuotationCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const { register, control, handleSubmit, watch, setValue, getValues, reset } = useForm({
    defaultValues: {
      customer: "",
      currency: "",
      quotation_validity: "",
      subject: "",
      show_last_quotation_price: false,
      bank_account: "",
      date: today,
      rfq_ref: "",
      currency_rate: "1",
      payment_terms: "",
      contact_details: "",
      site_name: "",
      enable_seal_and_sign: false,
      narration: "",
      tax_mode: "TAX_INCLUDED",
      attention: "",
      sales_person: "",
      ref_date: "",
      show_total_box_quotation: false,
      discount_total: "0",
      products: Array.from({ length: 4 }, () => EMPTY_ROW()),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const [tick, forceUpdate] = useReducer(x => x + 1, 0);
  const setVal = useCallback((name, value) => {
    setValue(name, value);
    forceUpdate();
  }, [setValue]);

  const discountTotal = watch("discount_total");

  // File
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [existingAttachmentName, setExistingAttachmentName] = useState("");
  const fileInputRef = useRef(null);

  // Dropdown options
  const [options, setOptions] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [billNumber, setBillNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  const customers = options?.customers || [];
  const currencies = options?.currencies || [];
  const users = options?.users || [];
  const bankAccounts = options?.bank_accounts || [];
  const products = options?.products || [];

  // Resolve i18n error keys into localized strings.
  useEffect(() => {
    if (!error) return;
    if (error.startsWith("salesQuotation.")) {
      setError(t(error));
    }
  }, [t, error]);

  // Load options first, then optionally load the quotation being edited so
  // the form renders with all <select> options already populated.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchSalesQuotationOptions();
        if (!active) return;
        setOptions(data);
      } catch (e) {
        // ignore — options will be empty arrays
      } finally {
        if (!active) return;
        setLoadingOptions(false);
        if (editId) {
          setLoadingData(true);
          axiosInstance
            .get(`/api/sales-quotations/${editId}/`)
            .then((res) => {
              if (!active) return;
              const q = res.data;
              setBillNumber(q.bill_number || "");
              setExistingAttachmentName(q.attachment_name || "");
              reset({
                customer: q.customer || "",
                currency: q.currency || "",
                quotation_validity: q.quotation_validity || "",
                subject: q.subject || "",
                show_last_quotation_price: !!q.show_last_quotation_price,
                bank_account: q.bank_account || "",
                date: q.date || today,
                rfq_ref: q.rfq_ref || "",
                currency_rate: q.currency_rate ? String(q.currency_rate) : "1",
                payment_terms: q.payment_terms || "",
                contact_details: q.contact_details || "",
                site_name: q.site_name || "",
                enable_seal_and_sign: !!q.enable_seal_and_sign,
                narration: q.narration || "",
                tax_mode: q.tax_mode || "TAX_EXCLUDED",
                attention: q.attention || "",
                sales_person: q.sales_person || "",
                ref_date: q.ref_date || "",
                show_total_box_quotation: !!q.show_total_box_quotation,
                discount_total: q.discount_total ? String(q.discount_total) : "0",
                products: (() => {
                  const loaded = (q.items || []).map((it) => ({
                    product: it.product || "",
                    unit: it.unit || "",
                    qty: it.qty ? String(it.qty) : "0",
                    rate: it.rate ? String(it.rate) : "0",
                    discount_amount: it.discount_amount ? String(it.discount_amount) : "0",
                    tax_percent: it.tax_percent ? String(it.tax_percent) : "0",
                  }));
                  while (loaded.length < 4) loaded.push(EMPTY_ROW());
                  return loaded;
                })(),
              });
            })
            .catch(() => {
              if (!active) return;
              setError("salesQuotation.failed");
            })
            .finally(() => {
              if (!active) return;
              setLoadingData(false);
            });
        }
      }
    })();
    return () => { active = false; };
  }, [editId, reset, today]);

  const handleProductChange = useCallback(
    (index, productId) => {
      setVal(`products.${index}.product`, productId);
      const product = products.find((p) => String(p.id) === String(productId));
      if (!product) {
        setVal(`products.${index}.unit`, "");
        setVal(`products.${index}.rate`, "0");
        return;
      }
      const productUnits = product.product_units || [];
      let newUnit = "";
      let newRate = "0";
      if (productUnits.length > 0) {
        const defaultSelling = productUnits.find((pu) => pu.is_default_selling);
        const selling = productUnits.find((pu) => pu.is_selling_unit);
        const fallback = productUnits[0];
        const chosen = defaultSelling || selling || fallback;
        newUnit = String(chosen.unit_id);
      } else if (product.selling_unit_id) {
        newUnit = String(product.selling_unit_id);
      } else if (product.unit_prices && product.unit_prices.length > 0) {
        newUnit = String(product.unit_prices[0].unit_id);
      }
      const matched = (product.unit_prices || []).find(
        (up) => String(up.unit_id) === String(newUnit)
      );
      if (matched) {
        newRate = matched.sales_price;
      } else if (product.default_rate) {
        newRate = product.default_rate;
      }
      setVal(`products.${index}.unit`, newUnit);
      setVal(`products.${index}.rate`, newRate);
    },
    [products, setVal]
  );

  const handleUnitChange = useCallback(
    (index, unitId) => {
      setVal(`products.${index}.unit`, unitId);
      const currentProductId = getValues(`products.${index}.product`);
      const product = products.find((p) => String(p.id) === String(currentProductId));
      if (product && product.unit_prices) {
        const matched = product.unit_prices.find(
          (up) => String(up.unit_id) === String(unitId)
        );
        if (matched) {
          setVal(`products.${index}.rate`, matched.sales_price);
        }
      }
    },
    [products, setVal, getValues]
  );

  const unitsForProduct = useCallback(
    (productId) => {
      const product = products.find((p) => String(p.id) === String(productId));
      if (!product) return [];
      if (product.product_units && product.product_units.length > 0) {
        return product.product_units.map((pu) => ({
          id: pu.unit_id,
          name: pu.unit_name,
        }));
      }
      if (product.unit_prices && product.unit_prices.length > 0) {
        return product.unit_prices.map((up) => ({
          id: up.unit_id,
          name: up.unit_name,
        }));
      }
      return [];
    },
    [products]
  );

  // Per-row computed values
  const computedRows = useMemo(() => {
    const products = getValues("products") || [];
    return products.map((r, idx) => {
      const qty = parseFloat(r.qty || 0) || 0;
      const rate = parseFloat(r.rate || 0) || 0;
      const discount = parseFloat(r.discount_amount || 0) || 0;
      const taxPercent = parseFloat(r.tax_percent || 0) || 0;
      const productTotal = qty * rate;
      const amount = productTotal - discount;
      const taxAmount = (amount * taxPercent) / 100;
      const total = amount + taxAmount;
      return { ...r, si_no: idx + 1, productTotal, amount, taxAmount, total };
    });
  }, [tick]);

  const totals = useMemo(() => {
    const total = computedRows.reduce((acc, r) => acc + r.amount, 0);
    const tax = computedRows.reduce((acc, r) => acc + r.taxAmount, 0);
    const disc = parseFloat(discountTotal || 0) || 0;
    const grandTotal = total + tax - disc;
    return { total, tax, grandTotal };
  }, [computedRows, discountTotal]);

  const clearAll = useCallback(() => {
    reset({
      customer: "", currency: "", quotation_validity: "", subject: "",
      show_last_quotation_price: false, bank_account: "", rfq_ref: "",
      currency_rate: "1", payment_terms: "", contact_details: "",
      site_name: "", enable_seal_and_sign: false, narration: "",
      tax_mode: "TAX_INCLUDED", attention: "", sales_person: "",
      ref_date: "", show_total_box_quotation: false, discount_total: "0",
      products: Array.from({ length: 4 }, () => EMPTY_ROW()),
    });
    setBillNumber("");
    setAttachmentFile(null);
    setExistingAttachmentName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  }, [reset]);

  const validate = useCallback((data) => {
    if (!data.customer) return t("salesQuotation.validation.customerRequired");
    if (!data.currency) return t("salesQuotation.validation.currencyRequired");
    if (!data.date) return t("salesQuotation.validation.dateRequired");
    if (!data.sales_person) return t("salesQuotation.validation.salesPersonRequired");
    const validRows = (data.products || []).filter((r) => r.product);
    if (validRows.length === 0) return t("salesQuotation.validation.productRequired");
    for (const r of validRows) {
      if (parseFloat(r.qty || 0) <= 0) return t("salesQuotation.validation.qtyPositive");
      if (parseFloat(r.rate || 0) < 0) return t("salesQuotation.validation.rateNonNegative");
      if (parseFloat(r.discount_amount || 0) < 0) return t("salesQuotation.validation.discountNonNegative");
      if (parseFloat(r.tax_percent || 0) < 0) return t("salesQuotation.validation.taxNonNegative");
    }
    return "";
  }, [t]);

  const onSave = handleSubmit(async (data) => {
    const err = validate(data);
    if (err) { setError(err); return; }
    setError(""); setSaving(true);
    try {
      const formData = new FormData();
      formData.append("customer", data.customer);
      formData.append("currency", data.currency);
      formData.append("currency_rate", data.currency_rate || "1");
      formData.append("date", data.date);
      formData.append("tax_mode", data.tax_mode);
      if (data.quotation_validity) formData.append("quotation_validity", data.quotation_validity);
      if (data.subject) formData.append("subject", data.subject);
      formData.append("show_last_quotation_price", data.show_last_quotation_price ? "true" : "false");
      if (data.bank_account) formData.append("bank_account", data.bank_account);
      formData.append("show_total_box_quotation", data.show_total_box_quotation ? "true" : "false");
      if (data.rfq_ref) formData.append("rfq_ref", data.rfq_ref);
      if (data.payment_terms) formData.append("payment_terms", data.payment_terms);
      if (data.contact_details) formData.append("contact_details", data.contact_details);
      if (data.site_name) formData.append("site_name", data.site_name);
      formData.append("enable_seal_and_sign", data.enable_seal_and_sign ? "true" : "false");
      if (data.narration) formData.append("narration", data.narration);
      if (data.attention) formData.append("attention", data.attention);
      formData.append("sales_person", data.sales_person);
      if (data.ref_date) formData.append("ref_date", data.ref_date);
      formData.append("discount_total", data.discount_total || "0");
      if (attachmentFile) {
        formData.append("attachment", attachmentFile);
        formData.append("attachment_name", attachmentFile.name);
      }

      const rawProducts = data.products || [];
      const productsPayload = rawProducts
        .filter((r) => r.product)
        .map((r, idx) => ({
          product: r.product,
          unit: r.unit || null,
          qty: String(parseFloat(r.qty || 0) || 0),
          rate: String(parseFloat(r.rate || 0) || 0),
          discount_amount: String(parseFloat(r.discount_amount || 0) || 0),
          tax_percent: String(parseFloat(r.tax_percent || 0) || 0),
          si_no: idx + 1,
        }));
      formData.append("products", JSON.stringify(productsPayload));

      if (isEdit) {
        await updateSalesQuotation(editId, formData);
      } else {
        await createSalesQuotation(formData);
      }
      router.push("/dashboard/sales/sales-quotation");
    } catch (e) {
      const resp = e?.response?.data;
      let msg = resp?.detail || resp?.error || "";
      if (!msg && resp) msg = JSON.stringify(resp);
      setError(typeof msg === "string" && msg ? msg : "Failed to save");
    } finally {
      setSaving(false);
    }
  });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f) {
      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/jpeg", "image/jpg", "image/png",
      ];
      const name = (f.name || "").toLowerCase();
      const ext = name.split(".").pop();
      const okExts = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"];
      if (allowed.includes(f.type) || okExts.includes(ext)) {
        setAttachmentFile(f);
        setExistingAttachmentName("");
      } else {
        alert("Unsupported file type");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      setAttachmentFile(null);
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  if (loadingData) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        {t("salesQuotation.loading")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span>
          <span>//</span>
          <span>Sales Quotation</span>
          <span>//</span>
          <span className="font-medium text-gray-800">
            {isEdit ? t("salesQuotation.editTitle") : t("salesQuotation.createTitle")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{currentYear}</span>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600"><Plus className="size-4" /></button>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg bg-rose-700 text-white hover:bg-rose-800"><Save className="size-4" /></button>
          <button type="button" className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700"><Plus className="size-4" /></button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="bg-[#004080] py-3 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">{t("salesQuotation.title")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.billNumber")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none"
                value={billNumber || "(auto)"}
                disabled
                readOnly
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.customer")}</label>
              <div className="flex gap-1">
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                  {...register("customer")}
                >
                  <option value="">{t("salesQuotation.selectCustomer")}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="button" className="flex size-9 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700" title={t("salesQuotation.addCustomer")}>
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.currency")}</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                {...register("currency")}
              >
                <option value="">{t("salesQuotation.selectCurrency")}</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.quotationValidity")}</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder={t("salesQuotation.quotationValidityPlaceholder")}
                {...register("quotation_validity")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.subject")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder={t("salesQuotation.subjectPlaceholder")}
                {...register("subject")}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="showLastQP"
                type="checkbox"
                className="size-4 accent-red-600"
                style={{ borderColor: "#dc2626" }}
                {...register("show_last_quotation_price")}
              />
              <label htmlFor="showLastQP" className="text-sm font-medium text-gray-700">
                {t("salesQuotation.showLastQuotationPrice")}
              </label>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.bankAccount")}</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                {...register("bank_account")}
              >
                <option value="">{t("salesQuotation.selectBankAccount")}</option>
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}{b.account_number ? ` - ${b.account_number}` : ""}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.date")}</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                {...register("date")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.rfqRef")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder={t("salesQuotation.rfqRefPlaceholder")}
                {...register("rfq_ref")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.currencyRate")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                {...register("currency_rate")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.paymentTerms")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder={t("salesQuotation.paymentTermsPlaceholder")}
                {...register("payment_terms")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.contactDetails")}</label>
              <textarea
                rows={2}
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder={t("salesQuotation.contactDetailsPlaceholder")}
                {...register("contact_details")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.siteName")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder={t("salesQuotation.siteNamePlaceholder")}
                {...register("site_name")}
              />
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.narration")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder={t("salesQuotation.narrationPlaceholder")}
                {...register("narration")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.tax")}</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                {...register("tax_mode")}
              >
                <option value="TAX_INCLUDED">{t("salesQuotation.taxIncluded")}</option>
                <option value="TAX_EXCLUDED">{t("salesQuotation.taxExcluded")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.attention")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder={t("salesQuotation.attentionPlaceholder")}
                {...register("attention")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.salesPerson")}</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                {...register("sales_person")}
              >
                <option value="">{t("salesQuotation.selectSalesPerson")}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.refDate")}</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                {...register("ref_date")}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 border-t px-6 py-3">
          <div className="flex items-center gap-2">
            <input
              id="showTotalBox"
              type="checkbox"
              className="size-4 accent-red-600"
              style={{ borderColor: "#dc2626" }}
              {...register("show_total_box_quotation")}
            />
            <label htmlFor="showTotalBox" className="text-sm font-medium text-gray-700">
              {t("salesQuotation.showTotalBoxQuotation")}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="enableSeal"
              type="checkbox"
              className="size-4 accent-red-600"
              style={{ borderColor: "#dc2626" }}
              {...register("enable_seal_and_sign")}
            />
            <label htmlFor="enableSeal" className="text-sm font-medium text-gray-700">
              {t("salesQuotation.enableSealAndSign")}
            </label>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-6 pb-2">
          <div className="mb-2 flex justify-start">
            <button
              type="button"
              onClick={() => append(EMPTY_ROW())}
              className="flex size-9 items-center justify-center rounded-md bg-purple-700 text-white shadow hover:bg-purple-800"
              title={t("salesQuotation.addRow")}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg ring-1 ring-purple-200">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="bg-[#004080] text-xs font-semibold uppercase text-white">
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.siNo")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.product")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.unit")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.qty")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.rate")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.discountAmount")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.productTotal")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.amount")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.taxPercent")}</th>
                  <th className="px-2 py-2 text-center">{t("salesQuotation.items.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const prodVal = getValues(`products.${index}.product`);
                  const unitVal = getValues(`products.${index}.unit`);
                  const productUnits = unitsForProduct(prodVal);
                  const cr = computedRows[index];
                  return (
                    <tr key={field.id} className="border-b">
                      <td className="bg-purple-100 px-2 py-2 text-center font-bold text-gray-800">{index + 1}</td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand"
                          value={prodVal}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                        >
                          <option value="">{t("salesQuotation.items.selectProduct")}</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-brand disabled:bg-purple-50"
                          value={unitVal}
                          onChange={(e) => handleUnitChange(index, e.target.value)}
                          disabled={!prodVal}
                        >
                          <option value="">--</option>
                          {productUnits.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number" step="0.01" min="0"
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand"
                          value={getValues(`products.${index}.qty`) || "0"}
                          onChange={(e) => setVal(`products.${index}.qty`, e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number" step="0.01" min="0"
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand"
                          value={getValues(`products.${index}.rate`) || "0"}
                          onChange={(e) => setVal(`products.${index}.rate`, e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number" step="0.01" min="0"
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand"
                          value={getValues(`products.${index}.discount_amount`) || "0"}
                          onChange={(e) => setVal(`products.${index}.discount_amount`, e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2 text-right text-xs text-gray-700">{cr ? cr.productTotal.toFixed(2) : "0.00"}</td>
                      <td className="px-2 py-2 text-right text-xs text-gray-700">{cr ? cr.amount.toFixed(2) : "0.00"}</td>
                      <td className="px-2 py-2">
                        <input
                          type="number" step="0.01" min="0"
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-right text-xs outline-none focus:border-brand"
                          value={getValues(`products.${index}.tax_percent`) || "0"}
                          onChange={(e) => setVal(`products.${index}.tax_percent`, e.target.value)}
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="flex size-7 items-center justify-center rounded bg-purple-700 text-white hover:bg-red-600"
                          title={t("salesQuotation.removeRow")}
                          disabled={fields.length <= 1}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & File Section */}
        <div className="grid grid-cols-1 gap-6 border-t p-6 lg:grid-cols-3">
          {/* Left: Financial summaries */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.totals.total")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-right text-sm outline-none"
                value={totals.total.toFixed(2)}
                readOnly
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.totals.discount")}</label>
              <input
                type="number" step="0.01" min="0"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right text-sm outline-none focus:border-brand"
                {...register("discount_total")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.totals.grandTotal")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-right text-sm font-bold outline-none"
                value={totals.grandTotal.toFixed(2)}
                readOnly
              />
            </div>
          </div>

          {/* Center: Tax summary */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.totals.tax")}</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-right text-sm outline-none"
                value={totals.tax.toFixed(2)}
                readOnly
              />
            </div>
          </div>

          {/* Right: File attachment */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#004080]">{t("salesQuotation.attachFiles")}</label>
              <div className="flex items-stretch">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-100"
                >
                  {t("salesQuotation.selectFiles")}
                </button>
              </div>
              {(attachmentFile || existingAttachmentName) && (
                <div className="mt-2 text-xs text-gray-600">
                  {attachmentFile ? attachmentFile.name : existingAttachmentName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center gap-3 border-t bg-gray-50 px-6 py-4">
          <CreatePermission module="sales_quotation">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-2 text-sm font-semibold uppercase text-white hover:bg-green-700 disabled:opacity-60"
          >
            <Save className="size-4" />{saving ? t("salesQuotation.loading") : (isEdit ? t("salesQuotation.update") : t("salesQuotation.save"))}
          </button>
          </CreatePermission>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-[#1e3a8a] px-6 py-2 text-sm font-semibold uppercase text-white hover:opacity-90"
          >
            {t("salesQuotation.more")}<ChevronDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-2 rounded-md bg-red-600 px-6 py-2 text-sm font-semibold uppercase text-white hover:bg-red-700"
          >
            <Brush className="size-4" />{t("salesQuotation.clear")}
          </button>
        </div>
      </div>

      <button onClick={scrollToTop} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]">
        <ArrowUp className="size-5" />
      </button>
    </div>
  );
}
