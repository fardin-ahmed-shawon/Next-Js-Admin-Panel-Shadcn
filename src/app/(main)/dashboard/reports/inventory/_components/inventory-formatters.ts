export function formatInventoryQuantity(
  qty: number,
  baseUnitCode?: string | null,
  inventoryUnitCode?: string | null,
  inventoryMode?: string | null
): { primary: string; secondary?: string; fullText: string } {
  const base = (baseUnitCode || "").toLowerCase();
  const inv = (inventoryUnitCode || "").toLowerCase();
  const mode = (inventoryMode || "").toLowerCase();

  const isBulk =
    mode === "shared_bulk" ||
    ["g", "ml"].includes(base) ||
    ["kg", "l"].includes(inv);

  const prefix = qty > 0 ? "+" : qty < 0 ? "−" : "";
  const absQty = Math.abs(qty);

  if (isBulk) {
    const baseUnit = base || (inv === "l" ? "ml" : "g");
    const invUnit = inv || (baseUnit === "ml" ? "L" : "kg");

    // Weight products: e.g. base is g, inv is kg
    if (baseUnit === "g" && (invUnit === "kg" || invUnit === "kilogram")) {
      const kgVal = absQty / 1000;
      const formattedKg = `${prefix}${kgVal.toLocaleString("en-BD", { maximumFractionDigits: 3 })} kg`;
      const formattedGm = `${prefix}${absQty.toLocaleString("en-BD")} gm`;
      return {
        primary: formattedKg,
        secondary: formattedGm,
        fullText: `${formattedKg} (${formattedGm})`,
      };
    }

    // Volume products: e.g. base is ml, inv is L
    if (baseUnit === "ml" && (invUnit === "l" || invUnit === "liter" || invUnit === "litre" || invUnit === "L")) {
      const lVal = absQty / 1000;
      const formattedL = `${prefix}${lVal.toLocaleString("en-BD", { maximumFractionDigits: 3 })} L`;
      const formattedMl = `${prefix}${absQty.toLocaleString("en-BD")} ml`;
      return {
        primary: formattedL,
        secondary: formattedMl,
        fullText: `${formattedL} (${formattedMl})`,
      };
    }

    const formatted = `${prefix}${absQty.toLocaleString("en-BD")} ${invUnit}`;
    return {
      primary: formatted,
      fullText: formatted,
    };
  }

  const unit = inv || "piece";
  const formatted = `${prefix}${absQty.toLocaleString("en-BD")} ${unit}`;
  return {
    primary: formatted,
    fullText: formatted,
  };
}

export function formatInventoryBalance(
  before: number | null,
  after: number | null,
  baseUnitCode?: string | null,
  inventoryUnitCode?: string | null,
  inventoryMode?: string | null
): { primary: string; secondary?: string; fullText: string } {
  if (before === null && after === null) {
    return { primary: "—", fullText: "—" };
  }

  const base = (baseUnitCode || "").toLowerCase();
  const inv = (inventoryUnitCode || "").toLowerCase();
  const mode = (inventoryMode || "").toLowerCase();

  const isBulk =
    mode === "shared_bulk" ||
    ["g", "ml"].includes(base) ||
    ["kg", "l"].includes(inv);

  if (isBulk) {
    const baseUnit = base || (inv === "l" ? "ml" : "g");
    const invUnit = inv || (baseUnit === "ml" ? "L" : "kg");

    if (baseUnit === "g" && (invUnit === "kg" || invUnit === "kilogram")) {
      const bKg = before != null ? `${(before / 1000).toLocaleString("en-BD", { maximumFractionDigits: 3 })} kg` : "?";
      const aKg = after != null ? `${(after / 1000).toLocaleString("en-BD", { maximumFractionDigits: 3 })} kg` : "?";
      const bGm = before != null ? `${before.toLocaleString("en-BD")} gm` : "?";
      const aGm = after != null ? `${after.toLocaleString("en-BD")} gm` : "?";
      return {
        primary: `${bKg} → ${aKg}`,
        secondary: `${bGm} → ${aGm}`,
        fullText: `${bKg} → ${aKg} (${bGm} → ${aGm})`,
      };
    }

    if (baseUnit === "ml" && (invUnit === "l" || invUnit === "liter" || invUnit === "litre" || invUnit === "L")) {
      const bL = before != null ? `${(before / 1000).toLocaleString("en-BD", { maximumFractionDigits: 3 })} L` : "?";
      const aL = after != null ? `${(after / 1000).toLocaleString("en-BD", { maximumFractionDigits: 3 })} L` : "?";
      const bMl = before != null ? `${before.toLocaleString("en-BD")} ml` : "?";
      const aMl = after != null ? `${after.toLocaleString("en-BD")} ml` : "?";
      return {
        primary: `${bL} → ${aL}`,
        secondary: `${bMl} → ${aMl}`,
        fullText: `${bL} → ${aL} (${bMl} → ${aMl})`,
      };
    }

    const b = before != null ? `${before.toLocaleString("en-BD")} ${invUnit}` : "?";
    const a = after != null ? `${after.toLocaleString("en-BD")} ${invUnit}` : "?";
    return {
      primary: `${b} → ${a}`,
      fullText: `${b} → ${a}`,
    };
  }

  const unit = inv || "piece";
  const b = before != null ? `${before.toLocaleString("en-BD")} ${unit}` : "?";
  const a = after != null ? `${after.toLocaleString("en-BD")} ${unit}` : "?";
  return {
    primary: `${b} → ${a}`,
    fullText: `${b} → ${a}`,
  };
}
