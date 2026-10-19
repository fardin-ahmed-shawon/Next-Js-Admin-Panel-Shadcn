"use client";
import { HrmCalendarPage } from "@/components/hrm/hrm-calendar-page";
import { HrmWarnings } from "@/components/hrm/hrm-warnings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function Page() {
  return <div className="space-y-6"><div><h1 className="text-3xl">Notice &amp; Warning</h1><p className="text-sm text-muted-foreground">Manage announcements and employee disciplinary records.</p></div>
    <Tabs defaultValue="notices"><TabsList><TabsTrigger value="notices">Notice</TabsTrigger><TabsTrigger value="warnings">Warning</TabsTrigger></TabsList>
      <TabsContent value="notices" className="pt-4"><HrmCalendarPage section="notices" /></TabsContent>
      <TabsContent value="warnings" className="pt-4"><HrmWarnings /></TabsContent>
    </Tabs></div>;
}
