import { fetchClient } from "@/lib/fetch-client";
import * as React from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoles } from "@/hooks/useRoles";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_USERS || "users"}`;

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
  const { roles, loading: rolesLoading } = useRoles();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      full_name: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role_id: formData.get("roleId"),
      password: formData.get("password"),
      status: "active",
    };

    try {
      const response = await fetchClient(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add user.");
      }

      toast.success("User added successfully.");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "An error occurred while adding the user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New User
          </DialogTitle>
          <DialogDescription>Create a new system user and assign their role.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <Field>
            <FieldLabel htmlFor="user-name">Full Name</FieldLabel>
            <FieldContent>
              <Input id="user-name" name="fullName" placeholder="John Doe" required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="user-email">Email Address</FieldLabel>
            <FieldContent>
              <Input id="user-email" name="email" type="email" placeholder="john@example.com" required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="user-phone">Phone Number</FieldLabel>
            <FieldContent>
              <Input id="user-phone" name="phone" placeholder="01700000000" required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="user-role">Role</FieldLabel>
            <FieldContent>
              <Select name="roleId" required disabled={rolesLoading}>
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="user-password">Password</FieldLabel>
            <FieldContent>
              <Input id="user-password" name="password" type="password" placeholder="••••••••" required minLength={8} />
            </FieldContent>
          </Field>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || rolesLoading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
