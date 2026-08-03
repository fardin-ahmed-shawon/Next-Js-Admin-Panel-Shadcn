"use client";

import * as React from "react";

import { Loader2, Palette, Plus, Ruler, Search, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useAttributes, { type ColorAttribute, type SizeAttribute } from "@/hooks/useAttributes";
import { useModularFeatures } from "@/hooks/useModularFeatures";

export default function VariantAttributesPage() {
  const { features } = useModularFeatures();
  const { colors, sizes, loading, error, createColor, createSize, updateColor, deleteColor, updateSize, deleteSize } = useAttributes();

  // Color inputs state
  const [colorLabel, setColorLabel] = React.useState("");
  const [colorHex, setColorHex] = React.useState("#3b82f6");
  const [isSubmittingColor, setIsSubmittingColor] = React.useState(false);
  const [colorSearch, setColorSearch] = React.useState("");

  // Edit Color state
  const [editingColor, setEditingColor] = React.useState<ColorAttribute | null>(null);
  const [editColorLabel, setEditColorLabel] = React.useState("");
  const [editColorHex, setEditColorHex] = React.useState("");
  const [isUpdatingColor, setIsUpdatingColor] = React.useState(false);
  const [colorToDelete, setColorToDelete] = React.useState<ColorAttribute | null>(null);

  // Size inputs state
  const [sizeLabel, setSizeLabel] = React.useState("");
  const [isSubmittingSize, setIsSubmittingSize] = React.useState(false);
  const [sizeSearch, setSizeSearch] = React.useState("");

  // Edit Size state
  const [editingSize, setEditingSize] = React.useState<SizeAttribute | null>(null);
  const [editSizeLabel, setEditSizeLabel] = React.useState("");
  const [isUpdatingSize, setIsUpdatingSize] = React.useState(false);
  const [sizeToDelete, setSizeToDelete] = React.useState<SizeAttribute | null>(null);

  // Handle color form submit
  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colorLabel.trim()) {
      toast.error("Color name is required");
      return;
    }
    if (!colorHex.match(/^#[0-9A-Fa-f]{6}$/)) {
      toast.error("Valid hex color (e.g., #3b82f6) is required");
      return;
    }

    try {
      setIsSubmittingColor(true);
      await createColor({
        label: colorLabel.trim(),
        hex_value: colorHex,
      });
      toast.success(`Color "${colorLabel}" added successfully!`);
      setColorLabel("");
      setColorHex("#3b82f6");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to add color";
      toast.error(message);
    } finally {
      setIsSubmittingColor(false);
    }
  };

  const handleUpdateColor = async () => {
    if (!editingColor?.id) return;
    if (!editColorLabel.trim()) {
      toast.error("Color name is required");
      return;
    }
    if (!editColorHex.match(/^#[0-9A-Fa-f]{6}$/)) {
      toast.error("Valid hex color (e.g., #3b82f6) is required");
      return;
    }

    try {
      setIsUpdatingColor(true);
      await updateColor(editingColor.id, {
        label: editColorLabel.trim(),
        hex_value: editColorHex,
      });
      toast.success("Color updated successfully!");
      setEditingColor(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update color");
    } finally {
      setIsUpdatingColor(false);
    }
  };

  const handleDeleteColor = async () => {
    if (!colorToDelete?.id) return;
    try {
      setIsUpdatingColor(true);
      await deleteColor(colorToDelete.id);
      toast.success("Color deleted successfully!");
      setColorToDelete(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete color");
    } finally {
      setIsUpdatingColor(false);
    }
  };

  // Handle size form submit
  const handleAddSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeLabel.trim()) {
      toast.error("Size label is required");
      return;
    }

    try {
      setIsSubmittingSize(true);
      await createSize({
        label: sizeLabel.trim(),
      });
      toast.success(`Size "${sizeLabel}" added successfully!`);
      setSizeLabel("");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to add size";
      toast.error(message);
    } finally {
      setIsSubmittingSize(false);
    }
  };

  const handleUpdateSize = async () => {
    if (!editingSize?.id) return;
    if (!editSizeLabel.trim()) {
      toast.error("Size label is required");
      return;
    }

    try {
      setIsUpdatingSize(true);
      await updateSize(editingSize.id, {
        label: editSizeLabel.trim(),
      });
      toast.success("Size updated successfully!");
      setEditingSize(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update size");
    } finally {
      setIsUpdatingSize(false);
    }
  };

  const handleDeleteSize = async () => {
    if (!sizeToDelete?.id) return;
    try {
      setIsUpdatingSize(true);
      await deleteSize(sizeToDelete.id);
      toast.success("Size deleted successfully!");
      setSizeToDelete(null);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete size");
    } finally {
      setIsUpdatingSize(false);
    }
  };

  // Filter colors and sizes by local search
  const filteredColors = React.useMemo(() => {
    if (!colors) return [];
    return colors.filter(
      (c: ColorAttribute) =>
        c.label?.toLowerCase().includes(colorSearch.toLowerCase()) ||
        c.hex_value?.toLowerCase().includes(colorSearch.toLowerCase()),
    );
  }, [colors, colorSearch]);

  const filteredSizes = React.useMemo(() => {
    if (!sizes) return [];
    return sizes.filter((s: SizeAttribute) => s.label?.toLowerCase().includes(sizeSearch.toLowerCase()));
  }, [sizes, sizeSearch]);

  if (features && (features.variant_management === false || String(features.variant_management) === "0")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Palette className="size-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Feature Disabled</h1>
        <p className="text-muted-foreground">The Variant Management module is currently disabled.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="font-medium text-3xl tracking-tight">Variant Attributes</h1>
        <p className="text-muted-foreground text-sm">
          Configure global product variation dimensions such as colors and sizes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Colors management card */}
        <Card className="flex flex-col border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="size-5 text-primary" />
                Colors
              </CardTitle>
              <CardDescription>Add and manage colors for your product variants.</CardDescription>
            </div>
            <Badge variant="secondary" className="px-2.5 py-0.5">
              {colors?.length || 0} Total
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6">
            <form onSubmit={handleAddColor} className="space-y-4">
              <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
                <div className="space-y-1.5 sm:col-span-6">
                  <Label htmlFor="color-name">Color Name</Label>
                  <Input
                    id="color-name"
                    placeholder="e.g. Navy Blue"
                    value={colorLabel}
                    onChange={(e) => setColorLabel(e.target.value)}
                    disabled={isSubmittingColor}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-4">
                  <Label htmlFor="color-hex">Hex Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color-hex"
                      type="text"
                      placeholder="#000000"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      disabled={isSubmittingColor}
                      className="font-mono uppercase"
                    />
                    <div className="relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        disabled={isSubmittingColor}
                        className="absolute inset-0 size-full cursor-pointer opacity-0"
                      />
                      <div className="size-full" style={{ backgroundColor: colorHex }} />
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingColor}
                    className="flex w-full items-center justify-center gap-1.5"
                  >
                    {isSubmittingColor ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <Separator />

            <div className="flex flex-1 flex-col space-y-3">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search colors..."
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[280px] rounded-md border bg-muted/10 p-4">
                {loading ? (
                  <div className="flex h-full items-center justify-center gap-2 py-8 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading colors...</span>
                  </div>
                ) : error ? (
                  <div className="py-8 text-center text-destructive text-sm">Failed to load colors.</div>
                ) : filteredColors.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    {colorSearch ? "No colors match your search." : "No colors created yet."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredColors.map((color: ColorAttribute) => (
                      <div
                        key={color.id ?? color.label}
                        className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-2.5 shadow-xs transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="size-7 shrink-0 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: color.hex_value ?? "#cccccc" }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-sm">{color.label}</p>
                            <p className="truncate font-mono text-muted-foreground text-xs uppercase">
                              {color.hex_value}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-8" 
                            onClick={() => {
                              setEditingColor(color);
                              setEditColorLabel(color.label);
                              setEditColorHex(color.hex_value || "#000000");
                            }}
                          >
                            <Edit className="size-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => setColorToDelete(color)}>
                            <Trash className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Sizes management card */}
        <Card className="flex flex-col border border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Ruler className="size-5 text-primary" />
                Sizes
              </CardTitle>
              <CardDescription>Add and manage sizes for your product variants.</CardDescription>
            </div>
            <Badge variant="secondary" className="px-2.5 py-0.5">
              {sizes?.length || 0} Total
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-6">
            <div className="rounded-md bg-blue-50 dark:bg-blue-950/40 p-3.5 border border-blue-100 dark:border-blue-900/50">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong className="font-semibold mr-1">Pro Tip:</strong> 
                If you create a size label in the format like <span className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-xs">'1 Piece'</span>, <span className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-xs">'2 Piece'</span>, etc., the inventory will automatically detect the number and reduce stock by exactly 1 Unit, 2 Units, etc.
              </p>
            </div>
            <form onSubmit={handleAddSize} className="space-y-4">
              <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
                <div className="space-y-1.5 sm:col-span-10">
                  <Label htmlFor="size-label">Size Label</Label>
                  <Input
                    id="size-label"
                    placeholder="e.g. XL, XXL, 32, 44"
                    value={sizeLabel}
                    onChange={(e) => setSizeLabel(e.target.value)}
                    disabled={isSubmittingSize}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingSize}
                    className="flex w-full items-center justify-center gap-1.5"
                  >
                    {isSubmittingSize ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <Separator />

            <div className="flex flex-1 flex-col space-y-3">
              <div className="relative">
                <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search sizes..."
                  value={sizeSearch}
                  onChange={(e) => setSizeSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-[280px] rounded-md border bg-muted/10 p-4">
                {loading ? (
                  <div className="flex h-full items-center justify-center gap-2 py-8 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Loading sizes...</span>
                  </div>
                ) : error ? (
                  <div className="py-8 text-center text-destructive text-sm">Failed to load sizes.</div>
                ) : filteredSizes.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    {sizeSearch ? "No sizes match your search." : "No sizes created yet."}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {filteredSizes.map((size: SizeAttribute) => (
                      <Badge
                        key={size.id ?? size.label}
                        variant="outline"
                        className="group relative border bg-card pl-3.5 pr-2 py-1.5 font-medium text-sm shadow-xs transition-colors hover:bg-muted/40"
                      >
                        <span className="mr-6">{size.label}</span>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-5 rounded-full" 
                            onClick={(e) => {
                              e.preventDefault();
                              setEditingSize(size);
                              setEditSizeLabel(size.label);
                            }}
                          >
                            <Edit className="size-3 text-muted-foreground" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-5 rounded-full" 
                            onClick={(e) => {
                              e.preventDefault();
                              setSizeToDelete(size);
                            }}
                          >
                            <Trash className="size-3 text-destructive" />
                          </Button>
                        </div>
                      </Badge>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Color Dialog */}
      <Dialog open={!!editingColor} onOpenChange={(open) => !open && setEditingColor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Color</DialogTitle>
            <DialogDescription>Update the details for this color variant.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label>Color Name</Label>
              <Input
                value={editColorLabel}
                onChange={(e) => setEditColorLabel(e.target.value)}
                disabled={isUpdatingColor}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hex Code</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={editColorHex}
                  onChange={(e) => setEditColorHex(e.target.value)}
                  disabled={isUpdatingColor}
                  className="font-mono uppercase"
                />
                <div className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
                  <input
                    type="color"
                    value={editColorHex}
                    onChange={(e) => setEditColorHex(e.target.value)}
                    disabled={isUpdatingColor}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                  />
                  <div className="size-full" style={{ backgroundColor: editColorHex }} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingColor(null)} disabled={isUpdatingColor}>Cancel</Button>
            <Button onClick={handleUpdateColor} disabled={isUpdatingColor}>
              {isUpdatingColor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Color Dialog */}
      <Dialog open={!!colorToDelete} onOpenChange={(open) => !open && setColorToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Color</DialogTitle>
            <DialogDescription>Are you sure you want to delete the color "{colorToDelete?.label}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColorToDelete(null)} disabled={isUpdatingColor}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteColor} disabled={isUpdatingColor}>
              {isUpdatingColor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Size Dialog */}
      <Dialog open={!!editingSize} onOpenChange={(open) => !open && setEditingSize(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Size</DialogTitle>
            <DialogDescription>Update the label for this size variant.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label>Size Label</Label>
              <Input
                value={editSizeLabel}
                onChange={(e) => setEditSizeLabel(e.target.value)}
                disabled={isUpdatingSize}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSize(null)} disabled={isUpdatingSize}>Cancel</Button>
            <Button onClick={handleUpdateSize} disabled={isUpdatingSize}>
              {isUpdatingSize && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Size Dialog */}
      <Dialog open={!!sizeToDelete} onOpenChange={(open) => !open && setSizeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Size</DialogTitle>
            <DialogDescription>Are you sure you want to delete the size "{sizeToDelete?.label}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSizeToDelete(null)} disabled={isUpdatingSize}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSize} disabled={isUpdatingSize}>
              {isUpdatingSize && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
