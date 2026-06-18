"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Home, ChevronRight, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  swrFetcher,
  createAccount, updateAccount,
} from "@/services/api";
import axiosInstance from "@/utils/axios";
import AddressInformationSection from "@/components/masters/AddressInformationSection";
import { CreatePermission, UpdatePermission, DeletePermission } from "@/components/permission/action-permission";

export default function AccountCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [activeTab, setActiveTab] = useState("account-info");

  // Account Info state
  const [parentId, setParentId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [name, setName] = useState("");
  const [mailingName, setMailingName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [arabicBankName, setArabicBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [ibanNo, setIbanNo] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [isDebit, setIsDebit] = useState(false);
  const [swiftCode, setSwiftCode] = useState("");

  // Address state
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [city, setCity] = useState("");
  const [buildingNo, setBuildingNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [district, setDistrict] = useState("");
  const [additionalNo, setAdditionalNo] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [arabicFields, setArabicFields] = useState({
    arabic_country: "", arabic_state: "", arabic_city: "",
    arabic_building_no: "", arabic_street_name: "", arabic_district: "",
    arabic_additional_no: "", arabic_zip_code: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const { data: parentsData } = useSWR("/api/account-groups/", swrFetcher, { revalidateOnFocus: false });
  const parents = useMemo(() => parentsData?.results || parentsData || [], [parentsData]);

  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    axiosInstance.get(`/api/accounts/${editId}/`).then((res) => {
      const acct = res.data;
      setParentId(acct.parent || "");
      setDisplayName(acct.display_name || "");
      setName(acct.name || "");
      setMailingName(acct.mailing_name || "");
      setArabicName(acct.arabic_name || "");
      setPhoneNumber(acct.phone_number || "");
      setMobileNumber(acct.mobile_number || "");
      setBankName(acct.bank_name || "");
      setArabicBankName(acct.arabic_bank_name || "");
      setBankAccountNumber(acct.bank_account_number || "");
      setIbanNo(acct.iban_no || "");
      setBranchName(acct.branch_name || "");
      setBranchCode(acct.branch_code || "");
      setEmail(acct.email || "");
      setDescription(acct.description || "");
      setOpeningBalance(acct.opening_balance != null ? String(acct.opening_balance) : "");
      setIsDebit(acct.is_debit || false);
      setSwiftCode(acct.swift_code || "");
      setCountryId(acct.country_ref || "");
      setStateId(acct.state_ref || "");
      setCity(acct.city || "");
      setBuildingNo(acct.building_no || "");
      setStreetName(acct.street_name || "");
      setDistrict(acct.district || "");
      setAdditionalNo(acct.additional_no || "");
      setZipCode(acct.zip_code || "");
      setArabicFields({
        arabic_country: acct.arabic_country || "",
        arabic_state: acct.arabic_state || "",
        arabic_city: acct.arabic_city || "",
        arabic_building_no: acct.arabic_building_no || "",
        arabic_street_name: acct.arabic_street_name || "",
        arabic_district: acct.arabic_district || "",
        arabic_additional_no: acct.arabic_additional_no || "",
        arabic_zip_code: acct.arabic_zip_code || "",
      });
    }).catch(() => setError(t("account.failed")))
      .finally(() => setLoadingData(false));
  }, [editId, t]);

  const translateField = (fieldKey, englishValue) => {
    if (!englishValue) return;
    if (fieldKey === "arabicName") setArabicName(`[${englishValue}]`);
    if (fieldKey === "arabicBankName") setArabicBankName(`[${englishValue}]`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        parent: parentId || null,
        display_name: displayName.trim() || null,
        name: name.trim(),
        mailing_name: mailingName.trim() || null,
        arabic_name: arabicName.trim() || null,
        phone_number: phoneNumber || null,
        mobile_number: mobileNumber || null,
        bank_name: bankName || null,
        arabic_bank_name: arabicBankName || null,
        bank_account_number: bankAccountNumber || null,
        iban_no: ibanNo || null,
        branch_name: branchName || null,
        branch_code: branchCode || null,
        email: email || null,
        description: description || null,
        opening_balance: openingBalance || null,
        is_debit: isDebit,
        cheque_print_enabled: false,
        swift_code: swiftCode || null,
        country_ref: countryId || null,
        arabic_country: arabicFields.arabic_country || null,
        state_ref: stateId || null,
        arabic_state: arabicFields.arabic_state || null,
        city: city || null,
        arabic_city: arabicFields.arabic_city || null,
        building_no: buildingNo || null,
        arabic_building_no: arabicFields.arabic_building_no || null,
        street_name: streetName || null,
        arabic_street_name: arabicFields.arabic_street_name || null,
        district: district || null,
        arabic_district: arabicFields.arabic_district || null,
        additional_no: additionalNo || null,
        arabic_additional_no: arabicFields.arabic_additional_no || null,
        zip_code: zipCode || null,
        arabic_zip_code: arabicFields.arabic_zip_code || null,
      };
      if (isEdit) await updateAccount(editId, payload);
      else await createAccount(payload);
      router.push("/dashboard/masters/account");
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  if (loadingData) return <div className="flex items-center justify-center py-32 text-gray-400">{t("account.loading")}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><ChevronRight className="size-3.5" />
          <Link href="/dashboard/masters/account" className="hover:text-brand">{t("account.title")}</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">{isEdit ? t("account.editTitle") : t("account.createTitle")}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        {/* Tab Bar */}
        <div className="flex rounded-t-xl bg-[#00477D]">
          <button
            onClick={() => setActiveTab("account-info")}
            className="px-6 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: activeTab === "account-info" ? "#3F51B5" : "transparent" }}
          >
            {t("account.accountInfo")}
          </button>
          <button
            onClick={() => setActiveTab("address")}
            className="px-6 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: activeTab === "address" ? "#3F51B5" : "transparent" }}
          >
            {t("account.address")}
          </button>
        </div>

        {activeTab === "account-info" && (
          <div className="p-6 space-y-5">
            {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {/* Parent + Display Name */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.parent")}</label>
                <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
                  <option value="">-- {t("account.parent")} --</option>
                  {parents.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.displayName")}</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("account.displayName")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Name + Arabic Name */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.name")}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("account.name")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold text-[#004080]">{t("account.arabicName")}</label>
                  <input value={arabicName} onChange={(e) => setArabicName(e.target.value)} placeholder={t("account.arabicName")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
                </div>
                <button type="button" onClick={() => translateField("arabicName", name)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title={t("account.translate")}>T</button>
              </div>
            </div>

            {/* Mailing Name */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">{t("account.mailingName")}</label>
              <input value={mailingName} onChange={(e) => setMailingName(e.target.value)} placeholder={t("account.mailingName")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>

            {/* Phone + Mobile */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.phoneNumber")}</label>
                <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder={t("account.phoneNumber")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.mobileNumber")}</label>
                <input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder={t("account.mobileNumber")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Bank Name + Arabic Bank Name */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.bankName")}</label>
                <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder={t("account.bankName")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold text-[#004080]">{t("account.arabicBankName")}</label>
                  <input value={arabicBankName} onChange={(e) => setArabicBankName(e.target.value)} placeholder={t("account.arabicBankName")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
                </div>
                <button type="button" onClick={() => translateField("arabicBankName", bankName)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title={t("account.translate")}>T</button>
              </div>
            </div>

            {/* Bank Account Number + IBAN */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.bankAccountNumber")}</label>
                <input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder={t("account.bankAccountNumber")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.ibanNo")}</label>
                <input value={ibanNo} onChange={(e) => setIbanNo(e.target.value)} placeholder={t("account.ibanNo")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Branch Name + Branch Code */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.branchName")}</label>
                <input value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder={t("account.branchName")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.branchCode")}</label>
                <input value={branchCode} onChange={(e) => setBranchCode(e.target.value)} placeholder={t("account.branchCode")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Email + Swift Code */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("account.email")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.swiftCode")}</label>
                <input value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} placeholder={t("account.swiftCode")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">{t("account.description")}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={t("account.description")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>

            {/* Opening Balance + Is Debit + Cheque Print */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("account.openingBalance")}</label>
                <input type="number" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-3 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isDebit" checked={isDebit} onChange={(e) => setIsDebit(e.target.checked)} className="size-4 accent-brand" />
                    <label htmlFor="isDebit" className="text-sm font-semibold text-[#004080]">{t("account.isDebit")}</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="chequePrint" checked={false} readOnly disabled className="size-4 accent-brand opacity-60" />
                    <label htmlFor="chequePrint" className="text-sm font-semibold text-gray-600">{t("account.chequePrintEnabled")}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "address" && (
          <div className="p-6">
            {error && <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <AddressInformationSection
              countryId={countryId}
              setCountryId={setCountryId}
              stateId={stateId}
              setStateId={setStateId}
              city={city}
              setCity={setCity}
              buildingNo={buildingNo}
              setBuildingNo={setBuildingNo}
              streetName={streetName}
              setStreetName={setStreetName}
              district={district}
              setDistrict={setDistrict}
              additionalNo={additionalNo}
              setAdditionalNo={setAdditionalNo}
              zipCode={zipCode}
              setZipCode={setZipCode}
              arabicFields={arabicFields}
              setArabicFields={setArabicFields}
            />
          </div>
        )}

        <div className="flex justify-end gap-4 border-t px-6 py-4">
          <Link href="/dashboard/masters/account" className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">{t("account.cancel")}</Link>
          <CreatePermission module="account">
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#004080] px-6 py-2 text-sm font-semibold text-white hover:bg-[#003060] disabled:opacity-60">
            {saving ? t("account.loading") : isEdit ? t("account.update") : t("account.save")}
          </button>
          </CreatePermission>
        </div>
      </div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
