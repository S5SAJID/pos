import { StockStatus, computeStockStatus, type StockStatusType } from '#/components/stock-status.tsx'
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
import { Selector } from '@astryxdesign/core/Selector'
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
  stockStatus: StockStatusType
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

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

  const enrichedData = useMemo<EnrichedInventory[]>(() => {
    if (!productsData) return []
    const inventoryMap = new Map<string, RespInventory>()
    if (inventoryData) {
      for (const inv of inventoryData) {
        inventoryMap.set(inv.productId, inv)
      }
    }

    return productsData.map((product) => {
      const inv = inventoryMap.get(product.id)
      const quantity = inv?.quantity ?? product.quantity ?? 0
      const minStockLevel = inv?.minStockLevel ?? product.minStockLevel ?? 0
      const stockStatus = computeStockStatus(quantity, minStockLevel)

      return {
        id: inv?.id ?? product.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku ?? '—',
        quantity,
        minStockLevel,
        stockStatus,
        createdAt: inv?.createdAt ?? product.createdAt,
        updatedAt: inv?.updatedAt ?? product.updatedAt,
      }
    })
  }, [productsData, inventoryData])

  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim()
    return enrichedData.filter((item) => {
      const matchesSearch =
        !q ||
        item.productName.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'ALL' || item.stockStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [enrichedData, search, statusFilter])

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

  const handleStatusFilterChange = (val?: string) => {
    setStatusFilter(val || 'ALL')
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
                  <HStack gap={2} vAlign="center">
                    <TextInput
                      label="Search inventory"
                      isLabelHidden
                      hasClear={true}
                      placeholder="Search by product name or SKU..."
                      value={search}
                      onChange={handleSearchChange}
                      startIcon={SearchIcon}
                    />
                    <Selector
                      label="Stock Status"
                      isLabelHidden
                      placeholder="Status"
                      options={STATUS_OPTIONS}
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      size="sm"
                      width={160}
                    />
                  </HStack>
                }
              />
              {isLoading ? (
                <TableSkeleton columns={inventoryColumns} />
              ) : !enrichedData || enrichedData.length === 0 ? (
                <EmptyState
                  title="No inventory records found"
                  description="Add products to your catalog to track and manage stock."
                  icon={<Icon icon={Boxes} />}
                />
              ) : filteredData.length === 0 ? (
                <EmptyState
                  title="No matching inventory"
                  description={`No items matched your search${statusFilter !== 'ALL' ? ' and filter' : ''}. Try adjusting your filters.`}
                  icon={<Icon icon={SearchIcon} />}
                  actions={
                    <Button
                      label="Clear filters"
                      variant="secondary"
                      onClick={() => {
                        setSearch('')
                        setStatusFilter('ALL')
                        setPage(1)
                      }}
                    />
                  }
                />
              ) : (
                <Table
                  data={paginateData(sortedData, page, pageSize) ?? []}
                  columns={inventoryColumns}
                  idKey="id"
                  isStriped
                  hasHover
                  plugins={{ pagination: plugin, sortable: sortablePlugin }}
                />
              )}
            </VStack>
          </Card>
        </LayoutContent>
      }
    />
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
    renderCell: (item) => (
      <Text type="body" hasTabularNumbers>
        {item.quantity}
      </Text>
    ),
  },
  {
    key: 'minStockLevel',
    header: 'Min Stock Level',
    align: 'end',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => (
      <Text type="body" color="secondary" hasTabularNumbers>
        {item.minStockLevel}
      </Text>
    ),
  },
  {
    key: 'stockStatus',
    header: 'Status',
    sortable: true,
    width: proportional(1.5),
    renderCell: (item) => <StockStatus status={item.stockStatus} />,
  },
  {
    key: 'updatedAt',
    header: 'Last Updated',
    align: 'end',
    sortable: true,
    width: proportional(1.5),
    renderCell: (item) =>
      item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—',
  },
]
