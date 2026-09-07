import { Skeleton } from '@astryxdesign/core/Skeleton'
import { HStack, VStack } from '@astryxdesign/core/Stack'
import type { TableColumn } from '@astryxdesign/core/Table'

export default function TableSkeleton<T extends Record<string, unknown>>({
  columns,
  rows = 15,
}: {
  columns: TableColumn<T>[]
  rows?: number
}) {
  return (
    <VStack gap={2} minHeight={300}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <HStack key={`skeleton-row-${rowIndex}`} gap={4} vAlign="center">
          {columns.map((_col, cellIndex) => (
            <Skeleton
              key={`skeleton-cell-${rowIndex}-${cellIndex}`}
              width={'100%'}
              height={24}
              radius={1}
              index={rowIndex * 4 + cellIndex}
            />
          ))}
        </HStack>
      ))}
    </VStack>
  )
}
