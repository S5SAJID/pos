import TableSkeleton from '#/components/table-skeleton.tsx'
import { backendClient } from '#/lib/backend.ts'
import { Button } from '@astryxdesign/core/Button'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon } from '@astryxdesign/core/Icon'
import {
  Card,
  HStack,
  Layout,
  LayoutContent,
  VStack,
} from '@astryxdesign/core/Layout'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import {
  paginateData,
  proportional,
  Table,
  useTablePagination,
  useTableSortable,
  useTableSortableState,
  type TableColumn,
} from '@astryxdesign/core/Table'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Toolbar } from '@astryxdesign/core/Toolbar'
import type { Inventory, Product } from '@pos/backend'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Boxes, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_app/inventory')({
  component: RouteComponent,
})

type RespInventory = Omit<Inventory, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

type RespProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  quantity: number
  minStockLevel: number
  createdAt: string
  updatedAt: string
}

type EnrichedInventory = {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  minStockLevel: number
  stockStatus: 'out_of_stock' | 'low_stock' | 'in_stock'
  createdAt: string
  updatedAt: string
}

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const {
    data: inventoryData,
    isLoading: isLoadingInventory,
    isError: isErrorInventory,
  } = useQuery<RespInventory[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await backendClient.data.inventory.$get()
      return await res.json()
    },
  })

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useQuery<RespProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await backendClient.data.products.$get()
      return await res.json()
    },
  })

  const productsMap = useMemo(() => {
    const map = new Map<string, RespProduct>()
    if (productsData) {
      for (const prod of productsData) {
        map.set(prod.id, prod)
      }
    }
    return map
  }, [productsData])

  const enrichedData = useMemo<EnrichedInventory[]>(() => {
    if (!inventoryData) return []
    return inventoryData.map((item) => {
      const product = productsMap.get(item.productId)
      const productName = product?.name ?? 'Unknown Product'
      const sku = product?.sku ?? '—'
      const isOutOfStock = item.quantity <= 0
      const isLowStock = !isOutOfStock && item.quantity <= item.minStockLevel
      const stockStatus: 'out_of_stock' | 'low_stock' | 'in_stock' =
        isOutOfStock ? 'out_of_stock' : isLowStock ? 'low_stock' : 'in_stock'

      return {
        id: item.id,
        productId: item.productId,
        productName,
        sku,
        quantity: item.quantity,
        minStockLevel: item.minStockLevel,
        stockStatus,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    })
  }, [inventoryData, productsMap])

  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return enrichedData
    return enrichedData.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)),
    )
  }, [enrichedData, search])

  const pageSize = 20
  const plugin = useTablePagination<EnrichedInventory>({
    page,
    onPageChange: setPage,
    totalItems: filteredData.length,
    pageSize,
  })

  const { sortedData, sortConfig } = useTableSortableState<EnrichedInventory>({
    data: filteredData,
  })
  const sortablePlugin = useTableSortable<EnrichedInventory>(sortConfig)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const isLoading = isLoadingInventory || isLoadingProducts
  const isError = isErrorInventory || isErrorProducts

  if (isError) {
    return (
      <Layout
        height="fill"
        defaultHasDividers
        contentWidth={1200}
        content={
          <LayoutContent padding={6}>
            <EmptyState
              title="Error loading inventory"
              description="Failed to load inventory records. Please refresh and try again."
              icon={<Icon icon={Boxes} />}
            />
          </LayoutContent>
        }
      />
    )
  }

  return (
    <Layout
      height="fill"
      defaultHasDividers
      contentWidth={1200}
      content={
        <LayoutContent padding={6}>
          <Card padding={4}>
            <VStack gap={2}>
              <HStack hAlign="between" vAlign="center">
                <Heading level={2}>Inventory</Heading>
                <Button label="Add inventory record" />
              </HStack>
              <Toolbar
                label="Inventory filters"
                size="sm"
                dividers={['bottom', 'top']}
                startContent={
                  <TextInput
                    label="Search inventory"
                    isLabelHidden
                    placeholder="Search by product name or SKU..."
                    value={search}
                    onChange={handleSearchChange}
                    startIcon={SearchIcon}
                  />
                }
              />
              {isLoading ? (
                <TableSkeleton columns={inventoryColumns} />
              ) : enrichedData.length > 0 ? (
                <Table
                  data={paginateData(sortedData, page, pageSize) ?? []}
                  columns={inventoryColumns}
                  idKey="id"
                  isStriped
                  hasHover
                  plugins={{ pagination: plugin, sortable: sortablePlugin }}
                />
              ) : (
                <EmptyState
                  title="No inventory records found"
                  description="Add inventory records to manage your stock levels."
                  icon={<Icon icon={Boxes} />}
                />
              )}
            </VStack>
          </Card>
        </LayoutContent>
      }
    />
  )
}

function StockStatusCell({
  status,
}: {
  status: 'out_of_stock' | 'low_stock' | 'in_stock'
}) {
  if (status === 'out_of_stock') {
    return (
      <HStack gap={1.5} vAlign="center">
        <StatusDot variant="error" label="Out of stock" />
        <Text type="supporting">Out of stock</Text>
      </HStack>
    )
  }

  if (status === 'low_stock') {
    return (
      <HStack gap={1.5} vAlign="center">
        <StatusDot variant="warning" label="Low stock" />
        <Text type="supporting">Low stock</Text>
      </HStack>
    )
  }

  return (
    <HStack gap={1.5} vAlign="center">
      <StatusDot variant="success" label="In stock" />
      <Text type="supporting">In stock</Text>
    </HStack>
  )
}

const inventoryColumns: TableColumn<EnrichedInventory>[] = [
  {
    key: 'productName',
    header: 'Product Name',
    sortable: true,
    resizable: true,
    width: proportional(2),
  },
  {
    key: 'sku',
    header: 'SKU',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => item.sku,
  },
  {
    key: 'quantity',
    header: 'In Stock',
    align: 'end',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => item.quantity,
  },
  {
    key: 'minStockLevel',
    header: 'Min Stock Level',
    align: 'end',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => item.minStockLevel,
  },
  {
    key: 'stockStatus',
    header: 'Status',
    sortable: true,
    width: proportional(1.5),
    renderCell: (item) => <StockStatusCell status={item.stockStatus} />,
  },
  {
    key: 'updatedAt',
    header: 'Last Updated',
    align: 'end',
    sortable: true,
    width: proportional(1.5),
    renderCell: (item) => new Date(item.updatedAt).toLocaleDateString(),
  },
]
