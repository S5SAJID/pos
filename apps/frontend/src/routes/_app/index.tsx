import { backendClient } from '#/lib/backend.ts'
import { printReciept } from '#/lib/print-lib.tsx'
import { EmptyState, LayoutFooter } from '@astryxdesign/core'
import { Button } from '@astryxdesign/core/Button'
import { Center } from '@astryxdesign/core/Center'
import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { Grid } from '@astryxdesign/core/Grid'
import { Icon } from '@astryxdesign/core/Icon'
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  VStack,
} from '@astryxdesign/core/Layout'
import { Spinner } from '@astryxdesign/core/Spinner'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import { Heading, Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Search, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [search, setSearch] = useState('')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await backendClient.data.products.$get()
      return await data.json()
    },
  })

  if (isLoading)
    return (
      <Center height={'100%'}>
        <Spinner label="Loading products..." />
      </Center>
    )
  if (isError) return <Text>Error at fetching products.</Text>

  if (!data || data.length <= 0) {
    return (
      <EmptyState
        icon={<Icon icon={ShoppingBag} />}
        title="No products added yet"
        description="Add products first then products will apear here."
      />
    )
  }

  const filteredProducts = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Layout
      height="fill"
      defaultHasDividers
      content={
        <LayoutContent padding={6}>
          <VStack gap={4}>
            <HStack>
              <TextInput
                startIcon={<Icon icon={Search} />}
                label="Search products"
                value={search}
                placeholder="Search Products by name"
                onChange={setSearch}
                isLabelHidden
              />
            </HStack>
            {filteredProducts.length > 0 ? (
              <Grid columns={{ minWidth: 200, repeat: 'fill', max: 6 }} gap={2}>
                {filteredProducts.map((product) => {
                  const quantity = product.quantity ?? 0
                  const minStock = product.minStockLevel ?? 3
                  const isOutOfStock = quantity <= 0
                  const isLowStock = quantity < minStock

                  return (
                    <ClickableCard
                      style={{ userSelect: 'none' }}
                      key={product.id}
                      label={product.name}
                      isDisabled={isOutOfStock}
                    >
                      <VStack gap={0.5}>
                        <VStack gap={1}>
                          {isOutOfStock ? (
                            <HStack gap={1} vAlign="center">
                              <StatusDot variant="error" label="Sold out" />
                              <Text type="supporting">Sold out</Text>
                            </HStack>
                          ) : isLowStock ? (
                            <HStack gap={1} vAlign="center">
                              <StatusDot variant="warning" label="Low stock" />
                              <Text type="supporting">
                                Low stock ({quantity} left)
                              </Text>
                            </HStack>
                          ) : (
                            <Text type="supporting">{quantity + ' left'}</Text>
                          )}
                          <Text weight="bold">{product.name}</Text>
                        </VStack>
                        <Text type="label">Rs. {product.price}</Text>
                      </VStack>
                    </ClickableCard>
                  )
                })}
              </Grid>
            ) : (
              <Center>
                <EmptyState
                  icon={<Icon icon={Search} />}
                  title="No results found"
                  description="Try adjusting your search or filters to find what you need."
                  actions={
                    <Button
                      onClick={() => setSearch('')}
                      label="Clear search"
                    />
                  }
                />
              </Center>
            )}
          </VStack>
        </LayoutContent>
      }
      end={
        <LayoutPanel
          width={420}
          padding={0}
          hasDivider
          style={{ borderRight: '1px solid #fff2' }}
        >
          <Layout
            height="fill"
            padding={4}
            defaultHasDividers
            header={
              <LayoutHeader label="Current sale">
                <HStack gap={3} align="center" justify="between">
                  <VStack gap={0}>
                    <Heading level={4}>Current sale</Heading>
                    <Text type="supporting" color="secondary">
                      {new Date().toLocaleDateString()}
                    </Text>
                  </VStack>
                </HStack>
              </LayoutHeader>
            }
            footer={
              <LayoutFooter label="Order actions">
                <HStack hAlign="end">
                  <Button
                    label="Confirm Order"
                    onClick={() => printReciept()}
                  />
                </HStack>
              </LayoutFooter>
            }
          />
        </LayoutPanel>
      }
    />
  )
}
