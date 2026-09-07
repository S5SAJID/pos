import SkeletonTableRowSkeleton from '#/components/table-skeleton.tsx'
import { backendClient } from '#/lib/backend.ts'
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

type ExpensesResponce = {
  results: RespExpense[]
  page: number
  limit: number
  total: number
  pages: number
}

function RouteComponent() {
  const [page, setPage] = useState(1)
  const { sortConfig } = useTableSortableState<RespExpense>({
    data: [],
  })

  const sortablePlugin = useTableSortable<RespExpense>(sortConfig)

  const { data, isLoading, isError, isFetching } = useQuery<ExpensesResponce>({
    queryKey: ['expenses', page, sortConfig],
    queryFn: async () => {
      const data = await backendClient.data.expenses.$get({
        query: {
          page: page.toString(),
          limit: pageSize.toString(),
          ...(sortConfig.sort[0] && {
            'orderBy[0][field]': sortConfig.sort[0].sortKey,
            'orderBy[0][direction]': sortConfig.sort[0].direction === "ascending" ? "asc" : "desc",
          }),
        },
      })
      return await data.json()
    },
  })

  const pageSize = 20
  const plugin = useTablePagination<RespExpense>({
    page,
    onPageChange: setPage,
    totalItems: data ? data.limit * data.pages : 0,
    pageSize,
  })

  if (isError) {
    return <div>Error loading data.</div>
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
              <HStack hAlign="between">
                <Heading level={2}>Expenses</Heading>
                <Button label="Add Expense" />
              </HStack>
              <Toolbar
                label="Table filters"
                size="sm"
                dividers={['bottom', 'top']}
                startContent={
                  <TextInput
                    label="Search"
                    isLabelHidden
                    placeholder="Search..."
                    value={'search'}
                    // onChange={setSearch}
                    startIcon={SearchIcon}
                  />
                }
              />
              {isLoading || isFetching ? (
                <SkeletonTableRowSkeleton columns={expenseColumns} />
              ) : data ? (
                <Table
                  data={data.results ?? []}
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
