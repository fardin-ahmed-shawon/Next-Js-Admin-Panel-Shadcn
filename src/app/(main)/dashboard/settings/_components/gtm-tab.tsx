"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Code2, HelpCircle, CheckCircle2, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchClient } from "@/lib/fetch-client";

export function GtmTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gtmHead, setGtmHead] = useState("");
  const [gtmBody, setGtmBody] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}web-settings`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            setGtmHead(res.data.gtm_head || "");
            setGtmBody(res.data.gtm_body || "");
          }
        } else {
          toast.error("Failed to load Google Tag Manager settings");
        }
      } catch (error) {
        console.error("Error fetching GTM settings:", error);
        toast.error("An error occurred while loading GTM settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}web-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gtm_head: gtmHead,
          gtm_body: gtmBody,
        }),
      });

      const res = await response.json();
      if (response.ok && res.success) {
        toast.success("Google Tag Manager code updated successfully!");
      } else {
        if (res.errors) {
          const firstError = Object.values(res.errors)[0];
          if (Array.isArray(firstError)) {
            toast.error(firstError[0] || "Failed to update GTM settings");
          } else {
            toast.error("Failed to update GTM settings");
          }
        } else {
          toast.error(res.message || "Failed to update GTM settings");
        }
      }
    } catch (error) {
      console.error("Error saving GTM settings:", error);
      toast.error("An error occurred while saving GTM settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground animate-pulse">
        Loading Google Tag Manager settings...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
      <div className="flex flex-col gap-1.5 border-b pb-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Google Tag Manager (GTM)</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure dynamic Google Tag Manager head and body tracking scripts for your Store-Front.
        </p>
      </div>

      {/* Instruction Card */}
      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <HelpCircle className="h-4 w-4 text-blue-500" />
          <span>How to use Google Tag Manager:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs sm:text-sm pl-1">
          <li>Go to your Google Tag Manager account and click on <strong>Admin &gt; Install Google Tag Manager</strong>.</li>
          <li>Copy the <strong>first code snippet</strong> and paste it into the <strong>GTM Head Code</strong> box below.</li>
          <li>Copy the <strong>second code snippet</strong> and paste it into the <strong>GTM Body Code</strong> box below.</li>
          <li>Click <strong>Save Changes</strong>. The codes will automatically be injected into your Store-Front.</li>
        </ol>
      </div>

      <div className="space-y-6">
        {/* Head Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="gtm-head-input" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>GTM Head Code</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-mono">
                &lt;head&gt;
              </span>
            </label>
            {gtmHead && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Configured
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Paste the script code from Google Tag Manager that belongs as high in the &lt;head&gt; of the page as possible.
          </p>
          <Textarea
            id="gtm-head-input"
            value={gtmHead}
            onChange={(e) => setGtmHead(e.target.value)}
            placeholder={`<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->`}
            className="font-mono text-xs leading-relaxed min-h-[160px] bg-background selection:bg-primary/20"
            rows={8}
            spellCheck={false}
          />
        </div>

        {/* Body Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="gtm-body-input" className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span>GTM Body Code (noscript)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-mono">
                &lt;body&gt;
              </span>
            </label>
            {gtmBody && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Configured
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Paste the noscript snippet from Google Tag Manager that belongs immediately after the opening &lt;body&gt; tag.
          </p>
          <Textarea
            id="gtm-body-input"
            value={gtmBody}
            onChange={(e) => setGtmBody(e.target.value)}
            placeholder={`<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`}
            className="font-mono text-xs leading-relaxed min-h-[120px] bg-background selection:bg-primary/20"
            rows={5}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
        {(gtmHead || gtmBody) && (
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Are you sure you want to clear both GTM Head and Body codes?")) {
                setGtmHead("");
                setGtmBody("");
              }
            }}
            disabled={saving}
          >
            Clear Codes
          </Button>
        )}
      </div>
    </div>
  );
}
