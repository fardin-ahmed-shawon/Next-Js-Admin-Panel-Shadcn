export function orderDisplayLines(lines: any[] = []): any[] {
  const result: any[] = [];
  const groups = new Map<string, any>();
  for (const line of lines) {
    const snapshot = typeof line.bundle_snapshot === "string" ? JSON.parse(line.bundle_snapshot) : line.bundle_snapshot;
    if (!snapshot?.key) { result.push(line); continue; }
    let combo = groups.get(snapshot.key);
    if (!combo) {
      combo = { id: snapshot.key, product_id: snapshot.product_id, qty: snapshot.qty, unit_price: snapshot.unit_price,
        product: {title: snapshot.title, product_thumbnail_img: snapshot.image}, components: [], is_bundle: true };
      groups.set(snapshot.key, combo); result.push(combo);
    }
    const existing = combo.components.find((part: any) => part.product_id === line.product_id && part.product_variant_id === line.product_variant_id && part.size_label === line.size_label && part.color_label === line.color_label);
    if (existing) existing.qty = Number(existing.qty) + Number(line.qty);
    else combo.components.push({...line});
  }
  return result;
}
