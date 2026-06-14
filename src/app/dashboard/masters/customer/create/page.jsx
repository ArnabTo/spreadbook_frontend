"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Home, ChevronRight, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  swrFetcher, fetchCustomers, createCustomer, updateCustomer,
  uploadCustomerAttachment, deleteCustomerAttachment,
} from "@/services/api";
import axiosInstance from "@/utils/axios";
import AddressInformationSection from "@/components/masters/AddressInformationSection";

export default function CustomerCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [activeTab, setActiveTab] = useState("party-info");

  // Party info state
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [address, setAddress] = useState("");
  const [arabicAddress, setArabicAddress] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [vatNo, setVatNo] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [creditPeriod, setCreditPeriod] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");

  // Sales person (dropdown placeholder)
  const [salesPersonId, setSalesPersonId] = useState("");

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

  // Attachments
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const fileInputRef = useRef(null);

  const fetchCustomerDetail = async (id) => {
    const res = await axiosInstance.get(`/api/customers/${id}/`);
    return res.data;
  };

  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    fetchCustomerDetail(editId).then((cust) => {
        setName(cust.name || "");
        setDisplayName(cust.display_name || "");
        setArabicName(cust.arabic_name || "");
        setAddress(cust.address || "");
        setArabicAddress(cust.arabic_address || "");
        setCode(cust.customer_code || "");
        setPhone(cust.phone || cust.phoneNumber || "");
        setMobile(cust.mobile_number || "");
        setEmail(cust.email || "");
        setVatNo(cust.vat_no || "");
        setCrNumber(cust.cr_number || "");
        setCreditPeriod(cust.credit_period != null ? String(cust.credit_period) : "");
        setCreditLimit(cust.credit_limit != null ? String(cust.credit_limit) : "");
        setContactPerson(cust.contact_person || "");
        setOpeningBalance(cust.opening_balance != null ? String(cust.opening_balance) : "");
        setSalesPersonId(cust.sales_person || "");
        setCountryId(cust.country_ref || "");
        setStateId(cust.state_ref || "");
        setCity(cust.city || "");
        setBuildingNo(cust.building_no || "");
        setStreetName(cust.street_name || "");
        setDistrict(cust.district || "");
        setAdditionalNo(cust.additional_no || "");
        setZipCode(cust.zip_code || "");
        setArabicFields({
          arabic_country: cust.arabic_country || "",
          arabic_state: cust.arabic_state || "",
          arabic_city: cust.arabic_city || "",
          arabic_building_no: cust.arabic_building_no || "",
          arabic_street_name: cust.arabic_street_name || "",
          arabic_district: cust.arabic_district || "",
          arabic_additional_no: cust.arabic_additional_no || "",
          arabic_zip_code: cust.arabic_zip_code || "",
        });
        setExistingAttachments(cust.attachments || []);
    }).catch(() => setError(t("customer.failed")))
      .finally(() => setLoadingData(false));
  }, [editId, t]);

  const translateToArabic = (field, englishValue) => {
    if (!englishValue) return;
    if (field === "arabicName") setArabicName(`[${englishValue}]`);
    if (field === "arabicAddress") setArabicAddress(`[${englishValue}]`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAttachmentFile(file);
  };

  const handleUploadAttachment = async () => {
    if (!attachmentFile || !editId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", attachmentFile);
      await uploadCustomerAttachment(editId, formData);
      setAttachmentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      const cust = await fetchCustomerDetail(editId);
      setExistingAttachments(cust?.attachments || []);
    } catch (err) {
      setError(err?.detail || err?.message || "Upload failed.");
    } finally { setUploading(false); }
  };

  const handleDeleteAttachment = async (attId) => {
    if (!editId) return;
    try {
      await deleteCustomerAttachment(editId, attId);
      const cust = await fetchCustomerDetail(editId);
      setExistingAttachments(cust?.attachments || []);
    } catch (err) {
      setError(err?.detail || err?.message || "Delete failed.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: name.trim() || null,
        display_name: displayName.trim() || null,
        arabic_name: arabicName.trim() || null,
        address: address || null,
        arabic_address: arabicAddress || null,
        customer_code: code.trim() || null,
        phoneNumber: phone || null,
        mobile_number: mobile || null,
        email: email || null,
        vat_no: vatNo || null,
        cr_number: crNumber || null,
        is_effected_to_ledger: true,
        credit_period: creditPeriod ? Number(creditPeriod) : null,
        credit_limit: creditLimit || null,
        opening_balance: openingBalance || null,
        contact_person: contactPerson || null,
        sales_person: salesPersonId || null,
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

      let savedCustomer;
      if (isEdit) {
        savedCustomer = await updateCustomer(editId, payload);
        if (attachmentFile) {
          const formData = new FormData();
          formData.append("file", attachmentFile);
          await uploadCustomerAttachment(editId, formData);
        }
      } else {
        savedCustomer = await createCustomer(payload);
        if (attachmentFile && savedCustomer?.id) {
          const formData = new FormData();
          formData.append("file", attachmentFile);
          await uploadCustomerAttachment(savedCustomer.id, formData);
        }
      }
      router.push("/dashboard/masters/customer");
    } catch (err) {
      setError(err?.detail || err?.message || "Failed to save.");
    } finally { setSaving(false); }
  };

  if (loadingData) return <div className="flex items-center justify-center py-32 text-gray-400">{t("customer.loading")}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><ChevronRight className="size-3.5" />
          <Link href="/dashboard/masters/customer" className="hover:text-brand">{t("customer.title")}</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">{isEdit ? t("customer.editTitle") : t("customer.createTitle")}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        {/* Tab Bar */}
        <div className="flex rounded-t-xl bg-[#00477D]">
          <button
            onClick={() => setActiveTab("party-info")}
            className="px-6 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: activeTab === "party-info" ? "#3F51B5" : "transparent" }}
          >
            {t("customer.partyInfo")}
          </button>
          <button
            onClick={() => setActiveTab("address")}
            className="px-6 py-3 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: activeTab === "address" ? "#3F51B5" : "transparent" }}
          >
            {t("customer.address")}
          </button>
        </div>

        {activeTab === "party-info" && (
          <div className="p-6 space-y-5">
            {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {/* Name + Arabic Name */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.name")}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("customer.namePlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold text-[#004080]">{t("customer.arabicName")}</label>
                  <input value={arabicName} onChange={(e) => setArabicName(e.target.value)} placeholder={t("customer.arabicNamePlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
                </div>
                <button type="button" onClick={() => translateToArabic("arabicName", name)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mb-0.5" title={t("customer.translate")}>T</button>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">{t("customer.displayName")}</label>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t("customer.displayNamePlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
            </div>

            {/* Address + Arabic Address */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.partyAddress")}</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder={t("customer.addressPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold text-[#004080]">{t("customer.partyArabicAddress")}</label>
                  <textarea value={arabicAddress} onChange={(e) => setArabicAddress(e.target.value)} rows={3} placeholder={t("customer.arabicAddressPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand text-right" dir="rtl" />
                </div>
                <button type="button" onClick={() => translateToArabic("arabicAddress", address)} className="flex size-9 items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 shrink-0 mt-5" title={t("customer.translate")}>T</button>
              </div>
            </div>

            {/* Code + Phone */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.code")}</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("customer.codePlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.phoneNumber")}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("customer.phonePlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Mobile + Email */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.mobileNumber")}</label>
                <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder={t("customer.mobilePlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.email")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("customer.emailPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* VAT No + CR Number */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.vatNo")}</label>
                <input value={vatNo} onChange={(e) => setVatNo(e.target.value)} placeholder={t("customer.vatNoPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.crNumber")}</label>
                <input value={crNumber} onChange={(e) => setCrNumber(e.target.value)} placeholder={t("customer.crNumberPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Is Effected To Ledger + Credit Period */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="effectedLedger" checked={true} readOnly disabled className="size-4 accent-brand opacity-60" />
                <label htmlFor="effectedLedger" className="text-sm font-semibold text-gray-600">{t("customer.isEffectedToLedger")}</label>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.creditPeriod")}</label>
                <input type="number" min="0" value={creditPeriod} onChange={(e) => setCreditPeriod(e.target.value)} placeholder={t("customer.creditPeriodPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
                <p className="text-xs text-gray-500">{t("customer.numberOfDays")}</p>
              </div>
            </div>

            {/* Credit Limit + Opening Balance */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.creditLimit")}</label>
                <input type="number" step="0.01" min="0" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder={t("customer.creditLimitPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.openingBalance")}</label>
                <input type="number" step="0.01" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} placeholder={t("customer.openingBalancePlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Contact Person + Sales Person */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.contactPerson")}</label>
                <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder={t("customer.contactPersonPlaceholder")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#004080]">{t("customer.salesPerson")}</label>
                <input value={salesPersonId} onChange={(e) => setSalesPersonId(e.target.value)} placeholder={t("customer.salesPerson")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
              </div>
            </div>

            {/* Attach Files */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#004080]">{t("customer.attachFiles")}</label>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFileChange} className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#004080] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-[#003060]" />
                {isEdit && attachmentFile && (
                  <button type="button" onClick={handleUploadAttachment} disabled={uploading} className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60">
                    {uploading ? "..." : "Upload"}
                  </button>
                )}
              </div>
              {existingAttachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {existingAttachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm">
                      <span className="flex-1 text-gray-700">{att.original_filename || att.file}</span>
                      {isEdit && (
                        <button type="button" onClick={() => handleDeleteAttachment(att.id)} className="text-red-500 hover:text-red-700 font-medium">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
          <Link href="/dashboard/masters/customer" className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">{t("customer.cancel")}</Link>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#004080] px-6 py-2 text-sm font-semibold text-white hover:bg-[#003060] disabled:opacity-60">
            {saving ? (t("customer.loading")) : isEdit ? t("customer.update") : t("customer.save")}
          </button>
        </div>
      </div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
