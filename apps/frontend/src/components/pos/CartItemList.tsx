import { CartItemRow } from '#/components/pos/CartItemRow.tsx'
import { useCartItems } from '#/lib/pos-store.ts'
import { Center } from '@astryxdesign/core/Center'
import { Icon } from '@astryxdesign/core/Icon'
import { VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'
import { ShoppingCart } from 'lucide-react'

export function CartItemList() {
  const items = useCartItems()

  if (items.length === 0) {
    return (
      <Center height="100%" minHeight={200}>
        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Icon icon={ShoppingCart} size="lg" />
          <Text color="secondary" type="supporting">
            Your cart is empty. Click a product to add it.
          </Text>
        </VStack>
      </Center>
    )
  }

  return (
    <VStack gap={0}>
      {items.map((item) => (
        <VStack key={item.productId} gap={0}>
          <CartItemRow item={item} />
          {/* {index < items.length - 1 && <Divider />} TODO: Think about this */}
        </VStack>
      ))}
    </VStack>
  )
}
