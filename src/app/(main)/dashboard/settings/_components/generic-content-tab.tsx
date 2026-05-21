import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export function GenericContentTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full max-w-3xl">
      <div>
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Separator />

      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">Content</p>
        <Textarea 
          placeholder={`Enter content for ${title}...`} 
          className="min-h-[300px] resize-y"
        />
      </div>
      
      <div className="flex justify-end pt-4 pb-8">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
