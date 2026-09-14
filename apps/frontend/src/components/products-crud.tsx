import { backendClient } from '#/lib/backend.ts'
import { Text } from '@astryxdesign/core/Text'
import { AlertDialog } from '@astryxdesign/core/AlertDialog'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup'
import { HStack, Layout, LayoutContent, LayoutFooter, VStack } from '@astryxdesign/core/Layout'
import { Link } from '@astryxdesign/core/Link'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Product } from '@pos/backend'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatPriceForApi } from '#/lib/utils'

export type RespProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  quantity: number
  minStockLevel: number
  createdAt: string
  updatedAt: string
}

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(255, 'Product name cannot exceed 255 characters'),
  sku: z.string().trim().max(255, 'SKU cannot exceed 255 characters').optional().or(z.literal('')),
  price: z
    .string()
    .trim()
    .min(1, 'Selling price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid price (e.g. 150 or 150.00)')
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, 'Selling price cannot be negative'),
  cost: z
    .string()
    .trim()
    .min(1, 'Cost price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid cost (e.g. 100 or 100.00)')
    .refine((v) => Number.isFinite(Number(v)) && Number(v) >= 0, 'Cost price cannot be negative'),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

interface CreateProductModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProductModal({ isOpen, onOpenChange }: CreateProductModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: '',
      cost: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        sku: '',
        price: '',
        cost: '',
      })
    }
  }, [isOpen, reset])

  const createMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = {
        name: values.name.trim(),
        sku: values.sku?.trim() || null,
        price: formatPriceForApi(values.price),
        cost: formatPriceForApi(values.cost),
      }

      const res = await backendClient.data.products.$post({
        json: payload,
      })

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(errorData.error ?? 'Failed to create product')
      }

      return await res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onOpenChange(false)
      toast({
        type: 'info',
        body: `Product "${variables.name}" created successfully.`,
        endContent: (
          <Link href="/inventory" hasUnderline>
            Manage stock
          </Link>
        ),
      })
    },
    onError: (err: Error) => {
      toast({
        type: 'error',
        body: err.message || 'Error creating product. Please try again.',
      })
    },
  })

  const onSubmit = (values: ProductFormValues) => {
    createMutation.mutate(values)
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={460}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Layout
          header={
            <DialogHeader
              title="Create Product"
              subtitle="Add a new item to your POS catalog"
              onOpenChange={onOpenChange}
            />
          }
          content={
            <LayoutContent padding={4}>
              <VStack gap={4}>
                <FormLayout defaultOptionality="required">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="Product Name"
                        placeholder="e.g. Whole Wheat Bread"
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        hasAutoFocus
                        status={errors.name ? { type: 'error', message: errors.name.message } : undefined}
                      />
                    )}
                  />

                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <TextInput
                        label="SKU"
                        placeholder="e.g. BRD-001 or barcode"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        labelTooltip="Unique barcode or identifier for quick scanning"
                        isOptional
                        status={errors.sku ? { type: 'error', message: errors.sku.message } : undefined}
                      />
                    )}
                  />

                  <FormLayout direction="horizontal" defaultOptionality="required">
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <InputGroup
                          label="Selling Price"
                          isRequired
                          status={errors.price ? { type: 'error', message: errors.price.message } : undefined}
                        >
                          <InputGroupText>Rs.</InputGroupText>
                          <TextInput
                            label="Selling Price"
                            isLabelHidden
                            placeholder="0.00"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </InputGroup>
                      )}
                    />

                    <Controller
                      name="cost"
                      control={control}
                      render={({ field }) => (
                        <InputGroup
                          label="Cost Price"
                          isRequired
                          status={errors.cost ? { type: 'error', message: errors.cost.message } : undefined}
                        >
                          <InputGroupText>Rs.</InputGroupText>
                          <TextInput
                            label="Cost Price"
                            isLabelHidden
                            placeholder="0.00"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </InputGroup>
                      )}
                    />
                  </FormLayout>
                </FormLayout>
                <Text type="supporting" color="secondary">
                  Initial stock can be added anytime in the Inventory section.
                </Text>
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end" padding={3}>
                <Button
                  label="Cancel"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  isDisabled={createMutation.isPending}
                />
                <Button label="Create product" type="submit" variant="primary" isLoading={createMutation.isPending} />
              </HStack>
            </LayoutFooter>
          }
        />
      </form>
    </Dialog>
  )
}

