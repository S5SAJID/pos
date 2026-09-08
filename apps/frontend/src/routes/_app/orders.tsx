import TableSkeleton from '#/components/table-skeleton.tsx'
import { backendClient } from '#/lib/backend.ts'
import { useDebounce } from '#/lib/use-debounce'
import { Button } from '@astryxdesign/core/Button'
import { Center } from '@astryxdesign/core/Center'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Grid } from '@astryxdesign/core/Grid'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon } from '@astryxdesign/core/Icon'
import {
  Card,
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  VStack,
} from '@astryxdesign/core/Layout'
import { Selector } from '@astryxdesign/core/Selector'
import { Spinner } from '@astryxdesign/core/Spinner'
import { StatusDot } from '@astryxdesign/core/StatusDot'
import {
  proportional,
  Table,
  useTablePagination,
  useTableSortable,
  useTableSortableState,
  type TableColumn,
} from '@astryxdesign/core/Table'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Token } from '@astryxdesign/core/Token'
import { Toolbar } from '@astryxdesign/core/Toolbar'
import type { PaymentMethod, Product, Transaction } from '@pos/backend'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ReceiptText, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_app/orders')({
  component: RouteComponent,
})

type RespTransaction = Omit<Transaction, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

type OrdersResponse = {
  results: RespTransaction[]
  page: number
  limit: number
  total: number
  pages: number
}

type RespProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  quantity: number
  minStockLevel: number
  createdAt: string
  updatedAt: string
}

type RespTransactionItem = {
  id: string
  transactionId: string
  productId: string
  quantity: number
  unitPrice: string
  createdAt: string
  updatedAt: string
}

type EnrichedTransactionItem = {
  id: string
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: string
  subtotal: number
}

const PAGE_SIZE = 15

const PAYMENT_METHOD_OPTIONS = [
  { value: 'ALL', label: 'All Payments' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'EASYPAISA', label: 'Easypaisa' },
]

const ORDER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
]

