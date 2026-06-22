const ROUTE_MODULE_MAP = [
  { path: "/dashboard", module: "dashboard" },
  { path: "/dashboard/masters/category", module: "category" },
  { path: "/dashboard/masters/measuring-units", module: "measuring_unit" },
  { path: "/dashboard/masters/product", module: "product" },
  { path: "/dashboard/masters/product-services", module: "product_service" },
  { path: "/dashboard/masters/warehouse", module: "warehouse" },
  { path: "/dashboard/masters/prefix", module: "prefix" },
  { path: "/dashboard/masters/customer", module: "customer" },
  { path: "/dashboard/masters/supplier", module: "supplier" },
  { path: "/dashboard/masters/account-group", module: "account_group" },
  { path: "/dashboard/masters/account", module: "account" },
  { path: "/dashboard/masters/financial-year", module: "financial_year" },
  { path: "/dashboard/sales/sales-quotation", module: "sales_quotation" },
  { path: "/dashboard/sales/sales-order", module: "sales_order" },
  { path: "/dashboard/sales/delivery-note", module: "delivery_note" },
  { path: "/dashboard/sales/sales-invoice", module: "sales_invoice" },
  { path: "/dashboard/sales/sales-invoice-registry", module: "sales_invoice_registry" },
  { path: "/dashboard/sales/sales-order-registry", module: "sales_order_registry" },
  { path: "/dashboard/sales/proforma-invoice", module: "proforma_invoice" },
  { path: "/dashboard/sales/sales-return", module: "sales_return" },
  { path: "/dashboard/purchases/purchase-order", module: "purchase_order" },
  { path: "/dashboard/settings/country", module: "settings" },
  { path: "/dashboard/settings/state-province", module: "settings" },
  { path: "/dashboard/settings/bank-account", module: "settings" },
  { path: "/dashboard/settings/currency", module: "settings" },
  { path: "/dashboard/permission", module: "permission" },
];

export function getModuleFromPath(pathname) {
  const entry = ROUTE_MODULE_MAP.find((r) => pathname === r.path || pathname.startsWith(r.path + "/"));
  return entry?.module || null;
}
