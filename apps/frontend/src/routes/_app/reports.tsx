import { StockStatus } from '#/components/stock-status'
import { backendClient } from '#/lib/backend.ts'
import { capitalize } from '#/lib/utils'
import { Center } from '@astryxdesign/core/Center'
import { Divider } from '@astryxdesign/core/Divider'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Grid, GridSpan } from '@astryxdesign/core/Grid'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon } from '@astryxdesign/core/Icon'
import { Card, HStack, Layout, LayoutContent, StackItem, VStack } from '@astryxdesign/core/Layout'
import { ProgressBar } from '@astryxdesign/core/ProgressBar'
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl'
import { Spinner } from '@astryxdesign/core/Spinner'
import { proportional, Table, type TableColumn } from '@astryxdesign/core/Table'
import { Text } from '@astryxdesign/core/Text'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, BarChart2, PackageCheck } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/reports')({
  component: RouteComponent,
})

type Period = 'today' | 'weekly' | 'monthly'

type PaymentMethodBreakdown = {
  method: string
  total: string
  count: number
  percentage: string
}

type ExpenseCategoryBreakdown = {
  category: string
  amount: string
  count: number
}

type LowStockItem = {
  id: string
  name: string
  sku: string
  currentStock: number
  minStockLevel: number
  deficit: number
}

type TopProduct = {
  id: string
  name: string
  sku: string
  unitsSold: number
  revenue: string
  transactionCount: number
}

type ReportData = {
  period: { label: string; start: string; end: string }
  revenue: {
    total: string
    grossProfit: string
    netProfit: string
    transactionCount: number
    avgTransaction: string
    byPaymentMethod: PaymentMethodBreakdown[]
  }
  expenses: {
    total: string
    count: number
    byCategory: ExpenseCategoryBreakdown[]
  }
  inventory: {
    lowStockItems: LowStockItem[]
    alertCount: number
  }
  topProducts: TopProduct[]
}

