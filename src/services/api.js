import axiosInstance, { fetcher, endpoints } from "../utils/axios";
import useSWR, { mutate } from "swr";

export const swrFetcher = (url) => fetcher(url);

// ── Category API ──

export const fetchCategories = (params = {}) =>
  fetcher([endpoints.category, { params }]);

export const createCategory = (data) =>
  axiosInstance.post(endpoints.category, data).then((r) => r.data);

export const updateCategory = (id, data) =>
  axiosInstance.patch(`${endpoints.category}${id}/`, data).then((r) => r.data);

export const deleteCategory = (id) =>
  axiosInstance.delete(`${endpoints.category}${id}/`).then((r) => r.data);

// SWR key builder for categories list (used for mutate)
export const categoriesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.category}?${qs}` : endpoints.category;
};

// ── Measuring Unit API ──

export const fetchUnits = (params = {}) =>
  fetcher([endpoints.units, { params }]);

export const createUnit = (data) =>
  axiosInstance.post(endpoints.units, data).then((r) => r.data);

export const updateUnit = (id, data) =>
  axiosInstance.patch(`${endpoints.units}${id}/`, data).then((r) => r.data);

export const deleteUnit = (id) =>
  axiosInstance.delete(`${endpoints.units}${id}/`).then((r) => r.data);

export const unitsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.units}?${qs}` : endpoints.units;
};

// ── Product API ──

export const fetchProducts = (params = {}) =>
  fetcher([endpoints.products, { params }]);

export const createProduct = (data) =>
  axiosInstance.post(endpoints.productPost, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateProduct = (id, data) =>
  axiosInstance.patch(`${endpoints.products}${id}/`, data).then((r) => r.data);

export const deleteProduct = (id) =>
  axiosInstance.delete(`${endpoints.products}${id}/`).then((r) => r.data);

export const productsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.products}?${qs}` : endpoints.products;
};

// ── Product Services API ──

export const fetchProductServices = (params = {}) =>
  fetcher([endpoints.productServices, { params }]);

export const createProductService = (data) =>
  axiosInstance.post(endpoints.productServices, data).then((r) => r.data);

export const updateProductService = (id, data) =>
  axiosInstance.patch(`${endpoints.productServices}${id}/`, data).then((r) => r.data);

export const deleteProductService = (id) =>
  axiosInstance.delete(`${endpoints.productServices}${id}/`).then((r) => r.data);

export const productServicesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.productServices}?${qs}` : endpoints.productServices;
};

// ── Dashboard API ──

export const fetchDashboardSalesSummary = (params = {}) =>
  fetcher([endpoints.dashboard.salesSummary, { params }]);

// ── Branch / Company API ──

export const fetchAccessibleBranches = () =>
  fetcher(endpoints.accessibleBranches);

export const fetchCompanyStructure = (companyId) =>
  fetcher(endpoints.companyStructure(companyId));

// ── Warehouse API ──

export const fetchWarehouses = (params = {}) =>
  fetcher([endpoints.warehouses, { params }]);

export const createWarehouse = (data) =>
  axiosInstance.post(endpoints.warehouses, data).then((r) => r.data);

export const updateWarehouse = (id, data) =>
  axiosInstance.patch(`${endpoints.warehouses}${id}/`, data).then((r) => r.data);

export const deleteWarehouse = (id) =>
  axiosInstance.delete(`${endpoints.warehouses}${id}/`).then((r) => r.data);

export const warehousesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.warehouses}?${qs}` : endpoints.warehouses;
};

// ── Country / State API ──

export const fetchCountries = (params = {}) =>
  fetcher([endpoints.countries, { params }]);

export const createCountry = (data) =>
  axiosInstance.post(endpoints.countries, data).then((r) => r.data);

export const updateCountry = (id, data) =>
  axiosInstance.patch(`${endpoints.countries}${id}/`, data).then((r) => r.data);

export const deleteCountry = (id) =>
  axiosInstance.delete(`${endpoints.countries}${id}/`).then((r) => r.data);

export const countriesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.countries}?${qs}` : endpoints.countries;
};

