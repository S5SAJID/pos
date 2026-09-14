export function formatMoney(value: string | number) {
  const stringValue = typeof value === "number" ? value.toString() : value;
  const num = parseFloat(stringValue);

  if (isNaN(num)) {
    return "0.00";
  }

  return num.toFixed(2);
}

export function getDateRange(period: "today" | "weekly" | "monthly"): {
  start: Date;
  end: Date;
} {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "weekly":
      // Last 7 days including today
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "monthly":
      // Current month from 1st to today
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error(`Invalid period: ${period}`);
  }

  return { start, end };
}
