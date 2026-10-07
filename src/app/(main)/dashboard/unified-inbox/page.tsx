"use client";

import { useCallback, useEffect, useState } from "react";

import { Inbox, LoaderCircle, MessageSquareMore, PlugZap, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import IntegrationHub from "@/components/unified-inbox/IntegrationHub";
import WorkspaceInbox from "@/components/unified-inbox/WorkspaceInbox";

type AccountState = "loading" | "unregistered" | "ready" | "error";

export default function UnifiedInboxPage() {
  const [accountState, setAccountState] = useState<AccountState>("loading");
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);

  const loadAccount = useCallback(async () => {
    setAccountState("loading");
    setError("");

    try {
      const response = await fetch("/api/unified-inbox/account", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unified Inbox could not be loaded.");
      }

      setAccountState(payload.registered ? "ready" : "unregistered");
    } catch (accountError) {
      setError(accountError instanceof Error ? accountError.message : "Unified Inbox could not be loaded.");
      setAccountState("error");
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const registerAccount = async () => {
    setRegistering(true);
    setError("");

    try {
      const response = await fetch("/api/unified-inbox/account", { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unified Inbox account could not be created.");
      }

      setAccountState("ready");
    } catch (registrationError) {
      setError(
        registrationError instanceof Error ? registrationError.message : "Unified Inbox account could not be created.",
      );
    } finally {
      setRegistering(false);
    }
  };

  if (accountState === "loading") {
    return (
      <div className="flex h-[calc(100svh-6rem)] items-center justify-center rounded-2xl border bg-card">
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
          <span>Opening your Unified Inbox…</span>
        </div>
      </div>
    );
  }

  if (accountState === "unregistered" || accountState === "error") {
    return (
      <div className="flex min-h-[calc(100svh-7rem)] items-center justify-center rounded-2xl border bg-gradient-to-br from-indigo-50 via-background to-violet-50 p-6 dark:from-indigo-950/20 dark:to-violet-950/20">
        <div className="w-full max-w-xl rounded-2xl border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            <MessageSquareMore className="size-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Your messages, in one place</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Create the Unified Inbox account for this tenant, then connect Messenger and Instagram and manage every
            customer conversation from Zymerce.
          </p>
          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" /> Tenant isolated
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Inbox className="size-4 text-indigo-600" /> Central inbox
            </span>
          </div>
          {error && <p className="mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div className="mt-7 flex justify-center gap-3">
            {accountState === "error" ? (
              <Button onClick={loadAccount} variant="outline">
                Try again
              </Button>
            ) : (
              <Button onClick={registerAccount} disabled={registering} size="lg">
                {registering ? <LoaderCircle className="animate-spin" /> : <PlugZap />}
                {registering ? "Creating account…" : "Register Now"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-6rem)] min-h-[620px] flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <div>
          <h1 className="font-semibold tracking-tight">Unified Inbox</h1>
          <p className="text-xs text-muted-foreground">
            Messenger, Instagram, and WhatsApp conversations for this tenant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setChannelsOpen(true)}>
            <PlugZap /> Manage Channels
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl">
        <WorkspaceInbox onManageChannels={() => setChannelsOpen(true)} />
      </div>

      <Dialog open={channelsOpen} onOpenChange={setChannelsOpen}>
        <DialogContent className="h-[min(82svh,760px)] max-w-[min(1180px,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-[min(1180px,calc(100vw-2rem))]">
          <DialogHeader className="sr-only">
            <DialogTitle>Manage Unified Inbox channels</DialogTitle>
            <DialogDescription>Connect or disconnect this tenant&apos;s messaging channels.</DialogDescription>
          </DialogHeader>
          <IntegrationHub onChannelChange={() => undefined} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
