import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { TanStackDevtools } from '@tanstack/react-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { ThemeProvider, useThemeChanger } from '#/providers/theme.tsx'
import { LinkProvider } from '@astryxdesign/core/Link'
import { Theme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'
import '@astryxdesign/theme-neutral/theme.css'
import '@fontsource-variable/figtree/wght.css'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import '../styles.css'

type MyRootContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRootContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: 'React Query',
            render: <ReactQueryDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}

function MainAppContent() {
  const { theme } = useThemeChanger()

  return (
    <Theme theme={neutralTheme} mode={theme}>
      <LinkProvider component={Link}>
        <Outlet />
      </LinkProvider>
    </Theme>
  )
}
