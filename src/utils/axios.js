import axios from "axios";
import { API_BASE_URL } from "@/config/api";

const TOKEN_KEY = "spreadbook_access_token";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

const axiosInstance = axios.create({ baseURL: API_BASE_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || error.message || "Something went wrong!"
    )
);

export default axiosInstance;

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosInstance.get(url, { ...config });
  return res.data;
};

export const endpoints = {
  // Auth
  auth: {
    login: "/api/auth/megashop-login/",
    profile: "/api/auth/profile/",
    refresh: "/api/auth/token/refresh/",
  },

  // Masters
  category: "/api/product/category/",
  units: "/api/product/units/",
  products: "/api/product/list/",
  productPost: "/api/product/post/",
  productTypes: "/api/product/types/",
  brands: "/api/product/brands/",
  genericNames: "/api/product/generic-names/",

  // Inventory
  inventoryItems: "/api/inventory/items/",
  inventoryCategories: "/api/inventory/categories/",
  inventoryMovements: "/api/inventory/movements/",
  stockSummary: "/api/inventory/stock-summary-items/",
  productStock: (id) => `/api/inventory/product-stock/${id}/`,

  // Company / Branch
  companies: "/api/companies/",
  branches: "/api/branches/",
  warehouses: "/api/warehouses/",
  countries: "/api/countries/",
  states: "/api/states/",
  accessibleBranches: "/api/user/accessible-branches/",
  companyStructure: (id) => `/api/companies/${id}/structure/`,

  // POS / Sales
  posSalesSummary: "/api/pos/sales-summary/",
  posCatalog: "/api/pos/catalog/",
  posProductIndex: "/api/pos/product-index/",

  // Purchases
  purchases: "/api/purchase/orders/",

  // Customers / Suppliers
  customers: "/api/customers/",
  suppliers: "/api/suppliers/",

  // Product Services
  productServices: "/api/product-services/",

  // Account Groups
  accounts: "/api/accounts/",
  accountGroups: "/api/account-groups/",
  accountGroupParents: "/api/account-group-parents/",
  accountGroupSeed: "/api/account-groups/seed/",

  // Financial Years
  financialYears: "/api/financial-years/",

  // Prefixes
  prefixes: "/api/prefixes/",

  // Orders
  orders: "/api/order/",

  // Sales Quotation
  salesQuotations: "/api/sales-quotations/",
  salesQuotationOptions: "/api/sales-quotations/options/",
  salesQuotationCurrencies: "/api/sales-quotations/currencies/",
  salesQuotationBankAccounts: "/api/sales-quotations/bank-accounts/",

  // Sales Order
  salesOrders: "/api/sales-orders/",
  salesOrderOptions: "/api/sales-orders/options/",

  // Delivery Note
  deliveryNotes: "/api/delivery-notes/",
  deliveryNoteOptions: "/api/delivery-notes/options/",

  // Dashboard
  dashboard: {
    salesSummary: "/api/pos/sales-summary/",
  },
};
