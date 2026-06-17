"use client";

import {
    ChevronRight,
    Home,
    Plus,
    Edit3,
    Lock,
    Sun,
    CloudSun,
    ChevronLeft,
    ClipboardList,
    ShoppingCart,
    Calendar,
    Search,
    Wind,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

const currentYear = new Date().getFullYear();

export default function DashboardPage() {
    const { user } = useAuth();
    const company = user?.company;
    const companyName = company?.name || "Your Company";
    const companyPhone = company?.phone || "\u2014";
    const companyEmail = company?.email || "\u2014";
    const companyCrNumber = company?.crNumber || "\u2014";
    const companyAddress = company?.address || "\u2014";
    const companyLogo = company?.logo;
    return (
        <div className="flex flex-col gap-5">
            {/* ===== 1. Breadcrumb Bar ===== */}
            <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Home className="size-4" />
                    <span>Home</span>
                    <ChevronRight className="size-3.5" />
                    <span className="font-medium text-gray-800">Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {currentYear}
                    </span>
                    <button className="flex size-8 items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600">
                        <Edit3 className="size-4" />
                    </button>
                    <button className="flex size-8 items-center justify-center rounded-lg bg-rose-700 text-white hover:bg-rose-800">
                        <Lock className="size-4" />
                    </button>
                    <button className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700">
                        <Plus className="size-4" />
                    </button>
                </div>
            </div>

            {/* ===== 2. Company Info Banner ===== */}
            <Card className="overflow-hidden">
                <CardContent className="px-6 py-6">
                    <div className="flex flex-col items-center gap-1 text-center">
                        {/* Logo */}
                        <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-brand/10">
                            {companyLogo ? (
                                <img src={companyLogo} alt={companyName} className="size-12 rounded-full object-cover" />
                            ) : (
                                <svg viewBox="0 0 40 40" className="size-8" fill="none">
                                    <rect x="4" y="8" width="32" height="24" rx="3" stroke="#00477D" strokeWidth="2.5" />
                                    <path d="M10 16h20v3H10zM10 22h14v3H10z" fill="#00477D" opacity="0.15" />
                                    <text x="20" y="26" textAnchor="middle" fill="#00477D" fontSize="16" fontWeight="bold" fontFamily="sans-serif">S</text>
                                </svg>
                            )}
                        </div>
                        <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
                            {companyName}
                        </h1>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
                        <div className="space-y-1 text-sm">
                            <p><span className="font-semibold text-gray-700">Phone :</span> <span className="text-gray-600">{companyPhone}</span></p>
                            <p><span className="font-semibold text-gray-700">Email :</span> <span className="text-gray-600">{companyEmail}</span></p>
                        </div>
                        <div className="space-y-1 text-sm sm:text-right">
                            <p><span className="font-semibold text-gray-700">CR Number :</span> <span className="text-gray-600">{companyCrNumber}</span></p>
                            <p><span className="font-semibold text-gray-700">Address :</span> <span className="text-gray-600">{companyAddress}</span></p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ===== 3. Metrics & Weather Row ===== */}
            <div className="grid gap-4 lg:grid-cols-4">
                {/* Weather Card */}
                <Card className="overflow-hidden border-0 bg-[#004080] text-white lg:col-span-1">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">JUBAIL</p>
                                <p className="text-xs text-white/60">TODAY - 09/06/2026</p>
                                <p className="text-xs text-white/60">12:40</p>
                            </div>
                            <Sun className="size-10 text-yellow-300" />
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <p className="text-5xl font-bold leading-none tracking-tight">35.76°</p>
                                <div className="mt-2 flex items-center gap-1.5">
                                    <Wind className="size-4 text-white/70" />
                                    <span className="text-sm font-medium text-white/80">CLEAR SKY</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Metric Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 lg:col-span-3">
                    {[
                        { title: "Total Sales", value: "0.00 ر.س." },
                        { title: "Total Expences", value: "0.00 ر.س." },
                        { title: "Total Invoices", value: "0" },
                        { title: "Transactions", value: "0" },
                        { title: "Total Customer", value: "14" },
                    ].map((metric) => (
                        <Card key={metric.title} className="relative">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                        {metric.title}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <ChevronLeft className="size-3 cursor-pointer text-gray-400 hover:text-gray-600" />
                                        <ChevronRight className="size-3 cursor-pointer text-gray-400 hover:text-gray-600" />
                                    </div>
                                </div>
                                <p className="mt-2 text-lg font-bold text-gray-900">{metric.value}</p>
                                <span className="absolute bottom-1.5 right-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                                    Today
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* ===== 4. Quick-Action Buttons ===== */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Sales Button */}
                <button className="group bg-card-red-light  flex justify-center items-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-5 text-white transition-colors">
                        <ClipboardList className="size-7" />
                        <span className="text-lg font-bold tracking-wide">Sales</span>
                    </div>
                    <div className="flex w-[20%] h-full items-center justify-center bg-card-red-dark text-white transition-colors">
                        <Plus className="size-10" />
                    </div>
                </button>

                {/* Purchase Button */}
                <button className="group bg-card-blue-light  flex justify-center items-center overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-5 text-white transition-colors">
                        <ShoppingCart className="size-7" />
                        <span className="text-xl font-bold tracking-wide">Purchase</span>
                    </div>
                    <div className="flex w-[20%] h-full items-center justify-center bg-card-blue-dark text-white transition-colors">
                        <Plus className="size-10" />
                    </div>
                </button>
            </div>

            {/* ===== 5. Bottom Split Panel ===== */}
            <div className="grid gap-4 lg:grid-cols-5">
                {/* Customer Search */}
                <Card className="lg:col-span-3">
                    <CardContent className="p-5">
                        <h3 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-gray-700">
                            Customer Search
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                            <div className="space-y-1 sm:col-span-1">
                                <label className="text-xs font-medium text-gray-500">Customer Name</label>
                                <input
                                    placeholder="Search by customer name"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-1">
                                <label className="text-xs font-medium text-gray-500">Customer Code</label>
                                <input
                                    placeholder="Search by code"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-1">
                                <label className="text-xs font-medium text-gray-500">Phone</label>
                                <input
                                    placeholder="Search by phone"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                            <div className="flex items-end sm:col-span-1">
                                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-hover">
                                    <Search className="size-4" />
                                    SEARCH
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* To Do List */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-gray-500" />
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                                    To Do List
                                </h3>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ChevronLeft className="size-3.5 cursor-pointer text-gray-400 hover:text-gray-600" />
                                <ChevronRight className="size-3.5 cursor-pointer text-gray-400 hover:text-gray-600" />
                                <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                                    Today
                                </span>
                            </div>
                        </div>
                        <hr className="my-3 border-gray-200" />
                        <p className="text-sm font-semibold text-cyan-600">
                            Today, 09 Jun Tuesday
                        </p>
                        <div className="mt-4 flex flex-col items-center justify-center py-8 text-center text-gray-400">
                            <ClipboardList className="size-10 mb-2 text-gray-300" />
                            <p className="text-sm">No tasks for today</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