export const fetchStates = (params = {}) =>
  fetcher([endpoints.states, { params }]);

export const createState = (data) =>
  axiosInstance.post(endpoints.states, data).then((r) => r.data);

export const updateState = (id, data) =>
  axiosInstance.patch(`${endpoints.states}${id}/`, data).then((r) => r.data);

export const deleteState = (id) =>
  axiosInstance.delete(`${endpoints.states}${id}/`).then((r) => r.data);

export const statesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.states}?${qs}` : endpoints.states;
};

// ── Bank Account API ──

export const fetchBankAccounts = (params = {}) =>
  fetcher([endpoints.bankAccounts, { params }]);

export const createBankAccount = (data) =>
  axiosInstance.post(endpoints.bankAccounts, data).then((r) => r.data);

export const updateBankAccount = (id, data) =>
  axiosInstance.patch(`${endpoints.bankAccounts}${id}/`, data).then((r) => r.data);

export const deleteBankAccount = (id) =>
  axiosInstance.delete(`${endpoints.bankAccounts}${id}/`).then((r) => r.data);

export const bankAccountsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.bankAccounts}?${qs}` : endpoints.bankAccounts;
};

// ── Supplier API ──

export const fetchSuppliers = (params = {}) =>
  fetcher([endpoints.suppliers, { params }]);

export const createSupplier = (data) =>
  axiosInstance.post(endpoints.suppliers, data).then((r) => r.data);

export const updateSupplier = (id, data) =>
  axiosInstance.patch(`${endpoints.suppliers}${id}/`, data).then((r) => r.data);

export const deleteSupplier = (id) =>
  axiosInstance.delete(`${endpoints.suppliers}${id}/`).then((r) => r.data);

export const suppliersKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.suppliers}?${qs}` : endpoints.suppliers;
};

// ── Customer API ──

export const fetchCustomers = (params = {}) =>
  fetcher([endpoints.customers, { params }]);

export const createCustomer = (data) =>
  axiosInstance.post(endpoints.customers, data).then((r) => r.data);

export const updateCustomer = (id, data) =>
  axiosInstance.patch(`${endpoints.customers}${id}/`, data).then((r) => r.data);

export const deleteCustomer = (id) =>
  axiosInstance.delete(`${endpoints.customers}${id}/`).then((r) => r.data);

export const uploadCustomerAttachment = (id, formData) =>
  axiosInstance.post(`${endpoints.customers}${id}/attachments/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteCustomerAttachment = (customerId, attachmentId) =>
  axiosInstance.delete(`${endpoints.customers}${customerId}/attachments/${attachmentId}/`).then((r) => r.data);

export const customersKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.customers}?${qs}` : endpoints.customers;
};

// ── Account API ──

export const fetchAccounts = (params = {}) =>
  fetcher([endpoints.accounts, { params }]);

export const createAccount = (data) =>
  axiosInstance.post(endpoints.accounts, data).then((r) => r.data);

export const updateAccount = (id, data) =>
  axiosInstance.patch(`${endpoints.accounts}${id}/`, data).then((r) => r.data);

export const deleteAccount = (id) =>
  axiosInstance.delete(`${endpoints.accounts}${id}/`).then((r) => r.data);

export const accountsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.accounts}?${qs}` : endpoints.accounts;
};

// ── Auth ──

export const loginUser = (username, password) =>
  axiosInstance.post(endpoints.auth.login, { username, password }).then((r) => r.data);

export const fetchProfile = () => fetcher(endpoints.auth.profile);

// ── Account Groups API ──

export const fetchAccountGroups = (params = {}) =>
  fetcher([endpoints.accountGroups, { params }]);

export const createAccountGroup = (data) =>
  axiosInstance.post(endpoints.accountGroups, data).then((r) => r.data);

