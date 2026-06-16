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

export const getNavData = (userPermissions = []) => [
    {
        subheader: "Menu",
        items: [
            {
                title: "Dashboard",
                path: "/dashboard",
                icon: icon("dashboard"),
            },
        ],
    },
    {
        // subheader: "Management",
        items: [
            {
                title: "Masters",
                path: "/dashboard/masters",
                icon: icon("category"),
                children: [
                    { title: "Category", path: "/dashboard/masters/category" },
                    { title: "Measuring Units", path: "/dashboard/masters/measuring-units" },
                    { title: "Product", path: "/dashboard/masters/product",},
                    // { title: "Product Service", path: "/dashboard/masters/settings", icon: icon("settings") },
                    { title: "Product Service", path: "/dashboard/masters/product-services" },
                    { title: "Warehouse", path: "/dashboard/masters/warehouse" },
                    { title: "Prefix", path: "/dashboard/masters/prefix" },
                    { title: "Customer", path: "/dashboard/masters/customer" },
                    { title: "Supplier", path: "/dashboard/masters/supplier" },
                    { title: "Accounts Group", path: "/dashboard/masters/account-group" },
                    { title: "Accounts", path: "/dashboard/masters/account" },
                    { title: "Financial Year", path: "/dashboard/masters/financial-year" },
                ],
            },
        ],
    },
    {
        // subheader: "Management",
        items: [
            {
                title: "Sales",
                path: "/dashboard/sales",
                icon: icon("shopping"),
                children: [
                    { title: "Sales Quotation", path: "/dashboard/sales/sales-quotation" },
                    { title: "Sales Order", path: "/dashboard/sales/sales-order" },
                    { title: "Delivery Note", path: "/dashboard/sales/delivery-note",},
                    { title: "Sales Invoice", path: "/dashboard/sales/sales-invoice",},
                    { title: "Sales Invoice Registry", path: "/dashboard/sales/sales-invoice-registry",},
                    { title: "Sales Order Registry", path: "/dashboard/sales/sales-order-registry",},
                    { title: "Proforma Invoice", path: "/dashboard/sales/proforma-invoice",},
                    { title: "Sales Return", path: "/dashboard/sales/sales-return",},

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
                children: [
                    { title: "Country", path: "/dashboard/settings/country" },
                    { title: "State/Province", path: "/dashboard/settings/state-province" },
                    { title: "Bank Account", path: "/dashboard/settings/bank-account" },
                    { title: "Currency", path: "/dashboard/settings/currency" },
                ],
            },
        ],
    },

];

export const navData = getNavData();
