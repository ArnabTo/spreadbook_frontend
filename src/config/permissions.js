export const ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
};

export const MODULES = {
  DASHBOARD: "dashboard",
  PRODUCT: "product",
  CUSTOMER: "customer",
  SUPPLIER: "supplier",
  WAREHOUSE: "warehouse",
  SALES_QUOTATION: "sales_quotation",
  SALES_ORDER: "sales_order",
  DELIVERY_NOTE: "delivery_note",
  SALES_INVOICE: "sales_invoice",
  SALES_RETURN: "sales_return",
  ACCOUNT: "account",
  ACCOUNT_GROUP: "account_group",
  FINANCIAL_YEAR: "financial_year",
  USER: "user",
  ROLE: "role",
  PERMISSION: "permission",
  SETTINGS: "settings",
  CATEGORY: "category",
  MEASURING_UNIT: "measuring_unit",
  PRODUCT_SERVICE: "product_service",
  PREFIX: "prefix",
  SALES_INVOICE_REGISTRY: "sales_invoice_registry",
  SALES_ORDER_REGISTRY: "sales_order_registry",
  PROFORMA_INVOICE: "proforma_invoice",
};

export const ROLES = {
  SUPERADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  SALES: "sales",
  ACCOUNTS: "accounts",
  INVENTORY: "inventory",
  VIEWER: "viewer",
  ACCOUNTANT: "accountant",
};

function grant(module, view, create, update, delete_) {
  return { module, view, create, update, delete: delete_ };
}

function deny(module) {
  return { module, view: false, create: false, update: false, delete: false };
}

function fullAccess(module) {
  return { module, view: true, create: true, update: true, delete: true };
}

function viewOnly(module) {
  return { module, view: true, create: false, update: false, delete: false };
}

function viewCreate(module) {
  return { module, view: true, create: true, update: false, delete: false };
}

function viewCreateUpdate(module) {
  return { module, view: true, create: true, update: true, delete: false };
}

const ALL = Object.values(MODULES);

