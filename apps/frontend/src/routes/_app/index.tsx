import { CartPanel } from '#/components/pos/CartPanel.tsx'
import { ProductGrid } from '#/components/pos/ProductGrid.tsx'
import type { RespProduct } from '#/components/products-crud.tsx'
import { backendClient } from '#/lib/backend.ts'
import {
  useCartItems,
  usePaymentMethod,
  usePosActions,
} from '#/lib/pos-store.ts'
import { printReciept } from '#/lib/print-lib.tsx'
import { Layout, LayoutContent, LayoutPanel } from '@astryxdesign/core/Layout'
import { useToast } from '@astryxdesign/core/Toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/')({ component: RouteComponent })

function RouteComponent() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const cartItems = useCartItems()
  const paymentMethod = usePaymentMethod()
  const { clearCart } = usePosActions()

  const { data: products = [], isLoading } = useQuery<RespProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await backendClient.data.products.$get()
      return await res.json()
    },
  })

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await backendClient.data.transactions.$post({
        json: {
          paymentMethod,
          items: cartItems.map((item) => ({
            id: item.productId,
            quantity: item.quantity,
          })),
        },
      })

      const data = await res.json()

      if (!res.ok || !('success' in data) || !data.success) {
        const msg = 'error' in data ? data.error : 'Failed to confirm order'
        throw new Error(msg as string)
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })

      const orderId =
        'transactionId' in data && typeof data.transactionId === 'string'
          ? data.transactionId
          : 'unknown'

      printReciept({
        orderId,
        items: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        total:
          'totalPrice' in data && typeof data.totalPrice === 'number'
            ? data.totalPrice
            : cartItems.reduce((t, i) => t + i.price * i.quantity, 0),
        paymentMethod,
        createdAt: new Date(),
      })

      clearCart()

      toast({
        type: 'info',
        body: 'Order confirmed successfully!',
      })
    },
    onError: (err: Error) => {
      toast({
        type: 'error',
        body: err.message || 'Failed to confirm order. Please try again.',
      })
    },
  })

  return (
    <Layout
      height="fill"
      defaultHasDividers
      content={
        <LayoutContent padding={6}>
          <ProductGrid products={products} isLoading={isLoading} />
        </LayoutContent>
      }
      end={
        <LayoutPanel width={380} hasDivider padding={0}>
          <CartPanel
            isConfirming={confirmMutation.isPending}
            onConfirm={() => confirmMutation.mutate()}
          />
        </LayoutPanel>
      }
    />
  )
}