export const updateAccountGroup = (id, data) =>
  axiosInstance.patch(`${endpoints.accountGroups}${id}/`, data).then((r) => r.data);

export const deleteAccountGroup = (id) =>
  axiosInstance.delete(`${endpoints.accountGroups}${id}/`).then((r) => r.data);

export const accountGroupsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.accountGroups}?${qs}` : endpoints.accountGroups;
};

// ── Account Group Parents API ──

export const fetchAccountGroupParents = (params = {}) =>
  fetcher([endpoints.accountGroupParents, { params }]);

export const accountGroupParentsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.accountGroupParents}?${qs}` : endpoints.accountGroupParents;
};

// ── Account Group Seed API ──

export const seedAccountGroupParents = () =>
  axiosInstance.post(endpoints.accountGroupSeed).then((r) => r.data);

// ── Financial Years API ──

export const fetchFinancialYears = (params = {}) =>
  fetcher([endpoints.financialYears, { params }]);

export const createFinancialYear = (data) =>
  axiosInstance.post(endpoints.financialYears, data).then((r) => r.data);

export const updateFinancialYear = (id, data) =>
  axiosInstance.patch(`${endpoints.financialYears}${id}/`, data).then((r) => r.data);

export const deleteFinancialYear = (id) =>
  axiosInstance.delete(`${endpoints.financialYears}${id}/`).then((r) => r.data);

export const financialYearsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.financialYears}?${qs}` : endpoints.financialYears;
};

// ── Prefix API ──

export const fetchPrefixes = (params = {}) =>
  fetcher([endpoints.prefixes, { params }]);

export const createPrefix = (data) =>
  axiosInstance.post(endpoints.prefixes, data).then((r) => r.data);

export const updatePrefix = (id, data) =>
  axiosInstance.patch(`${endpoints.prefixes}${id}/`, data).then((r) => r.data);

export const deletePrefix = (id) =>
  axiosInstance.delete(`${endpoints.prefixes}${id}/`).then((r) => r.data);

export const prefixesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.prefixes}?${qs}` : endpoints.prefixes;
};

// ── Sales Quotation API ──

export const fetchSalesQuotations = (params = {}) =>
  fetcher([endpoints.salesQuotations, { params }]);

export const fetchSalesQuotation = (id) =>
  fetcher(`${endpoints.salesQuotations}${id}/`);

export const fetchSalesQuotationOptions = () =>
  fetcher(endpoints.salesQuotationOptions);