interface EditProductModalProps {
  product: RespProduct | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProductModal({ product, isOpen, onOpenChange }: EditProductModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: '',
      cost: '',
    },
  })

  useEffect(() => {
    if (product && isOpen) {
      reset({
        name: product.name,
        sku: product.sku ?? '',
        price: product.price ? parseFloat(product.price).toFixed(2) : '',
        cost: product.cost ? parseFloat(product.cost).toFixed(2) : '',
      })
    }
  }, [product, isOpen, reset])

  const editMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!product) return

      const payload = {
        id: product.id,
        name: values.name.trim(),
        sku: values.sku?.trim() || null,
        price: formatPriceForApi(values.price),
        cost: formatPriceForApi(values.cost),
        isDeleted: product.isDeleted,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(),
      }

      const res = await backendClient.data.products.$put({
        json: payload,
      })

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(errorData.error ?? 'Failed to update product')
      }

      return await res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onOpenChange(false)
      toast({
        type: 'info',
        body: `Product "${variables?.name}" updated successfully.`,
      })
    },
    onError: (err: Error) => {
      toast({
        type: 'error',
        body: err.message || 'Error updating product. Please try again.',
      })
    },
  })

  const onSubmit = (values: ProductFormValues) => {
    editMutation.mutate(values)
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={460}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Layout
          header={
            <DialogHeader
              title="Edit Product"
              subtitle={`Update details for ${product?.name ?? 'product'}`}
              onOpenChange={onOpenChange}
            />
          }
          content={
            <LayoutContent padding={4}>
              <FormLayout defaultOptionality="required">
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="Product Name"
                      placeholder="e.g. Whole Wheat Bread"
                      value={field.value}
                      onChange={field.onChange}
                      isRequired
                      hasAutoFocus
                      status={errors.name ? { type: 'error', message: errors.name.message } : undefined}
                    />
                  )}
                />

                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      label="SKU"
                      placeholder="e.g. BRD-001 or barcode"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      isOptional
                      labelTooltip="Unique barcode or identifier for rapid scanning"
                      status={errors.sku ? { type: 'error', message: errors.sku.message } : undefined}
                    />
                  )}
                />

                <FormLayout direction="horizontal" defaultOptionality="required">
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <InputGroup
                        label="Selling Price"
                        isRequired
                        status={errors.price ? { type: 'error', message: errors.price.message } : undefined}
                      >
                        <InputGroupText>Rs.</InputGroupText>
                        <TextInput
                          label="Selling Price"
                          isLabelHidden
                          placeholder="0.00"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </InputGroup>
                    )}
                  />

                  <Controller
                    name="cost"
                    control={control}
                    render={({ field }) => (
                      <InputGroup
                        label="Cost Price"
                        isRequired
                        status={errors.cost ? { type: 'error', message: errors.cost.message } : undefined}
                      >
                        <InputGroupText>Rs.</InputGroupText>
                        <TextInput
                          label="Cost Price"
                          isLabelHidden
                          placeholder="0.00"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </InputGroup>
                    )}
                  />
                </FormLayout>
              </FormLayout>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end" padding={3}>
                <Button
                  label="Cancel"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  isDisabled={editMutation.isPending}
                />
                <Button label="Save changes" type="submit" variant="primary" isLoading={editMutation.isPending} />
              </HStack>
            </LayoutFooter>
          }
        />
      </form>
    </Dialog>
  )
}

interface DeleteProductModalProps {
  product: RespProduct | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProductModal({ product, isOpen, onOpenChange }: DeleteProductModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await backendClient.data.products[':id'].$delete({
        param: { id },
      })

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(errorData.error ?? 'Failed to delete product')
      }

      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      onOpenChange(false)
      toast({
        type: 'info',
        body: `Product "${product?.name}" was deleted successfully.`,
      })
    },
    onError: (err: Error) => {
      toast({
        type: 'error',
        body: err.message || 'Error deleting product. Please try again.',
      })
    },
  })

  if (!product) return null

  return (
    <AlertDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`Delete "${product.name}"?`}
      description="This action will archive this product from your catalog. It will no longer appear in POS sales, checkout, or new inventory records."
      actionLabel="Delete product"
      cancelLabel="Cancel"
      actionVariant="destructive"
      isActionLoading={deleteMutation.isPending}
      onAction={() => deleteMutation.mutate(product.id)}
    />
  )
}