function RouteComponent() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('ALL')
  const [orderStatus, setOrderStatus] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<RespTransaction | null>(
    null,
  )

  const searchDebounced = useDebounce(search, 500)

  const { sortConfig } = useTableSortableState<RespTransaction>({
    data: [],
  })
  const sortablePlugin = useTableSortable<RespTransaction>(sortConfig)

  const { data, isLoading, isError, isFetching } = useQuery<OrdersResponse>({
    queryKey: [
      'transactions',
      page,
      sortConfig,
      searchDebounced,
      paymentMethod,
      orderStatus,
    ],
    queryFn: async () => {
      const res = await backendClient.data.transactions.$get({
        query: {
          page: page.toString(),
          limit: PAGE_SIZE.toString(),
          ...(sortConfig.sort[0] && {
            'orderBy[0][field]': sortConfig.sort[0].sortKey,
            'orderBy[0][direction]':
              sortConfig.sort[0].direction === 'ascending' ? 'asc' : 'desc',
          }),
          ...(paymentMethod !== 'ALL' && {
            'filters[paymentMethod]': paymentMethod,
          }),
          ...(orderStatus !== 'ALL' && {
            'filters[status]': orderStatus,
          }),
          ...(searchDebounced !== '' &&
            searchDebounced.length > 2 && {
              search: searchDebounced.toLowerCase(),
            }),
        },
      })
      return await res.json()
    },
  })

  const { data: productsData } = useQuery<RespProduct[]>({
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

  const { data: rawOrderItems, isLoading: isLoadingOrderItems } = useQuery<
    RespTransactionItem[]
  >({
    queryKey: ['transaction-items', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return []
      const res = await backendClient.data.transactions[':id'].$get({
        param: { id: selectedOrder.id },
      })
      return await res.json()
    },
    enabled: !!selectedOrder?.id,
  })

  const enrichedOrderItems = useMemo<EnrichedTransactionItem[]>(() => {
    if (!rawOrderItems) return []
    return rawOrderItems.map((item) => {
      const product = productsMap.get(item.productId)
      const unitPriceNum = parseFloat(item.unitPrice) || 0
      return {
        id: item.id,
        productId: item.productId,
        productName: product?.name ?? 'Unknown Product',
        sku: product?.sku ?? '—',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: unitPriceNum * item.quantity,
      }
    })
  }, [rawOrderItems, productsMap])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const plugin = useTablePagination<RespTransaction>({
    page,
    onPageChange: setPage,
    totalItems: data?.total ?? (data ? data.limit * data.pages : 0),
    pageSize: PAGE_SIZE,
  })

  const orderColumns: TableColumn<RespTransaction>[] = [
    {
      key: 'id',
      header: 'Order ID',
      width: proportional(1.5),
      renderCell: (item) => (
        <Text weight="medium">{item.id.slice(0, 8)}...</Text>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      sortable: true,
      width: proportional(1.5),
      renderCell: (item) => new Date(item.createdAt).toLocaleString(),
    },
    {
      key: 'paymentMethod',
      header: 'Payment',
      width: proportional(1),
      renderCell: (item) => <PaymentMethodToken method={item.paymentMethod} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: proportional(1.2),
      renderCell: (item) => <OrderStatusCell status={item.status} />,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      align: 'end',
      sortable: true,
      width: proportional(1.2),
      renderCell: (item) => `Rs. ${parseFloat(item.totalAmount).toFixed(2)}`,
    },
    {
      key: 'grossProfit',
      header: 'Gross Profit',
      align: 'end',
      sortable: true,
      width: proportional(1.2),
      renderCell: (item) => `Rs. ${parseFloat(item.grossProfit).toFixed(2)}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      width: proportional(1),
      renderCell: (item) => (
        <Button
          label="View items"
          variant="secondary"
          size="sm"
          onClick={() => setSelectedOrder(item)}
        />
      ),
    },
  ]

  if (isError) {
    return (
      <Layout
        height="fill"
        defaultHasDividers
        contentWidth={1200}
        content={
          <LayoutContent padding={6}>
            <EmptyState
              title="Error loading orders"
              description="Failed to load transactions data. Please refresh and try again."
              icon={<Icon icon={ReceiptText} />}
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
                  <Heading level={2}>Orders</Heading>
                </HStack>
                <Toolbar
                  label="Order filters"
                  size="sm"
                  dividers={['bottom', 'top']}
                  startContent={
                    <TextInput
                      label="Search orders"
                      isLabelHidden
                      placeholder="Search..."
                      value={search}
                      onChange={handleSearchChange}
                      isLoading={isFetching}
                      startIcon={SearchIcon}
                    />
                  }
                  endContent={
                    <HStack gap={2} vAlign="center">
                      <Selector
                        label="Payment Method"
                        isLabelHidden
                        placeholder="Payment Method"
                        options={PAYMENT_METHOD_OPTIONS}
                        value={paymentMethod}
                        onChange={(val) => {
                          setPaymentMethod(val || 'ALL')
                          setPage(1)
                        }}
                        size="sm"
                        width={160}
                      />
                      <Selector
                        label="Status"
                        isLabelHidden
                        placeholder="Status"
                        options={ORDER_STATUS_OPTIONS}
                        value={orderStatus}
                        onChange={(val) => {
                          setOrderStatus(val || 'ALL')
                          setPage(1)
                        }}
                        size="sm"
                        width={150}
                      />
                    </HStack>
                  }
                />
                {isLoading ? (
                  <TableSkeleton columns={orderColumns} />
                ) : data && data.results && data.results.length > 0 ? (
                  <Table
                    data={data.results}
                    columns={orderColumns}
                    idKey="id"
                    isStriped
                    hasHover
                    plugins={{ pagination: plugin, sortable: sortablePlugin }}
                  />
                ) : (
                  <EmptyState
                    title="No orders found"
                    description="No transaction records match your criteria."
                    icon={<Icon icon={ReceiptText} />}
                  />
                )}
              </VStack>
            </Card>
          </LayoutContent>
        }
      />

      <Dialog
        isOpen={!!selectedOrder}
        onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
        width={740}
        purpose="info"
      >
        <Layout
          header={
            <DialogHeader
              title="Order Details"
              subtitle={selectedOrder ? `Order ID: ${selectedOrder.id}` : ''}
              onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
            />
          }
          content={
            <LayoutContent padding={4}>
              {selectedOrder && (
                <VStack gap={8}>
                  <Card padding={3}>
                    <Grid
                      columns={{ minWidth: 120, repeat: 'fill', max: 4 }}
                      gap={3}
                    >
                      <VStack gap={0.5}>
                        <Text type="supporting" color="secondary">
                          Date & Time
                        </Text>
                        <Text weight="medium">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </Text>
                      </VStack>
                      <VStack gap={0.5}>
                        <Text type="supporting" color="secondary">
                          Payment
                        </Text>
                        <PaymentMethodToken
                          method={selectedOrder.paymentMethod}
                        />
                      </VStack>
                      <VStack gap={0.5}>
                        <Text type="supporting" color="secondary">
                          Status
                        </Text>
                        <OrderStatusCell status={selectedOrder.status} />
                      </VStack>
                      <VStack gap={0.5}>
                        <Text type="supporting" color="secondary">
                          Gross Profit
                        </Text>
                        <Text weight="medium">
                          Rs. {parseFloat(selectedOrder.grossProfit).toFixed(2)}
                        </Text>
                      </VStack>
                    </Grid>
                  </Card>

                  <VStack gap={2}>
                    {/* <Heading level={4}>Purchased Items</Heading> */}
                    {isLoadingOrderItems ? (
                      <Center minHeight={160}>
                        <Spinner label="Loading items..." />
                      </Center>
                    ) : enrichedOrderItems.length > 0 ? (
                      <Table
                        data={enrichedOrderItems}
                        columns={orderItemColumns}
                        idKey="id"
                      />
                    ) : (
                      <Text type="supporting">
                        No line items found for this order.
                      </Text>
                    )}
                  </VStack>
                </VStack>
              )}
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack hAlign="between" vAlign="center">
                {selectedOrder && (
                  <>
                    <Text weight="bold">Total Amount</Text>
                    <Heading level={3}>
                      Rs. {parseFloat(selectedOrder.totalAmount).toFixed(2)}
                    </Heading>
                  </>
                )}
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
    </>
  )
}

function PaymentMethodToken({ method }: { method: PaymentMethod }) {
  const methodConfig: Record<
    PaymentMethod,
    { color: 'green' | 'blue' | 'teal'; label: string }
  > = {
    CASH: { color: 'green', label: 'Cash' },
    CARD: { color: 'blue', label: 'Card' },
    EASYPAISA: { color: 'teal', label: 'Easypaisa' },
  }

  const config = methodConfig[method] ?? { color: 'default', label: method }
  return <Token color={config.color} label={config.label} size="sm" />
}

function OrderStatusCell({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { variant: 'success' | 'warning' | 'error' | 'neutral'; label: string }
  > = {
    COMPLETED: { variant: 'success', label: 'Completed' },
    PENDING: { variant: 'warning', label: 'Pending' },
    FAILED: { variant: 'error', label: 'Failed' },
    REFUNDED: { variant: 'neutral', label: 'Refunded' },
  }

  const config = statusConfig[status] ?? { variant: 'neutral', label: status }
  return (
    <HStack gap={1.5} vAlign="center">
      <StatusDot variant={config.variant} label={config.label} />
      <Text type="supporting">{config.label}</Text>
    </HStack>
  )
}

const orderItemColumns: TableColumn<EnrichedTransactionItem>[] = [
  {
    key: 'productName',
    header: 'Product Name',
    width: proportional(2),
    renderCell: (item) => (
      <VStack gap={0.5}>
        <Text weight="bold">{item.productName}</Text>
        {item.sku && item.sku !== '—' && (
          <Text type="supporting" color="secondary">
            SKU: {item.sku}
          </Text>
        )}
      </VStack>
    ),
  },
  {
    key: 'quantity',
    header: 'Qty',
    align: 'end',
    width: proportional(0.8),
    renderCell: (item) => item.quantity,
  },
  {
    key: 'unitPrice',
    header: 'Unit Price',
    align: 'end',
    width: proportional(1),
    renderCell: (item) => `Rs. ${parseFloat(item.unitPrice).toFixed(2)}`,
  },
  {
    key: 'subtotal',
    header: 'Subtotal',
    align: 'end',
    width: proportional(1),
    renderCell: (item) => `Rs. ${item.subtotal.toFixed(2)}`,
  },
]
