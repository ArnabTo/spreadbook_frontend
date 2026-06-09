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
                    { title: "Product", path: "/dashboard/masters/accounts",},
                    // { title: "Product Service", path: "/dashboard/masters/settings", icon: icon("settings") },
                    { title: "Product Service", path: "/dashboard/masters/settings" },
                    { title: "Warehouse", path: "/dashboard/masters/warehouse" },
                    { title: "Prefix", path: "/dashboard/masters/settings" },
                    { title: "Customer", path: "/dashboard/masters/settings" },
                    { title: "Supplier", path: "/dashboard/masters/settings" },
                    { title: "Accounts Group", path: "/dashboard/masters/settings" },
                    { title: "Accounts", path: "/dashboard/masters/settings" },
                    { title: "Financial Year", path: "/dashboard/masters/settings" },
                ],
            },
        ],
    },


];

export const navData = getNavData();
