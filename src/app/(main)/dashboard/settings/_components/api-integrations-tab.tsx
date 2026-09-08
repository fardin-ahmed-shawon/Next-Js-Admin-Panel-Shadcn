"use client";

import { useCallback, useEffect, useState } from "react";

import { Copy, KeyRound, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchClient } from "@/lib/fetch-client";

type ProviderState = { values: Record<string, string | boolean>; configured: Record<string, boolean> };
type Field = { key: string; label: string; secret?: boolean; generate?: boolean; placeholder?: string };
type Provider = { id: string; title: string; description: string; environment?: boolean; fields: Field[] };

const providers: Provider[] = [
  {
    id: "sslcommerz",
    title: "SSLCOMMERZ",
    description: "Choose your payment environment and manage each store's credentials.",
    environment: true,
    fields: [
      { key: "sandbox_store_id", label: "Sandbox Store ID" },
      { key: "sandbox_store_password", label: "Sandbox Store Password", secret: true },
      { key: "live_store_id", label: "Live Store ID" },
      { key: "live_store_password", label: "Live Store Password", secret: true },
      { key: "callback_base_url", label: "Store API base URL", placeholder: "https://store-api.example.com/" },
    ],
  },
  {
    id: "fraud_checker",
    title: "Fraud Checker",
    description: "API key used for customer courier-history checks.",
    fields: [{ key: "api_key", label: "API Key", secret: true }],
  },
  {
    id: "pathao",
    title: "Pathao",
    description: "Select the courier environment and authenticate delivery-status webhooks.",
    environment: true,
    fields: [
      { key: "webhook_secret", label: "Webhook Secret", secret: true, generate: true },
      {
        key: "integration_secret",
        label: "X-Pathao-Merchant-Webhook-Integration-Secret",
        secret: true,
        placeholder: "copy from the Pathao Merchant Account",
      },
    ],
  },
  {
    id: "redx",
    title: "RedX",
    description: "Select the courier environment and authenticate delivery-status webhooks.",
    environment: true,
    fields: [{ key: "webhook_secret", label: "Webhook Secret", secret: true, generate: true }],
  },
  {
    id: "orderconfirm",
    title: "Order Confirmation IO",
    description: "Connect AI confirmation calls and receive call results and address updates.",
    fields: [
      { key: "api_key", label: "API Key", secret: true },
      { key: "webhook_secret", label: "Webhook Secret", secret: true, generate: true },
    ],
  },
];

async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Clipboard unavailable. Select and copy the value manually.");
  }
}

function CopyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded-md border bg-background px-3 py-2 text-xs">{value}</code>
        <Button type="button" variant="outline" size="icon" aria-label={"Copy " + label} onClick={() => copy(value)}>
          <Copy className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function SetupGuide({
  provider,
  values,
  webhookUrl,
}: {
  provider: string;
  values: Record<string, string | boolean>;
  webhookUrl?: string;
}) {
  const base = String(values.callback_base_url || "https://YOUR-STORE-API/").replace(/\/+$/, "");
  const sslHost = values.sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
  return (
    <details className="rounded-lg border bg-muted/30 p-4">
      <summary className="cursor-pointer text-sm font-medium">Configuration guide & callback URLs</summary>
      <div className="mt-4 space-y-4 text-sm text-muted-foreground">
        {provider === "sslcommerz" && (
          <>
            <p>
              Enter credentials from your SSLCOMMERZ account for the selected environment. Gateway and validation URLs
              change automatically when you switch environments.
            </p>
            <CopyValue label="Transaction API" value={sslHost + "/gwprocess/v4/api.php"} />
            <CopyValue label="Validation API" value={sslHost + "/validator/api/validationserverAPI.php"} />
            <p>
              Set the public Store API base URL above, including any installation subfolder. Leave it blank to use the
              Store API's existing site URL. Checkout sends these callbacks automatically:
            </p>
            {["success", "fail", "cancel", "ipn"].map((name) => (
              <CopyValue key={name} label={name.toUpperCase() + " callback"} value={base + "/pay/" + name + ".php"} />
            ))}
            <p>Pending payments retain the environment and credentials used when checkout started.</p>
            <a
              className="text-primary underline"
              href="https://developer.sslcommerz.com/doc/v4/index.html"
              target="_blank"
              rel="noreferrer"
            >
              SSLCOMMERZ integration documentation
            </a>
          </>
        )}
        {provider === "fraud_checker" && (
          <p>
            Copy your API key from Fraud Checker and save it here. The key is used for new courier-history lookups;
            existing cached customer reports may still be shown.
          </p>
        )}
        {provider === "pathao" && (
          <>
            <p>
              Save your account credentials in{" "}
              <a className="text-primary underline" href="/dashboard/courier/pathao">
                Courier → Pathao
              </a>
              . Those credentials must match the environment selected above.
            </p>
            <CopyValue label="Pathao webhook URL" value={webhookUrl ?? ""} />
            <p>
              Register this public URL in your Pathao merchant webhook configuration. Set the same webhook secret in
              Pathao and here. Requests must include <code>X-PATHAO-Signature: &lt;Webhook Secret&gt;</code>.
            </p>
            <p>
              The endpoint responds with HTTP 202 and <code>X-Pathao-Merchant-Webhook-Integration-Secret</code>{" "}
              containing the saved value. Copy this value from the Pathao merchant panel and paste it into the matching
              field above.
            </p>
            <p>
              Delivery, partial-delivery, paid-return and returned events update the linked order through the existing
              order and inventory flow.
            </p>
          </>
        )}
        {provider === "redx" && (
          <>
            <p>
              Save your account credentials in{" "}
              <a className="text-primary underline" href="/dashboard/courier/redx">
                Courier → RedX
              </a>{" "}
              and select the matching environment above.
            </p>
            <CopyValue label="RedX webhook URL template" value={(webhookUrl ?? "") + "?token=<Webhook Secret>"} />
            <p>
              Replace <code>&lt;Webhook Secret&gt;</code> with the URL-encoded secret saved here, then register that URL
              with RedX. The endpoint checks the token query parameter before processing JSON status updates.
            </p>
            {!!values.webhook_secret && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copy((webhookUrl ?? "") + "?token=" + encodeURIComponent(String(values.webhook_secret)))}
              >
                Copy URL with newly entered secret
              </Button>
            )}
            <p>
              Supported statuses include ready-for-delivery, delivery-in-progress, delivered and returned. The invoice
              number identifies the order.
            </p>
          </>
        )}
        {provider === "orderconfirm" && (
          <>
            <p>
              Enter the API key issued by Order Confirmation IO. Outgoing confirmation calls use it in the{" "}
              <code>X-API-Key</code> header.
            </p>
            <CopyValue label="Order Confirmation IO webhook URL" value={webhookUrl ?? ""} />
            <p>
              Configure this callback URL with your provider and use{" "}
              <code>Authorization: Bearer &lt;Webhook Secret&gt;</code>. Save the same secret here. The endpoint accepts{" "}
              <code>call.completed</code> and <code>address.changed</code> events.
            </p>
          </>
        )}
        {provider !== "sslcommerz" && provider !== "fraud_checker" && (
          <p>
            Use a public HTTPS URL reachable by the provider. Copy newly generated secrets before saving; saved secrets
            are hidden.
          </p>
        )}
      </div>
    </details>
  );
}

