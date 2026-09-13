import type { PaymentMethod } from '@pos/backend'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  maxQuantity: number
}

interface PosState {
  items: CartItem[]
  paymentMethod: PaymentMethod
  actions: {
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    setPaymentMethod: (method: PaymentMethod) => void
  }
}

const usePosStore = create<PosState>()(
  devtools(
    (set) => ({
      items: [],
      paymentMethod: 'CASH',
      actions: {
        addItem: (item) =>
          set(
            (state) => {
              const existing = state.items.find((i) => i.productId === item.productId)
              if (existing) {
                return {
                  items: state.items.map((i) =>
                    i.productId === item.productId ? { ...i, quantity: Math.min(i.quantity + 1, i.maxQuantity) } : i,
                  ),
                }
              }
              return { items: [...state.items, { ...item, quantity: 1 }] }
            },
            false,
            'addItem',
          ),

        removeItem: (productId) =>
          set(
            (state) => ({
              items: state.items.filter((i) => i.productId !== productId),
            }),
            false,
            'removeItem',
          ),

        updateQuantity: (productId, quantity) =>
          set(
            (state) => {
              if (quantity <= 0) {
                return { items: state.items.filter((i) => i.productId !== productId) }
              }
              return {
                items: state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxQuantity) } : i,
                ),
              }
            },
            false,
            'updateQuantity',
          ),

        clearCart: () => set({ items: [] }, false, 'clearCart'),

        setPaymentMethod: (method) => set({ paymentMethod: method }, false, 'setPaymentMethod'),
      },
    }),
    { name: 'PosStore' },
  ),
)

// Atomic selector hooks — each subscribes only to the slice it needs
export const useCartItems = () => usePosStore((s) => s.items)
export const usePaymentMethod = () => usePosStore((s) => s.paymentMethod)
export const usePosActions = () => usePosStore((s) => s.actions)

export const useCartTotal = () =>
  usePosStore((s) => s.items.reduce((total, item) => total + item.price * item.quantity, 0))

export const useCartItemCount = () => usePosStore((s) => s.items.reduce((count, item) => count + item.quantity, 0))

export const useIsProductInCart = (productId: string) =>
  usePosStore((s) => s.items.some((i) => i.productId === productId))
