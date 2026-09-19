import type { RespProduct } from '#/components/products-crud.tsx'
import { useCartItems, usePosActions } from '#/lib/pos-store.ts'
import { useDebounce } from '#/lib/use-debounce.ts'
import { Badge, StatusDot } from '@astryxdesign/core'
import { Button } from '@astryxdesign/core/Button'
import { Center } from '@astryxdesign/core/Center'
import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import { HStack, VStack } from '@astryxdesign/core/Layout'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Cherry, GridIcon, Milk, Search, ShoppingBag, Vegan } from 'lucide-react'
import { useState } from 'react'
import { LocalDynamicIcon } from './LocalDynamicIcon'
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl'

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
      <HStack hAlign="between" vAlign="center">
        <TextInput
          label="Search products"
          isLabelHidden
          hasAutoFocus
          startIcon={Search}
          placeholder="Search by name or SKU..."
          value={search}
          onChange={setSearch}
          hasClear
          width={250}
        />
        <SegmentedControl size="sm" onChange={() => {}} value={'all'} label="View mode">
          <SegmentedControlItem value="all" label="All" icon={<GridIcon />} />
          <SegmentedControlItem value="list" label="Dairy" icon={<Milk />} />
          <SegmentedControlItem value="table" label="Fruits" icon={<Cherry />} />
        </SegmentedControl>
      </HStack>
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
                variant="muted"
                key={product.id}
                label={product.name}
                isDisabled={isOutOfStock || atMax}
                style={{ userSelect: 'none', position: 'relative', aspectRatio: '3/2' }}
                onClick={() =>
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: parseFloat(product.price),
                    maxQuantity: qty,
                  })
                }
              >
                <VStack gap={1} vAlign="between" style={{ height: '100%' }}>
                  <HStack hAlign="between">
                    <VStack>
                      <Text weight="semibold" style={{ fontSize: 'var(--font-size-md)' }}>
                        {product.name}
                      </Text>
                      <Text weight="normal" color="secondary" hasTabularNumbers>
                        Rs. {parseFloat(product.price)}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack hAlign="between">
                    <HStack gap={1}>
                      {product.category && (
                        <HStack vAlign="center" gap={0.5}>
                          <Icon
                            icon={(props) => (
                              <LocalDynamicIcon
                                name={(product.category ?? { icon: 'package' }).icon as any}
                                {...props}
                              />
                            )}
                            color="tertiary"
                            size="sm"
                          />
                          <Text type="supporting">{(product.category ?? { name: 'No Category' }).name}</Text>
                        </HStack>
                      )}
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
                          {product.category ? '• ' : null} {qty} left
                        </Text>
                      )}
                    </HStack>
                    {cartQty !== undefined && <Badge label={String(cartQty)} variant="info" />}
                  </HStack>
                </VStack>
              </ClickableCard>
            )
          })}
        </Grid>
      )}
    </VStack>
  )
}