export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: ALL.map(fullAccess),
  [ROLES.ADMIN]: ALL.map(fullAccess),
  [ROLES.MANAGER]: [
    ...ALL.filter((m) => m !== MODULES.ROLE && m !== MODULES.PERMISSION && m !== MODULES.USER).map(viewCreateUpdate),
    viewOnly(MODULES.ROLE),
    viewOnly(MODULES.PERMISSION),
    viewOnly(MODULES.USER),
  ],
  [ROLES.SALES]: [
    viewOnly(MODULES.DASHBOARD),
    viewCreate(MODULES.SALES_QUOTATION),
    viewCreate(MODULES.SALES_ORDER),
    viewCreate(MODULES.DELIVERY_NOTE),
    viewCreate(MODULES.SALES_INVOICE),
    viewCreate(MODULES.SALES_RETURN),
    viewOnly(MODULES.SALES_INVOICE_REGISTRY),
    viewOnly(MODULES.SALES_ORDER_REGISTRY),
    viewCreate(MODULES.PROFORMA_INVOICE),
    viewOnly(MODULES.PRODUCT),
    viewOnly(MODULES.CUSTOMER),
    viewOnly(MODULES.SUPPLIER),
    viewOnly(MODULES.WAREHOUSE),
    deny(MODULES.SETTINGS),
    deny(MODULES.ROLE),
    deny(MODULES.PERMISSION),
    deny(MODULES.USER),
    viewOnly(MODULES.CATEGORY),
    deny(MODULES.MEASURING_UNIT),
    deny(MODULES.PRODUCT_SERVICE),
    deny(MODULES.PREFIX),
    deny(MODULES.ACCOUNT),
    deny(MODULES.ACCOUNT_GROUP),
    deny(MODULES.FINANCIAL_YEAR),
  ],
  [ROLES.ACCOUNTS]: [
    viewOnly(MODULES.DASHBOARD),
    viewOnly(MODULES.SALES_QUOTATION),
    viewOnly(MODULES.SALES_ORDER),
    viewOnly(MODULES.DELIVERY_NOTE),
    viewOnly(MODULES.SALES_INVOICE),
    viewOnly(MODULES.SALES_RETURN),
    viewOnly(MODULES.SALES_INVOICE_REGISTRY),
    viewOnly(MODULES.SALES_ORDER_REGISTRY),
    viewOnly(MODULES.PROFORMA_INVOICE),
    viewOnly(MODULES.PRODUCT),
    viewOnly(MODULES.CUSTOMER),
    viewOnly(MODULES.SUPPLIER),
    viewOnly(MODULES.WAREHOUSE),
    viewOnly(MODULES.CATEGORY),
    viewOnly(MODULES.MEASURING_UNIT),
    viewOnly(MODULES.PRODUCT_SERVICE),
    viewOnly(MODULES.PREFIX),
    viewCreateUpdate(MODULES.ACCOUNT),
    viewCreateUpdate(MODULES.ACCOUNT_GROUP),
    viewCreateUpdate(MODULES.FINANCIAL_YEAR),
    viewOnly(MODULES.SETTINGS),
    deny(MODULES.ROLE),
    deny(MODULES.PERMISSION),
    deny(MODULES.USER),
  ],
  [ROLES.INVENTORY]: [
    viewOnly(MODULES.DASHBOARD),
    viewCreateUpdate(MODULES.PRODUCT),
    viewCreateUpdate(MODULES.WAREHOUSE),
    viewCreateUpdate(MODULES.CATEGORY),
    viewCreateUpdate(MODULES.MEASURING_UNIT),
    viewCreateUpdate(MODULES.PRODUCT_SERVICE),
    viewOnly(MODULES.CUSTOMER),
    viewOnly(MODULES.SUPPLIER),
    deny(MODULES.SALES_QUOTATION),
    deny(MODULES.SALES_ORDER),
    deny(MODULES.DELIVERY_NOTE),
    deny(MODULES.SALES_INVOICE),
    deny(MODULES.SALES_RETURN),
    deny(MODULES.SALES_INVOICE_REGISTRY),
    deny(MODULES.SALES_ORDER_REGISTRY),
    deny(MODULES.PROFORMA_INVOICE),
    deny(MODULES.PREFIX),
    deny(MODULES.ACCOUNT),
    deny(MODULES.ACCOUNT_GROUP),
    deny(MODULES.FINANCIAL_YEAR),
    deny(MODULES.SETTINGS),
    deny(MODULES.ROLE),
    deny(MODULES.PERMISSION),
    deny(MODULES.USER),
  ],
  [ROLES.VIEWER]: [
    viewOnly(MODULES.DASHBOARD),
    viewOnly(MODULES.PRODUCT),
    viewOnly(MODULES.CUSTOMER),
    viewOnly(MODULES.SUPPLIER),
    viewOnly(MODULES.WAREHOUSE),
    viewOnly(MODULES.CATEGORY),
    viewOnly(MODULES.MEASURING_UNIT),
    viewOnly(MODULES.PRODUCT_SERVICE),
    viewOnly(MODULES.SALES_QUOTATION),
    viewOnly(MODULES.SALES_ORDER),
    viewOnly(MODULES.DELIVERY_NOTE),
    viewOnly(MODULES.SALES_INVOICE),
    viewOnly(MODULES.SALES_RETURN),
    viewOnly(MODULES.SALES_INVOICE_REGISTRY),
    viewOnly(MODULES.SALES_ORDER_REGISTRY),
    viewOnly(MODULES.PROFORMA_INVOICE),
    deny(MODULES.PREFIX),
    deny(MODULES.ACCOUNT),
    deny(MODULES.ACCOUNT_GROUP),
    deny(MODULES.FINANCIAL_YEAR),
    deny(MODULES.SETTINGS),
    deny(MODULES.ROLE),
    deny(MODULES.PERMISSION),
    deny(MODULES.USER),
  ],
  [ROLES.ACCOUNTANT]: [
    viewOnly(MODULES.DASHBOARD),
  ],
};

export function permissionsArrayToObject(arr) {
  const obj = {};
  (arr || []).forEach((entry) => {
    obj[entry.module] = {
      view: entry.view,
      create: entry.create,
      update: entry.update,
      delete: entry.delete,
    };
  });
  return obj;
}

export const DEFAULT_PERMISSIONS = { view: false, create: false, update: false, delete: false };
