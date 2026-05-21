import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WebsiteInfoTab() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Update Website Information</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Website Name</label>
          <Input defaultValue="Easy Tech" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Address</label>
          <Input defaultValue="Dhaka, Bangladesh" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Inside Delivery Location (Your District Location)</label>
          <Input defaultValue="Dhaka" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Inside Delivery Charge</label>
          <Input defaultValue="80" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Outside Delivery Charge (Outside Of Your District)</label>
          <Input defaultValue="150" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Phone</label>
          <Input defaultValue="01944667441" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">WhatsApp API Number (Remove the first digit '0' from your whatsapp number)</label>
          <Input defaultValue="1944667441" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Messenger Username</label>
          <Input defaultValue="5475678" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Account Number (Mobile Banking)</label>
          <Input defaultValue="01724923068" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input defaultValue="info@dokanxbd.com" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Facebook Link</label>
          <Input defaultValue="#" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Instagram Link</label>
          <Input defaultValue="#" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Twitter Link</label>
          <Input defaultValue="#" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">YouTube Link</label>
          <Input defaultValue="#" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Google Map location</label>
          <Input defaultValue="https://www.google.com/maps/embed?pb=!1m18..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Top Banner Ad Content</label>
          <Input defaultValue="Get 25% off on your purchase! Use this coupon code RKKXSO50PQ on the Checkout Page" />
        </div>
      </div>
      
      <div className="pt-4 pb-8">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
