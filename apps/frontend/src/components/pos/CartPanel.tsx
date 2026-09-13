import { CartItemList } from '#/components/pos/CartItemList.tsx'
import { CartSummary } from '#/components/pos/CartSummary.tsx'
import { useCartItemCount, usePosActions } from '#/lib/pos-store.ts'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Heading } from '@astryxdesign/core/Heading'
import { HStack, Layout, LayoutContent, LayoutFooter, LayoutHeader, VStack } from '@astryxdesign/core/Layout'
import { Text } from '@astryxdesign/core/Text'

interface CartPanelProps {
  isConfirming: boolean
  onConfirm: () => void
}

export function CartPanel({ isConfirming, onConfirm }: CartPanelProps) {
  const itemCount = useCartItemCount()
  const { clearCart } = usePosActions()

  return (
    <Layout
      height="fill"
      defaultHasDividers
      header={
        <LayoutHeader label="Current sale" hasDivider padding={4}>
          <HStack hAlign="between" vAlign="center">
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <Heading level={4}>Current Sale</Heading>
                {itemCount > 0 && <Badge label={String(itemCount)} />}
              </HStack>
              <Text type="supporting" color="secondary">
                {new Date().toLocaleDateString()}
              </Text>
            </VStack>
            {itemCount > 0 && <Button label="Clear" variant="ghost" size="sm" onClick={clearCart} />}
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4}>
          <CartItemList />
        </LayoutContent>
      }
      footer={
        <LayoutFooter label="Order actions">
          <VStack padding={4} gap={0}>
            <CartSummary isConfirming={isConfirming} onConfirm={onConfirm} />
          </VStack>
        </LayoutFooter>
      }
    />
  )
}
