import * as React from "react";
import { UserCog } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoles } from "@/hooks/useRoles";
import { User } from "@/hooks/useUsers";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}${process.env.NEXT_PUBLIC_API_USERS || "users"}`;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function EditUserDialog({ open, onOpenChange, user, onSuccess }: EditUserDialogProps) {
  const { roles, loading: rolesLoading } = useRoles();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {
      full_name: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      role_id: formData.get("roleId"),
    };

    const password = formData.get("password");
    if (password && (password as string).trim() !== "") {
      data.password = password;
    }

    try {
      const response = await fetch(`${API_URL}/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user.");
      }

      toast.success("User updated successfully.");
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating the user.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <UserCog className="h-5 w-5 text-primary" />
            Edit User
          </DialogTitle>
          <DialogDescription>Update details for {user.full_name}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <Field>
            <FieldLabel htmlFor="edit-user-name">Full Name</FieldLabel>
            <FieldContent>
              <Input id="edit-user-name" name="fullName" defaultValue={user.full_name} required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-user-email">Email Address</FieldLabel>
            <FieldContent>
              <Input id="edit-user-email" name="email" type="email" defaultValue={user.email} required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-user-phone">Phone Number</FieldLabel>
            <FieldContent>
              <Input id="edit-user-phone" name="phone" defaultValue={user.phone} required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-user-role">Role</FieldLabel>
            <FieldContent>
              <Select name="roleId" defaultValue={user.role_id.toString()} required disabled={rolesLoading}>
                <SelectTrigger id="edit-user-role" className="w-full">
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
            <FieldLabel htmlFor="edit-user-password">Password</FieldLabel>
            <FieldContent>
              <Input 
                id="edit-user-password" 
                name="password" 
                type="password" 
                placeholder="Leave blank to keep current" 
                minLength={8} 
              />
            </FieldContent>
          </Field>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || rolesLoading}>
              {loading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