export const createSalesQuotation = (formData) =>
  axiosInstance.post(endpoints.salesQuotations, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateSalesQuotation = (id, formData) =>
  axiosInstance.patch(`${endpoints.salesQuotations}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteSalesQuotation = (id) =>
  axiosInstance.delete(`${endpoints.salesQuotations}${id}/`).then((r) => r.data);

export const salesQuotationsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.salesQuotations}?${qs}` : endpoints.salesQuotations;
};

// Currency master
export const fetchSalesQuotationCurrencies = (params = {}) =>
  fetcher([endpoints.salesQuotationCurrencies, { params }]);

export const createSalesQuotationCurrency = (data) =>
  axiosInstance.post(endpoints.salesQuotationCurrencies, data).then((r) => r.data);

export const updateSalesQuotationCurrency = (id, data) =>
  axiosInstance.patch(`${endpoints.salesQuotationCurrencies}${id}/`, data).then((r) => r.data);

export const deleteSalesQuotationCurrency = (id) =>
  axiosInstance.delete(`${endpoints.salesQuotationCurrencies}${id}/`).then((r) => r.data);

// ── Sales Order API ──

export const fetchSalesOrders = (params = {}) =>
  fetcher([endpoints.salesOrders, { params }]);

export const fetchSalesOrder = (id) =>
  fetcher(`${endpoints.salesOrders}${id}/`);

export const fetchSalesOrderOptions = () =>
  fetcher(endpoints.salesOrderOptions);

export const createSalesOrder = (formData) =>
  axiosInstance.post(endpoints.salesOrders, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateSalesOrder = (id, formData) =>
  axiosInstance.patch(`${endpoints.salesOrders}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteSalesOrder = (id) =>
  axiosInstance.delete(`${endpoints.salesOrders}${id}/`).then((r) => r.data);

// ── Delivery Note API ──

export const fetchDeliveryNotes = (params = {}) =>
  fetcher([endpoints.deliveryNotes, { params }]);

export const fetchDeliveryNote = (id) =>
  fetcher(`${endpoints.deliveryNotes}${id}/`);

export const fetchDeliveryNoteOptions = () =>
  fetcher(endpoints.deliveryNoteOptions);

export const createDeliveryNote = (formData) =>
  axiosInstance.post(endpoints.deliveryNotes, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateDeliveryNote = (id, formData) =>
  axiosInstance.patch(`${endpoints.deliveryNotes}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteDeliveryNote = (id) =>
  axiosInstance.delete(`${endpoints.deliveryNotes}${id}/`).then((r) => r.data);

export const deliveryNotesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.deliveryNotes}?${qs}` : endpoints.deliveryNotes;
};

// ── Sales Invoice API ──

export const fetchSalesInvoices = (params = {}) =>
  fetcher([endpoints.salesInvoices, { params }]);

export const fetchSalesInvoice = (id) =>
  fetcher(`${endpoints.salesInvoices}${id}/`);

export const fetchSalesInvoiceOptions = () =>
  fetcher(endpoints.salesInvoiceOptions);

export const createSalesInvoice = (formData) =>
  axiosInstance.post(endpoints.salesInvoices, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateSalesInvoice = (id, formData) =>
  axiosInstance.patch(`${endpoints.salesInvoices}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteSalesInvoice = (id) =>
  axiosInstance.delete(`${endpoints.salesInvoices}${id}/`).then((r) => r.data);

export const salesInvoicesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.salesInvoices}?${qs}` : endpoints.salesInvoices;
};

// ── Sales Invoice Registry API ──

export const fetchSalesInvoiceRegistries = (params = {}) =>
  fetcher([endpoints.salesInvoiceRegistry, { params }]);

export const exportSalesInvoiceRegistry = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  const url = qs ? `${endpoints.salesInvoiceRegistryExport}?${qs}` : endpoints.salesInvoiceRegistryExport;
  return axiosInstance.get(url, { responseType: "blob" }).then((r) => r.data);
};

export const salesInvoiceRegistryKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.salesInvoiceRegistry}?${qs}` : endpoints.salesInvoiceRegistry;
};

export const fetchProformaInvoiceOptions = () =>
  fetcher(endpoints.proformaInvoiceOptions);

export const createProformaInvoice = (formData) =>
  axiosInstance.post(endpoints.proformaInvoices, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateProformaInvoice = (id, formData) =>
  axiosInstance.patch(`${endpoints.proformaInvoices}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteProformaInvoice = (id) =>
  axiosInstance.delete(`${endpoints.proformaInvoices}${id}/`).then((r) => r.data);

export const proformaInvoicesKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.proformaInvoices}?${qs}` : endpoints.proformaInvoices;
};

export const fetchSalesReturnOptions = () =>
  fetcher(endpoints.salesReturnOptions);

export const createSalesReturn = (formData) =>
  axiosInstance.post(endpoints.salesReturns, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateSalesReturn = (id, formData) =>
  axiosInstance.patch(`${endpoints.salesReturns}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteSalesReturn = (id) =>
  axiosInstance.delete(`${endpoints.salesReturns}${id}/`).then((r) => r.data);

export const salesReturnsKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.salesReturns}?${qs}` : endpoints.salesReturns;
};

export const salesOrdersKey = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") searchParams.set(k, v);
  });
  const qs = searchParams.toString();
  return qs ? `${endpoints.salesOrders}?${qs}` : endpoints.salesOrders;
};

