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
import {
  paginateData,
  proportional,
  Table,
  useTablePagination,
  useTableSortable,
  useTableSortableState,
  type TableColumn,
} from '@astryxdesign/core/Table'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Toolbar } from '@astryxdesign/core/Toolbar'
import type { Product } from '@pos/backend'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { SearchIcon, ShoppingBag } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/products')({
  component: RouteComponent,
})

type RespProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  quantity: number
  minStockLevel: number
  createdAt: string
  updatedAt: string
}

function RouteComponent() {
  const { data, isLoading, isError } = useQuery<RespProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await backendClient.data.products.$get()
      return await data.json()
    },
  })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const pageSize = 20
  const plugin = useTablePagination<RespProduct>({
    page,
    onPageChange: setPage,
    totalItems: data?.length ?? 0,
    pageSize,
  })

  if (isError) {
    return <div>Error loading data.</div>
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const { sortedData, sortConfig } = useTableSortableState<RespProduct>({
    data: (data ?? []).filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    ),
  })
  const sortablePlugin = useTableSortable<RespProduct>(sortConfig)

  return (
    <Layout
      height="fill"
      defaultHasDividers
      contentWidth={1200}
      content={
        <LayoutContent padding={6}>
          <Card padding={4}>
            <VStack gap={2}>
              <HStack hAlign="between">
                <Heading level={2}>Products</Heading>
                <Button label="Create product" />
              </HStack>
              <Toolbar
                label="Table filters"
                size="sm"
                dividers={['bottom', 'top']}
                startContent={
                  <TextInput
                    label="Search"
                    isLabelHidden
                    placeholder="Search by name..."
                    value={search}
                    onChange={handleSearchChange}
                    startIcon={SearchIcon}
                  />
                }
              />
              {isLoading ? (
                <TableSkeleton columns={productColumns} />
              ) : data ? (
                <Table
                  data={paginateData(sortedData, page, pageSize) ?? []}
                  columns={productColumns}
                  idKey="id"
                  isStriped
                  hasHover
                  plugins={{ pagination: plugin, sortable: sortablePlugin }}
                />
              ) : (
                <EmptyState
                  title="No Products found"
                  description="Create a product first."
                  icon={<Icon icon={ShoppingBag} />}
                />
              )}
            </VStack>
          </Card>
        </LayoutContent>
      }
    />
  )
}

const productColumns: TableColumn<RespProduct>[] = [
  {
    key: 'name',
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
    renderCell: (item) => item.sku ?? '—',
  },
  {
    key: 'price',
    header: 'Price',
    align: 'end',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => `Rs. ${parseFloat(item.price).toFixed(2)}`,
  },
  {
    key: 'cost',
    header: 'Cost',
    align: 'end',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => `Rs. ${parseFloat(item.cost).toFixed(2)}`,
  },
  {
    key: 'quantity',
    header: 'Qty',
    align: 'end',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => item.quantity,
  },
  {
    key: 'minStockLevel',
    header: 'Min Stock',
    align: 'end',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => item.minStockLevel,
  },
  {
    key: 'createdAt',
    header: 'Created At',
    width: proportional(1),
    renderCell: (item) => new Date(item.createdAt).toLocaleDateString(),
  },
]
