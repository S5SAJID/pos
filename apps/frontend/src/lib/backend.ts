import type { AppType } from '@pos/backend'
import { hc } from 'hono/client'

export const backendClient = hc<AppType>(import.meta.env.VITE_BACKEND_URL, {
  init: {
    credentials: 'include',
  },
})
