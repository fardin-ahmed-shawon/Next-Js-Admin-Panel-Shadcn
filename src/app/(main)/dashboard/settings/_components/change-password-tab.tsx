import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { fetchClient } from "@/lib/fetch-client";

export function ChangePasswordTab() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("User session not found.");
      return;
    }

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}users/${user.id}`;
      const response = await fetchClient(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      const res = await response.json();

      if (response.ok && res.success) {
        toast.success("Password updated successfully.");
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleUpdatePassword} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
      <div>
        <h3 className="text-lg font-medium text-foreground">Change Password</h3>
        <p className="text-sm text-muted-foreground">
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>
      <Separator />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Current Password</p>
        </div>
        <div className="w-full md:w-[450px]">
          <Input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">New Password</p>
        </div>
        <div className="w-full md:w-[450px]">
          <Input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Confirm Password</p>
        </div>
        <div className="w-full md:w-[450px]">
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-8">
        <Button type="submit" disabled={saving}>
          {saving ? "Updating Password..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
}
