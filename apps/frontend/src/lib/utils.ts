export function formatPriceForApi(val: string): string {
  const num = parseFloat(val)
  return isNaN(num) ? val : num.toFixed(2)
}
