"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Inbox,
  KeyRound,
  LoaderCircle,
  LogIn,
  LogOut,
  Mail,
  MessageSquareMore,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import IntegrationHub from "@/components/unified-inbox/IntegrationHub";
import WorkspaceInbox from "@/components/unified-inbox/WorkspaceInbox";

type AccountState = "loading" | "unregistered" | "ready" | "error";

export default function UnifiedInboxPage() {
  const { user } = useAuth();
  const [accountState, setAccountState] = useState<AccountState>("loading");
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [customLoginOpen, setCustomLoginOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customPassword, setCustomPassword] = useState("12345678");

  useEffect(() => {
    if (user?.email && !customEmail) {
      setCustomEmail(user.email);
    }
  }, [user?.email, customEmail]);

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
      toast.success("Unified Inbox account registered successfully!");
    } catch (registrationError) {
      setError(
        registrationError instanceof Error ? registrationError.message : "Unified Inbox account could not be created.",
      );
    } finally {
      setRegistering(false);
    }
  };

  const loginAccount = async (credentials?: { email?: string; password?: string }) => {
    setLoggingIn(true);
    setError("");

    try {
      const response = await fetch("/api/unified-inbox/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          ...(credentials?.email ? { email: credentials.email } : {}),
          ...(credentials?.password ? { password: credentials.password } : {}),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not log in to Unified Inbox.");
      }

      setAccountState("ready");
      setCustomLoginOpen(false);
      toast.success("Logged in to Unified Inbox successfully!");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Could not log in to Unified Inbox.",
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const logoutAccount = async () => {
    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/unified-inbox/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });

      if (!response.ok) {
        throw new Error("Could not log out of Unified Inbox.");
      }

      setAccountState("unregistered");
      toast.success("Logged out of Unified Inbox. You can now log in with your existing account.");
    } catch (logoutError) {
      toast.error(logoutError instanceof Error ? logoutError.message : "Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setCustomEmail(email);
    setCustomPassword(pass);
  };

  const renderLoginDialog = () => (
    <Dialog open={customLoginOpen} onOpenChange={setCustomLoginOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="size-5 text-indigo-600" /> Log In to Unified Inbox
          </DialogTitle>
          <DialogDescription>
            Enter the email and password of your existing Unified Inbox account.
          </DialogDescription>
        </DialogHeader>

        {/* Quick fill buttons */}
        <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-xs">
          <p className="font-medium text-muted-foreground">Quick Fill Existing Accounts:</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill("admin@zymerce.com", "password")}
              className="inline-flex items-center gap-1 rounded bg-background px-2 py-1 text-xs font-medium border shadow-xs hover:bg-accent transition-colors"
            >
              <User className="size-3 text-indigo-600" /> admin@zymerce.com (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("user@zymerce.com", "password")}
              className="inline-flex items-center gap-1 rounded bg-background px-2 py-1 text-xs font-medium border shadow-xs hover:bg-accent transition-colors"
            >
              <User className="size-3 text-emerald-600" /> user@zymerce.com (User)
            </button>
            {user?.email && (
              <button
                type="button"
                onClick={() => handleQuickFill(user.email ?? "", "12345678")}
                className="inline-flex items-center gap-1 rounded bg-background px-2 py-1 text-xs font-medium border shadow-xs hover:bg-accent transition-colors"
              >
                <User className="size-3 text-violet-600" /> Store Email (12345678)
              </button>
            )}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginAccount({ email: customEmail, password: customPassword });
          }}
          className="space-y-4 py-1"
        >
          <div className="space-y-1.5">
            <Label htmlFor="custom-inbox-email" className="text-xs flex items-center gap-1.5">
              <Mail className="size-3.5" /> Email
            </Label>
            <Input
              id="custom-inbox-email"
              type="email"
              placeholder="your-email@example.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-inbox-password" className="text-xs flex items-center gap-1.5">
              <KeyRound className="size-3.5" /> Password
            </Label>
            <Input
              id="custom-inbox-password"
              type="password"
              placeholder="••••••••"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground">Default password for registered stores is 12345678, demo is password</p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCustomLoginOpen(false)}
              disabled={loggingIn}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loggingIn}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loggingIn ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              {loggingIn ? "Signing in…" : "Sign In"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

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
          <h1 className="text-2xl font-semibold tracking-tight">Unified Inbox Login & Activation</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Log in to your existing Unified Inbox account, or activate a new one for this store to manage
            Messenger, Instagram, and WhatsApp conversations from one place.
          </p>
          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" /> Multi-channel
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Inbox className="size-4 text-indigo-600" /> Unified Inbox
            </span>
          </div>
          {error && <p className="mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => setCustomLoginOpen(true)}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              <LogIn className="size-4 mr-1.5" /> Log In with Existing Account
            </Button>
            <Button
              onClick={() => loginAccount()}
              disabled={loggingIn || registering}
              variant="outline"
              size="lg"
              className="font-medium"
            >
              {loggingIn ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4 mr-1.5" />}
              {loggingIn ? "Logging in…" : "Quick Store Login"}
            </Button>
            <Button
              onClick={registerAccount}
              disabled={loggingIn || registering}
              variant="outline"
              size="lg"
              className="font-medium"
            >
              {registering ? <LoaderCircle className="size-4 animate-spin" /> : <PlugZap className="size-4 mr-1.5" />}
              {registering ? "Registering…" : "Register New Account"}
            </Button>
            {accountState === "error" && (
              <Button onClick={loadAccount} variant="ghost" size="lg">
                <RefreshCw className="size-4" /> Try again
              </Button>
            )}
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => setCustomLoginOpen(true)}
              className="text-xs text-muted-foreground hover:text-indigo-600 underline underline-offset-4 transition-colors"
            >
              Need to enter custom email & password? Click here
            </button>
          </div>
        </div>

        {renderLoginDialog()}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomLoginOpen(true)}
            title="Log in to an existing or different Unified Inbox account"
          >
            <LogIn className="size-4 mr-1.5" /> Switch Account
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={logoutAccount}
            disabled={loggingOut}
            title="Log out and return to the login screen"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            {loggingOut ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4 mr-1.5" />}
            Log Out
          </Button>
          <Button size="sm" onClick={() => setChannelsOpen(true)}>
            <PlugZap className="size-4 mr-1.5" /> Manage Channels
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

      {renderLoginDialog()}
    </div>
  );
}
