"use client";

import * as React from "react";
import {
  CirclePlus,
  Eye,
  Trash2,
  Package,
  Check,
  Ban,
  Settings2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import useAttributes from "@/hooks/useAttributes";

export interface Variant {
  id: string;
  color: string;
  size: string;
  sku: string;
  stock: string;
  purchasePrice?: string;
  regularPrice?: string;
  sellingPrice?: string;
}

interface ProductVariantsSectionProps {
  hasVariantWisePricing: boolean;
  variants: Variant[];
  setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;
  baseSku: string;
  hidePurchasePrice?: boolean;
  disableStockEdit?: boolean;
}

const generateSKU = () => "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase();

export function ProductVariantsSection({
  hasVariantWisePricing,
  variants,
  setVariants,
  baseSku,
  hidePurchasePrice = false,
  disableStockEdit = false,
}: ProductVariantsSectionProps) {
  const { colors: availableColors, sizes: availableSizes } = useAttributes();

  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedColors, setSelectedColors] = React.useState<string[]>([]);

  // Bulk action states
  const [bulkPurchasePrice, setBulkPurchasePrice] = React.useState("");
  const [bulkRegularPrice, setBulkRegularPrice] = React.useState("");
  const [bulkSellingPrice, setBulkSellingPrice] = React.useState("");
  const [bulkStock, setBulkStock] = React.useState("");

  // Table state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  const [selectedVariantIds, setSelectedVariantIds] = React.useState<Set<string>>(new Set());

  // Derive combinations when selected sizes/colors change
  const handleGenerateCombinations = () => {
    const newVariants: Variant[] = [];
    
    // If both empty, no variants
    if (selectedSizes.length === 0 && selectedColors.length === 0) {
      setVariants([]);
      return;
    }

    const sizes = selectedSizes.length > 0 ? selectedSizes : [""];
    const colors = selectedColors.length > 0 ? selectedColors : [""];

    sizes.forEach((size) => {
      colors.forEach((color) => {
        // Try to find an existing variant to preserve data
        const existing = variants.find((v) => v.size === size && v.color === color);
        
        if (existing) {
          newVariants.push(existing);
        } else {
          // Determine SKU prefix
          const skuPrefix = baseSku ? `${baseSku}-` : "SKU-";
          let skuSuffix = "";
          if (color && size) skuSuffix = `${color.substring(0,3).toUpperCase()}-${size}`;
          else if (color) skuSuffix = color.substring(0,3).toUpperCase();
          else if (size) skuSuffix = size;
          
          const genSku = skuSuffix ? `${skuPrefix}${skuSuffix}` : generateSKU();
          
          newVariants.push({
            id: `v${Date.now()}-${Math.random()}`,
            color,
            size,
            sku: genSku,
            stock: "",
            purchasePrice: "",
            regularPrice: "",
            sellingPrice: "",
          });
        }
      });
    });

    setVariants(newVariants);
    toast.success(`${newVariants.length} combinations generated.`);
  };

  // Matrix handlers
  const handleMatrixStockChange = (size: string, color: string, value: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.size === size && v.color === color ? { ...v, stock: value } : v))
    );
  };

  const setAllMatrixStock = () => {
    if (!bulkStock) return;
    setVariants((prev) => prev.map((v) => ({ ...v, stock: bulkStock })));
    toast.success("Stock applied to all combinations.");
  };

  const clearAllMatrixStock = () => {
    setVariants((prev) => prev.map((v) => ({ ...v, stock: "" })));
    toast.success("All stock cleared.");
  };

  // Bulk handlers
  const applyBulkPrice = (field: "purchasePrice" | "regularPrice" | "sellingPrice", val: string) => {
    if (!val) return;
    setVariants((prev) => prev.map((v) => ({ ...v, [field]: val })));
    toast.success(`Price applied to all variants.`);
  };

  const autoGenerateSKUs = () => {
    setVariants((prev) =>
      prev.map((v) => {
        const skuPrefix = baseSku ? `${baseSku}-` : "SKU-";
        let skuSuffix = "";
        if (v.color && v.size) skuSuffix = `${v.color.substring(0,3).toUpperCase()}-${v.size}`;
        else if (v.color) skuSuffix = v.color.substring(0,3).toUpperCase();
        else if (v.size) skuSuffix = v.size;
        
        return { ...v, sku: skuSuffix ? `${skuPrefix}${skuSuffix}` : generateSKU() };
      })
    );
    toast.success("SKUs auto-generated.");
  };

  const handleDeleteSelected = () => {
    if (selectedVariantIds.size === 0) return;
    setVariants((prev) => prev.filter((v) => !selectedVariantIds.has(v.id)));
    setSelectedVariantIds(new Set());
    toast.success("Selected variants deleted.");
  };

  // Table filtering and pagination
  const filteredVariants = variants.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.sku.toLowerCase().includes(q) ||
      v.color.toLowerCase().includes(q) ||
      v.size.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredVariants.length / itemsPerPage);
  const paginatedVariants = filteredVariants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedVariantIds.size === paginatedVariants.length) {
      setSelectedVariantIds(new Set());
    } else {
      const newSet = new Set<string>();
      paginatedVariants.forEach((v) => newSet.add(v.id));
      setSelectedVariantIds(newSet);
    }
  };

  const toggleSelectVariant = (id: string) => {
    const newSet = new Set(selectedVariantIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedVariantIds(newSet);
  };

  const updateVariant = (id: string, field: keyof Variant, val: string) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  };

  // UI Components
  const OptionSelector = ({ 
    label, 
    selected, 
    setSelected, 
    options 
  }: { 
    label: string, 
    selected: string[], 
    setSelected: (s: string[]) => void, 
    options: {label: string, hex_value?: string}[] 
  }) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-dashed">
        <div className="w-16 font-medium text-sm">{label}</div>
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {selected.map((val) => (
            <div key={val} className="flex items-center gap-1.5 bg-background border rounded-md px-3 py-1.5 text-sm shadow-sm">
              {label === "Color" && options.find(o => o.label === val)?.hex_value && (
                <div 
                  className="size-3 rounded-full border border-black/10" 
                  style={{ backgroundColor: options.find(o => o.label === val)?.hex_value }}
                />
              )}
              {val}
              <button 
                onClick={() => setSelected(selected.filter(s => s !== val))}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed bg-background">
                <CirclePlus className="size-3.5 mr-1" />
                Add {label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput placeholder={`Search ${label}...`} />
                <CommandList>
                  <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                  <CommandGroup>
                    {options.filter(o => !selected.includes(o.label)).map((opt) => (
                      <CommandItem
                        key={opt.label}
                        value={opt.label}
                        onSelect={() => {
                          setSelected([...selected, opt.label]);
                          setOpen(false);
                        }}
                      >
                        {label === "Color" && opt.hex_value && (
                          <div 
                            className="size-3 rounded-full border border-black/10 mr-2" 
                            style={{ backgroundColor: opt.hex_value }}
                          />
                        )}
                        {opt.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {selected.length > 0 && (
          <Button variant="ghost" size="icon" onClick={() => setSelected([])} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Step 1: Define Options */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Step 1: Define Options
          </h3>
          <p className="text-sm text-muted-foreground">Add sizes, colors or other attributes.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <OptionSelector 
            label="Size" 
            selected={selectedSizes} 
            setSelected={setSelectedSizes} 
            options={availableSizes} 
          />
          <OptionSelector 
            label="Color" 
            selected={selectedColors} 
            setSelected={setSelectedColors} 
            options={availableColors} 
          />
        </div>

        <div className="flex items-center justify-between bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-md">
              <Package className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {selectedSizes.length || 1} Sizes × {selectedColors.length || 1} Colors
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.max(selectedSizes.length, 1) * Math.max(selectedColors.length, 1)} Variants will be generated
              </p>
            </div>
          </div>
          <Button onClick={handleGenerateCombinations} variant="default" className="shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
            <Eye className="size-4 mr-2" />
            Preview Combinations
          </Button>
        </div>
      </div>

      <Separator />

      {/* Step 2: Inventory Matrix */}
      {selectedSizes.length > 0 && selectedColors.length > 0 && variants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Step 2: Inventory Matrix
              </h3>
              <p className="text-sm text-muted-foreground">Enter stock for each size and color quickly.</p>
            </div>
            {!disableStockEdit && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={setAllMatrixStock}>
                  <Check className="size-4 mr-2" /> Set All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAllMatrixStock} className="text-destructive hover:text-destructive">
                  <Ban className="size-4 mr-2" /> Clear All
                </Button>
              </div>
            )}
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground w-32 border-r">Color \\ Size</th>
                  {selectedSizes.map(size => (
                    <th key={size} className="p-3 text-center font-medium">{size}</th>
                  ))}
                  <th className="p-3 text-center font-medium border-l bg-muted/50">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedColors.map(color => {
                  const colorObj = availableColors.find(c => c.label === color);
                  let rowTotal = 0;
                  return (
                    <tr key={color} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium border-r flex items-center gap-2">
                        {colorObj?.hex_value && (
                          <div className="size-3 rounded-full border border-black/10" style={{ backgroundColor: colorObj.hex_value }} />
                        )}
                        {color}
                      </td>
                      {selectedSizes.map(size => {
                        const variant = variants.find(v => v.size === size && v.color === color);
                        const stockVal = variant?.stock || "";
                        rowTotal += Number(stockVal) || 0;
                        return (
                          <td key={`${color}-${size}`} className="p-2">
                            <Input 
                              type="number"
                              className="h-9 w-20 mx-auto text-center bg-background" 
                              placeholder="0"
                              value={stockVal}
                              onChange={(e) => handleMatrixStockChange(size, color, e.target.value)}
                              disabled={disableStockEdit}
                            />
                          </td>
                        );
                      })}
                      <td className="p-3 text-center font-medium text-muted-foreground border-l bg-muted/20">
                        {rowTotal}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-muted/50 font-medium">
                <tr>
                  <td className="p-3 border-r">Total</td>
                  {selectedSizes.map(size => {
                    const colTotal = variants.filter(v => v.size === size).reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
                    return <td key={size} className="p-3 text-center">{colTotal}</td>;
                  })}
                  <td className="p-3 text-center border-l">
                    {variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block size-3 rounded-full border bg-background" /> 0 or blank = Out of Stock
          </p>
        </div>
      )}

      {variants.length > 0 && <Separator />}

      {/* Step 3: Bulk Actions */}
      {variants.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Step 3: Bulk Actions <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hasVariantWisePricing && (
              <>
                {!hidePurchasePrice && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Purchase Price</Label>
                    <div className="flex">
                      <Input 
                        placeholder="0.00" 
                        className="rounded-r-none h-9 border-r-0 focus-visible:ring-0" 
                        value={bulkPurchasePrice}
                        onChange={(e) => setBulkPurchasePrice(e.target.value)}
                      />
                      <Button variant="outline" className="rounded-l-none h-9 px-3 bg-muted/20 hover:bg-muted font-semibold text-xs" onClick={() => applyBulkPrice("purchasePrice", bulkPurchasePrice)}>
                        Apply to all
                      </Button>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Regular Price (Optional)</Label>
                  <div className="flex">
                    <Input 
                      placeholder="0.00" 
                      className="rounded-r-none h-9 border-r-0 focus-visible:ring-0"
                      value={bulkRegularPrice}
                      onChange={(e) => setBulkRegularPrice(e.target.value)}
                    />
                    <Button variant="outline" className="rounded-l-none h-9 px-3 bg-muted/20 hover:bg-muted font-semibold text-xs" onClick={() => applyBulkPrice("regularPrice", bulkRegularPrice)}>
                      Apply to all
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Selling Price</Label>
                  <div className="flex">
                    <Input 
                      placeholder="0.00" 
                      className="rounded-r-none h-9 border-r-0 focus-visible:ring-0"
                      value={bulkSellingPrice}
                      onChange={(e) => setBulkSellingPrice(e.target.value)}
                    />
                    <Button variant="outline" className="rounded-l-none h-9 px-3 bg-muted/20 hover:bg-muted font-semibold text-xs" onClick={() => applyBulkPrice("sellingPrice", bulkSellingPrice)}>
                      Apply to all
                    </Button>
                  </div>
                </div>
              </>
            )}
            {!disableStockEdit && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Set Stock</Label>
                <div className="flex">
                  <Input 
                    placeholder="0" 
                    type="number"
                    className="rounded-r-none h-9 border-r-0 focus-visible:ring-0"
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value)}
                  />
                  <Button variant="outline" className="rounded-l-none h-9 px-3 bg-muted/20 hover:bg-muted font-semibold text-xs" onClick={setAllMatrixStock}>
                    Apply to all
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={autoGenerateSKUs}>
              <Settings2 className="size-4 mr-2" /> Auto Generate SKUs
            </Button>
            <Button variant="outline" size="sm" onClick={() => {}} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              <Check className="size-4 mr-2" /> Enable All
            </Button>
            <Button variant="outline" size="sm" onClick={() => {}} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
              <Ban className="size-4 mr-2" /> Disable All
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteSelected} className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto">
              <Trash2 className="size-4 mr-2" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Variants Table */}
      {variants.length > 0 && (
        <Card className="shadow-none border-muted/60 overflow-hidden">
          <CardHeader className="bg-muted/20 border-b pb-4 pt-5 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Variants ({variants.length})</CardTitle>
              <CardDescription>View and edit variants in detail.</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-background">
                <Settings2 className="size-4 mr-2" /> Filters
              </Button>
              <Input 
                placeholder="Search variants..." 
                className="w-64 h-9 bg-background"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground border-b">
                <tr>
                  <th className="p-4 text-left w-12">
                    <Checkbox 
                      checked={selectedVariantIds.size === paginatedVariants.length && paginatedVariants.length > 0} 
                      onCheckedChange={toggleSelectAll} 
                    />
                  </th>
                  <th className="p-4 text-left font-medium">Color</th>
                  <th className="p-4 text-left font-medium">Size</th>
                  <th className="p-4 text-left font-medium">SKU</th>
                  {hasVariantWisePricing && (
                    <>
                      {!hidePurchasePrice && <th className="p-4 text-left font-medium">Purchase Price</th>}
                      <th className="p-4 text-left font-medium">Regular Price (Optional)</th>
                      <th className="p-4 text-left font-medium">Selling Price</th>
                    </>
                  )}
                  <th className="p-4 text-left font-medium">Stock</th>
                  <th className="p-4 text-center font-medium">Status</th>
                  <th className="p-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVariants.map((v) => {
                  const colorObj = availableColors.find(c => c.label === v.color);
                  return (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <Checkbox 
                          checked={selectedVariantIds.has(v.id)} 
                          onCheckedChange={() => toggleSelectVariant(v.id)} 
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-medium">
                          {colorObj?.hex_value && (
                            <div className="size-3 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: colorObj.hex_value }} />
                          )}
                          {v.color || "-"}
                        </div>
                      </td>
                      <td className="p-4 font-medium">{v.size || "-"}</td>
                      <td className="p-4">
                        <Input 
                          value={v.sku} 
                          onChange={(e) => updateVariant(v.id, "sku", e.target.value)} 
                          className="h-8 min-w-[120px] bg-background" 
                        />
                      </td>
                      {hasVariantWisePricing && (
                        <>
                          {!hidePurchasePrice && (
                            <td className="p-4">
                              <Input 
                                value={v.purchasePrice || ""} 
                                onChange={(e) => updateVariant(v.id, "purchasePrice", e.target.value)} 
                                className="h-8 w-24 bg-background" 
                                placeholder="0.00"
                              />
                            </td>
                          )}
                          <td className="p-4">
                            <Input 
                              value={v.regularPrice || ""} 
                              onChange={(e) => updateVariant(v.id, "regularPrice", e.target.value)} 
                              className="h-8 w-24 bg-background" 
                              placeholder="0.00"
                            />
                          </td>
                          <td className="p-4">
                            <Input 
                              value={v.sellingPrice || ""} 
                              onChange={(e) => updateVariant(v.id, "sellingPrice", e.target.value)} 
                              className="h-8 w-24 bg-background" 
                              placeholder="0.00"
                            />
                          </td>
                        </>
                      )}
                      <td className="p-4">
                        <Input 
                          type="number"
                          value={v.stock} 
                          onChange={(e) => updateVariant(v.id, "stock", e.target.value)} 
                          className="h-8 w-20 bg-background" 
                          placeholder="0"
                          disabled={disableStockEdit}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => setVariants(prev => prev.filter(prevV => prevV.id !== v.id))}>
                              <Trash2 className="size-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
                {paginatedVariants.length === 0 && (
                  <tr>
                    <td colSpan={hasVariantWisePricing ? 10 : 7} className="p-8 text-center text-muted-foreground">
                      No variants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between border-t bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVariants.length)} of {filteredVariants.length} variants
              </p>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button 
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="icon"
                    className="size-8"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="size-8"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