function fmt(val: string): string {
  const n = parseFloat(val)
  return isNaN(n) ? val : `Rs. ${n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDateRange(start: string, end: string): string {
  // TODO: when viewing 'today', start and end point to today, yielding "Sep 15, 2026 – Sep 15, 2026". Formatting should collapse to "Sep 15, 2026" when start and end dates match.
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  const s = new Date(start).toLocaleDateString(undefined, opts)
  const e = new Date(end).toLocaleDateString(undefined, opts)
  return `${s} – ${e}`
}

function StatItem({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string
  value: string
  sub?: string
  valueColor?: 'primary' | 'secondary' | 'success' | 'error'
}) {
  return (
    <StackItem size="fill">
      <VStack gap={0.5}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Text
          type="large"
          hasTabularNumbers
          weight="bold"
          style={
            valueColor === 'error'
              ? { color: 'var(--color-text-red)' }
              : valueColor === 'success'
                ? { color: 'var(--color-text-green)' }
                : undefined
          }
        >
          {value}
        </Text>
        {sub && (
          <Text type="supporting" color="secondary">
            {sub}
          </Text>
        )}
      </VStack>
    </StackItem>
  )
}

function StatsRow({ data }: { data: ReportData }) {
  const netProfit = parseFloat(data.revenue.netProfit)
  const netProfitColor = netProfit >= 0 ? 'success' : 'error'
  const avgTx = parseFloat(data.revenue.avgTransaction)
  const avgFormatted = isNaN(avgTx) ? '—' : fmt(data.revenue.avgTransaction)

  return (
    <Card padding={4}>
      <HStack gap={4} vAlign="center" wrap="wrap">
        <StatItem
          label="Revenue"
          value={fmt(data.revenue.total)}
          sub={`${data.revenue.transactionCount} transactions`}
        />
        <Divider orientation="vertical" style={{ alignSelf: 'stretch', height: 'auto' }} isFullBleed />
        <StatItem label="Gross Profit" value={fmt(data.revenue.grossProfit)} />
        <Divider orientation="vertical" style={{ alignSelf: 'stretch', height: 'auto' }} isFullBleed />
        <StatItem
          label="Net Profit"
          value={fmt(data.revenue.netProfit)}
          valueColor={netProfitColor}
          sub={netProfit < 0 ? 'After expenses' : undefined}
        />
        <Divider orientation="vertical" style={{ alignSelf: 'stretch', height: 'auto' }} isFullBleed />
        <StatItem label="Avg. Transaction" value={avgFormatted} sub="per completed order" />
      </HStack>
    </Card>
  )
}

function PaymentBreakdownCard({ methods }: { methods: PaymentMethodBreakdown[] }) {
  return (
    <Card padding={4}>
      <VStack gap={4}>
        <Heading level={4}>Revenue by Payment Method</Heading>
        {methods.length === 0 ? (
          <Text type="supporting" color="secondary">
            No transactions in this period.
          </Text>
        ) : (
          <VStack gap={3}>
            {methods
              .toSorted((a, b) => b.count - a.count)
              .map((m) => {
                const pct = parseFloat(m.percentage)
                return (
                  <VStack gap={1} key={m.method}>
                    <ProgressBar
                      label={capitalize(m.method)}
                      hasValueLabel
                      value={pct}
                      max={100}
                      variant="accent"
                      formatValueLabel={() => `${fmt(m.total)} · ${m.percentage}%`}
                    />
                  </VStack>
                )
              })}
          </VStack>
        )}
      </VStack>
    </Card>
  )
}

function ExpenseBreakdownCard({ categories, total }: { categories: ExpenseCategoryBreakdown[]; total: string }) {
  const totalNum = parseFloat(total)

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack hAlign="between" vAlign="center">
          <Heading level={4}>Expenses by Category</Heading>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Total: {fmt(total)}
          </Text>
        </HStack>
        {categories.length === 0 ? (
          <Text type="supporting" color="secondary">
            No expenses recorded in this period.
          </Text>
        ) : (
          <VStack gap={3}>
            {categories
              .toSorted((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
              .map((c) => {
                const amount = parseFloat(c.amount)
                const pct = totalNum > 0 ? (amount / totalNum) * 100 : 0
                return (
                  <VStack gap={1} key={c.category}>
                    <HStack hAlign="between" vAlign="center">
                      <Text>{capitalize(c.category)}</Text>
                      <HStack gap={2} vAlign="center">
                        <Text type="supporting" color="secondary" hasTabularNumbers>
                          {fmt(c.amount)}
                        </Text>
                        <Text type="supporting" color="secondary" hasTabularNumbers>
                          {pct.toFixed(1)}%
                        </Text>
                      </HStack>
                    </HStack>
                    <ProgressBar label={`${c.category} expense share`} isLabelHidden value={pct} max={100} />
                  </VStack>
                )
              })}
          </VStack>
        )}
      </VStack>
    </Card>
  )
}

const topProductColumns: TableColumn<TopProduct>[] = [
  {
    key: 'name',
    header: 'Product',
    width: proportional(2),
    renderCell: (item) => (
      <VStack gap={0.5}>
        <Text weight="medium">{item.name}</Text>
        {item.sku && (
          <Text type="supporting" color="secondary">
            {item.sku}
          </Text>
        )}
      </VStack>
    ),
  },
  {
    key: 'unitsSold',
    header: 'Units Sold',
    align: 'end',
    width: proportional(1),
    renderCell: (item) => (
      <Text type="body" hasTabularNumbers>
        {item.unitsSold}
      </Text>
    ),
  },
  {
    key: 'revenue',
    header: 'Revenue',
    width: proportional(1),
    align: 'end',
    renderCell: (item) => (
      <Text type="body" hasTabularNumbers>
        {fmt(item.revenue)}
      </Text>
    ),
  },
  {
    key: 'transactionCount',
    header: 'Orders',
    width: proportional(1),
    align: 'end',
    renderCell: (item) => (
      <Text type="body" color="secondary" hasTabularNumbers>
        {item.transactionCount}
      </Text>
    ),
  },
]

function TopProductsCard({ products }: { products: TopProduct[] }) {
  return (
    <Card padding={4}>
      <VStack gap={4}>
        <Heading level={4}>Top Selling Products</Heading>
        {products.length === 0 ? (
          <EmptyState
            title="No sales yet"
            description="Complete a transaction to see top products here."
            icon={<Icon icon={BarChart2} />}
          />
        ) : (
          <Table data={products} columns={topProductColumns} idKey="id" density="compact" dividers="rows" hasHover />
        )}
      </VStack>
    </Card>
  )
}

const lowStockColumns: TableColumn<LowStockItem>[] = [
  {
    key: 'name',
    header: 'Product',
    width: proportional(2),
    renderCell: (item) => (
      <HStack gap={1.5} vAlign="center">
        <StockStatus minStockLevel={item.minStockLevel} quantity={item.currentStock} hasLabel={false} />
        <VStack gap={0.5}>
          <Text weight="medium">{item.name}</Text>
          {item.sku && (
            <Text type="supporting" color="secondary">
              {item.sku}
            </Text>
          )}
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'currentStock',
    header: 'In Stock',
    align: 'end',
    width: proportional(1),
    renderCell: (item) => (
      <Text type="body" hasTabularNumbers>
        {item.currentStock}
      </Text>
    ),
  },
  {
    key: 'minStockLevel',
    header: 'Min Level',
    align: 'end',
    width: proportional(1),
    renderCell: (item) => (
      <Text type="body" color="secondary" hasTabularNumbers>
        {item.minStockLevel}
      </Text>
    ),
  },
  {
    key: 'deficit',
    header: 'Deficit',
    align: 'end',
    width: proportional(1),
    renderCell: (item) => (
      <Text type="body" hasTabularNumbers>
        {item.deficit}
      </Text>
    ),
  },
]

function LowStockCard({ items, alertCount }: { items: LowStockItem[]; alertCount: number }) {
  return (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack hAlign="between" vAlign="center">
          <Heading level={4}>Low Stock Alerts</Heading>
          {alertCount > 0 && (
            <HStack gap={1} vAlign="center">
              <Icon icon={AlertTriangle} size="sm" color="warning" />
              <Text type="supporting" style={{ color: 'var(--color-text-orange)' }}>
                {alertCount} item{alertCount !== 1 ? 's' : ''} need restocking
              </Text>
            </HStack>
          )}
        </HStack>
        {alertCount === 0 ? (
          <EmptyState
            title="All stock levels healthy"
            description="No items are below their minimum stock level."
            icon={<Icon icon={PackageCheck} />}
          />
        ) : (
          <Table data={items} columns={lowStockColumns} idKey="id" density="compact" dividers="rows" hasHover />
        )}
      </VStack>
    </Card>
  )
}

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Today',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

function RouteComponent() {
  const [period, setPeriod] = useState<Period>('today')

  const { data, isLoading, isError, isFetching } = useQuery<ReportData>({
    queryKey: ['report', period],
    queryFn: async () => {
      const res = await backendClient.data.report.$get({ query: { period } })
      if (!res.ok) {
        throw new Error('Failed to fetch report')
      }
      return (await res.json()) as ReportData
    },
    placeholderData: keepPreviousData,
  })

  const periodSubtitle = data ? formatDateRange(data.period.start, data.period.end) : null

  if (isError) {
    return (
      <Layout
        height="fill"
        defaultHasDividers
        contentWidth={1200}
        content={
          <LayoutContent padding={6}>
            <EmptyState
              title="Failed to load report"
              description="Could not fetch report data. Please refresh and try again."
              icon={<Icon icon={BarChart2} />}
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
          <VStack gap={4}>
            <HStack hAlign="between" vAlign="center">
              <VStack gap={0.5}>
                <Heading level={2}>Reports</Heading>
                {periodSubtitle && (
                  <Text type="supporting" color="secondary">
                    {periodSubtitle}
                  </Text>
                )}
              </VStack>
              <HStack gap={1} vAlign="center">
                {isFetching && <Spinner size="sm" />}
              <SegmentedControl
                label="Report period"
                value={period}
                onChange={(val) => setPeriod(val as Period)}
                size="sm"
              >
                {Object.entries(PERIOD_LABELS).map(([val, label]) => (
                  <SegmentedControlItem key={val} value={val} label={label} />
                ))}
              </SegmentedControl>
              </HStack>
            </HStack>
            {isLoading ? (
              <Center minHeight={400}>
                <Spinner label="Loading report..." />
              </Center>
            ) : data ? (
              <VStack gap={2}>
                <StatsRow data={data} />

                <Grid columns={{ minWidth: 320, repeat: 'fit', max: 3 }} gap={2} width="100%">
                  <GridSpan columns={2}>
                    <VStack gap={1}>
                      <TopProductsCard products={data.topProducts} />
                      <LowStockCard items={data.inventory.lowStockItems} alertCount={data.inventory.alertCount} />
                    </VStack>
                  </GridSpan>
                  <VStack gap={1}>
                    <PaymentBreakdownCard methods={data.revenue.byPaymentMethod} />
                    <ExpenseBreakdownCard categories={data.expenses.byCategory} total={data.expenses.total} />
                  </VStack>
                </Grid>
              </VStack>
            ) : null}
          </VStack>
        </LayoutContent>
      }
    />
  )
}
