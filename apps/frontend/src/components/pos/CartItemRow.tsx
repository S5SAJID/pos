import type { CartItem } from '#/lib/pos-store.ts'
import { usePosActions } from '#/lib/pos-store.ts'
import { IconButton } from '@astryxdesign/core/IconButton'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Text } from '@astryxdesign/core/Text'
import { Trash2 } from 'lucide-react'

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = usePosActions()

  const subtotal = item.price * item.quantity

  return (
    <HStack gap={3} vAlign="center" paddingBlock={2}>
      <VStack gap={0} style={{ flex: 1, minWidth: 0 }}>
        <Text weight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
        </Text>
        <Text type="supporting" color="secondary">
          Rs. {item.price.toFixed(2)} each
        </Text>
      </VStack>

      <NumberInput
        label="Quantity"
        isLabelHidden
        value={item.quantity}
        onChange={(qty) => updateQuantity(item.productId, qty)}
        min={1}
        max={item.maxQuantity}
        step={1}
        isIntegerOnly
        hasNumberSteppers
        isWheelEnabled={false}
        width={90}
        size="sm"
      />

      <Text weight="medium" style={{ minWidth: 72, textAlign: 'right' }}>
        Rs. {subtotal.toFixed(2)}
      </Text>

      <IconButton
        label={`Remove ${item.name} from cart`}
        icon={<Trash2 size={14} />}
        variant="ghost"
        size="sm"
        tooltip="Remove item"
        onClick={() => removeItem(item.productId)}
      />
    </HStack>
  )
}

