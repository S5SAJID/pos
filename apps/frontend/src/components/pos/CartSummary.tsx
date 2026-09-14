import { useCartItems, useCartTotal, usePaymentMethod, usePosActions } from '#/lib/pos-store.ts'
import type { PaymentMethod } from '@pos/backend'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl'
import { Text } from '@astryxdesign/core/Text'
import { Heading } from '@astryxdesign/core/Heading'
import { Button } from '@astryxdesign/core/Button'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'EASYPAISA', label: 'Easypaisa' },
]

interface CartSummaryProps {
  isConfirming: boolean
  onConfirm: () => void
}

export function CartSummary({ isConfirming, onConfirm }: CartSummaryProps) {
  const total = useCartTotal()
  const paymentMethod = usePaymentMethod()
  const items = useCartItems()
  const { setPaymentMethod } = usePosActions()

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const hasItems = items.length > 0

  return (
    <VStack gap={3}>
      <HStack hAlign="between" vAlign="center">
        <Text type="supporting" color="secondary">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
        <VStack gap={0} style={{ alignItems: 'flex-end' }}>
          <Text type="supporting" color="secondary">
            Total
          </Text>
          <Heading level={3}>Rs. {total.toFixed(2)}</Heading>
        </VStack>
      </HStack>

      <SegmentedControl
        label="Payment method"
        value={paymentMethod}
        onChange={(val) => setPaymentMethod(val as PaymentMethod)}
        layout="fill"
        size="sm"
      >
        {PAYMENT_METHODS.map((m) => (
          <SegmentedControlItem key={m.value} value={m.value} label={m.label} />
        ))}
      </SegmentedControl>

      <Button
        label="Confirm Order"
        variant="primary"
        isLoading={isConfirming}
        isDisabled={!hasItems || isConfirming}
        onClick={onConfirm}
        style={{ width: '100%' }}
      />
    </VStack>
  )
}
