// pages/invoice/[id].jsx  OR  app/invoice/[id]/page.jsx
// Usage: open in new tab → window.open(`/invoice/${invoiceId}`, '_blank')
// Pass invoice data via query params or fetch by ID inside the component

"use client";
import React from "react";

// ─── SAMPLE DATA SHAPE ───────────────────────────────────────────────────────
// Replace with your actual fetch / props logic
const SAMPLE_INVOICE = {
  invoiceNo: "SE-102",
  invoiceNoAr: "SE-۱٠۲",

  from: {
    nameEn: "SANA ARABIA CONTRACTING COMPANY",
    nameAr: "شركة سناء العربية للمقاولات",
    addressEn: "MADRASA STREET P.O. BOX 30277, JUBAIL 31951 KINGDOM OF SAUDI ARABIA",
    addressAr: "شارع المدرسة ص.ب. صندوق بريد 30277، الجبيل 31951 المملكة العربية السعودية",
    vatEn: "312701213200003",
    vatAr: "۳۱۲٧٠۱۲۱۳۲٠٠٠٠۳",
    crEn: "1009150437",
    crAr: "۱٠٠٩۱۵٠٤۳٧",
  },

  to: {
    nameEn: "Fundamental Installation for Electric Work Co. Ltd.",
    nameAr: "شركة التركيبات الأساسية للأعمال الكهربائية المحدودة",
    addressEn: "8875 Samahat An Nafs, Al Khalidiyyah, 3397, Jeddah 23423",
    addressAr: "8875 سماحة النفس، الخالدية، 3397، جدة 23423",
    vatEn: "310059979900003",
    vatAr: "۳۱٠٠۵٩٩٧٩٩٠٠٠٠۳",
    crEn: "4030279152",
    crAr: "٤٠۳٠۲٧٩۱۵۲",
  },

  dates: {
    invoiceDate: "2025-07-14",
    supplyDate: "",
    contractNo: "25008120",
    dueDate: "20-07-2025",
    invoicePeriod: "21-05-2025 To 20-06-2025",
    projectRef: "THUWAL (CEER)",
  },

  items: [
    {
      code: "#1110",
      descriptionEn: "3G WELDER",
      descriptionAr: "لحام 3G",
      unit: "Nos",
      qty: 188,
      rate: 19.0,
      totalExclVAT: 3572.0,
      vatPct: 15.0,
      vatAmount: 535.8,
      total: 4107.8,
    },
    {
      code: "#1112",
      descriptionEn: "6G WELDER",
      descriptionAr: "آلة لحام 6G",
      unit: "Nos",
      qty: 124,
      rate: 24.0,
      totalExclVAT: 2976.0,
      vatPct: 15.0,
      vatAmount: 446.4,
      total: 3422.4,
    },
  ],

  totals: {
    subtotal: 6548.0,
    vat: 982.2,
    grandTotal: 7530.2,
    balanceDue: 7530.2,
    amountInWordsEn:
      "Seven Thousand Five Hundred Thirty Saudi Riyals and Twenty Halalas only",
    amountInWordsAr:
      "فقط سبعة آلاف و خمسمائة و ثلاثون ريالاً سعودياً و عشرون هللة لا غير.",
  },

  bank: {
    accountNameEn: "SANA ARABIA CONTRACTING COMPANY",
    accountNameAr: "شركة سناء العربية للمقاولات",
    bankNameEn: "Saudi National Bank (SNB)",
    bankNameAr: "البنك الوطني السعودي (SNB)",
    accountNo: "56900000095309",
    accountNoAr: "٥٦۹۰۰۰۰۰۰۹٥۳۰۹",
    iban: "SA1510000056900000095309",
    ibanAr: "SA۱٥۱۰۰۰۰۰٥٦۹۰۰۰۰۰۰۹٥۳۰۹",
    swiftCode: "",
  },

  preparedBy: "",
  receivedBy: "Admin.BillPrint.ReceivedBy",
  logoUrl: "/logo.png", // replace with actual logo path
  qrCodeUrl: "/qr.png", // replace with actual QR path
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function InvoicePage({ invoice = SAMPLE_INVOICE }) {
  const inv = invoice;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&family=Arial:wght@400;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #000;
          background: #fff;
        }

        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 8mm 8mm 16mm;
          background: #fff;
        }

        /* ── HEADER ── */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #000;
          padding: 6px 10px;
          margin-bottom: 0;
        }
        .header-logo { width: 80px; }
        .header-center { text-align: center; flex: 1; }
        .header-center .company-ar {
          font-family: 'Noto Sans Arabic', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #000;
          direction: rtl;
        }
        .header-center .company-en {
          font-size: 16px;
          font-weight: 700;
          color: #c00;
          letter-spacing: 0.5px;
        }
        .header-center .cr {
          font-size: 13px;
          font-weight: 700;
        }
        .header-logo-right { width: 60px; text-align: right; }

        /* ── TITLE BAR ── */
        .title-bar {
          background: #d9d9d9;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          padding: 4px;
          border: 1px solid #000;
          border-top: none;
          font-family: 'Noto Sans Arabic', sans-serif;
        }

        /* ── SECTIONS ── */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #000;
          border-top: none;
        }
        .info-cell {
          padding: 5px 8px;
          font-size: 10.5px;
          line-height: 1.6;
        }
        .info-cell.rtl {
          direction: rtl;
          text-align: right;
          font-family: 'Noto Sans Arabic', sans-serif;
          border-left: 1px solid #000;
        }
        .info-cell.ltr { border-right: 1px solid #000; }
        .info-row { display: flex; gap: 4px; }
        .info-label { font-weight: 700; white-space: nowrap; }
        .info-val { flex: 1; }
        .info-row.rtl { direction: rtl; }

        /* ── DATES ROW ── */
        .dates-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .dates-table th, .dates-table td {
          border: 1px solid #000;
          padding: 3px 5px;
          text-align: center;
        }
        .dates-table th {
          background: #d9d9d9;
          font-weight: 700;
          font-family: 'Noto Sans Arabic', sans-serif;
        }
        .dates-table .ar { direction: rtl; font-family: 'Noto Sans Arabic', sans-serif; display: block; }

        /* ── ITEMS TABLE ── */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin-top: 0;
        }
        .items-table th, .items-table td {
          border: 1px solid #000;
          padding: 3px 4px;
          text-align: center;
          vertical-align: middle;
        }
        .items-table thead th {
          background: #d9d9d9;
          font-weight: 700;
          font-family: 'Noto Sans Arabic', sans-serif;
          line-height: 1.4;
        }
        .items-table .desc-cell { text-align: right; }
        .items-table .ar-label {
          direction: rtl;
          font-family: 'Noto Sans Arabic', sans-serif;
          display: block;
          font-size: 10px;
        }

        /* ── TOTALS ── */
        .totals-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #000;
          border-top: none;
        }
        .total-cell {
          padding: 3px 8px;
          font-weight: 700;
          font-size: 10.5px;
          display: flex;
          justify-content: space-between;
        }
        .total-cell.rtl {
          direction: rtl;
          font-family: 'Noto Sans Arabic', sans-serif;
          border-left: 1px solid #000;
        }
        .total-cell.highlight { background: #f0f0f0; }

        .words-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #000;
          border-top: none;
          font-size: 10px;
          padding: 4px 8px;
        }
        .words-en { padding-right: 8px; }
        .words-ar {
          direction: rtl;
          text-align: right;
          font-family: 'Noto Sans Arabic', sans-serif;
          border-left: 1px solid #000;
          padding-left: 8px;
        }

        /* ── BANK ── */
        .bank-title {
          text-align: center;
          font-weight: 700;
          font-size: 11px;
          border: 1px solid #000;
          border-top: none;
          padding: 3px;
          background: #d9d9d9;
        }
        .bank-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .bank-table td {
          border: 1px solid #000;
          border-top: none;
          padding: 3px 8px;
        }
        .bank-table .label-ar {
          direction: rtl;
          font-family: 'Noto Sans Arabic', sans-serif;
          text-align: right;
          font-weight: 700;
          width: 80px;
        }
        .bank-table .val-ar {
          direction: rtl;
          font-family: 'Noto Sans Arabic', sans-serif;
          text-align: right;
        }
        .bank-table .label-en { font-weight: 700; width: 90px; }

        /* ── FOOTER SIGNATURE ── */
        .sig-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border: 1px solid #000;
          border-top: none;
          min-height: 80px;
          font-size: 10px;
        }
        .sig-cell {
          padding: 4px 8px;
          border-right: 1px solid #000;
        }
        .sig-cell:last-child { border-right: none; }
        .sig-cell.center { display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
        .sig-cell .ar { direction: rtl; font-family: 'Noto Sans Arabic', sans-serif; }
        .sig-bottom { margin-top: 40px; font-size: 10px; }

        /* ── FOOTER ADDRESS ── */
        .footer-addr {
          text-align: center;
          margin-top: 12px;
          font-size: 10px;
          line-height: 1.8;
          border-top: 2px solid #c00;
          padding-top: 6px;
          color: #c00;
        }
        .footer-addr .ar {
          direction: rtl;
          font-family: 'Noto Sans Arabic', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #000;
        }
        .footer-addr .en { color: #000; }

        @media print {
          .page { margin: 0; padding: 8mm; }
        }
      `}</style>

      <div className="page">

        {/* ── HEADER ── */}
        <div className="header">
          <img src={inv.logoUrl} alt="Logo" className="header-logo" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="header-center">
            <div className="company-ar">شركة سناء العربية للمقاولات</div>
            <div className="company-en">SANA ARABIA CONTRACTING COMPANY</div>
            <div className="cr">C.R : 1009150437</div>
          </div>
          <div className="header-logo-right">
            {/* second logo badge if needed */}
          </div>
        </div>

        {/* ── TITLE ── */}
        <div className="title-bar">
          تقدير المبيعات / SALES ESTIMATION
        </div>

        {/* ── INVOICE NO ── */}
        <div className="info-grid" style={{ borderTop: "none" }}>
          <div className="info-cell ltr">
            <div className="info-row">
              <span className="info-label">Invoice No :</span>
              <span className="info-val">{inv.invoiceNo}</span>
            </div>
          </div>
          <div className="info-cell rtl">
            <div className="info-row rtl">
              <span className="info-label">رقم الفاتوره :</span>
              <span className="info-val">{inv.invoiceNoAr}</span>
            </div>
          </div>
        </div>

        {/* ── FROM ── */}
        <div className="info-grid" style={{ borderTop: "none" }}>
          <div className="info-cell ltr">
            <div className="info-row"><span className="info-label">From&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span><span className="info-val">{inv.from.nameEn}</span></div>
            <div className="info-row"><span className="info-label">Address :</span><span className="info-val">{inv.from.addressEn}</span></div>
            <div className="info-row"><span className="info-label">VAT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span><span className="info-val">{inv.from.vatEn}</span></div>
            <div className="info-row"><span className="info-label">CR No&nbsp;&nbsp;:</span><span className="info-val">{inv.from.crEn}</span></div>
          </div>
          <div className="info-cell rtl">
            <div className="info-row rtl"><span className="info-label">من عند :</span><span className="info-val">{inv.from.nameAr}</span></div>
            <div className="info-row rtl"><span className="info-label">عنوان :</span><span className="info-val">{inv.from.addressAr}</span></div>
            <div className="info-row rtl"><span className="info-label">الرقم الضريبي:</span><span className="info-val">{inv.from.vatAr}</span></div>
            <div className="info-row rtl"><span className="info-label">السجل التجاري :</span><span className="info-val">{inv.from.crAr}</span></div>
          </div>
        </div>

        {/* ── TO ── */}
        <div className="info-grid" style={{ borderTop: "none" }}>
          <div className="info-cell ltr">
            <div className="info-row"><span className="info-label">To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span><span className="info-val">{inv.to.nameEn}</span></div>
            <div className="info-row"><span className="info-label">Address :</span><span className="info-val">{inv.to.addressEn}</span></div>
            <div className="info-row"><span className="info-label">VAT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span><span className="info-val">{inv.to.vatEn}</span></div>
            <div className="info-row"><span className="info-label">CR No&nbsp;&nbsp;:</span><span className="info-val">{inv.to.crEn}</span></div>
          </div>
          <div className="info-cell rtl">
            <div className="info-row rtl"><span className="info-label">إلى :</span><span className="info-val">{inv.to.nameAr}</span></div>
            <div className="info-row rtl"><span className="info-label">عنوان :</span><span className="info-val">{inv.to.addressAr}</span></div>
            <div className="info-row rtl"><span className="info-label">الرقم الضريبي:</span><span className="info-val">{inv.to.vatAr}</span></div>
            <div className="info-row rtl"><span className="info-label">السجل التجاري :</span><span className="info-val">{inv.to.crAr}</span></div>
          </div>
        </div>

        {/* ── DATES ── */}
        <table className="dates-table">
          <thead>
            <tr>
              <th><span className="ar">تاريخ الفاتورة</span>Invoice Date</th>
              <th><span className="ar">تاريخ التوريد</span>Supply Date</th>
              <th><span className="ar">رقم التعاقد</span>Contract / PO No</th>
              <th><span className="ar">تاريخ الاستحقاق</span>DueDate</th>
              <th><span className="ar">فترة الفاتورة</span>Invoice Period</th>
              <th><span className="ar">رقم المشروع</span>Project / Reference No</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{inv.dates.invoiceDate}</td>
              <td>{inv.dates.supplyDate}</td>
              <td>{inv.dates.contractNo}</td>
              <td>{inv.dates.dueDate}</td>
              <td>{inv.dates.invoicePeriod}</td>
              <td>{inv.dates.projectRef}</td>
            </tr>
          </tbody>
        </table>

        {/* ── ITEMS TABLE ── */}
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: 24 }}>#</th>
              <th><span className="ar-label">الشفرة</span>Code</th>
              <th style={{ minWidth: 120 }}><span className="ar-label">وصف</span>Description</th>
              <th><span className="ar-label">إسم الوحدة</span>Unit</th>
              <th><span className="ar-label">كمية</span>Qty</th>
              <th><span className="ar-label">معدل</span>Rate</th>
              <th><span className="ar-label">الإجمالي باستثناء الضرائب</span>Total Price excl. VAT</th>
              <th><span className="ar-label">ضريبة القيمة المضافة Vat %</span>Vat %</th>
              <th><span className="ar-label">ضريبة القيمة المضافة</span>VAT Amount</th>
              <th><span className="ar-label">المجموع ر.س</span>Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.code}</td>
                <td className="desc-cell">
                  {item.descriptionEn}
                  <span className="ar-label">{item.descriptionAr}</span>
                </td>
                <td>{item.unit}</td>
                <td>{item.qty}</td>
                <td>{fmt(item.rate)}</td>
                <td>{fmt(item.totalExclVAT)}</td>
                <td>{fmt(item.vatPct)}</td>
                <td>{fmt(item.vatAmount)}</td>
                <td>{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── SUBTOTAL / VAT ROW ── */}
        <div className="totals-row">
          <div className="total-cell">
            <span>Total / المجموع ر.س :</span>
            <span>{fmt(inv.totals.subtotal)} SAR</span>
          </div>
          <div className="total-cell rtl">
            <span>المضافة القيمة ض / 15% VAT :</span>
            <span>SAR {fmt(inv.totals.vat)}</span>
          </div>
        </div>

        {/* ── GRAND TOTAL ROW ── */}
        <div className="totals-row" style={{ borderTop: "none" }}>
          <div className="total-cell highlight">
            <span>Grand Total / المبلغ الإجمالي :</span>
            <span>{fmt(inv.totals.grandTotal)} SAR</span>
          </div>
          <div className="total-cell rtl highlight">
            <span>الرصيد المستحق / Balance Due :</span>
            <span>SAR {fmt(inv.totals.balanceDue)}</span>
          </div>
        </div>

        {/* ── AMOUNT IN WORDS ── */}
        <div className="words-row">
          <div className="words-en">
            <strong>Amount In Words:</strong> {inv.totals.amountInWordsEn}
          </div>
          <div className="words-ar">
            <strong>كمية في الكلمات:</strong> {inv.totals.amountInWordsAr}
          </div>
        </div>

        {/* ── BANK DETAILS ── */}
        <div className="bank-title">BANK DETAILS</div>
        <table className="bank-table">
          <tbody>
            <tr>
              <td className="label-ar">أسم الحساب</td>
              <td className="val-ar">{inv.bank.accountNameAr}</td>
              <td>{inv.bank.accountNameEn}</td>
              <td className="label-en">Account Name</td>
            </tr>
            <tr>
              <td className="label-ar">اسم البنك</td>
              <td className="val-ar">{inv.bank.bankNameAr}</td>
              <td>{inv.bank.bankNameEn}</td>
              <td className="label-en">Bank Name</td>
            </tr>
            <tr>
              <td className="label-ar">رقم البنك</td>
              <td className="val-ar">{inv.bank.accountNoAr}</td>
              <td>{inv.bank.accountNo}</td>
              <td className="label-en">Account No</td>
            </tr>
            <tr>
              <td className="label-ar">أنا أحظر</td>
              <td className="val-ar">{inv.bank.ibanAr}</td>
              <td>{inv.bank.iban}</td>
              <td className="label-en">IBAN</td>
            </tr>
            <tr>
              <td className="label-ar">رمز السرعة</td>
              <td className="val-ar"></td>
              <td>{inv.bank.swiftCode}</td>
              <td className="label-en">Swift Code</td>
            </tr>
          </tbody>
        </table>

        {/* ── SIGNATURE ROW ── */}
        <div className="sig-row">
          <div className="sig-cell">
            <div><span className="ar">أعدت بواسطة /</span> Prepared By</div>
            <div>{inv.preparedBy}</div>
            <div className="sig-bottom">Signature/Stamp</div>
          </div>
          <div className="sig-cell center">
            <div style={{ fontWeight: 700 }}>QR Code</div>
            {inv.qrCodeUrl && (
              <img
                src={inv.qrCodeUrl}
                alt="QR Code"
                style={{ width: 80, height: 80, margin: "4px auto" }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="sig-cell" style={{ textAlign: "right", direction: "rtl" }}>
            <div>Invoice Received By / {inv.receivedBy}</div>
            <div className="sig-bottom">Signature/Stamp</div>
          </div>
        </div>

        {/* ── FOOTER ADDRESS ── */}
        <div className="footer-addr">
          <div className="ar">شارع المدرسة ص.ب 30277- الجبيل 31951 - المملكة العربية السعودية</div>
          <div className="en">
            C.R: 1009150437, Mob-0545732691, 0558304906, Email: info@sanaarabia.com
          </div>
          <div className="en">Madrsha Street P.O.Box 30277 Jubail 31951 Kingdom of Saudi Arabia</div>
        </div>

      </div>
    </>
  );
}
