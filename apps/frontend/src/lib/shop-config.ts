// Shop configuration — update these values for your store.
// Future: load from a settings API or user preferences.

export const shopConfig = {
  name: 'SRA Store',
  tagline: 'Your one-stop store for anything, anytime.',
  address: '123 Main Street, Karachi',
  phone: '+92 313 1234569',
  currency: 'Rs.',
  currencyCode: 'PKR',
} as const

export type ShopConfig = typeof shopConfig

