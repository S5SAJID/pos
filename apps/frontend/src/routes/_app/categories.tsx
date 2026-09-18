import TableSkeleton from '#/components/table-skeleton'
import { backendClient } from '#/lib/backend'
import { capitalize } from '#/lib/utils'
import type { TableColumn } from '@astryxdesign/core'
import { Button } from '@astryxdesign/core/Button'
import { EmptyState } from '@astryxdesign/core/EmptyState'
import { Heading } from '@astryxdesign/core/Heading'
import { Icon } from '@astryxdesign/core/Icon'
import { Card, HStack, Layout, LayoutContent, VStack } from '@astryxdesign/core/Layout'
import { Table } from '@astryxdesign/core/Table'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Token } from '@astryxdesign/core/Token'
import { Toolbar } from '@astryxdesign/core/Toolbar'
import type { Category } from '@pos/backend'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { SearchIcon, TagsIcon } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'

export const Route = createFileRoute('/_app/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading, isError } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await backendClient.data.categories.$get()
      return await data.json()
    },
  })

  const categoryColumns: TableColumn<Category>[] = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'icon',
      header: 'Icon',
      renderCell: (category) => (
        <Token
          label={capitalize(category.icon)}
          icon={
            <Icon icon={(props) => <DynamicIcon name={category.icon as any} {...props} />} size="sm" color="inherit" />
          }
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      renderCell: (item) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      key: 'updatedAt',
      header: 'Updated At',
      renderCell: (item) => new Date(item.updatedAt).toLocaleDateString(),
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
              title="Error loading categories"
              description="Failed to load categories data. Please refresh and try again."
              icon={<Icon icon={TagsIcon} />}
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
                  <Heading level={2}>Categories</Heading>
                  <Button label="Create category" />
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
                      value={''}
                      startIcon={SearchIcon}
                      hasClear={true}
                    />
                  }
                />
                {isLoading ? (
                  <TableSkeleton columns={categoryColumns} />
                ) : !data || data.length === 0 ? (
                  <EmptyState
                    title="No categories yet"
                    description="Create your first category to start managing your catalog."
                    icon={<Icon icon={TagsIcon} />}
                    actions={<Button label="Create category" variant="primary" />}
                  />
                ) : (
                  <Table data={data} columns={categoryColumns} idKey="id" isStriped hasHover />
                )}
              </VStack>
            </Card>
          </LayoutContent>
        }
      />
    </>
  )
}
