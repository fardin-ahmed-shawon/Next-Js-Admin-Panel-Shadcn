"use client";

import { ExcelExportButton } from "@/components/excel-export-button";
import * as React from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  PhoneCall,
  Send,
  MessageSquare,
  RotateCcw,
  Users,
  CreditCard,
  ShoppingBag,
  Sparkles,
  Crown,
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  MapPin,
  Package,
  Hash,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendCustomerSms, sendBulkSms } from "@/hooks/useCustomers";
import { cn, getInitials } from "@/lib/utils";
import { useCrmAssignments, assignCrmCustomers } from "@/hooks/useCrmAssignments";

export const BANGLADESH_DISTRICTS = [
  "Dhaka",
  "Chattogram",
  "Gazipur",
  "Narayanganj",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Bogura",
  "Cox's Bazar",
  "Tangail",
  "Jessore",
  "Dinajpur",
  "Brahmanbaria",
  "Narsingdi",
  "Jamalpur",
  "Pabna",
  "Kushtia",
  "Faridpur",
  "Sirajganj",
  "Noakhali",
  "Feni",
  "Chandpur",
  "Habiganj",
  "Moulvibazar",
  "Sunamganj",
  "Natore",
  "Naogaon",
  "Chapai Nawabganj",
  "Joypurhat",
  "Gaibandha",
  "Kurigram",
  "Lalmonirhat",
  "Nilphamari",
  "Panchagarh",
  "Thakurgaon",
  "Jashore",
  "Satkhira",
  "Bagerhat",
  "Jhenaidah",
  "Magura",
  "Narail",
  "Chuadanga",
  "Meherpur",
  "Bhola",
  "Jhalokathi",
  "Patuakhali",
  "Pirojpur",
  "Barguna",
  "Kishoreganj",
  "Manikganj",
  "Munshiganj",
  "Netrokona",
  "Rajbari",
  "Shariatpur",
  "Gopalganj",
  "Madaripur",
  "Sherpur",
  "Bandarban",
  "Khagrachhari",
  "Rangamati",
];

export interface CustomerRow {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  productsCount: number;
  totalSpent: number;
  aov: number;
  status: "Registered";
  avatar: string;
  joinDate: string;
  lastOrderDate: string | null;
  daysSinceLastOrder: number | null;
  successRate: number;
  returnRate: number;
  segmentKey: string;
  segmentName: string;
  segmentColor: string;
  city: string;
  address: string;
  district?: string;
  shippingArea?: string;
  allDistricts?: string[];
  orderIds?: string[];
  orderNos?: string[];
  recentOrderNo?: string;
  productNames?: string[];
  productSkus?: string[];
  notesCount?: number;
  crmAssignee?: string | null;
  crmManager?: string | null;
}

interface CustomersTableProps {
  data: CustomerRow[];
  onRefresh?: () => void;
}

