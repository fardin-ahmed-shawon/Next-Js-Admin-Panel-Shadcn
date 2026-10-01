import {
  AppWindow,
  Archive,
  Award,
  BadgePercent,
  Ban,
  BookOpenText,
  Bot,
  Briefcase,
  ChartBar,
  Flag,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  MessageCircle,
  MessageSquareQuote,
  Package,
  PhoneCall,
  Settings,
  ShieldAlert,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Zap,
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
  module?: string; // Corresponds to PageAccess keys
  className?: string;
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
  className?: string;
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
          { title: "Add Product", url: "/dashboard/products/add", module: "products" },
          { title: "Bundle List", url: "/dashboard/products/bundles", module: "product_bundles" },
          { title: "Create Bundle", url: "/dashboard/products/bundles/create", module: "product_bundles" },
          { title: "All Products", url: "/dashboard/products", module: "products" },
          { title: "AI Recommendations", url: "/dashboard/products/recommendations", module: "product_recommendations" },
          { title: "Variant Attributes", url: "/dashboard/products/attributes", module: "product_attributes" },
          { title: "Home Page Videos", url: "/dashboard/products/homepage-videos", module: "homepage_videos" },
          { title: "Purchase & Procurement", url: "/dashboard/products/procurement", module: "procurement" },
          { title: "Suppliers", url: "/dashboard/suppliers", module: "suppliers" },
        ],
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: ShoppingCart,
        module: "orders",
        subItems: [
          { title: "Create Order", url: "/dashboard/orders/create", module: "create_orders" },
          { title: "Assign Orders", url: "/dashboard/orders/assign-orders", module: "assign_orders" },
          { title: "Packaging Team", url: "/dashboard/orders/packaging", module: "packaging_team" },
          { title: "Pending Returns", url: "/dashboard/orders/pending-return", module: "pending_returns" },
          { title: "Order Management", url: "/dashboard/orders", module: "orders" },
          { title: "Invoice", url: "/dashboard/orders/invoice", module: "invoices" },
          { title: "Incomplete Orders", url: "/dashboard/orders/incomplete", module: "incomplete_orders" },
          { title: "AI Calling Logs", url: "/dashboard/ai-calling-logs", module: "ai_calling_logs", isNew: true }
        ],
      },


      {
        title: "Wholesale Orders",
        url: "/dashboard/orders/wholesale",
        icon: ShoppingCart,
        module: "wholesale_orders",
        subItems: [
          { title: "Order Create", url: "/dashboard/orders/wholesale-create", module: "wholesale_orders", isNew: true },
          { title: "Order History", url: "/dashboard/orders/wholesale", module: "wholesale_orders", isNew: true },
          { title: "Order Due", url: "/dashboard/orders/wholesale/due", module: "wholesale_orders", isNew: true }
        ],
      },

      {
        title: "Landing Page",
        url: "/dashboard/landing-pages",
        icon: AppWindow,
        module: "landing_pages",
        subItems: [
          { title: "Create Landing Page", url: "/dashboard/landing-pages/create", module: "landing_pages_create" },
          { title: "All Landing Pages", url: "/dashboard/landing-pages", module: "landing_pages" },
        ],
      },
      {
        title: "CRM",
        url: "/dashboard/crm",
        icon: Users,
        module: "customers",
        subItems: [
          { title: "Dashboard", url: "/dashboard/crm", module: "customers" },
          { title: "All Customers", url: "/dashboard/customers", module: "customers" },
          { title: "Follow-Ups", url: "/dashboard/crm/follow-ups", module: "customer_followups" },
          { title: "Customer Segmentation", url: "/dashboard/crm/segmentation", module: "customer_segmentation" },
        ],
      },
      // { title: "Auto Calling AI", url: "/dashboard/auto-calling", icon: PhoneCall, module: "auto_calling", comingSoon: true },
      {
        title: "Accounts",
        url: "/dashboard/accounts",
        icon: ChartBar,
        module: "accounts",
        subItems: [
          { title: "Dashboard", url: "/dashboard/accounts", module: "accounts" },
          { title: "Cash In / Cash Out", url: "/dashboard/accounts/capital", module: "capital" },
          { title: "Revenue", url: "/dashboard/accounts/revenue", module: "revenue" },
          { title: "Expense Categories", url: "/dashboard/accounts/expense-category", module: "expense_category" },
          { title: "Expenses", url: "/dashboard/accounts/expenses", module: "expenses" },
          { title: "Profit & Loss", url: "/dashboard/accounts/profit-loss", module: "profit_loss" },
          { title: "Statements", url: "/dashboard/accounts/statements", module: "statements" },
          { title: "Due", url: "/dashboard/accounts/due", module: "due" },
          { title: "Refund History", url: "/dashboard/accounts/refund-history", module: "refund_history", comingSoon: true },
        ],
      },
      { title: "Inventory", url: "/dashboard/inventory", icon: Archive, module: "inventory" },
      { title: "Slider", url: "/dashboard/slider", icon: SlidersHorizontal, module: "slider" },
      { title: "Banner", url: "/dashboard/banner", icon: Flag, module: "banner" },
      { title: "Discounts", url: "/dashboard/discounts", icon: BadgePercent, module: "discounts" },
      { title: "Coupons", url: "/dashboard/coupons", icon: Ticket, module: "coupons" },
      { title: "Flash Sales", url: "/dashboard/flash-sales", icon: Zap, module: "flash_sales" },
      { title: "Reviews", url: "/dashboard/reviews", icon: Star, module: "reviews" },
      { title: "Testimonials", url: "/dashboard/testimonials", icon: MessageSquareQuote, module: "testimonials" },
      { title: "Fraud Checker", url: "/dashboard/fraud-checker", icon: ShieldAlert, module: "fraud_checker" },
      { title: "User Behaviour Logs", url: "/dashboard/user-behaviour-logs", icon: History, module: "user_behaviour_logs" },
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
          { title: "Dashboard", url: "/dashboard/reports/dashboard", module: "reports_dashboard" },
          { title: "Return Reports", url: "/dashboard/reports/returns", module: "order_returns" },
          { title: "Product Report", url: "/dashboard/reports/product", module: "product_report" },
          { title: "Product Percent", url: "/dashboard/reports/product-percent", module: "product_percent" },
          { title: "Customer Report", url: "/dashboard/reports/customer", module: "customer_report" },
          { title: "Supplier Report", url: "/dashboard/reports/supplier", module: "supplier_report" },
          { title: "Employee Report", url: "/dashboard/reports/employee", module: "employee_report" },
          { title: "Upsell Report", url: "/dashboard/reports/upsell", module: "employee_report", isNew: true },
          { title: "Payment Report", url: "/dashboard/reports/payment", module: "payment_report" },
          { title: "Parcel Report", url: "/dashboard/reports/parcel", module: "parcel_report" },
          { title: "Courier Report", url: "/dashboard/reports/courier", module: "courier_report" },
          {
            title: "Inventory Report",
            url: "/dashboard/reports/inventory",
            module: "reports_inventory",
          },
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
          { title: "RedX", url: "/dashboard/courier/redx" },
        ],
      },
      { title: "Purchase History", url: "/dashboard/purchase-history", icon: History, module: "history" },
      {
        title: "HRM & People",
        url: "/dashboard/hrm",
        icon: Briefcase,
        module: "hrm",
        subItems: [
          { title: "Overview", url: "/dashboard/hrm", module: "hrm_overview" },
          { title: "Leaderboard", url: "/dashboard/hrm/leaderboard", isNew: true, module: "hrm_leaderboard" },
          { title: "Dept Performance", url: "/dashboard/hrm/department-performance", isNew: true, module: "hrm_department_performance" },
          { title: "Upsell Tracking", url: "/dashboard/hrm/upsell-report", module: "hrm_upsells" },
          { title: "Peer Tasks", url: "/dashboard/hrm/tasks", isNew: true, module: "hrm_tasks" },
          { title: "Organization Tree", url: "/dashboard/hrm/organization", module: "hrm_org_tree" },
          { title: "Employees", url: "/dashboard/hrm/employees", module: "hrm_employees" },
          { title: "Attendance", url: "/dashboard/hrm/attendance", module: "hrm_attendance" },
          { title: "Salary & Payroll", url: "/dashboard/hrm/salaries", module: "hrm_salaries" },
          { title: "Employee Cash Flow", url: "/dashboard/hrm/cash-flow", isNew: true, module: "hrm_cash_flow" },
          { title: "Loans & Advance", url: "/dashboard/hrm/loans", module: "hrm_loans" },
          { title: "Documents", url: "/dashboard/hrm/documents", module: "hrm_documents" },
          { title: "Resignation & Exit", url: "/dashboard/hrm/exits", module: "hrm_exits" },
          { title: "Self-Service Portal", url: "/dashboard/hrm/self-service", module: "hrm_self_service" },
        ],
      },
      {
        title: "Roles & Permission",
        url: "/dashboard/roles",
        icon: UserCog,
        module: "roles_and_permission",
        subItems: [
          { title: "Add Role", url: "/dashboard/roles/add" },
          { title: "View Roles & Users", url: "/dashboard/roles" },
          { title: "Auto Order", url: "/dashboard/auto-order", module: "auto_order" },
        ],
      },
      { title: "Users", url: "/dashboard/users", icon: Users, module: "users", className: "hidden" },
      { title: "Blocklist", url: "/dashboard/blocklist", icon: Ban, module: "blocklist" },
      { title: "Messages", url: "/dashboard/messages", icon: MessageCircle, module: "messages" },
      // { title: "Feature Control", url: "/dashboard/feature-control", icon: SlidersHorizontal, module: "settings" },
      { title: "Settings", url: "/dashboard/settings", icon: Settings, module: "settings" },
      { title: "Logout", url: "#", icon: LogOut },
    ],
  },
];
