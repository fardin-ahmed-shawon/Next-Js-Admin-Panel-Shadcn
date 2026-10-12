import { Truck } from "lucide-react";

export const DELIVERY_SUPPORT_PERMISSIONS = [
  {
    "id": "delivery_support",
    "label": "Delivery Operations & Support (own issues)"
  },
  {
    "id": "delivery_support_create",
    "label": "Raise Delivery Issues",
    "dependsOn": "delivery_support"
  },
  {
    "id": "delivery_support_reporting_team",
    "label": "Reporting Team — View Team Issues",
    "dependsOn": "delivery_support"
  },
  {
    "id": "delivery_support_all",
    "label": "All Issues — Management Access",
    "dependsOn": "delivery_support"
  },
  {
    "id": "delivery_support_assign",
    "label": "Assign Support Handlers",
    "dependsOn": "delivery_support"
  },
  {
    "id": "delivery_support_handle",
    "label": "Handle Assigned Issues",
    "dependsOn": "delivery_support"
  },
  {
    "id": "delivery_support_approve",
    "label": "Approve Resolved Issues",
    "dependsOn": "delivery_support"
  },
  {
    "id": "delivery_support_export",
    "label": "Export Visible Issues",
    "dependsOn": "delivery_support"
  }
].map(item => ({ ...item, icon: Truck }));

export const DELIVERY_SUPPORT_PERMISSION_GROUP = {
  id: "delivery_support", title: "Delivery Operations & Support", icon: Truck,
  items: DELIVERY_SUPPORT_PERMISSIONS,
};
