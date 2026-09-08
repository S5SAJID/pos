import SkeletonTableRowSkeleton from '#/components/table-skeleton.tsx'
import { backendClient } from '#/lib/backend.ts'
import { useDebounce } from '#/lib/use-debounce'
import { Badge, type BadgeVariant } from '@astryxdesign/core/Badge'
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
  proportional,
  Table,
  useTablePagination,
  useTableSortable,
  useTableSortableState,
  type TableColumn,
} from '@astryxdesign/core/Table'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Toolbar } from '@astryxdesign/core/Toolbar'
import type { Expense, ExpenseCategory } from '@pos/backend'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { SearchIcon, Wallet } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/_app/expenses')({
  component: RouteComponent,
})

type RespExpense = Omit<Expense, 'createdAt'> & {
  createdAt: string
}

type ExpensesResponse = {
  results: RespExpense[]
  page: number
  limit: number
  total: number
  pages: number
}

const PAGE_SIZE = 20

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'SALARIES', label: 'Salaries' },
  { value: 'SUPPLY', label: 'Supply' },
  { value: 'RENT', label: 'Rent' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'SOFTWARE', label: 'Software' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'TAXES', label: 'Taxes' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'OTHER', label: 'Other' },
]

function RouteComponent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const searchDebounced = useDebounce(search, 500)
  const { sortConfig } = useTableSortableState<RespExpense>({
    data: [],
  })

  const sortablePlugin = useTableSortable<RespExpense>(sortConfig)

  const { data, isLoading, isError, isFetching } = useQuery<ExpensesResponse>({
    queryKey: ['expenses', page, sortConfig, searchDebounced, category],
    queryFn: async () => {
      const data = await backendClient.data.expenses.$get({
        query: {
          page: page.toString(),
          limit: PAGE_SIZE.toString(),
          ...(sortConfig.sort[0] && {
            'orderBy[0][field]': sortConfig.sort[0].sortKey,
            'orderBy[0][direction]':
              sortConfig.sort[0].direction === 'ascending' ? 'asc' : 'desc',
          }),
          ...(category !== 'ALL' && {
            'filters[category]': category,
          }),
          ...(searchDebounced !== '' &&
            searchDebounced.length > 2 && {
              search: searchDebounced.toLowerCase(),
            }),
        },
      })
      return await data.json()
    },
  })

  // reset to page 1 automatically when user starts searching or filtering
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const plugin = useTablePagination<RespExpense>({
    page,
    onPageChange: setPage,
    totalItems: data?.total ?? (data ? data.limit * data.pages : 0),
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    return (
      <Layout
        height="fill"
        defaultHasDividers
        contentWidth={1200}
        content={
          <LayoutContent padding={6}>
            <EmptyState
              title="Error loading expenses"
              description="Failed to load expenses data. Please refresh and try again."
              icon={<Icon icon={Wallet} />}
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
                <Heading level={2}>Expenses</Heading>
                <Button label="Add Expense" />
              </HStack>
              <Toolbar
                label="Table filters"
                size="sm"
                dividers={['bottom', 'top']}
                startContent={
                  <HStack gap={2} vAlign="center">
                    <TextInput
                      label="Search"
                      isLabelHidden
                      placeholder="Search..."
                      value={search}
                      onChange={handleSearchChange}
                      isLoading={isFetching}
                      startIcon={SearchIcon}
                    />
                    <Selector
                      label="Category"
                      isLabelHidden
                      placeholder="Category"
                      options={CATEGORY_OPTIONS}
                      value={category}
                      onChange={(val) => {
                        setCategory(val || 'ALL')
                        setPage(1)
                      }}
                      size="sm"
                      width={170}
                    />
                  </HStack>
                }
              />
              {isLoading ? (
                <SkeletonTableRowSkeleton columns={expenseColumns} />
              ) : data && data.results && data.results.length > 0 ? (
                <Table
                  data={data.results}
                  columns={expenseColumns}
                  idKey="id"
                  isStriped
                  hasHover
                  plugins={{ pagination: plugin, sortable: sortablePlugin }}
                />
              ) : (
                <EmptyState
                  title="No expenses found"
                  description="Add expenses data first."
                  icon={<Icon icon={Wallet} />}
                />
              )}
            </VStack>
          </Card>
        </LayoutContent>
      }
    />
  )
}

const expenseColumns: TableColumn<RespExpense>[] = [
  {
    key: 'description',
    header: 'Description',
    resizable: true,
    width: proportional(2),
  },
  {
    key: 'category',
    header: 'Category',
    width: proportional(1.5),
    renderCell: (item) => <ExpenseTypePill expense={item.category} />,
  },
  {
    key: 'amount',
    header: 'Amount',
    align: 'end',
    sortable: true,
    width: proportional(1),
    renderCell: (item) => `Rs. ${parseFloat(item.amount).toFixed(2)}`,
  },
  {
    key: 'createdAt',
    header: 'Created At',
    sortable: true,
    align: 'end',
    width: proportional(1.5),
    renderCell: (item) => new Date(item.createdAt).toLocaleDateString(),
  },
]

export default function ExpenseTypePill({
  expense,
}: {
  expense: ExpenseCategory
}) {
  const categoryConfig: Record<
    ExpenseCategory,
    { variant: BadgeVariant; label: string }
  > = {
    SALARIES: { variant: 'gray', label: 'Salaries' }, // Green: Wealth, prosperity, and financial livelihood
    INSURANCE: { variant: 'blue', label: 'Insurance' }, // Blue: Trust, safety, security, and peace of mind
    SOFTWARE: { variant: 'teal', label: 'Software' }, // Teal: Innovation, digital logic, and modern tech
    MARKETING: { variant: 'pink', label: 'Marketing' }, // Pink: Excitement, creative energy, and expression
    TAXES: { variant: 'orange', label: 'Taxes' }, // Orange: Focus, strict calculation, and high alertness
    RENT: { variant: 'purple', label: 'Rent' }, // Purple: Fixed obligations, luxury space, and structure
    TRAVEL: { variant: 'cyan', label: 'Travel' }, // Cyan: Open horizons, movement, freedom, and sky
    UTILITIES: { variant: 'yellow', label: 'Utilities' }, // Blue: Infrastructure connection (water, power grids)
    SUPPLY: { variant: 'green', label: 'Supply' }, // Green: Tangible assets, resources, and raw materials
    OTHER: { variant: 'cyan', label: 'Other' }, // Cyan: Low visual dominance, neutral backdrop baseline
  }

  const { variant, label } = categoryConfig[expense]

  return <Badge variant={variant} label={label} />
}
