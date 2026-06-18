import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    FileText,
    Settings,
    BarChart3,
    CreditCard,
    Warehouse,
    Building2,
    Truck,
    Receipt,
    FolderTree,
    Globe,
    Shield,
    UserCircle,
    Activity,
    BookOpen,
    Calendar,
    MessageSquare,
} from "lucide-react";

const ICONS = {
    dashboard: LayoutDashboard,
    shopping: ShoppingCart,
    product: Package,
    users: Users,
    invoice: FileText,
    settings: Settings,
    analytics: BarChart3,
    payment: CreditCard,
    inventory: Warehouse,
    building: Building2,
    truck: Truck,
    receipt: Receipt,
    category: FolderTree,
    globe: Globe,
    shield: Shield,
    profile: UserCircle,
    activity: Activity,
    book: BookOpen,
    calendar: Calendar,
    chat: MessageSquare,
};

const icon = (name) => ICONS[name] || ICONS.dashboard;

function module(name) {
    return name.toLowerCase().replace(/\s+/g, "_");
}

export const getNavData = () => [
    {
        subheader: "Menu",
        items: [
            {
                title: "Dashboard",
                path: "/dashboard",
                icon: icon("dashboard"),
                module: "dashboard",
            },
        ],
    },
    {
        items: [
            {
                title: "Masters",
                path: "/dashboard/masters",
                icon: icon("category"),
                module: "masters",
                children: [
                    { title: "Category", path: "/dashboard/masters/category", module: module("Category") },
                    { title: "Measuring Units", path: "/dashboard/masters/measuring-units", module: module("Measuring Units") },
                    { title: "Product", path: "/dashboard/masters/product", module: "product" },
                    { title: "Product Service", path: "/dashboard/masters/product-services", module: module("Product Service") },
                    { title: "Warehouse", path: "/dashboard/masters/warehouse", module: "warehouse" },
                    { title: "Prefix", path: "/dashboard/masters/prefix", module: "prefix" },
                    { title: "Customer", path: "/dashboard/masters/customer", module: "customer" },
                    { title: "Supplier", path: "/dashboard/masters/supplier", module: "supplier" },
                    { title: "Accounts Group", path: "/dashboard/masters/account-group", module: module("Account Group") },
                    { title: "Accounts", path: "/dashboard/masters/account", module: "account" },
                    { title: "Financial Year", path: "/dashboard/masters/financial-year", module: module("Financial Year") },
                ],
            },
        ],
    },
    {
        items: [
            {
                title: "Sales",
                path: "/dashboard/sales",
                icon: icon("shopping"),
                module: "sales",
                children: [
                    { title: "Sales Quotation", path: "/dashboard/sales/sales-quotation", module: module("Sales Quotation") },
                    { title: "Sales Order", path: "/dashboard/sales/sales-order", module: module("Sales Order") },
                    { title: "Delivery Note", path: "/dashboard/sales/delivery-note", module: module("Delivery Note") },
                    { title: "Sales Invoice", path: "/dashboard/sales/sales-invoice", module: module("Sales Invoice") },
                    { title: "Sales Invoice Registry", path: "/dashboard/sales/sales-invoice-registry", module: module("Sales Invoice Registry") },
                    { title: "Sales Order Registry", path: "/dashboard/sales/sales-order-registry", module: module("Sales Order Registry") },
                    { title: "Proforma Invoice", path: "/dashboard/sales/proforma-invoice", module: module("Proforma Invoice") },
                    { title: "Sales Return", path: "/dashboard/sales/sales-return", module: module("Sales Return") },
                ],
            },
        ],
    },
    {
        items: [
            {
                title: "Settings",
                path: "/dashboard/settings",
                icon: icon("settings"),
                module: "settings",
                children: [
                    { title: "Country", path: "/dashboard/settings/country", module: "settings" },
                    { title: "State/Province", path: "/dashboard/settings/state-province", module: "settings" },
                    { title: "Bank Account", path: "/dashboard/settings/bank-account", module: "settings" },
                    { title: "Currency", path: "/dashboard/settings/currency", module: "settings" },
                ],
            },
        ],
    },
    {
        items: [
            {
                title: "Permissions",
                path: "/dashboard/permission",
                icon: icon("shield"),
                module: "permission",
            },
        ],
    },
];

export const navData = getNavData();
