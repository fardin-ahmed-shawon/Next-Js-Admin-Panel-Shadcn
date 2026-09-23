export interface InventoryOperationAttempt {
  signature: string;
  key: string;
}

/** Keep the same key for retries; changed receipt fields represent a new operation. */
export function inventoryOperationKey(
  attempt: { current: InventoryOperationAttempt | null },
  payload: unknown,
): string {
  const signature = JSON.stringify(payload);
  if (!attempt.current || attempt.current.signature !== signature) {
    attempt.current = { signature, key: crypto.randomUUID() };
  }
  return attempt.current.key;
}
