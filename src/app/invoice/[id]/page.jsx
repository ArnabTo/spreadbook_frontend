"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer, Loader2, AlertCircle } from "lucide-react";
import InvoicePage from "./InvoicePage";
import { API_BASE_URL } from "@/config/api";

const TOKEN_KEY = "spreadbook_access_token";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

const COMPANY = {
  nameEn: "SANA ARABIA CONTRACTING COMPANY",
  nameAr: "شركة سناء العربية للمقاولات",
  addressEn: "MADRASA STREET P.O. BOX 30277, JUBAIL 31951 KINGDOM OF SAUDI ARABIA",
  addressAr: "شارع المدرسة ص.ب. صندوق بريد 30277، الجبيل 31951 المملكة العربية السعودية",
  vatEn: "312701213200003",
  vatAr: "۳۱۲٧٠۱۲۱۳۲٠٠٠٠۳",
  crEn: "1009150437",
  crAr: "۱٠٠٩۱۵٠٤۳٧",
};

function mapInvoiceData(inv) {
  if (!inv) return null;
  const items = (inv.items || []).map((item) => ({
    code: item.product_name || `#${item.product || ""}`,
    descriptionEn: item.product_name || "",
    descriptionAr: "",
    unit: item.unit_name || "",
    qty: item.qty || 0,
    rate: item.rate || 0,
    totalExclVAT: item.product_total || item.amount || 0,
    vatPct: item.tax_percent || 0,
    vatAmount: item.tax_amount || 0,
    total: item.total || 0,
  }));
  return {
    invoiceNo: inv.bill_number || "",
    invoiceNoAr: inv.bill_number || "",
    from: { ...COMPANY },
    to: {
      nameEn: inv.customer_name || "",
      nameAr: "",
      addressEn: "",
      addressAr: "",
      vatEn: "",
      vatAr: "",
      crEn: "",
      crAr: "",
    },
    dates: {
      invoiceDate: inv.date || "",
      supplyDate: inv.supply_date || "",
      contractNo: inv.po_ref || "",
      dueDate: inv.due_date || "",
      invoicePeriod: inv.invoice_period || "",
      projectRef: inv.project_ref_no || "",
    },
    items,
    totals: {
      subtotal: inv.total || 0,
      vat: inv.tax_total || 0,
      grandTotal: inv.grand_total || 0,
      balanceDue: inv.grand_total || 0,
      amountInWordsEn: "",
      amountInWordsAr: "",
    },
    bank: {
      accountNameEn: COMPANY.nameEn,
      accountNameAr: COMPANY.nameAr,
      bankNameEn: inv.bank_account_name || "",
      bankNameAr: "",
      accountNo: "",
      accountNoAr: "",
      iban: "",
      ibanAr: "",
      swiftCode: "",
    },
    preparedBy: inv.sales_person_name || "",
    receivedBy: "Admin.BillPrint.ReceivedBy",
    logoUrl: "/logo.png",
    qrCodeUrl: "/qr.png",
  };
}

export default function InvoiceViewPage() {
  const params = useParams();
  const id = params?.id;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchInvoice() {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/proforma-invoices/${id}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to fetch invoice (${res.status})`);
        const data = await res.json();
        if (!cancelled) setInvoice(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInvoice();
    return () => { cancelled = true; };
  }, [id]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="size-8 animate-spin" />
          <span className="text-sm font-medium">Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="size-8" />
          <span className="text-sm font-medium">Failed to load invoice</span>
          <span className="text-xs text-gray-400">{error}</span>
          <button onClick={handleBack} className="mt-2 rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const mapped = mapInvoiceData(invoice);

  return (
    <>
      <style>{`
        .no-print { display: flex; }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-2 shadow-sm">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>Proforma Invoice</span>
          {mapped?.invoiceNo && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900">{mapped.invoiceNo}</span>
            </>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          <Printer className="size-4" />
          Print / Save PDF
        </button>
      </div>

      <InvoicePage invoice={mapped} />
    </>
  );
}
