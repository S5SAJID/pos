import type { AppType } from '@pos/backend'
import { hc } from 'hono/client'

if (!import.meta.env.VITE_BACKEND_URL) {
  throw Error('VITE_BACKEND_URL needs to be initialized in .env')
}

export const backendClient = hc<AppType>(import.meta.env.VITE_BACKEND_URL, {
  init: {
    credentials: 'include',
  },
})
