import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function ChangeLogoTab() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Change Website Logo</h3>
        <p className="text-sm text-muted-foreground mt-1">Update your company logo displayed across the site.</p>
      </div>
      <Separator />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        {/* Logo Preview Area */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Current Logo Preview</p>
          <div className="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/30 overflow-hidden">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <span className="text-xs mt-2">No Logo Uploaded</span>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Upload New Logo</p>
            <p className="text-sm text-muted-foreground">Recommend size: 256x256px. Max size: 2MB.</p>
          </div>
          <Input type="file" className="cursor-pointer file:cursor-pointer" accept="image/*" />
        </div>
      </div>
      
      <div className="flex justify-end pt-4 pb-8">
        <Button>Save Logo</Button>
      </div>
    </div>
  );
}
