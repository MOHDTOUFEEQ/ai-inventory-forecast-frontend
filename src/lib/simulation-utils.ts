export function getReorderDay(stockLevels: number[], reorderLevel: number): number | null {
  const idx = stockLevels.findIndex((s) => s < reorderLevel);
  return idx >= 0 ? idx + 1 : null;
}

export function getFirstBreachIndex(stockLevels: number[], reorderLevel: number): number {
  return stockLevels.findIndex((s) => s < reorderLevel);
}

export function computeReorderActionDays(firstBreachIndex: number, leadTimeDays: number): number | null {
  if (firstBreachIndex < 0) return null;
  const breachDay = firstBreachIndex + 1;
  const actionDay = Math.max(0, breachDay - Math.max(0, leadTimeDays));
  return actionDay;
}

