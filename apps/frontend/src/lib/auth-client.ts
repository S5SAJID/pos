import { createAuthClient } from 'better-auth/react'

if (!import.meta.env.VITE_BACKEND_URL) {
  throw Error('VITE_BACKEND_URL needs to be initialized first.')
}

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL,
})
