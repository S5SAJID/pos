import {
  CreateProductModal,
  DeleteProductModal,
  EditProductModal,
  type RespProduct,
} from '#/components/products-crud.tsx'
import { StockStatus } from '#/components/stock-status'
import TableSkeleton from '#/components/table-skeleton.tsx'
import { backendClient } from '#/lib/backend.ts'
import { Button } from '@astryxdesign/core/Button'
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu'
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
  pixel,
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
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  MoreHorizontal,
  Pencil,
  SearchIcon,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_app/products')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<RespProduct | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<RespProduct | null>(
    null,
  )

  const { data, isLoading, isError } = useQuery<RespProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await backendClient.data.products.$get()
      return await data.json()
    },
  })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const pageSize = 15

  const productColumns = useMemo<TableColumn<RespProduct>[]>(
    () => [
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
        renderCell: (item) => (
          <Text type="body" hasTabularNumbers>
            {`Rs. ${parseFloat(item.price).toFixed(2)}`}
          </Text>
        ),
      },
      {
        key: 'cost',
        header: 'Cost',
        align: 'end',
        sortable: true,
        width: proportional(1),
        renderCell: (item) => (
          <Text type="body" color="secondary" hasTabularNumbers>
            {`Rs. ${parseFloat(item.cost).toFixed(2)}`}
          </Text>
        ),
      },
      {
        key: 'quantity',
        header: 'Qty',
        align: 'end',
        sortable: true,
        width: proportional(1),
        renderCell: (item) => (
          <StockStatus
            hAlign="end"
            minStockLevel={item.minStockLevel}
            quantity={item.quantity}
            showQuantity
          />
        ),
      },
      {
        key: 'minStockLevel',
        header: 'Min Stock',
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
        key: 'createdAt',
        header: 'Created At',
        width: proportional(1),
        renderCell: (item) => new Date(item.createdAt).toLocaleDateString(),
      },
      {
        key: 'actions',
        header: '',
        align: 'end',
        width: pixel(48),
        renderCell: (item) => (
          <DropdownMenu
            hasChevron={false}
            placement="below"
            alignment="end"
            button={{
              label: `Actions for ${item.name}`,
              icon: <Icon icon={MoreHorizontal} size="sm" />,
              variant: 'ghost',
              size: 'sm',
              isIconOnly: true,
            }}
            items={[
              {
                label: 'Edit',
                icon: <Icon icon={Pencil} size="sm" />,
                onClick: () => setEditingProduct(item),
              },
              { type: 'divider' },
              {
                label: 'Delete',
                variant: 'destructive',
                icon: <Icon icon={Trash2} size="sm" />,
                onClick: () => setDeletingProduct(item),
              },
            ]}
          />
        ),
      },
    ],
    [],
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const filteredData = (data ?? []).filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku?.toLowerCase().includes(search.toLowerCase()),
  )

  const { sortedData, sortConfig } = useTableSortableState<RespProduct>({
    data: filteredData,
  })

  const plugin = useTablePagination<RespProduct>({
    page,
    onPageChange: setPage,
    totalItems: filteredData.length ?? 0,
    pageSize,
  })
  const sortablePlugin = useTableSortable<RespProduct>(sortConfig)

  if (isError) {
    return (
      <Layout
        height="fill"
        defaultHasDividers
        contentWidth={1200}
        content={
          <LayoutContent padding={6}>
            <EmptyState
              title="Error loading products"
              description="Failed to load products data. Please refresh and try again."
              icon={<Icon icon={ShoppingBag} />}
            />
          </LayoutContent>
        }
      />
    )
  }

  return (
    <>
      <Layout
        height="fill"
        defaultHasDividers
        contentWidth={1200}
        content={
          <LayoutContent padding={6}>
            <Card padding={4}>
              <VStack gap={2}>
                <HStack hAlign="between" vAlign="center">
                  <Heading level={2}>Products</Heading>
                  <Button
                    label="Create product"
                    onClick={() => setIsCreateOpen(true)}
                  />
                </HStack>
                <Toolbar
                  label="Table filters"
                  size="sm"
                  dividers={['bottom', 'top']}
                  startContent={
                    <TextInput
                      label="Search"
                      isLabelHidden
                      placeholder="Search by name or SKU..."
                      value={search}
                      onChange={handleSearchChange}
                      startIcon={SearchIcon}
                      hasClear={true}
                    />
                  }
                />
                {isLoading ? (
                  <TableSkeleton columns={productColumns} />
                ) : !data || data.length === 0 ? (
                  <EmptyState
                    title="No products yet"
                    description="Create your first product to start managing your catalog."
                    icon={<Icon icon={ShoppingBag} />}
                    actions={
                      <Button
                        label="Create product"
                        variant="primary"
                        onClick={() => setIsCreateOpen(true)}
                      />
                    }
                  />
                ) : filteredData.length === 0 ? (
                  <EmptyState
                    title="No matching products"
                    description={`No products matched "${search}". Try searching with a different name or SKU.`}
                    icon={<Icon icon={SearchIcon} />}
                    actions={
                      <Button
                        label="Clear search"
                        variant="secondary"
                        onClick={() => {
                          setSearch('')
                          setPage(1)
                        }}
                      />
                    }
                  />
                ) : (
                  <Table
                    data={paginateData(sortedData, page, pageSize) ?? []}
                    columns={productColumns}
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

      <CreateProductModal
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      />

      <DeleteProductModal
        product={deletingProduct}
        isOpen={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      />
    </>
  )
}
