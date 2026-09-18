import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'

import { authClient } from '#/lib/auth.ts'
import { useThemeChanger } from '#/providers/theme.tsx'
import { IconButton } from '@astryxdesign/core'
import { AppShell } from '@astryxdesign/core/AppShell'
import { SideNav, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav'
import {
  BarChart2,
  Boxes,
  Monitor,
  Moon,
  Package,
  ReceiptText,
  ShoppingCart,
  Sun,
  TagIcon,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query({
      queryKey: ['session'],
      queryFn: async () => {
        const session = await authClient.getSession()
        return session
      },
      staleTime: 1000 * 60 * 5,
    })

    if (!session.data) {
      throw redirect({
        to: '/login',
      })
    }
    return {
      session: session.data.session,
    }
  },
  component: () => <AppLayout />,
})

function ToggleThemeButton() {
  const { theme, toggleTheme } = useThemeChanger()

  const icons = {
    light: <Sun />,
    dark: <Moon />,
    system: <Monitor />,
  }

  return (
    <IconButton
      label={`Switch theme (currently ${theme})`}
      size="sm"
      variant="ghost"
      icon={icons[theme]}
      onClick={toggleTheme}
    />
  )
}

type SideNavItem = {
  title: string
  icon: LucideIcon
  href: string
  subItems?: SideNavItem[] | undefined
}

type SideNavGroup = {
  name: string
  items: SideNavItem[]
}

const SideNavItems: SideNavGroup[] = [
  {
    name: 'Sell',
    items: [
      { href: '/', icon: ShoppingCart, title: 'POS' },
      { href: '/orders', icon: ReceiptText, title: 'Orders' },
    ],
  },
  {
    name: 'Manage',
    items: [
      {
        href: '/products',
        icon: Package,
        title: 'Products',
        subItems: [{ icon: TagIcon, href: '/categories', title: 'Categories' }],
      },
      { href: '/inventory', icon: Boxes, title: 'Inventory' },
      { href: '/expenses', icon: Wallet, title: 'Expenses' },
    ],
  },
  {
    name: 'Analytics',
    items: [{ href: '/reports', icon: BarChart2, title: 'Reports' }],
  },
]

function AppSideNavBar() {
  const { pathname } = useLocation()
  return (
    <SideNav collapsible footerIcons={<ToggleThemeButton />}>
      {SideNavItems.map((item) => (
        <SideNavSection key={item.name} title={item.name}>
          {item.items.map((navItem, index) => (
            <SideNavItem
              label={navItem.title}
              icon={navItem.icon}
              href={navItem.href}
              isSelected={navItem.href == pathname}
              key={index + navItem.title}
            >
              {navItem.subItems && navItem.subItems.length > 0
                ? navItem.subItems.map((subItem) => (
                    <SideNavItem
                      label={subItem.title}
                      icon={subItem.icon}
                      href={subItem.href}
                      isSelected={subItem.href == pathname}
                      key={index + subItem.title}
                    />
                  ))
                : null}
            </SideNavItem>
          ))}
        </SideNavSection>
      ))}
    </SideNav>
  )
}

export default function AppLayout() {
  return (
    <AppShell contentPadding={0} sideNav={<AppSideNavBar />}>
      <Outlet />
    </AppShell>
  )
}
