import {
  AppWindow,
  Archive,
  Award,
  BadgePercent,
  Ban,
  Banknote,
  BookOpenText,
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
  SquareArrowUpRight,
  Star,
  Ticket,
  TrendingUp,
  Truck,
  UserCog,
  Users,
} from "lucide-react";
import { Carter_One } from "next/font/google";

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
      },
      {
        title: "Categories",
        url: "/dashboard/categories",
        icon: Layers,
      },
      {
        title: "Products",
        url: "/dashboard/products",
        icon: Package,
        subItems: [
          { title: "Add Product", url: "/dashboard/products/add" },
          { title: "All Products", url: "/dashboard/products" },
        ],
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: ShoppingCart,
        subItems: [
          { title: "Create Order", url: "/dashboard/orders/create" },
          { title: "Order Management", url: "/dashboard/orders" },
        ],
      },
      {
        title: "Landing Page",
        url: "/dashboard/landing-pages",
        icon: AppWindow,
        subItems: [
          { title: "Create Landing Page", url: "/dashboard/landing-pages/create" },
          { title: "All Landing Pages", url: "/dashboard/landing-pages" },
        ],
      },
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
        subItems: [
          { title: "All Customers", url: "/dashboard/customers" },
          { title: "Customer Report", url: "/dashboard/customers/report" },
        ],
      },
      { title: "Payments", url: "/dashboard/payments", icon: Banknote },
      {
        title: "Accounts",
        url: "/dashboard/accounts",
        icon: ChartBar,
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
      { title: "Inventory", url: "/dashboard/inventory", icon: Archive },
      { title: "Slider", url: "/dashboard/slider", icon: SlidersHorizontal },
      { title: "Banner", url: "/dashboard/banner", icon: Flag },
      { title: "Discounts", url: "/dashboard/discounts", icon: BadgePercent },
      { title: "Coupons", url: "/dashboard/coupons", icon: Ticket },
      { title: "Reviews", url: "/dashboard/reviews", icon: Star },
      { title: "Testimonials", url: "/dashboard/testimonials", icon: MessageSquareQuote },
      { title: "Fraud Checker", url: "/dashboard/fraud-checker", icon: ShieldAlert },
      {
        title: "Blogs",
        url: "/dashboard/blogs",
        icon: BookOpenText,
      },
      { title: "Sales Reports", url: "/dashboard/sales-reports", icon: TrendingUp },
      { title: "Brands", url: "/dashboard/brands", icon: Award },
      {
        title: "Courier",
        url: "/dashboard/courier",
        icon: Truck,
        subItems: [
          { title: "Steadfast", url: "/dashboard/courier/steadfast" },
          { title: "Pathao", url: "/dashboard/courier/pathao" },
          { title: "Parcel Reports", url: "/dashboard/courier/parcel-reports" },
        ],
      },
      { title: "Purchase History", url: "/dashboard/purchase-history", icon: History },
      {
        title: "Roles & Permission",
        url: "/dashboard/roles",
        icon: UserCog,
        subItems: [
          { title: "Add Role", url: "/dashboard/roles/add" },
          { title: "View Roles", url: "/dashboard/roles" },
        ],
      },
      { title: "Users", url: "/dashboard/users", icon: Users },
      { title: "Blocklist", url: "/dashboard/blocklist", icon: Ban },
      { title: "Messages", url: "/dashboard/messages", icon: MessageCircle },
      { title: "Settings", url: "/dashboard/settings", icon: Settings },
      { title: "Login", url: "/auth/v2/login", icon: Fingerprint, newTab: true },
      { title: "Logout", url: "#", icon: LogOut },
    ],
  }
];
