import {
  Archive,
  Award,
  BadgePercent,
  Ban,
  BookOpenText,
  Bot,
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
          { title: "Add Product", url: "/dashboard/products/add" },

          { title: "All Products", url: "/dashboard/products" },
          { title: "AI Recommendations", url: "/dashboard/products/recommendations" },
          { title: "Create Bundle", url: "/dashboard/products/create-bundle", comingSoon: true },
          { title: "Variant Attributes", url: "/dashboard/products/attributes" },
          { title: "Home Page Videos", url: "/dashboard/products/homepage-videos" },
          { title: "Purchase & Procurement", url: "/dashboard/products/procurement" },
          { title: "Suppliers", url: "/dashboard/suppliers" },
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
          { title: "Order Management", url: "/dashboard/orders", module: "orders" },
          { title: "Invoice", url: "/dashboard/orders/invoice", module: "orders" },
          { title: "Incomplete Orders", url: "/dashboard/orders/incomplete", module: "orders" },
          { title: "AI Calling Logs", url: "/dashboard/ai-calling-logs", module: "orders", isNew: true }
        ],
      },


      {
        title: "Wholesale Orders",
        url: "/dashboard/orders/wholesale",
        icon: ShoppingCart,
        module: "orders",
        subItems: [
          { title: "Order Create", url: "/dashboard/orders/wholesale-create", module: "orders" , isNew: true  },
          { title: "Order History", url: "/dashboard/orders/wholesale", module: "orders" , isNew: true  },
          { title: "Order Due", url: "/dashboard/orders/wholesale/due", module: "orders" , isNew: true  }
        ],
      },

      // {
      //   title: "Landing Page",
      //   url: "/dashboard/landing-pages",
      //   icon: AppWindow,
      //   module: "landing_pages",
      //   subItems: [
      //     { title: "Create Landing Page", url: "/dashboard/landing-pages/create", module: "landing_pages_create" },
      //     { title: "All Landing Pages", url: "/dashboard/landing-pages", module: "landing_pages" },
      //   ],
      // },
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
        module: "customers",
      },
      // { title: "Auto Calling AI", url: "/dashboard/auto-calling", icon: PhoneCall, module: "auto_calling", comingSoon: true },
      {
        title: "Accounts",
        url: "/dashboard/accounts",
        icon: ChartBar,
        module: "accounts",
        subItems: [
          { title: "Dashboard", url: "/dashboard/accounts", module: "accounts" },
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
      { title: "User Behaviour Logs", url: "/dashboard/user-behaviour-logs", icon: History },
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
          { title: "Product Report", url: "/dashboard/reports/product", module: "product_report" },
          { title: "Product Percent", url: "/dashboard/reports/product-percent", module: "product_percent" },
          { title: "Customer Report", url: "/dashboard/reports/customer", module: "customer_report" },
          { title: "Employee Report", url: "/dashboard/reports/employee", module: "employee_report" },
          { title: "Payment Report", url: "/dashboard/reports/payment", module: "payment_report" },
          { title: "Parcel Report", url: "/dashboard/reports/parcel", module: "parcel_report" },
          { title: "Courier Report", url: "/dashboard/reports/courier", module: "courier_report" },
          {
            title: "Inventory Report",
            url: "/dashboard/reports/inventory",
            module: "reports_inventory",
            comingSoon: true,
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
        title: "Roles & Permission",
        url: "/dashboard/roles",
        icon: UserCog,
        module: "roles_and_permission",
        subItems: [
          { title: "Add Role", url: "/dashboard/roles/add" },
          { title: "View Roles & Users", url: "/dashboard/roles" },
          { title: "Auto Order", url: "/dashboard/auto-order" },
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
  {
    id: 1,
    label: "Upcoming AI Features",
    items: [
      { title: "AI Assistant", url: "/dashboard/ai-assistant", icon: Bot, module: "ai_assistant", comingSoon: true },
      {
        title: "AI Auto Calling",
        url: "/dashboard/ai-auto-calling",
        icon: PhoneCall,
        module: "ai_auto_calling",
        comingSoon: true,
      },
      {
        title: "AI Business Copilot",
        url: "/dashboard/ai-business-copilot",
        icon: Sparkles,
        module: "ai_business_copilot",
        comingSoon: true,
      },
      {
        title: "AI Sales Forecasting",
        url: "/dashboard/ai-sales-forecasting",
        icon: TrendingUp,
        module: "ai_sales_forecasting",
        comingSoon: true,
      },
      {
        title: "AI Inventory Assistant",
        url: "/dashboard/ai-inventory-assistant",
        icon: Archive,
        module: "ai_inventory_assistant",
        comingSoon: true,
      },
      {
        title: "AI Customer Support",
        url: "/dashboard/ai-customer-support",
        icon: MessageCircle,
        module: "ai_customer_support_agent",
        comingSoon: true,
      },
    ],
  },
];
