"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createPrefix, updatePrefix } from "@/services/api";
import PREFIX_TYPES from "@/config/prefixTypes";

function InlineField({ label, required, children }) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-36 shrink-0 text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function InlineCheckbox({ label, checked, onChange, id }) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-36 shrink-0 text-sm font-semibold text-gray-700">{label}</label>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="size-4 accent-brand"
      />
    </div>
  );
}

export function PrefixDialog({ open, onClose, onSaved, prefix, financialYears }) {
  const { t } = useTranslation();

  const [type, setType] = useState("");
  const [prefixStr, setPrefixStr] = useState("");
  const [separator, setSeparator] = useState("-");
  const [startIndex, setStartIndex] = useState("0");
  const [currentIndex, setCurrentIndex] = useState("0");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [narration, setNarration] = useState("");
  const [prefixSeries, setPrefixSeries] = useState("");
  const [applicable, setApplicable] = useState(true);
  const [excludeTax, setExcludeTax] = useState(false);

  const [extraConfig, setExtraConfig] = useState({});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = useMemo(() => !!prefix, [prefix]);
  const title = useMemo(
    () => (isEdit ? t("prefix.editTitle") : t("prefix.addTitle")),
    [isEdit, t]
  );

  const typeFields = useMemo(() => {
    if (!type) return [];
    return PREFIX_TYPES.typeFields[type]?.fields || [];
  }, [type]);

  useEffect(() => {
    if (open) {
      if (prefix) {
        setType(prefix.type || "");
        setPrefixStr(prefix.prefix || "");
        setSeparator(prefix.separator || "-");
        setStartIndex(prefix.start_index != null ? String(prefix.start_index) : "0");
        setCurrentIndex(prefix.current_index != null ? String(prefix.current_index) : "0");
        setFromDate(prefix.from_date || "");
        setToDate(prefix.to_date || "");
        setFinancialYear(prefix.financial_year ? String(prefix.financial_year) : "");
        setNarration(prefix.narration || "");
        setPrefixSeries(prefix.prefix_series || "");
        setApplicable(prefix.applicable != null ? prefix.applicable : true);
        setExcludeTax(prefix.exclude_tax || false);
        setExtraConfig(prefix.extra_config || {});
      } else {
        setType("");
        setPrefixStr("");
        setSeparator("-");
        setStartIndex("0");
        setCurrentIndex("0");
        setFromDate("");
        setToDate("");
        setFinancialYear("");
        setNarration("");
        setPrefixSeries("");
        setApplicable(true);
        setExcludeTax(false);
        setExtraConfig({});
      }
      setError("");
    }
  }, [open, prefix]);

  const handleExtraFieldChange = useCallback((name, value) => {
    setExtraConfig((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTypeChange = useCallback((newType) => {
    setType(newType);
    setExtraConfig({});
  }, []);

  const handleSave = useCallback(async () => {
    setError("");

    if (!type.trim()) {
      setError(t("prefix.typeRequired"));
      return;
    }
    if (!prefixStr.trim()) {
      setError(t("prefix.prefixRequired"));
      return;
    }
    if (!financialYear) {
      setError(t("prefix.financialYearRequired"));
      return;
    }

    const si = Number(startIndex);
    const ci = Number(currentIndex);
    if (ci < si) {
      setError(t("prefix.indexError"));
      return;
    }

    if (fromDate && toDate && fromDate >= toDate) {
      setError(t("prefix.dateOrderError"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type: type.trim(),
        prefix: prefixStr.trim(),
        separator: separator || "-",
        start_index: si,
        current_index: ci,
        from_date: fromDate || null,
        to_date: toDate || null,
        financial_year: financialYear ? Number(financialYear) : null,
        narration: narration,
        prefix_series: prefixSeries,
        applicable: applicable,
        exclude_tax: excludeTax,
        extra_config: extraConfig,
      };

      if (isEdit) {
        await updatePrefix(prefix.id, payload);
      } else {
        await createPrefix(payload);
      }
      onSaved();
    } catch (err) {
      const msg =
        err?.detail ||
        err?.message ||
        err?.response?.data?.detail ||
        (typeof err === "object" ? JSON.stringify(err) : err) ||
        "Failed to save prefix.";
      setError(typeof msg === "string" ? msg : "Failed to save prefix.");
    } finally {
      setSaving(false);
    }
  }, [
    type,
    prefixStr,
    separator,
    startIndex,
    currentIndex,
    fromDate,
    toDate,
    financialYear,
    narration,
    prefixSeries,
    applicable,
    excludeTax,
    extraConfig,
    isEdit,
    prefix,
    onSaved,
    t,
  ]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="shrink-0 flex items-center justify-between rounded-t-xl bg-[#004080] px-5 py-3">
          <h2 className="text-base font-bold uppercase tracking-wide text-white">{title}</h2>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <InlineField label={t("prefix.type")} required>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="">-- Select --</option>
              {PREFIX_TYPES.types.map((tVal) => (
                <option key={tVal} value={tVal}>
                  {tVal}
                </option>
              ))}
            </select>
          </InlineField>

          {typeFields.length > 0 && (
            <div className="space-y-3 border-b pb-3">
              {typeFields.map((field) => (
                <InlineField key={field.name} label={t(`prefix.${field.name}`)}>
                  <select
                    value={extraConfig[field.name] || ""}
                    onChange={(e) => handleExtraFieldChange(field.name, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  >
                    <option value="">-- {field.label} --</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </InlineField>
              ))}
            </div>
          )}

          <InlineField label={t("prefix.prefix")} required>
            <input
              value={prefixStr}
              onChange={(e) => setPrefixStr(e.target.value)}
              placeholder={t("prefix.prefix")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </InlineField>

          <InlineField label={t("prefix.separator")}>
            <input
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </InlineField>

          <InlineField label={t("prefix.startIndex")}>
            <input
              type="number"
              min="0"
              value={startIndex}
              onChange={(e) => setStartIndex(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </InlineField>

          <InlineField label={t("prefix.currentIndex")}>
            <input
              type="number"
              min="0"
              value={currentIndex}
              onChange={(e) => setCurrentIndex(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </InlineField>

          <InlineField label={t("prefix.fromDate")}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </InlineField>

          <InlineField label={t("prefix.toDate")}>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </InlineField>

          <InlineField label={t("prefix.financialYear")} required>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="">-- Select --</option>
              {(financialYears || []).map((fy) => (
                <option key={fy.id} value={fy.id}>
                  {fy.name}
                </option>
              ))}
            </select>
          </InlineField>

          <InlineField label={t("prefix.narration")}>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </InlineField>

          <InlineField label={t("prefix.prefixSeries")}>
            <input
              value={prefixSeries}
              onChange={(e) => setPrefixSeries(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </InlineField>

          <InlineCheckbox
            label={t("prefix.applicable")}
            checked={applicable}
            onChange={(e) => setApplicable(e.target.checked)}
            id="applicableCheck"
          />

          <InlineCheckbox
            label={t("prefix.excludeTax")}
            checked={excludeTax}
            onChange={(e) => setExcludeTax(e.target.checked)}
            id="excludeTaxCheck"
          />
        </div>

        <div className="shrink-0 flex justify-end gap-3 rounded-b-xl border-t bg-gray-50 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {t("prefix.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#004080] px-5 py-2 text-sm font-semibold text-white hover:bg-[#003060] disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? t("prefix.update") : t("prefix.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
