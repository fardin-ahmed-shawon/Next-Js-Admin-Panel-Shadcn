"use client";

import * as React from "react";

import { Loader2, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { pathaoService } from "@/services/pathao";

interface SendPathaoModalProps {
  orderNo: string;
  dueAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PathaoStore {
  store_id: number;
  store_name: string;
}

interface PathaoCity {
  city_id: number;
  city_name: string;
}

interface PathaoZone {
  zone_id: number;
  zone_name: string;
}

interface PathaoArea {
  area_id: number;
  area_name: string;
}

export function SendPathaoModal({ orderNo, dueAmount, open, onOpenChange, onSuccess }: SendPathaoModalProps) {
  // Form values
  const [stores, setStores] = React.useState<PathaoStore[]>([]);
  const [cities, setCities] = React.useState<PathaoCity[]>([]);
  const [zones, setZones] = React.useState<PathaoZone[]>([]);
  const [areas, setAreas] = React.useState<PathaoArea[]>([]);

  const [selectedStore, setSelectedStore] = React.useState<string>("");
  const [selectedCity, setSelectedCity] = React.useState<string>("");
  const [selectedZone, setSelectedZone] = React.useState<string>("");
  const [selectedArea, setSelectedArea] = React.useState<string>("");

  const [deliveryType, setDeliveryType] = React.useState<string>("48"); // Normal = 48
  const [itemType, setItemType] = React.useState<string>("2"); // Parcel = 2
  const [weight, setWeight] = React.useState<string>("0.5");
  const [amountToCollect, setAmountToCollect] = React.useState<string>(dueAmount.toString());
  const [specialInstruction, setSpecialInstruction] = React.useState<string>("");

  // Loading states
  const [isLoadingMetadata, setIsLoadingMetadata] = React.useState(false);
  const [isLoadingZones, setIsLoadingZones] = React.useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Load stores & cities on open
  React.useEffect(() => {
    if (open) {
      // Reset dependent lists
      setZones([]);
      setAreas([]);
      setSelectedZone("");
      setSelectedArea("");
      setSelectedCity("");
      setSelectedStore("");

      // Set default inputs
      setDeliveryType("48");
      setItemType("2");
      setWeight("0.5");
      setAmountToCollect(dueAmount.toString());
      setSpecialInstruction("");

      async function loadMetadata() {
        setIsLoadingMetadata(true);
        try {
          const [storesRes, citiesRes] = await Promise.all([pathaoService.getStores(), pathaoService.getCities()]);

          if (storesRes?.success) {
            const list = (storesRes?.data?.data?.data || storesRes?.data?.data || []) as PathaoStore[];
            setStores(list);
            if (list.length > 0) {
              setSelectedStore(list[0].store_id.toString());
            }
          }

          if (citiesRes?.success) {
            const list = (citiesRes?.data?.data?.data || citiesRes?.data?.data || []) as PathaoCity[];
            setCities(list);
          }
        } catch (_err) {
          toast.error("Failed to load Pathao cities/stores info.");
        } finally {
          setIsLoadingMetadata(false);
        }
      }

      void loadMetadata();
    }
  }, [open, dueAmount]);

  // Load zones when city changes
  React.useEffect(() => {
    if (!selectedCity) {
      setZones([]);
      setSelectedZone("");
      return;
    }

    async function loadZones() {
      setIsLoadingZones(true);
      try {
        const res = await pathaoService.getZones(Number(selectedCity));
        if (res?.success) {
          const list = (res?.data?.data?.data || res?.data?.data || []) as PathaoZone[];
          setZones(list);
        }
      } catch (_err) {
        toast.error("Failed to load zones.");
      } finally {
        setIsLoadingZones(false);
      }
    }

    void loadZones();
  }, [selectedCity]);

  // Load areas when zone changes
  React.useEffect(() => {
    if (!selectedZone) {
      setAreas([]);
      setSelectedArea("");
      return;
    }

    async function loadAreas() {
      setIsLoadingAreas(true);
      try {
        const res = await pathaoService.getAreas(Number(selectedZone));
        if (res?.success) {
          const list = (res?.data?.data?.data || res?.data?.data || []) as PathaoArea[];
          setAreas(list);
        }
      } catch (_err) {
        toast.error("Failed to load areas.");
      } finally {
        setIsLoadingAreas(false);
      }
    }

    void loadAreas();
  }, [selectedZone]);

  const handleSend = async () => {
    // Validate required fields
    if (!selectedStore) {
      toast.error("Please select a store.");
      return;
    }
    if (!selectedCity) {
      toast.error("Please select a city.");
      return;
    }
    if (!selectedZone) {
      toast.error("Please select a zone.");
      return;
    }
    if (!selectedArea) {
      toast.error("Please select an area.");
      return;
    }
    if (!weight || Number.isNaN(Number(weight)) || Number(weight) <= 0) {
      toast.error("Please enter a valid weight (e.g. 0.5).");
      return;
    }
    if (amountToCollect === "" || Number.isNaN(Number(amountToCollect))) {
      toast.error("Please enter amount to collect.");
      return;
    }

    const toastId = toast.loading(`Sending order ${orderNo} to Pathao...`);
    setIsSubmitting(true);

    try {
      const payload = {
        store_id: Number(selectedStore),
        recipient_city: Number(selectedCity),
        recipient_zone: Number(selectedZone),
        recipient_area: Number(selectedArea),
        delivery_type: Number(deliveryType),
        item_type: Number(itemType),
        item_weight: weight,
        amount_to_collect: Number(amountToCollect),
        special_instruction: specialInstruction,
      };

      await pathaoService.createParcel(orderNo, payload);

      toast.success(`Order ${orderNo} sent to Pathao successfully.`, { id: toastId });
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message || "Failed to send to Pathao.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Truck className="size-5 text-[#ef4444]" />
            Send Order to Pathao
          </DialogTitle>
          <DialogDescription>
            Specify delivery details for Order #{orderNo} before creating Pathao parcel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Store */}
          <div className="space-y-1.5">
            <Label className="text-sm">Store</Label>
            {isLoadingMetadata ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground h-9">
                <Loader2 className="size-3.5 animate-spin" /> Loading stores...
              </div>
            ) : (
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.store_id} value={s.store_id.toString()}>
                      {s.store_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* City */}
            <div className="space-y-1.5">
              <Label className="text-sm">City</Label>
              {isLoadingMetadata ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground h-9">
                  <Loader2 className="size-3.5 animate-spin" /> Loading...
                </div>
              ) : (
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.city_id} value={c.city_id.toString()}>
                        {c.city_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Zone */}
            <div className="space-y-1.5">
              <Label className="text-sm">Zone</Label>
              {isLoadingZones ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground h-9">
                  <Loader2 className="size-3.5 animate-spin" /> Loading...
                </div>
              ) : (
                <Select value={selectedZone} onValueChange={setSelectedZone} disabled={!selectedCity}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((z) => (
                      <SelectItem key={z.zone_id} value={z.zone_id.toString()}>
                        {z.zone_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Area */}
          <div className="space-y-1.5">
            <Label className="text-sm">Area</Label>
            {isLoadingAreas ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground h-9">
                <Loader2 className="size-3.5 animate-spin" /> Loading...
              </div>
            ) : (
              <Select value={selectedArea} onValueChange={setSelectedArea} disabled={!selectedZone}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.area_id} value={a.area_id.toString()}>
                      {a.area_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Delivery Type */}
            <div className="space-y-1.5">
              <Label className="text-sm">Delivery Type</Label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="48">Normal (48h)</SelectItem>
                  <SelectItem value="12">On-Demand (12h)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Item Type */}
            <div className="space-y-1.5">
              <Label className="text-sm">Item Type</Label>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Parcel</SelectItem>
                  <SelectItem value="1">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Weight */}
            <div className="space-y-1.5">
              <Label className="text-sm">Weight (kg)</Label>
              <Input
                type="text"
                placeholder="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Amount to collect */}
            <div className="space-y-1.5">
              <Label className="text-sm">Amount to Collect (৳)</Label>
              <Input
                type="number"
                value={amountToCollect}
                onChange={(e) => setAmountToCollect(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Special Instruction */}
          <div className="space-y-1.5">
            <Label className="text-sm">Special Instructions</Label>
            <Textarea
              placeholder="E.g., Fragile, handle with care..."
              value={specialInstruction}
              onChange={(e) => setSpecialInstruction(e.target.value)}
              className="min-h-[70px] resize-y"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleSend}
            disabled={isSubmitting || isLoadingMetadata}
            className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Sending...
              </>
            ) : (
              "Confirm & Send"
            )}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
