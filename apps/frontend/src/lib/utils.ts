export function formatPriceForApi(val: string): string {
  const num = parseFloat(val)
  return isNaN(num) ? val : num.toFixed(2)
}

export function capitalize(str: string) {
  if (!str) return ""; // Handle empty strings
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}