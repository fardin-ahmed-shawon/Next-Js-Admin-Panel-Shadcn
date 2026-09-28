"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, X, Tag, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateCustomerTags } from "@/hooks/useCustomers";

const PRESET_TAGS = [
  "VIP Buyer",
  "High Value",
  "Frequent Buyer",
  "COD Verified",
  "Prompt Payer",
  "Needs Follow-up",
  "Wholesale Interest",
  "Return Risk",
  "Festival Shopper",
];

interface CustomerTagsManagerProps {
  customerId: number | string;
  tags: string[];
  onUpdate: () => void;
}

export function CustomerTagsManager({
  customerId,
  tags = [],
  onUpdate,
}: CustomerTagsManagerProps) {
  const [open, setOpen] = React.useState(false);
  const [newTag, setNewTag] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const activeTags = Array.isArray(tags) ? tags : [];

  const handleAddTag = async (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (activeTags.includes(trimmed)) {
      toast.info("Tag already added.");
      return;
    }

    try {
      setLoading(true);
      const updated = [...activeTags, trimmed];
      await updateCustomerTags(customerId, updated);
      toast.success(`Tag "${trimmed}" added.`);
      setNewTag("");
      setOpen(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to add tag.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    try {
      setLoading(true);
      const updated = activeTags.filter((t) => t !== tagToRemove);
      await updateCustomerTags(customerId, updated);
      toast.success(`Tag "${tagToRemove}" removed.`);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove tag.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="size-3.5" /> CRM Tags
        </span>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-primary">
              <Plus className="size-3" /> Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="space-y-3">
              <div className="text-xs font-semibold">Assign Customer Tag</div>

              <div className="flex items-center gap-1.5">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Custom tag..."
                  className="h-7 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag(newTag);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => handleAddTag(newTag)}
                  disabled={loading || !newTag.trim()}
                >
                  Add
                </Button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Quick Suggestions
                </span>
                <div className="flex flex-wrap gap-1">
                  {PRESET_TAGS.filter((t) => !activeTags.includes(t)).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddTag(preset)}
                      className="text-[11px] bg-muted hover:bg-primary/10 hover:text-primary border rounded px-1.5 py-0.5 transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-7 items-center">
        {activeTags.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">No CRM tags assigned.</span>
        ) : (
          activeTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs pl-2.5 pr-1 py-0.5 gap-1 bg-secondary/80 hover:bg-secondary flex items-center"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={loading}
                className="hover:bg-muted rounded-full p-0.5 text-muted-foreground hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
