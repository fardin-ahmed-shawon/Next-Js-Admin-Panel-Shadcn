import type * as React from "react";

import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("User added successfully.");
    onOpenChange(false);
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
              <Input id="user-name" placeholder="John Doe" required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="user-email">Email Address</FieldLabel>
            <FieldContent>
              <Input id="user-email" type="email" placeholder="john@example.com" required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="user-phone">Phone Number</FieldLabel>
            <FieldContent>
              <Input id="user-phone" placeholder="01700000000" required />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="user-role">Role</FieldLabel>
            <FieldContent>
              <Select defaultValue="Staff">
                <SelectTrigger id="user-role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="user-password">Password</FieldLabel>
            <FieldContent>
              <Input id="user-password" type="password" placeholder="••••••••" required />
            </FieldContent>
          </Field>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