export function CustomersTable({ data, onRefresh }: CustomersTableProps) {
  const { options: assignmentOptions } = useCrmAssignments();
  const [assignmentIds, setAssignmentIds] = React.useState<(string | number)[]>([]);
  const [assignmentMode, setAssignmentMode] = React.useState<"handover" | "assign">("assign");
  const [recipientId, setRecipientId] = React.useState("");
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [assignmentError, setAssignmentError] = React.useState("");
  const [assignmentDepartment, setAssignmentDepartment] = React.useState("all");
  const [assignmentDesignation, setAssignmentDesignation] = React.useState("all");
  const [assignmentSearch, setAssignmentSearch] = React.useState("");
  const [assignmentSort, setAssignmentSort] = React.useState("name");
  const eligibleRecipients = (assignmentOptions?.data || []).filter((recipient) =>
    assignmentMode !== "handover" || recipient.can_manage_team);
  const departments = Array.from(new Map(eligibleRecipients.filter((r) => r.department_id)
    .map((r) => [String(r.department_id), r.department || "Department"])).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const designations = Array.from(new Map(eligibleRecipients.filter((r) => r.designation_id
    && (assignmentDepartment === "all" || String(r.department_id) === assignmentDepartment))
    .map((r) => [String(r.designation_id), r.designation || "Designation"])).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const recipients = eligibleRecipients.filter((r) =>
    (assignmentDepartment === "all" || String(r.department_id) === assignmentDepartment)
    && (assignmentDesignation === "all" || String(r.designation_id) === assignmentDesignation)
    && [r.full_name, r.department, r.designation].some((text) => text?.toLowerCase().includes(assignmentSearch.toLowerCase())))
    .sort((a, b) => (assignmentSort === "department" ? (a.department || "").localeCompare(b.department || "")
      : assignmentSort === "designation" ? (a.designation || "").localeCompare(b.designation || "") : 0)
      || a.full_name.localeCompare(b.full_name));
  const openAssignment = (ids: (string | number)[]) => {
    setAssignmentIds(ids); setRecipientId(""); setAssignmentMode(assignmentOptions?.all_customers ? "handover" : "assign"); setAssignmentError("");
    setAssignmentDepartment("all"); setAssignmentDesignation("all"); setAssignmentSearch(""); setAssignmentSort("name");
  };
  const handleAssignment = async () => {
    setIsAssigning(true); setAssignmentError("");
    try {
      await assignCrmCustomers(assignmentIds, recipientId === "unassigned" ? null : Number(recipientId), assignmentMode);
      toast.success("CRM customer assignments updated");
      setAssignmentIds([]); setSelectedRowIds(new Set()); onRefresh?.();
    } catch (error) {
      setAssignmentError(error instanceof Error ? error.message : "Unable to assign customers");
    } finally {
      setIsAssigning(false);
    }
  };

  // --- Filter states ---
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [searchMode, setSearchMode] = React.useState<"all" | "district" | "order" | "product">("all");

  // --- Specific targeted filters ---
  const [districtFilter, setDistrictFilter] = React.useState<string>("all");
  const [orderIdFilter, setOrderIdFilter] = React.useState<string>("");
  const [productFilter, setProductFilter] = React.useState<string>("");

  // --- Behavioral filters ---
  const [selectedSegment, setSelectedSegment] = React.useState<string>("all");
  const [spendFilter, setSpendFilter] = React.useState<string>("all");
  const [orderFilter, setOrderFilter] = React.useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = React.useState<string>("all");
  const [recencyFilter, setRecencyFilter] = React.useState<string>("all");

  // --- Sorting state ---
  const [sortBy, setSortBy] = React.useState<string>("spent-desc");

  // --- Pagination state ---
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // --- Row selection ---
  const [selectedRowIds, setSelectedRowIds] = React.useState<Set<string | number>>(new Set());

  // --- SMS Dialog States ---
  const [isSmsOpen, setIsSmsOpen] = React.useState<boolean>(false);
  const [isBulkSmsOpen, setIsBulkSmsOpen] = React.useState<boolean>(false);
  const [activeCustomerForSms, setActiveCustomerForSms] = React.useState<CustomerRow | null>(null);
  const [smsMessage, setSmsMessage] = React.useState<string>("");
  const [isSendingSms, setIsSendingSms] = React.useState<boolean>(false);

  // --- Dynamically extract all districts detected across customers with counts ---
  const availableDistricts = React.useMemo(() => {
    const counts = new Map<string, number>();
    data.forEach((c) => {
      const set = new Set<string>();
      if (c.district) set.add(c.district);
      if (c.city && c.city !== "Inside Dhaka" && c.city !== "Outside Dhaka") set.add(c.city);
      if (c.allDistricts) {
        c.allDistricts.forEach((d) => {
          if (d && d !== "Inside Dhaka" && d !== "Outside Dhaka") set.add(d);
        });
      }
      set.forEach((d) => {
        counts.set(d, (counts.get(d) || 0) + 1);
      });
    });

    const detected = Array.from(counts.entries())
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count || a.district.localeCompare(b.district));

    const detectedNames = new Set(detected.map((d) => d.district.toLowerCase()));
    const remaining = BANGLADESH_DISTRICTS.filter((d) => !detectedNames.has(d.toLowerCase())).map((d) => ({
      district: d,
      count: 0,
    }));

    return [...detected, ...remaining];
  }, [data]);

  // --- Pre-calculated counts for quick filter tabs ---
  const tabCounts = React.useMemo(() => {
    return {
      all: data.length,
      vip: data.filter((c) => c.segmentKey === "vip").length,
      repeat: data.filter((c) => c.segmentKey === "returning" || c.totalOrders > 1).length,
      new: data.filter((c) => c.segmentKey === "new" || (c.daysSinceLastOrder !== null && c.daysSinceLastOrder <= 30 && c.totalOrders <= 1)).length,
      inactive: data.filter((c) => c.segmentKey === "inactive" || (c.daysSinceLastOrder !== null && c.daysSinceLastOrder > 30 && c.daysSinceLastOrder <= 90)).length,
      risk: data.filter((c) => c.segmentKey === "lost" || c.returnRate > 30).length,
    };
  }, [data]);

  // --- Filtering Logic ---
  const filteredData = React.useMemo(() => {
    return data.filter((c) => {
      // 1. Quick Tab Filter
      if (activeTab === "vip" && c.segmentKey !== "vip") return false;
      if (activeTab === "repeat" && c.segmentKey !== "returning" && c.totalOrders <= 1) return false;
      if (activeTab === "new" && c.segmentKey !== "new" && !(c.daysSinceLastOrder !== null && c.daysSinceLastOrder <= 30 && c.totalOrders <= 1)) return false;
      if (activeTab === "inactive" && c.segmentKey !== "inactive" && !(c.daysSinceLastOrder !== null && c.daysSinceLastOrder > 30 && c.daysSinceLastOrder <= 90)) return false;
      if (activeTab === "risk" && c.segmentKey !== "lost" && c.returnRate <= 30) return false;

      // 2. Specific Segment Filter
      if (selectedSegment !== "all" && c.segmentKey !== selectedSegment) return false;

      // 3. Dedicated District Filter
      if (districtFilter !== "all") {
        const target = districtFilter.toLowerCase();
        const hasDistrict =
          (c.district && c.district.toLowerCase().includes(target)) ||
          (c.city && c.city.toLowerCase().includes(target)) ||
          (c.address && c.address.toLowerCase().includes(target)) ||
          (c.allDistricts && c.allDistricts.some((d) => d.toLowerCase().includes(target)));
        if (!hasDistrict) return false;
      }

      // 4. Dedicated Order ID / No Filter
      if (orderIdFilter.trim()) {
        const oQuery = orderIdFilter.toLowerCase().trim().replace(/^#/, "");
        const hasOrder =
          (c.orderIds && c.orderIds.some((id) => id.toLowerCase().includes(oQuery))) ||
          (c.orderNos && c.orderNos.some((no) => no.toLowerCase().includes(oQuery)));
        if (!hasOrder) return false;
      }

      // 5. Dedicated Product Name / SKU Filter
      if (productFilter.trim()) {
        const pQuery = productFilter.toLowerCase().trim();
        const hasProduct =
          (c.productNames && c.productNames.some((p) => p.toLowerCase().includes(pQuery))) ||
          (c.productSkus && c.productSkus.some((s) => s.toLowerCase().includes(pQuery)));
        if (!hasProduct) return false;
      }

      // 6. Spend Filter
      if (spendFilter === "vip" && c.totalSpent < 15000) return false;
      if (spendFilter === "high" && (c.totalSpent < 8000 || c.totalSpent >= 15000)) return false;
      if (spendFilter === "mid" && (c.totalSpent < 2000 || c.totalSpent >= 8000)) return false;
      if (spendFilter === "low" && (c.totalSpent <= 0 || c.totalSpent >= 2000)) return false;
      if (spendFilter === "zero" && c.totalSpent > 0) return false;

      // 7. Order Count Filter
      if (orderFilter === "5plus" && c.totalOrders < 5) return false;
      if (orderFilter === "2to4" && (c.totalOrders < 2 || c.totalOrders > 4)) return false;
      if (orderFilter === "single" && c.totalOrders !== 1) return false;
      if (orderFilter === "zero" && c.totalOrders > 0) return false;

      // 8. Delivery Rate Filter
      if (deliveryFilter === "high" && c.successRate < 80) return false;
      if (deliveryFilter === "mid" && (c.successRate < 50 || c.successRate >= 80)) return false;
      if (deliveryFilter === "risk" && c.returnRate <= 30) return false;

      // 9. Recency Filter
      if (recencyFilter === "recent" && (c.daysSinceLastOrder === null || c.daysSinceLastOrder > 30)) return false;
      if (recencyFilter === "inactive" && (c.daysSinceLastOrder === null || c.daysSinceLastOrder <= 30 || c.daysSinceLastOrder > 90)) return false;
      if (recencyFilter === "dormant" && (c.daysSinceLastOrder === null || c.daysSinceLastOrder <= 90)) return false;
      if (recencyFilter === "never" && c.daysSinceLastOrder !== null) return false;

      // 10. Universal or Scope-Based Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanQ = q.replace(/^#/, "");

        if (searchMode === "district") {
          const matches =
            (c.district && c.district.toLowerCase().includes(q)) ||
            (c.city && c.city.toLowerCase().includes(q)) ||
            (c.address && c.address.toLowerCase().includes(q)) ||
            (c.allDistricts && c.allDistricts.some((d) => d.toLowerCase().includes(q)));
          if (!matches) return false;
        } else if (searchMode === "order") {
          const matches =
            (c.orderIds && c.orderIds.some((id) => id.toLowerCase().includes(cleanQ))) ||
            (c.orderNos && c.orderNos.some((no) => no.toLowerCase().includes(cleanQ)));
          if (!matches) return false;
        } else if (searchMode === "product") {
          const matches =
            (c.productNames && c.productNames.some((p) => p.toLowerCase().includes(q))) ||
            (c.productSkus && c.productSkus.some((s) => s.toLowerCase().includes(q)));
          if (!matches) return false;
        } else {
          // "all" mode matches customer fields, location, order IDs, and products!
          const idStr = String(c.id).toLowerCase();
          const nameStr = (c.name || "").toLowerCase();
          const phoneStr = (c.phone || "").toLowerCase();
          const emailStr = (c.email || "").toLowerCase();
          const cityStr = (c.city || "").toLowerCase();
          const districtStr = (c.district || "").toLowerCase();
          const segmentStr = (c.segmentName || "").toLowerCase();

          const matchesCustomer =
            idStr.includes(q) ||
            `#${idStr}`.includes(q) ||
            nameStr.includes(q) ||
            phoneStr.includes(q) ||
            emailStr.includes(q) ||
            cityStr.includes(q) ||
            districtStr.includes(q) ||
            segmentStr.includes(q);

          const matchesDistrict =
            c.allDistricts && c.allDistricts.some((d) => d.toLowerCase().includes(q));

          const matchesOrders =
            (c.orderIds && c.orderIds.some((id) => id.toLowerCase().includes(cleanQ))) ||
            (c.orderNos && c.orderNos.some((no) => no.toLowerCase().includes(cleanQ)));

          const matchesProducts =
            (c.productNames && c.productNames.some((p) => p.toLowerCase().includes(q))) ||
            (c.productSkus && c.productSkus.some((s) => s.toLowerCase().includes(q)));

          if (!matchesCustomer && !matchesDistrict && !matchesOrders && !matchesProducts) {
            return false;
          }
        }
      }

      return true;
    });
  }, [
    data,
    activeTab,
    selectedSegment,
    districtFilter,
    orderIdFilter,
    productFilter,
    spendFilter,
    orderFilter,
    deliveryFilter,
    recencyFilter,
    searchQuery,
    searchMode,
  ]);

  // --- Sorting Logic ---
  const sortedData = React.useMemo(() => {
    const list = [...filteredData];
    list.sort((a, b) => {
      switch (sortBy) {
        case "spent-desc":
          return b.totalSpent - a.totalSpent;
        case "spent-asc":
          return a.totalSpent - b.totalSpent;
        case "orders-desc":
          return b.totalOrders - a.totalOrders;
        case "orders-asc":
          return a.totalOrders - b.totalOrders;
        case "success-desc":
          return b.successRate - a.successRate;
        case "return-desc":
          return b.returnRate - a.returnRate;
        case "recency-desc": {
          const aTime = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
          const bTime = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
          return bTime - aTime;
        }
        case "recency-asc": {
          const aTime = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
          const bTime = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
          return aTime - bTime;
        }
        case "newest": {
          const aTime = a.joinDate ? new Date(a.joinDate).getTime() : 0;
          const bTime = b.joinDate ? new Date(b.joinDate).getTime() : 0;
          return bTime - aTime;
        }
        case "oldest": {
          const aTime = a.joinDate ? new Date(a.joinDate).getTime() : 0;
          const bTime = b.joinDate ? new Date(b.joinDate).getTime() : 0;
          return aTime - bTime;
        }
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "id-desc":
          return Number(b.id) - Number(a.id);
        case "id-asc":
          return Number(a.id) - Number(b.id);
        default:
          return b.totalSpent - a.totalSpent;
      }
    });
    return list;
  }, [filteredData, sortBy]);

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // --- Row Selection Handlers ---
  const isAllPageSelected =
    paginatedData.length > 0 && paginatedData.every((row) => selectedRowIds.has(row.id));

  const toggleSelectAllPage = () => {
    const next = new Set(selectedRowIds);
    if (isAllPageSelected) {
      paginatedData.forEach((row) => next.delete(row.id));
    } else {
      paginatedData.forEach((row) => next.add(row.id));
    }
    setSelectedRowIds(next);
  };

  const toggleSelectRow = (id: string | number) => {
    const next = new Set(selectedRowIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRowIds(next);
  };

  React.useEffect(() => {
    setSelectedRowIds(new Set());
    setPage(1);
  }, [filteredData]);

  // --- Reset All Filters ---
  const hasActiveFilters =
    activeTab !== "all" ||
    selectedSegment !== "all" ||
    districtFilter !== "all" ||
    Boolean(orderIdFilter.trim()) ||
    Boolean(productFilter.trim()) ||
    searchMode !== "all" ||
    spendFilter !== "all" ||
    orderFilter !== "all" ||
    deliveryFilter !== "all" ||
    recencyFilter !== "all" ||
    Boolean(searchQuery.trim());

  const resetAllFilters = () => {
    setActiveTab("all");
    setSelectedSegment("all");
    setDistrictFilter("all");
    setOrderIdFilter("");
    setProductFilter("");
    setSearchMode("all");
    setSpendFilter("all");
    setOrderFilter("all");
    setDeliveryFilter("all");
    setRecencyFilter("all");
    setSearchQuery("");
    setPage(1);
  };

  const customerExcelData = (selectedOnly = false) => ({
    headers: ["ID", "Full Name", "Phone", "Email", "Account Status", "Segment", "Total Orders", "Products Ordered", "Lifetime Spend (BDT)", "AOV (BDT)", "Delivery Success Rate (%)", "Return Rate (%)", "Last Order Date", "Joined Date", "District", "City/Shipping Area", "Address", "Order IDs", "Recent Order", "Purchased Products"],
    rows: (selectedOnly ? data.filter(c => selectedRowIds.has(c.id)) : sortedData).map(c => [
      c.id, c.name, c.phone, c.email, c.status, c.segmentName, c.totalOrders, c.productsCount,
      c.totalSpent, c.aov, c.successRate, c.returnRate, c.lastOrderDate || "Never", c.joinDate,
      c.district, c.city, c.address, (c.orderNos || c.orderIds || []).join(" | "), c.recentOrderNo, (c.productNames || []).join(" | "),
    ]),
  });

  // --- SMS Handlers ---
  const openSingleSmsModal = (customer: CustomerRow) => {
    setActiveCustomerForSms(customer);
    setSmsMessage(`Hello ${customer.name}, thank you for being with Zymerce! `);
    setIsSmsOpen(true);
  };

  const handleSendSingleSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomerForSms?.phone) {
      toast.error("Customer does not have a valid phone number.");
      return;
    }
    if (!smsMessage.trim()) {
      toast.error("Please enter an SMS message body.");
      return;
    }

    try {
      setIsSendingSms(true);
      await sendCustomerSms({
        customer_id: activeCustomerForSms.id,
        phone: activeCustomerForSms.phone,
        message: smsMessage.trim(),
      });
      toast.success(`SMS dispatched successfully to ${activeCustomerForSms.name} (${activeCustomerForSms.phone})`);
      setIsSmsOpen(false);
      setSmsMessage("");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch SMS.");
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleSendBulkSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRowIds.size === 0) {
      toast.error("No customers selected.");
      return;
    }
    if (!smsMessage.trim()) {
      toast.error("Please enter an SMS message body.");
      return;
    }

    const selectedCustomers = data.filter((c) => selectedRowIds.has(c.id) && Boolean(c.phone));
    const phones = selectedCustomers.map((c) => c.phone);
    const customerIds = selectedCustomers.map((c) => c.id);

    if (phones.length === 0) {
      toast.error("None of the selected customers have a valid phone number.");
      return;
    }

    try {
      setIsSendingSms(true);
      await sendBulkSms({
        customer_ids: customerIds,
        phones,
        message: smsMessage.trim(),
      });
      toast.success(`Bulk SMS dispatched to ${phones.length} customer(s).`);
      setIsBulkSmsOpen(false);
      setSmsMessage("");
      setSelectedRowIds(new Set());
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch bulk SMS.");
    } finally {
      setIsSendingSms(false);
    }
  };

  // Helper for toggle column sort
  const toggleColumnSort = (field: string) => {
    if (sortBy === `${field}-desc`) {
      setSortBy(`${field}-asc`);
    } else {
      setSortBy(`${field}-desc`);
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy === `${field}-desc`) {
      return <ArrowDown className="size-3.5 text-primary ml-1 inline" />;
    }
    if (sortBy === `${field}-asc`) {
      return <ArrowUp className="size-3.5 text-primary ml-1 inline" />;
    }
    return <ArrowUpDown className="size-3 text-muted-foreground/60 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

  return (
    <Card className="gap-0 py-0">
      {/* 1. Header Toolbar with Quick Segment Filter Tabs */}
      <div className="border-b bg-muted/20 px-3 sm:px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab("all");
            setPage(1);
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
            activeTab === "all"
              ? "bg-card text-foreground border-border shadow-2xs font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <span>All Customers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-muted font-mono">{tabCounts.all}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("vip");
            setPage(1);
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
            activeTab === "vip"
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 shadow-2xs font-bold"
              : "border-transparent text-muted-foreground hover:text-amber-600 hover:bg-muted/60"
          )}
        >
          <Crown className="size-3.5 text-amber-500" />
          <span>VIP Spenders</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/15 font-mono text-amber-700 dark:text-amber-300">
            {tabCounts.vip}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("repeat");
            setPage(1);
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
            activeTab === "repeat"
              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 shadow-2xs font-bold"
              : "border-transparent text-muted-foreground hover:text-blue-600 hover:bg-muted/60"
          )}
        >
          <RotateCcw className="size-3.5 text-blue-500" />
          <span>Repeat Buyers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/15 font-mono text-blue-700 dark:text-blue-300">
            {tabCounts.repeat}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("new");
            setPage(1);
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
            activeTab === "new"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shadow-2xs font-bold"
              : "border-transparent text-muted-foreground hover:text-emerald-600 hover:bg-muted/60"
          )}
        >
          <Calendar className="size-3.5 text-emerald-500" />
          <span>New Buyers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/15 font-mono text-emerald-700 dark:text-emerald-300">
            {tabCounts.new}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("inactive");
            setPage(1);
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
            activeTab === "inactive"
              ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 shadow-2xs font-bold"
              : "border-transparent text-muted-foreground hover:text-purple-600 hover:bg-muted/60"
          )}
        >
          <Clock className="size-3.5 text-purple-500" />
          <span>At-Risk</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/15 font-mono text-purple-700 dark:text-purple-300">
            {tabCounts.inactive}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("risk");
            setPage(1);
          }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border",
            activeTab === "risk"
              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 shadow-2xs font-bold"
              : "border-transparent text-muted-foreground hover:text-rose-600 hover:bg-muted/60"
          )}
        >
          <ShieldAlert className="size-3.5 text-rose-500" />
          <span>Return Risk</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/15 font-mono text-rose-700 dark:text-rose-300">
            {tabCounts.risk}
          </span>
        </button>
      </div>

      {/* 2. Main Search, Multi-Filter, and Sorting Control Bar */}
      <div className="p-4 border-b bg-card space-y-3.5">
        {/* Top Control Header: Search Scope Tabs, Universal Search Input, Sort By & Export */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Search Scope Pills */}
            <div className="flex items-center gap-1 p-1 bg-muted/60 dark:bg-muted/30 rounded-lg border text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground px-2 hidden sm:inline">Search By:</span>
              {[
                { id: "all", label: "All Fields", icon: Search },
                { id: "district", label: "District / City", icon: MapPin },
                { id: "order", label: "Order ID / No", icon: Hash },
                { id: "product", label: "Product / SKU", icon: Package },
              ].map((tab) => {
                const Icon = tab.icon;
                const isCurrent = searchMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSearchMode(tab.id as any);
                      setPage(1);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                      isCurrent
                        ? "bg-background text-foreground shadow-2xs font-bold border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    )}
                  >
                    <Icon className={cn("size-3.5", isCurrent ? "text-primary" : "text-muted-foreground")} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Action Tools: Sort By Dropdown & Export Button */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sorting Preset Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="shrink-0 hidden md:inline font-medium">Sort By:</span>
                <Select
                  value={sortBy}
                  onValueChange={(val) => {
                    setSortBy(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-[180px] text-xs font-medium">
                    <SelectValue placeholder="Sort customers by..." />
                  </SelectTrigger>
                  <SelectContent align="end" className="text-xs">
                    <SelectItem value="spent-desc">Highest Spend (Revenue)</SelectItem>
                    <SelectItem value="spent-asc">Lowest Spend</SelectItem>
                    <SelectItem value="orders-desc">Most Orders</SelectItem>
                    <SelectItem value="orders-asc">Least Orders</SelectItem>
                    <SelectItem value="success-desc">Highest Delivery Rate (%)</SelectItem>
                    <SelectItem value="return-desc">Highest Return Rate (%)</SelectItem>
                    <SelectItem value="recency-desc">Recently Active (Latest Order)</SelectItem>
                    <SelectItem value="recency-asc">Oldest Last Order</SelectItem>
                    <SelectItem value="newest">Newest Joined</SelectItem>
                    <SelectItem value="oldest">Oldest Customer</SelectItem>
                    <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z → A)</SelectItem>
                    <SelectItem value="id-desc">Customer ID (High → Low)</SelectItem>
                    <SelectItem value="id-asc">Customer ID (Low → High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Excel Button */}
              <ExcelExportButton module="crm" title="Customers" getData={() => customerExcelData()} />
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={
                searchMode === "district"
                  ? "Search by district or city name (e.g. Dhaka, Gazipur, Chattogram, Sylhet)..."
                  : searchMode === "order"
                  ? "Search by Order ID or Order Number (e.g. ORD-1790147394912 or #4)..."
                  : searchMode === "product"
                  ? "Search by Product name or SKU (e.g. Acid Black Denim, Panjabi, SKU-4650)..."
                  : "Search across all fields: name, phone, email, district, order ID, product name/SKU..."
              }
              className="pl-9 pr-8 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                title="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dedicated Targeted Filters Row: District, Order ID, and Product */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t">
          {/* 1. District Selector */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3 text-emerald-500" />
                District / Region
              </Label>
              {districtFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => {
                    setDistrictFilter("all");
                    setPage(1);
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline"
                >
                  Clear
                </button>
              )}
            </div>
            <Select
              value={districtFilter}
              onValueChange={(val) => {
                setDistrictFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent className="max-h-72 text-xs">
                <SelectItem value="all">All Districts & Cities</SelectItem>
                {availableDistricts.map((d) => (
                  <SelectItem key={d.district} value={d.district}>
                    {d.district} {d.count > 0 ? `(${d.count})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Order ID Filter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Hash className="size-3 text-blue-500" />
                Order ID / Order No
              </Label>
              {orderIdFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderIdFilter("");
                    setPage(1);
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Filter by Order ID (e.g. ORD-... or 4)"
                className="pl-8 pr-7 h-8 text-xs bg-background font-mono"
                value={orderIdFilter}
                onChange={(e) => {
                  setOrderIdFilter(e.target.value);
                  setPage(1);
                }}
              />
              {orderIdFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderIdFilter("");
                    setPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Product Filter */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Package className="size-3 text-purple-500" />
                Product Name / SKU
              </Label>
              {productFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setProductFilter("");
                    setPage(1);
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Filter by Product name or SKU..."
                className="pl-8 pr-7 h-8 text-xs bg-background"
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setPage(1);
                }}
              />
              {productFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setProductFilter("");
                    setPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Behavioral Filter Selectors Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-1 text-xs">
          {/* Filter: Segment */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Segment</Label>
            <Select
              value={selectedSegment}
              onValueChange={(val) => {
                setSelectedSegment(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Segments" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Segments</SelectItem>
                <SelectItem value="vip">VIP Spenders</SelectItem>
                <SelectItem value="high_value">High Value</SelectItem>
                <SelectItem value="returning">Repeat Buyers</SelectItem>
                <SelectItem value="new">New Buyers</SelectItem>
                <SelectItem value="inactive">At-Risk (Inactive)</SelectItem>
                <SelectItem value="lost">Return Risk / Lost</SelectItem>
                <SelectItem value="low_value">Low Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter: Spending Tier */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Lifetime Spend</Label>
            <Select
              value={spendFilter}
              onValueChange={(val) => {
                setSpendFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Spend" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Spend Tiers</SelectItem>
                <SelectItem value="vip">VIP (৳15,000+)</SelectItem>
                <SelectItem value="high">High (৳8,000 - ৳15k)</SelectItem>
                <SelectItem value="mid">Mid (৳2,000 - ৳8k)</SelectItem>
                <SelectItem value="low">Budget (&lt; ৳2,000)</SelectItem>
                <SelectItem value="zero">Zero Spend (৳0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter: Order Count */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Orders Count</Label>
            <Select
              value={orderFilter}
              onValueChange={(val) => {
                setOrderFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Orders" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="5plus">5+ Orders</SelectItem>
                <SelectItem value="2to4">2 to 4 Orders</SelectItem>
                <SelectItem value="single">Single (1 Order)</SelectItem>
                <SelectItem value="zero">No Orders (0)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter: Delivery Success */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Fulfillment Health</Label>
            <Select
              value={deliveryFilter}
              onValueChange={(val) => {
                setDeliveryFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Rates" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Delivery Rates</SelectItem>
                <SelectItem value="high">High Delivery (≥ 80%)</SelectItem>
                <SelectItem value="mid">Moderate (50% - 79%)</SelectItem>
                <SelectItem value="risk">High Return Risk (&gt; 30%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter: Recency Activity */}
          <div>
            <Label className="text-[11px] font-semibold text-muted-foreground mb-1 block">Activity Recency</Label>
            <Select
              value={recencyFilter}
              onValueChange={(val) => {
                setRecencyFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Activity</SelectItem>
                <SelectItem value="recent">Active (&lt; 30d)</SelectItem>
                <SelectItem value="inactive">Inactive (30 - 90d)</SelectItem>
                <SelectItem value="dormant">Dormant (&gt; 90d)</SelectItem>
                <SelectItem value="never">Never Ordered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Pill Bar & Results Count */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t text-xs">
            <span className="text-muted-foreground text-[11px] font-semibold mr-1">Active filters:</span>

            {searchQuery.trim() && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2">
                Search ({searchMode}): "{searchQuery}"
                <X className="size-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}

            {districtFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                <MapPin className="size-3 text-emerald-600 dark:text-emerald-400" />
                District: {districtFilter}
                <X className="size-3 cursor-pointer" onClick={() => setDistrictFilter("all")} />
              </Badge>
            )}

            {orderIdFilter.trim() && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
                <Hash className="size-3 text-blue-600 dark:text-blue-400" />
                Order: #{orderIdFilter.replace(/^#/, "")}
                <X className="size-3 cursor-pointer" onClick={() => setOrderIdFilter("")} />
              </Badge>
            )}

            {productFilter.trim() && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20">
                <Package className="size-3 text-purple-600 dark:text-purple-400" />
                Product: {productFilter}
                <X className="size-3 cursor-pointer" onClick={() => setProductFilter("")} />
              </Badge>
            )}

            {activeTab !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 capitalize">
                Tab: {activeTab}
                <X className="size-3 cursor-pointer" onClick={() => setActiveTab("all")} />
              </Badge>
            )}

            {selectedSegment !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2 capitalize">
                Segment: {selectedSegment}
                <X className="size-3 cursor-pointer" onClick={() => setSelectedSegment("all")} />
              </Badge>
            )}

            {spendFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2">
                Spend: {spendFilter}
                <X className="size-3 cursor-pointer" onClick={() => setSpendFilter("all")} />
              </Badge>
            )}

            {orderFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2">
                Orders: {orderFilter}
                <X className="size-3 cursor-pointer" onClick={() => setOrderFilter("all")} />
              </Badge>
            )}

            {deliveryFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2">
                Delivery: {deliveryFilter}
                <X className="size-3 cursor-pointer" onClick={() => setDeliveryFilter("all")} />
              </Badge>
            )}

            {recencyFilter !== "all" && (
              <Badge variant="secondary" className="gap-1 text-[11px] py-0.5 px-2">
                Recency: {recencyFilter}
                <X className="size-3 cursor-pointer" onClick={() => setRecencyFilter("all")} />
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="h-6 text-[11px] px-2 text-primary hover:underline ml-1"
            >
              Reset All
            </Button>

            <span className="ml-auto text-muted-foreground text-[11px]">
              Showing <strong className="text-foreground">{sortedData.length}</strong> of {data.length} records
            </span>
          </div>
        )}
      </div>

      {assignmentOptions?.can_assign && (
        <div className="flex flex-wrap items-center gap-3 border-b p-4 text-xs">
          <Button size="sm" variant="outline" disabled={!filteredData.length} onClick={() => setSelectedRowIds(new Set(filteredData.map((customer) => customer.id)))}>
            Select all {filteredData.length} matching customers
          </Button>
          <span className="text-muted-foreground">Assign customers to a Customer Relationship Manager, who distributes them to Customer Relationship Agents.</span>
        </div>
      )}

      {/* 3. Bulk Selection Action Floating / Info Bar */}
      {selectedRowIds.size > 0 && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              {selectedRowIds.size} customer{selectedRowIds.size > 1 ? "s" : ""} selected
            </span>
            <span className="text-muted-foreground text-[11px]">
              (across page or directory)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ExcelExportButton module="crm" title="Selected customers" label={`Export selected (${selectedRowIds.size})`} getData={() => customerExcelData(true)} />
            {assignmentOptions?.can_assign && (
              <Button size="sm" variant="outline" onClick={() => openAssignment(Array.from(selectedRowIds))}>
                Assign CRM customers ({selectedRowIds.size})
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => {
                setSmsMessage("Hello {name}, special offer from Zymerce just for you! ");
                setIsBulkSmsOpen(true);
              }}
              className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
            >
              <Send className="size-3" />
              Send Bulk SMS ({selectedRowIds.size})
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedRowIds(new Set())}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* 4. The Interactive Customers Table */}
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-xs">
          <thead className="border-b bg-muted/40 font-semibold text-muted-foreground">
            <tr>
              {/* Checkbox Header */}
              <th className="py-3 px-4 w-10 text-center">
                <Checkbox
                  checked={isAllPageSelected}
                  onCheckedChange={toggleSelectAllPage}
                  aria-label="Select all customers on current page"
                />
              </th>

              {/* ID */}
              <th
                onClick={() => toggleColumnSort("id")}
                className="py-3 px-3 text-left w-16 cursor-pointer group hover:text-foreground transition-colors"
              >
                <span>ID</span>
                {getSortIcon("id")}
              </th>

              {/* Customer Info */}
              <th
                onClick={() => toggleColumnSort("name")}
                className="py-3 px-4 text-left min-w-[220px] cursor-pointer group hover:text-foreground transition-colors"
              >
                <span>Customer</span>
                {getSortIcon("name")}
              </th>

              {/* Dynamic Segment */}
              <th className="py-3 px-3 text-left min-w-[130px]">
                <span>Segment</span>
              </th>

              {/* Orders & Volume */}
              <th
                onClick={() => toggleColumnSort("orders")}
                className="py-3 px-3 text-left min-w-[130px] cursor-pointer group hover:text-foreground transition-colors"
              >
                <span>Orders</span>
                {getSortIcon("orders")}
              </th>

              {/* Total Lifetime Spend */}
              <th
                onClick={() => toggleColumnSort("spent")}
                className="py-3 px-4 text-left min-w-[140px] cursor-pointer group hover:text-foreground transition-colors"
              >
                <span>Total Spent</span>
                {getSortIcon("spent")}
              </th>

              {/* Courier Delivery Reliability */}
              <th
                onClick={() => toggleColumnSort("success")}
                className="py-3 px-4 text-left min-w-[150px] cursor-pointer group hover:text-foreground transition-colors"
              >
                <span>Fulfillment Rate</span>
                {getSortIcon("success")}
              </th>

              {/* Purchase Recency / Last Active */}
              <th
                onClick={() => toggleColumnSort("recency")}
                className="py-3 px-3 text-left min-w-[130px] cursor-pointer group hover:text-foreground transition-colors"
              >
                <span>Last Active</span>
                {getSortIcon("recency")}
              </th>

              {/* Actions Header */}
              <th className="py-3 px-4 text-right min-w-[170px]">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <Users className="size-6" />
                    </div>
                    <p className="text-sm font-bold text-foreground">No customer records found</p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting or clearing your search queries and filters to see more results.
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={resetAllFilters} className="mt-2 text-xs">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((customer) => {
                const isSelected = selectedRowIds.has(customer.id);
                const phoneClean = (customer.phone || "").replace(/[^0-9]/g, "");

                return (
                  <tr
                    key={customer.id}
                    className={cn(
                      "transition-colors hover:bg-muted/40 group",
                      isSelected && "bg-primary/5 hover:bg-primary/[0.08]"
                    )}
                  >
                    {/* Checkbox Column */}
                    <td className="py-3.5 px-4 text-center align-middle">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectRow(customer.id)}
                        aria-label={`Select customer ${customer.name}`}
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-3 align-middle font-mono font-bold text-muted-foreground text-[11px]">
                      #{customer.id}
                    </td>

                    {/* Customer Info (Avatar, Name, Phone, Email, Status) */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border shadow-2xs overflow-hidden">
                          {customer.name ? getInitials(customer.name) : <Users className="size-4" />}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/customers/${customer.id}`}
                              className="font-bold text-foreground hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-[200px]"
                              title={customer.name}
                            >
                              {customer.name}
                            </Link>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-4 font-normal bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                            >
                              Registered
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-wrap">
                            <span className="w-full">Relationship Agent: <strong>{customer.crmAssignee || "Unassigned"}</strong>
                              {customer.crmManager && <span> · Relationship Manager: {customer.crmManager}</span>}
                              {assignmentOptions?.can_assign && <Button size="sm" variant="link" className="h-auto px-2 py-0 text-xs" onClick={() => openAssignment([customer.id])}>Assign</Button>}
                            </span>
                            {customer.phone && (
                              <span className="font-mono">{customer.phone}</span>
                            )}
                            {(customer.district || customer.city) && (
                              <>
                                <span className="opacity-40">•</span>
                                <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]" title={customer.allDistricts?.join(", ") || customer.district || customer.city || ""}>
                                  <MapPin className="size-2.5 shrink-0" />
                                  <span className="truncate max-w-[120px]">{customer.district || customer.city}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dynamic Segment Badge */}
                    <td className="py-3.5 px-3 align-middle">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs gap-1.5 whitespace-nowrap"
                        style={{
                          backgroundColor: `${customer.segmentColor}12`,
                          color: customer.segmentColor,
                          borderColor: `${customer.segmentColor}35`,
                        }}
                      >
                        <span
                          className="inline-block size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: customer.segmentColor }}
                        />
                        {customer.segmentName}
                      </Badge>
                    </td>

                    {/* Orders & AOV */}
                    <td className="py-3.5 px-3 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-foreground tabular-nums">
                          {customer.totalOrders} {customer.totalOrders === 1 ? "order" : "orders"}
                        </span>
                        {customer.recentOrderNo && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                            title={`Recent Order: #${customer.recentOrderNo}`}
                          >
                            <Hash className="size-2.5 opacity-70" />
                            {customer.recentOrderNo.length > 14
                              ? `${customer.recentOrderNo.slice(0, 12)}…`
                              : customer.recentOrderNo}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                        {customer.productsCount} items • AOV ৳{customer.aov.toLocaleString()}
                      </div>
                      {customer.productNames && customer.productNames.length > 0 && (
                        <div
                          className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 max-w-[210px] truncate"
                          title={`Purchased Products: ${customer.productNames.join(", ")}`}
                        >
                          <Package className="size-2.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span className="truncate">{customer.productNames[0]}</span>
                          {customer.productNames.length > 1 && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground shrink-0 font-medium">
                              +{customer.productNames.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Total Lifetime Spend */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-extrabold text-foreground tabular-nums text-sm">
                        ৳{customer.totalSpent.toLocaleString()}
                      </div>
                      {customer.totalSpent >= 10000 ? (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                          High Spender
                        </span>
                      ) : customer.totalSpent > 0 ? (
                        <span className="text-[10px] text-muted-foreground">
                          Lifetime value
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">
                          No purchases yet
                        </span>
                      )}
                    </td>

                    {/* Courier Fulfillment Quality Rate */}
                    <td className="py-3.5 px-4 align-middle">
                      {customer.totalOrders > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "font-bold tabular-nums text-xs",
                                customer.successRate >= 80
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : customer.successRate >= 50
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-rose-600 dark:text-rose-400"
                              )}
                            >
                              {customer.successRate}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">success</span>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${customer.successRate}%` }}
                            />
                            {customer.returnRate > 0 && (
                              <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${customer.returnRate}%` }}
                              />
                            )}
                          </div>

                          {customer.returnRate > 20 && (
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">
                              {customer.returnRate}% Return
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          No delivery data
                        </span>
                      )}
                    </td>

                    {/* Last Active / Recency */}
                    <td className="py-3.5 px-3 align-middle text-muted-foreground">
                      {customer.daysSinceLastOrder !== null ? (
                        <div>
                          <span className="font-medium text-foreground text-xs block">
                            {customer.daysSinceLastOrder === 0
                              ? "Today"
                              : customer.daysSinceLastOrder === 1
                              ? "Yesterday"
                              : `${customer.daysSinceLastOrder}d ago`}
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate" title={customer.lastOrderDate || ""}>
                            {customer.lastOrderDate || ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] italic">Never ordered</span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Call Button */}
                        {customer.phone && (
                          <a
                            href={`tel:${customer.phone}`}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title={`Call ${customer.phone}`}
                          >
                            <PhoneCall className="size-3.5" />
                          </a>
                        )}

                        {/* WhatsApp Button */}
                        {customer.phone && (
                          <a
                            href={`https://wa.me/${phoneClean.startsWith("0") ? "88" + phoneClean : phoneClean}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors"
                            title="WhatsApp Customer"
                          >
                            <Send className="size-3.5" />
                          </a>
                        )}

                        {/* Direct SMS Modal Button */}
                        {customer.phone && (
                          <button
                            type="button"
                            onClick={() => openSingleSmsModal(customer)}
                            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                            title="Send SMS"
                          >
                            <MessageSquare className="size-3.5" />
                          </button>
                        )}

                        {/* Direct 360 View Button */}
                        <Button asChild variant="outline" size="sm" className="h-7 text-xs font-semibold gap-1 hover:border-primary">
                          <Link href={`/dashboard/customers/${customer.id}`}>
                            360 View
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Custom Table Pagination Controls */}
      <div className="p-4 border-t bg-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-16 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <span className="ml-2">
            Showing <strong className="text-foreground">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> -{" "}
            <strong className="text-foreground">{Math.min(currentPage * pageSize, sortedData.length)}</strong> of{" "}
            <strong className="text-foreground">{sortedData.length}</strong> customers
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium mr-2">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(1)}
            disabled={currentPage <= 1}
            className="size-8"
            title="First page"
          >
            <ChevronsLeft className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="size-8"
            title="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="size-8"
            title="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="size-8"
            title="Last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* 6. Single Customer SMS Modal */}
      <Dialog open={isSmsOpen} onOpenChange={setIsSmsOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSendSingleSms} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" />
                <span>Send SMS to {activeCustomerForSms?.name}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Direct SMS dispatch via FastSMS BD gateway to <strong>{activeCustomerForSms?.phone}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Message Content</Label>
              <Textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type SMS message..."
                className="text-xs resize-none"
                required
              />
              <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                <span>{smsMessage.length} characters ({Math.ceil(smsMessage.length / 160) || 1} SMS)</span>
                <span>Sender ID: 8809640911546</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSmsOpen(false)}
                disabled={isSendingSms}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSendingSms || !smsMessage.trim()}
                className="text-xs gap-1.5 bg-primary"
              >
                <Send className="size-3.5" />
                {isSendingSms ? "Dispatching SMS..." : "Dispatch SMS"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. Bulk SMS Modal */}
      <Dialog open={isBulkSmsOpen} onOpenChange={setIsBulkSmsOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSendBulkSms} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Send className="size-4 text-primary" />
                <span>Send Bulk SMS to {selectedRowIds.size} Customers</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Broadcast an instant marketing, retention, or follow-up SMS message to all selected customers.
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 rounded-lg border bg-muted/30 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipients:</span>
                <strong className="text-foreground">{selectedRowIds.size} selected</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gateway:</span>
                <span className="font-mono text-foreground">FastSMS BD (Sender ID: 8809640911546)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Broadcast Message</Label>
              <Textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type broadcast message..."
                className="text-xs resize-none"
                required
              />
              <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                <span>{smsMessage.length} characters ({Math.ceil(smsMessage.length / 160) || 1} SMS per recipient)</span>
                <span>Est. total units: {selectedRowIds.size * (Math.ceil(smsMessage.length / 160) || 1)}</span>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBulkSmsOpen(false)}
                disabled={isSendingSms}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSendingSms || !smsMessage.trim()}
                className="text-xs gap-1.5 bg-primary"
              >
                <Send className="size-3.5" />
                {isSendingSms ? "Broadcasting..." : `Send to ${selectedRowIds.size} Customers`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={assignmentIds.length > 0} onOpenChange={(open) => { if (!open && !isAssigning) setAssignmentIds([]); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {assignmentIds.length} CRM customer{assignmentIds.length === 1 ? "" : "s"}</DialogTitle>
            <DialogDescription>Choose a Customer Relationship Manager for the first handover, or a Customer Relationship Agent for customer follow-ups.</DialogDescription>
          </DialogHeader>
          {assignmentOptions?.all_customers && (
            <div className="space-y-2">
              <Label>Assignment type</Label>
              <Select value={assignmentMode} onValueChange={(value: "handover" | "assign") => { setAssignmentMode(value); setRecipientId(""); setAssignmentDepartment("all"); setAssignmentDesignation("all"); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="handover">Customer Relationship Manager</SelectItem>
                  <SelectItem value="assign">Customer Relationship Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={assignmentDepartment} onValueChange={(value) => { setAssignmentDepartment(value); setAssignmentDesignation("all"); setRecipientId(""); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All departments</SelectItem>{departments.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Select value={assignmentDesignation} onValueChange={(value) => { setAssignmentDesignation(value); setRecipientId(""); }}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">All designations</SelectItem>{designations.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="crm-employee-search">Find employee</Label><Input id="crm-employee-search" placeholder="Search employees…" value={assignmentSearch} onChange={(event) => { setAssignmentSearch(event.target.value); setRecipientId(""); }} /></div>
            <div className="space-y-2"><Label>Sort employees by</Label><Select value={assignmentSort} onValueChange={setAssignmentSort}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="name">Name</SelectItem><SelectItem value="department">Department</SelectItem><SelectItem value="designation">Designation</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2">
            <Label>Customer Relationship {assignmentMode === "handover" ? "Manager" : "Agent"}</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger><SelectValue placeholder="Choose employee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {recipients.map((recipient) => <SelectItem key={recipient.id} value={String(recipient.id)}>{recipient.full_name}{[recipient.department, recipient.designation].filter(Boolean).length > 0 ? ` — ${[recipient.department, recipient.designation].filter(Boolean).join(" / ")}` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {recipients.length === 0 && <p className="text-sm text-muted-foreground">No eligible employees. Check their CRM permissions and HR department/reporting setup.</p>}
          {assignmentError && <p role="alert" className="text-sm text-destructive">{assignmentError}</p>}
          <DialogFooter>
            <Button variant="outline" disabled={isAssigning} onClick={() => setAssignmentIds([])}>Cancel</Button>
            <Button disabled={isAssigning || !recipientId} onClick={handleAssignment}>{isAssigning ? "Assigning..." : "Save assignments"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
