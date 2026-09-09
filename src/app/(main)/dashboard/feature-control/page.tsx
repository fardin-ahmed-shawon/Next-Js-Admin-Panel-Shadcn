"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Search } from "lucide-react";
import { useModularFeatures, type ModularFeaturesData } from "@/hooks/useModularFeatures";
import { fetchClient } from "@/lib/fetch-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function FeatureControlPage() {
  const { configuredFeatures, catalog, isLoading, isError, mutate } = useModularFeatures();
  const { user } = useAuth();
  const [draft, setDraft] = useState<ModularFeaturesData | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => {
    if (configuredFeatures && !dirty) setDraft(configuredFeatures);
  }, [configuredFeatures, dirty]);
  if (user?.role?.role_name !== "Admin") return <p>Only administrators can manage feature controls.</p>;
  if (isError)
    return (
      <div className="space-y-3 p-8">
        <p>Unable to load feature controls.</p>
        <Button onClick={() => mutate()}>Retry</Button>
      </div>
    );
  if (isLoading || !draft || !catalog) return <p className="p-8">Loading feature controls...</p>;
  const groups = [...new Set(Object.values(catalog).map((item) => item.group))];
  function update(key: string, value: boolean | number | null) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setDirty(true);
  }
  function enabled(key: string): boolean {
    return !!draft?.[key] && (catalog?.[key]?.dependencies ?? []).every(enabled);
  }
  async function save() {
    setSaving(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1/admin/";
      const response = await fetchClient(base + "modular-features", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          String(Object.values(result.errors ?? {}).flat()[0] ?? result.message ?? "Unable to save features"),
        );
      await mutate(result, false);
      setDraft(result.data);
      setDirty(false);
      toast.success("Feature controls saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save features");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Feature Control</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Control modules across the admin panel, storefront and APIs. Save changes to apply them.
          </p>
        </div>
        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        Turning a module off hides its controls and blocks its operations. Existing records and saved settings are
        retained. A dependent feature remains inactive while its required module is off.
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search features or connected pages..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <fieldset disabled={saving} className="grid gap-6 xl:grid-cols-2">
        {groups.map((group) => {
          const entries = Object.entries(catalog).filter(
            ([, item]) =>
              item.group === group &&
              (item.label + " " + item.paths.join(" ")).toLowerCase().includes(search.toLowerCase()),
          );
          if (!entries.length) return null;
          return (
            <Card key={group}>
              <CardHeader className="border-b">
                <CardTitle>{group}</CardTitle>
              </CardHeader>
              <CardContent className="divide-y px-5">
                {entries.map(([key, definition]) => {
                  const blockedBy = definition.dependencies.filter((parent) => !enabled(parent));
                  return (
                    <div key={key} className="flex items-start justify-between gap-4 py-4">
                      <div className="min-w-0 space-y-1.5">
                        <Label htmlFor={key} className="cursor-pointer font-medium">
                          {definition.label}
                        </Label>
                        {definition.paths.length > 0 && (
                          <p className="break-words text-xs text-muted-foreground">
                            {definition.paths.map((path) => path.replace("/dashboard/", "")).join(" · ")}
                          </p>
                        )}
                        {definition.dependencies.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Requires:{" "}
                            {definition.dependencies.map((parent) => catalog[parent]?.label ?? parent).join(", ")}
                          </p>
                        )}
                        {!!draft[key] && blockedBy.length > 0 && (
                          <p className="text-xs text-amber-700 dark:text-amber-400">
                            Inactive until the required module is enabled.
                          </p>
                        )}
                      </div>
                      <Switch id={key} checked={!!draft[key]} onCheckedChange={(value) => update(key, value)} />
                    </div>
                  );
                })}
                {group === "Employees & Roles" && (
                  <div className="space-y-2 py-4">
                    <Label htmlFor="max-users">Max Users (Role Based Access)</Label>
                    <Input
                      id="max-users"
                      type="number"
                      min={1}
                      value={draft.role_based_access_max_users ?? ""}
                      onChange={(event) =>
                        update(
                          "role_based_access_max_users",
                          event.target.value === "" ? null : Number(event.target.value),
                        )
                      }
                      placeholder="Leave empty for unlimited"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum total admin-panel user accounts. Existing accounts remain accessible.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </fieldset>
    </div>
  );
}
