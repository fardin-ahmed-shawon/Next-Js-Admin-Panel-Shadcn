import { Carter_One } from "next/font/google";

import {
  AppWindow,
  Archive,
  Award,
  BadgePercent,
  Ban,
  Banknote,
  BookOpenText,
  Briefcase,
  Calendar,
  ChartBar,
  ClipboardList,
  Fingerprint,
  Flag,
  Forklift,
  GalleryHorizontal,
  Gauge,
  GraduationCap,
  History,
  Kanban,
  Key,
  Layers,
  LayoutDashboard,
  LineChart,
  ListTodo,
  Lock,
  LogOut,
  type LucideIcon,
  Mail,
  Medal,
  MessageCircle,
  MessageSquare,
  MessageSquareQuote,
  Package,
  Package2,
  PieChart,
  ReceiptText,
  Settings,
  ShieldAlert,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  SquareArrowUpRight,
  Star,
  Ticket,
  TrendingUp,
  Truck,
  UserCog,
  Users,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  module?: string; // Corresponds to PageAccess keys
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 0,
    label: "Navigation",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard/home",
        icon: LayoutDashboard,
        module: "dashboard",
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: Layers,
        module: "categories",
      },
      {
        title: "Products",
        url: "/dashboard/products",
        icon: Package,
        module: "products",
        subItems: [
          { title: "Add Product", url: "/dashboard/products/add" },
          { title: "All Products", url: "/dashboard/products" },
          { title: "Recommendations", url: "/dashboard/products/recommendations", icon: Sparkles },
        ],
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: ShoppingCart,
        module: "orders",
        subItems: [
          { title: "Create Order", url: "/dashboard/orders/create" },
          { title: "Order Management", url: "/dashboard/orders" },
        ],
      },
      {
        title: "Landing Page",
        url: "/dashboard/landing-pages",
        icon: AppWindow,
        module: "landing_pages",
        subItems: [
          { title: "Create Landing Page", url: "/dashboard/landing-pages/create" },
          { title: "All Landing Pages", url: "/dashboard/landing-pages" },
        ],
      },
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
        module: "customers",
      },
      {
        title: "Accounts",
        url: "/dashboard/accounts",
        icon: ChartBar,
        module: "accounts",
        subItems: [
          { title: "Dashboard", url: "/dashboard/accounts" },
          { title: "Revenue", url: "/dashboard/accounts/revenue" },
          { title: "Expense Categories", url: "/dashboard/accounts/expense-category" },
          { title: "Expenses", url: "/dashboard/accounts/expenses" },
          { title: "Profit & Loss", url: "/dashboard/accounts/profit-loss" },
          { title: "Statements", url: "/dashboard/accounts/statements" },
          { title: "Due", url: "/dashboard/accounts/due" },
          { title: "Refund History", url: "/dashboard/accounts/refund-history" },
        ],
      },
      { title: "Inventory", url: "/dashboard/inventory", icon: Archive, module: "inventory" },
      { title: "Slider", url: "/dashboard/slider", icon: SlidersHorizontal, module: "slider" },
      { title: "Banner", url: "/dashboard/banner", icon: Flag, module: "banner" },
      { title: "Discounts", url: "/dashboard/discounts", icon: BadgePercent, module: "discounts" },
      { title: "Coupons", url: "/dashboard/coupons", icon: Ticket, module: "coupons" },
      { title: "Reviews", url: "/dashboard/reviews", icon: Star, module: "reviews" },
      { title: "Testimonials", url: "/dashboard/testimonials", icon: MessageSquareQuote, module: "testimonials" },
      { title: "Fraud Checker", url: "/dashboard/fraud-checker", icon: ShieldAlert, module: "fraud_checker" },
      {
        title: "Blogs",
        url: "/dashboard/blogs",
        icon: BookOpenText,
        module: "blogs",
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: TrendingUp,
        module: "reports",
        subItems: [
          { title: "Dashboard", url: "/dashboard/reports/dashboard" },
          { title: "Product Report", url: "/dashboard/reports/product" },
          { title: "Order Report", url: "/dashboard/reports/order" },
          { title: "Customer Report", url: "/dashboard/reports/customer" },
          { title: "Employee Report", url: "/dashboard/reports/employee" },
          { title: "Inventory Report", url: "/dashboard/reports/inventory" },
          { title: "Payment Report", url: "/dashboard/reports/payment" },
          { title: "Courier Report", url: "/dashboard/reports/courier" },
          { title: "Parcel Report", url: "/dashboard/reports/parcel" },
        ],
      },
      { title: "Brands", url: "/dashboard/brands", icon: Award, module: "brands" },
      {
        title: "Courier",
        url: "/dashboard/courier",
        icon: Truck,
        module: "courier",
        subItems: [
          { title: "Steadfast", url: "/dashboard/courier/steadfast" },
          { title: "Pathao", url: "/dashboard/courier/pathao" },
          { title: "Parcel Reports", url: "/dashboard/courier/parcel-reports" },
        ],
      },
      { title: "Purchase History", url: "/dashboard/purchase-history", icon: History, module: "history" },
      {
        title: "Roles & Permission",
        url: "/dashboard/roles",
        icon: UserCog,
        module: "roles_and_permission",
        subItems: [
          { title: "Add Role", url: "/dashboard/roles/add" },
          { title: "View Roles", url: "/dashboard/roles" },
        ],
      },
      { title: "Users", url: "/dashboard/users", icon: Users, module: "users" },
      {
        title: "Employee Management",
        url: "/dashboard/employee-management",
        icon: Briefcase,
        module: "employee_management",
        subItems: [
          { title: "Assign Orders", url: "/dashboard/employee-management/assign-orders" },
          { title: "Employee Reports", url: "/dashboard/employee-management/reports" },
        ],
      },
      { title: "Blocklist", url: "/dashboard/blocklist", icon: Ban, module: "blocklist" },
      { title: "Messages", url: "/dashboard/messages", icon: MessageCircle, module: "messages" },
      { title: "Settings", url: "/dashboard/settings", icon: Settings, module: "settings" },
      { title: "Logout", url: "#", icon: LogOut },
    ],
  },
];
