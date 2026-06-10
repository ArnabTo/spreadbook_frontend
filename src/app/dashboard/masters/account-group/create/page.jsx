"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { Home, ChevronRight, ArrowUp } from "lucide-react";
import {
  swrFetcher,
  fetchAccountGroups, createAccountGroup, updateAccountGroup,
  fetchAccountGroupParents,
} from "@/services/api";
import { useTranslation } from "react-i18next";

export default function AccountGroupCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = !!editId;
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [parentId, setParentId] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const { data: parentsData } = useSWR(
    "/api/account-group-parents/", swrFetcher, { revalidateOnFocus: false }
  );
  const parents = useMemo(() => parentsData?.results || parentsData || [], [parentsData]);

  useEffect(() => {
    if (!editId) return;
    setLoadingData(true);
    fetchAccountGroups({ id: editId }).then((data) => {
      const items = data?.results || data || [];
      const grp = Array.isArray(items) ? items[0] : items;
      if (grp) {
        setName(grp.name || "");
        setAccountCode(grp.account_code || "");
        setParentId(grp.parent || "");
      }
    }).catch(() => setError(t("accountGroup.failed")))
      .finally(() => setLoadingData(false));
  }, [editId, t]);

  const validateForm = () => {
    if (!name.trim()) return t("accountGroup.nameRequired");
    if (!accountCode.trim()) return t("accountGroup.codeRequired");
    if (!parentId) return t("accountGroup.parentRequired");
    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        account_code: accountCode.trim(),
        parent: Number(parentId),
      };
      if (isEdit) await updateAccountGroup(editId, payload);
      else await createAccountGroup(payload);
      router.push("/dashboard/masters/account-group");
    } catch (err) {
      const msg = typeof err === "object" ? (err?.name || err?.account_code || err?.parent || err?.detail || err?.message || "Failed to save.") : "Failed to save.";
      setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally { setSaving(false); }
  };

  if (loadingData) return <div className="flex items-center justify-center py-32 text-gray-400">{t("accountGroup.loading")}</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand"><Home className="size-4" /></Link>
          <span>Home</span><ChevronRight className="size-3.5" />
          <Link href="/dashboard/masters/account-group" className="hover:text-brand">{t("accountGroup.title")}</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">{isEdit ? t("accountGroup.editTitle") : t("accountGroup.addTitle")}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="rounded-t-xl bg-[#004080] py-3 text-center">
          <h2 className="text-base font-bold uppercase text-white">{isEdit ? t("accountGroup.editTitle") : t("accountGroup.addTitle")}</h2>
        </div>
        <div className="p-6 space-y-5">
          {error && <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{t("accountGroup.name")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("accountGroup.name")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{t("accountGroup.accountCode")}</label>
            <input value={accountCode} onChange={(e) => setAccountCode(e.target.value)} placeholder={t("accountGroup.accountCode")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#004080]">{t("accountGroup.parent")}</label>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand bg-white">
              <option value="">-- Select --</option>
              {parents.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>
        </div>

        <div className="flex justify-center gap-4 border-t px-6 py-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
            {saving ? "Saving..." : isEdit ? t("accountGroup.update") : t("accountGroup.save")}
          </button>
          <Link href="/dashboard/masters/account-group" className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-semibold text-white hover:bg-red-600">
            {t("accountGroup.cancel")}
          </Link>
        </div>
      </div>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-6 right-6 flex size-10 items-center justify-center rounded-lg bg-[#004080] text-white shadow-lg hover:bg-[#003060]"><ArrowUp className="size-5" /></button>
    </div>
  );
}
