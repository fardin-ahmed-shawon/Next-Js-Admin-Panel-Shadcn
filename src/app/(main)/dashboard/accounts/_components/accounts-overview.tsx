import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountsOverview() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Level KPIs */}
      <div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
        <div className="grid grid-cols-2 *:data-[slot=card]:rounded-none *:data-[slot=card]:ring-0 [&>*]:border-b [&>*:nth-child(odd)]:border-r md:grid-cols-5 md:[&>*]:border-b-0 md:[&>*:not(:last-child)]:border-r md:[&>*:last-child]:border-r-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">৳3,499,320</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Total COGS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">৳39,500</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-destructive">৳2,074,800</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">৳1,385,020</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">39.6%</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span className="font-medium">৳0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">COGS</span><span className="font-medium">৳0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gross Profit</span><span className="font-medium">৳0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expenses</span><span className="font-medium">৳0</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-medium">Net Profit</span><span className="font-bold">৳0</span></div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span className="font-medium">৳209,337</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">COGS</span><span className="font-medium">৳3,500</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gross Profit</span><span className="font-medium">৳205,837</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expenses</span><span className="font-medium">৳35,000</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-medium">Net Profit</span><span className="font-bold text-emerald-600 dark:text-emerald-500">৳170,837</span></div>
          </CardContent>
        </Card>

        {/* This Year */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Year Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span className="font-medium">৳3,499,320</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">COGS</span><span className="font-medium">৳39,500</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gross Profit</span><span className="font-medium">৳3,459,820</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expenses</span><span className="font-medium">৳2,074,800</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-medium">Net Profit</span><span className="font-bold text-emerald-600 dark:text-emerald-500">৳1,385,020</span></div>
          </CardContent>
        </Card>

        {/* All Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Time Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span className="font-medium">৳3,499,320</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">COGS</span><span className="font-medium">৳39,500</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Gross Profit</span><span className="font-medium">৳3,459,820</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Expenses</span><span className="font-medium">৳2,074,800</span></div>
            <div className="flex justify-between border-t pt-2 mt-2"><span className="font-medium">Net Profit</span><span className="font-bold text-emerald-600 dark:text-emerald-500">৳1,385,020</span></div>
            <div className="pt-2 text-xs text-muted-foreground text-center">Gross Margin: 98.9% · Net Margin: 39.6%</div>
          </CardContent>
        </Card>
      </div>

      {/* Glossary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Understanding the Numbers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="font-medium mb-1">Revenue</p>
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Revenue:</span> Total revenue from paid orders</p>
          </div>
          <div>
            <p className="font-medium mb-1">Cost & Expenses</p>
            <p className="text-muted-foreground"><span className="font-medium text-foreground">COGS:</span> Purchase price × quantity sold</p>
            <p className="text-muted-foreground mt-1"><span className="font-medium text-foreground">Expenses:</span> Rent, salary, utilities, etc.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Profitability</p>
            <p className="text-muted-foreground"><span className="font-medium text-foreground">Gross Profit:</span> Revenue − COGS</p>
            <p className="text-muted-foreground mt-1"><span className="font-medium text-foreground">Net Profit:</span> Gross Profit − Expenses</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
