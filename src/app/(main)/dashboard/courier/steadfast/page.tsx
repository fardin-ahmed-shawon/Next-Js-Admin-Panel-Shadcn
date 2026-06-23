import { ApiSetupDialog } from "./_components/api-setup-dialog";
import { SteadfastStats } from "./_components/steadfast-stats";
import { SteadfastTable } from "./_components/steadfast-table";
import { ReturnsTable } from "./_components/returns-table";
import { PaymentsTable } from "./_components/payments-table";
import { ReturnedParcelsTable } from "./_components/returned-parcels-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SteadfastPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl tracking-tight">Steadfast Courier</h1>
          <p className="text-muted-foreground text-sm">
            Manage your Steadfast courier orders, shipments, and API configuration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ApiSetupDialog />
        </div>
      </div>

      <SteadfastStats />

      <Tabs defaultValue="parcels" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="parcels">Parcels</TabsTrigger>
          <TabsTrigger value="returned-parcels">Returned Parcels</TabsTrigger>
          <TabsTrigger value="returns">Return Requests</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="parcels" className="mt-0">
          <SteadfastTable />
        </TabsContent>
        <TabsContent value="returned-parcels" className="mt-0">
          <ReturnedParcelsTable />
        </TabsContent>
        <TabsContent value="returns" className="mt-0">
          <ReturnsTable />
        </TabsContent>
        <TabsContent value="payments" className="mt-0">
          <PaymentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
