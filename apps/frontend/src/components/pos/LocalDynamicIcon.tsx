import React from 'react'
import { icons, type LucideProps } from 'lucide-react'

interface LocalDynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string
}

export const LocalDynamicIcon = React.memo(({ name, ...props }: LocalDynamicIconProps) => {
  // Convert standard kebab-case or snake-case strings (e.g., 'shopping-cart') to PascalCase ('ShoppingCart')
  const pascalName = name.toLowerCase().replace(/(^\w|-\w|_\w)/g, (match) => match.replace(/[-_]/, '').toUpperCase())

  const IconComponent = icons[pascalName as keyof typeof icons]

  // Fallback to a safe default icon if the name isn't found
  if (!IconComponent) return <icons.BadgeInfo {...props} />

  return <IconComponent {...props} />
})

LocalDynamicIcon.displayName = 'LocalDynamicIcon'
