import { authClient } from '#/lib/auth.ts'
import { useToast } from '@astryxdesign/core'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { Center } from '@astryxdesign/core/Center'
import { VStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { Text } from '@astryxdesign/core/Text'
import { TextInput } from '@astryxdesign/core/TextInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { type CSSProperties } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundImage: `url("/background.avif")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}

function LoginPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'hayakhan.45@gmail.com',
      password: 'idontknowwhyiusedhayasname',
    },
  })

  const toast = useToast()
  const navigate = useNavigate()

  const onSubmit = async (data: LoginFormValues) => {
    const responce = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })
    if (responce.error) {
      toast({
        type: 'error',
        body: responce.error.message,
        autoHideDuration: 1000,
        isAutoHide: true,
      })
      return
    }
    toast({
      body: `Welcome Back, ${responce.data.user.name}.`,
    })
    await navigate({ to: '/' })
  }

  return (
    <Center axis="both" padding={6} style={pageStyle}>
      <Card padding={8} width="100%" maxWidth={400}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={4} hAlign="stretch">
            <VStack gap={1} hAlign="center">
              <Text type="display-1" as="h2">
                Welcome back
              </Text>
              <Text type="body" color="secondary" size="sm">
                Enter your details to sign in to your account
              </Text>
            </VStack>

            <VStack gap={2}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Work email"
                    isLabelHidden
                    type="email"
                    placeholder="you@company.com"
                    {...field}
                    size="lg"
                    status={
                      errors.email
                        ? {
                            type: 'error',
                            message: errors.email?.message,
                          }
                        : undefined
                    }
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Password"
                    isLabelHidden
                    type="password"
                    placeholder="Password"
                    {...field}
                    size="lg"
                    status={
                      errors.password
                        ? {
                            type: 'error',
                            message: errors.password?.message,
                          }
                        : undefined
                    }
                  />
                )}
              />
            </VStack>

            <Button label="Sign in" variant="primary" size="lg" type="submit" isLoading={isSubmitting} />

            <VStack hAlign="center">
              <Text type="supporting" color="secondary">
                Don&apos;t have an account?{' '}
                <Link href="mailto:s5sajidyt@gmail.com" target="_blank" type="supporting">
                  Request access
                </Link>
              </Text>
            </VStack>
          </VStack>
        </form>
      </Card>
    </Center>
  )
}