function ProviderCard({
  provider,
  initial,
  webhookUrl,
}: {
  provider: Provider;
  initial: ProviderState;
  webhookUrl?: string;
}) {
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState<Record<string, string | boolean>>(initial.values);
  const [cleared, setCleared] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  function change(key: string, value: string | boolean) {
    setValues((current) => ({ ...current, [key]: value }));
    setCleared((current) => current.filter((field) => field !== key));
    setDirty(true);
  }
  function generate(key: string) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    change(key, Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(""));
  }
  async function save() {
    setSaving(true);
    try {
      const response = await fetchClient(process.env.NEXT_PUBLIC_API_BASE_URL + "integration-settings/" + provider.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values, clear_fields: cleared }),
      });
      const result = await response.json();
      if (!response.ok) {
        const errors = Object.values(result.errors || {}).flat();
        throw new Error(String(errors[0] || result.message || "Could not save configuration"));
      }
      setSaved(result.data);
      setValues(result.data.values);
      setCleared([]);
      setDirty(false);
      toast.success(provider.title + " configuration saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save configuration");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="font-semibold">{provider.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{provider.description}</p>
        </div>
        {dirty && (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-400">
            Unsaved changes
          </span>
        )}
      </div>
      <fieldset disabled={saving} className="space-y-5 p-5">
        {provider.environment && (
          <div className="space-y-2">
            <Label htmlFor={provider.id + "-environment"}>Environment</Label>
            <select
              id={provider.id + "-environment"}
              className="flex h-10 w-full rounded-md border bg-background px-3 text-sm sm:w-64"
              value={values.sandbox ? "sandbox" : "live"}
              onChange={(event) => change("sandbox", event.target.value === "sandbox")}
            >
              <option value="sandbox">Sandbox / testing</option>
              <option value="live">Live / production</option>
            </select>
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          {provider.fields.map((field) => {
            const id = provider.id + "-" + field.key;
            const removed = cleared.includes(field.key);
            return (
              <div
                key={field.key}
                className={"space-y-2 " + (field.key === "callback_base_url" ? "md:col-span-2" : "")}
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <Label htmlFor={id}>{field.label}</Label>
                  {field.secret && (
                    <span className="text-xs text-muted-foreground">
                      {removed
                        ? "Will be removed on save"
                        : saved.configured[field.key]
                          ? "Configured"
                          : "Not configured"}
                    </span>
                  )}
                </div>
                <Input
                  id={id}
                  type={field.secret ? "password" : "text"}
                  autoComplete="off"
                  spellCheck={false}
                  value={String(values[field.key] ?? "")}
                  disabled={removed}
                  placeholder={
                    removed
                      ? "Removed on save"
                      : field.placeholder ||
                        (field.secret && saved.configured[field.key]
                          ? "Leave blank to keep saved value"
                          : "Enter " + field.label.toLowerCase())
                  }
                  onChange={(event) => change(field.key, event.target.value)}
                />
                {field.secret && (
                  <div className="flex flex-wrap items-center gap-3">
                    {field.generate && (
                      <button
                        className="text-xs text-primary underline disabled:opacity-50"
                        type="button"
                        onClick={() => generate(field.key)}
                      >
                        Generate secret
                      </button>
                    )}
                    {!!values[field.key] && (
                      <button
                        className="text-xs text-primary underline"
                        type="button"
                        onClick={() => copy(String(values[field.key]))}
                      >
                        Copy new value
                      </button>
                    )}
                    {saved.configured[field.key] && (
                      <button
                        className="text-xs text-destructive underline"
                        type="button"
                        onClick={() => {
                          setCleared((current) =>
                            removed ? current.filter((key) => key !== field.key) : [...current, field.key],
                          );
                          setValues((current) => ({ ...current, [field.key]: "" }));
                          setDirty(true);
                        }}
                      >
                        {removed ? "Undo removal" : "Remove saved value"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <SetupGuide provider={provider.id} values={values} webhookUrl={webhookUrl} />
        <div className="flex justify-end">
          <Button type="button" disabled={saving || !dirty} onClick={save}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {saving ? "Saving..." : "Save configuration"}
          </Button>
        </div>
      </fieldset>
    </section>
  );
}

export function ApiIntegrationsTab() {
  const [data, setData] = useState<{
    providers: Record<string, ProviderState>;
    webhook_urls: Record<string, string>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetchClient(process.env.NEXT_PUBLIC_API_BASE_URL + "integration-settings", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unable to load integrations");
      const result = await response.json();
      setData(result.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  if (loading) return <p className="py-12 text-center text-muted-foreground">Loading integration settings...</p>;
  if (error || !data)
    return (
      <div className="space-y-3 rounded-lg border p-6">
        <p>Unable to load integration settings.</p>
        <Button variant="outline" onClick={load}>
          Try again
        </Button>
      </div>
    );
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <KeyRound className="size-5" />
          API Integrations
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage payment, courier, fraud-checking and AI confirmation credentials.
        </p>
      </div>
      <div className="flex gap-3 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-5 shrink-0" />
        <p>
          Secrets are encrypted and hidden after saving. Leave a secret blank to keep its current value. Changes apply
          to new requests after you save each configuration.
        </p>
      </div>
      {providers.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          initial={data.providers[provider.id]}
          webhookUrl={data.webhook_urls[provider.id]}
        />
      ))}
    </div>
  );
}
