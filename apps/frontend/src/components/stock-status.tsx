import { HStack, type StackMainAlignment } from '@astryxdesign/core/Layout'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'

export type StockStatusType = 'out_of_stock' | 'low_stock' | 'in_stock'

export const STOCK_STATUS_CONFIG: Record<
  StockStatusType,
  {
    variant: 'error' | 'warning' | 'success'
    label: string
  }
> = {
  out_of_stock: { variant: 'error', label: 'Out of stock' },
  low_stock: { variant: 'warning', label: 'Low stock' },
  in_stock: { variant: 'success', label: 'In stock' },
}

export function computeStockStatus(quantity: number, minStockLevel: number): StockStatusType {
  if (quantity <= 0) return 'out_of_stock'
  if (quantity <= minStockLevel) return 'low_stock'
  return 'in_stock'
}

export interface StockStatusProps {
  status?: StockStatusType
  quantity?: number
  minStockLevel?: number
  hasLabel?: boolean
  showQuantity?: boolean
  hAlign?: StackMainAlignment
}

export function StockStatus({
  status: explicitStatus,
  quantity,
  minStockLevel = 0,
  hasLabel = true,
  showQuantity = false,
  hAlign = 'start',
}: StockStatusProps) {
  const resolvedStatus: StockStatusType =
    explicitStatus ?? (quantity !== undefined ? computeStockStatus(quantity, minStockLevel) : 'in_stock')

  const config = STOCK_STATUS_CONFIG[resolvedStatus]

  return (
    <HStack gap={1.5} vAlign="center" hAlign={hAlign}>
      <StatusDot variant={config.variant} label={config.label} />
      {hasLabel && !showQuantity && (
        <Text type="supporting" color="secondary">
          {config.label}
        </Text>
      )}
      {showQuantity && quantity !== undefined && (
        <Text type="body" hasTabularNumbers>
          {quantity}
        </Text>
      )}
    </HStack>
  )
}
