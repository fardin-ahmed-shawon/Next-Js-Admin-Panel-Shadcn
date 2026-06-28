import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { fetchClient } from "@/lib/fetch-client";

interface GenericContentTabProps {
  title: string;
  description: string;
  fieldKey: string;
}

export function GenericContentTab({ title, description, fieldKey }: GenericContentTabProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}web-contents`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            setContent(res.data[fieldKey] || "");
          }
        } else {
          toast.error(`Failed to load ${title}`);
        }
      } catch (error) {
        console.error(`Error fetching ${title}:`, error);
        toast.error(`An error occurred while loading ${title}`);
      } finally {
        setLoading(false);
      }
    };

    void fetchContent();
  }, [fieldKey, title]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetchClient(`${process.env.NEXT_PUBLIC_API_BASE_URL}web-contents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [fieldKey]: content,
        }),
      });

      const res = await response.json();
      if (response.ok && res.success) {
        toast.success(`${title} updated successfully`);
      } else {
        toast.error(res.message || `Failed to update ${title}`);
      }
    } catch (error) {
      console.error(`Error saving ${title}:`, error);
      toast.error(`An error occurred while saving ${title}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground animate-pulse">Loading {title}...</div>;
  }

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
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="flex justify-end pt-4 pb-8">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
