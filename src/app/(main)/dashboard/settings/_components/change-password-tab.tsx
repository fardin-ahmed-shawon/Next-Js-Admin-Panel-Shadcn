import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function ChangePasswordTab() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
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
          <Input type="password" placeholder="••••••••" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">New Password</p>
        </div>
        <div className="w-full md:w-[450px]">
          <Input type="password" placeholder="••••••••" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Confirm Password</p>
        </div>
        <div className="w-full md:w-[450px]">
          <Input type="password" placeholder="••••••••" />
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-8">
        <Button>Update Password</Button>
      </div>
    </div>
  );
}
