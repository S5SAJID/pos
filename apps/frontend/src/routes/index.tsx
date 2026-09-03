import { createFileRoute } from '@tanstack/react-router'
import { Button, Heading, Text, toast } from '@medusajs/ui'
import { authClient } from '#/lib/auth-client.ts'
import { backendClient } from '#/lib/backend.ts';

export const Route = createFileRoute('/')({
  component: Home,
  loader: async ({ context }) => {
    await context.queryClient.query({queryKey: ["products"], queryFn: async () => {
      const resp = await backendClient.data.products.$get();
      return await resp.json();
    }})
  },
})

function Home() {
  async function handleClick() {
    authClient.signIn.email(
      {
        email: 'hayakhan.45@gmail.com',
        password: 'idontknowwhyiusedhayasname',
      },
      {
        onSuccess: async () => {
          toast.success('Welcome back')
        },
        onError: async (e) => {
          toast.error(e.error.message)
        },
      },
    )
  }
  return (
    <div className="p-8">
      <Heading>Products</Heading>
      <Text className="mt-4">
        Edit <code>src/routes/index.tsx</code> to get started.
      </Text>
      <Button onClick={handleClick}>Get Started</Button>
    </div>
  )
}
