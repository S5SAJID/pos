import type { RespProduct } from '#/components/products-crud.tsx'
import { useCartItems, usePosActions } from '#/lib/pos-store.ts'
import { useDebounce } from '#/lib/use-debounce.ts'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Center } from '@astryxdesign/core/Center'
import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { Spinner } from '@astryxdesign/core/Spinner'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

interface ProductGridProps {
  products: RespProduct[]
  isLoading: boolean
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 100)
  const cartItems = useCartItems()
  const { addItem } = usePosActions()

  const cartMap = new Map(cartItems.map((i) => [i.productId, i.quantity]))

  const filtered = debouncedSearch
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.sku?.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : products

  if (isLoading) {
    return (
      <Center height="100%">
        <Spinner label="Loading products..." />
      </Center>
    )
  }

  if (products.length === 0) {
    return (
      <Center height="100%">
        <EmptyState
          icon={<Icon icon={ShoppingBag} />}
          title="No products added yet"
          description="Add products first, then they will appear here."
        />
      </Center>
    )
  }

  return (
    <VStack gap={4}>
      <TextInput
        label="Search products"
        isLabelHidden
        startIcon={Search}
        placeholder="Search by name or SKU..."
        value={search}
        onChange={setSearch}
        hasClear
        width={250}
      />

      {filtered.length === 0 ? (
        <Center minHeight={200}>
          <EmptyState
            icon={<Icon icon={Search} />}
            title="No results found"
            description="Try a different name or SKU."
            actions={<Button label="Clear search" onClick={() => setSearch('')} />}
          />
        </Center>
      ) : (
        <Grid columns={{ minWidth: 170, repeat: 'fill', max: 6 }} gap={2}>
          {filtered.map((product) => {
            const qty = product.quantity ?? 0
            const minStock = product.minStockLevel ?? 0
            const isOutOfStock = qty <= 0
            const isLowStock = qty > 0 && qty <= minStock
            const cartQty = cartMap.get(product.id)
            const atMax = cartQty !== undefined && cartQty >= qty

            return (
              <ClickableCard
                key={product.id}
                label={product.name}
                isDisabled={isOutOfStock || atMax}
                style={{ userSelect: 'none', position: 'relative' }}
                onClick={() =>
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    maxQuantity: qty,
                  })
                }
              >
                <VStack gap={1}>
                  {isOutOfStock ? (
                    <HStack gap={1} vAlign="center">
                      <StatusDot variant="error" label="Sold out" />
                      <Text type="supporting" color="secondary">
                        Sold out
                      </Text>
                    </HStack>
                  ) : isLowStock ? (
                    <HStack gap={1} vAlign="center">
                      <StatusDot variant="warning" label="Low stock" />
                      <Text type="supporting" color="secondary">
                        Low stock ({qty} left)
                      </Text>
                    </HStack>
                  ) : (
                    <Text type="supporting" color="secondary">
                      {qty} in stock
                    </Text>
                  )}

                  <HStack vAlign="center" hAlign="between">
                    <Text weight="bold">{product.name}</Text>
                    {cartQty !== undefined && <Badge label={String(cartQty)} />}
                  </HStack>

                  <Text type="label">Rs. {parseFloat(product.price).toFixed(2)}</Text>
                </VStack>
              </ClickableCard>
            )
          })}
        </Grid>
      )}
    </VStack>
  )
}
