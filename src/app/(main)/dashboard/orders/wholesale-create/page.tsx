import { CreateOrderForm } from "../create/_components/create-order-form";

export const metadata = {
  title: "Create Wholesale Order",
};

export default function WholesaleCreateOrderPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <CreateOrderForm isWholesale />
    </div>
  );
}
