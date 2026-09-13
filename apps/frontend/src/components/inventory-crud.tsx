import { StockStatus, type StockStatusType } from '#/components/stock-status.tsx'
import { backendClient } from '#/lib/backend.ts'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { HStack, Layout, LayoutContent, LayoutFooter, VStack } from '@astryxdesign/core/Layout'
import { NumberInput } from '@astryxdesign/core/NumberInput'
import { Selector } from '@astryxdesign/core/Selector'
import { Text } from '@astryxdesign/core/Text'
import { useToast } from '@astryxdesign/core/Toast'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Product } from '@pos/backend'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

type RespProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  quantity: number
  minStockLevel: number
  createdAt: string
  updatedAt: string
}

export type EnrichedInventoryItem = {
  id: string
  inventoryId?: string
  productId: string
  productName: string
  sku: string
  quantity: number
  minStockLevel: number
  stockStatus: StockStatusType
  cost?: string
  createdAt?: string
  updatedAt?: string
}

// Add Inventory Schema & Modal
export const addInventorySchema = z.object({
  productId: z.string().trim().min(1, 'Please select a product'),
  quantity: z
    .number({
      error: 'Please enter a valid quantity',
    })
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1'),
  minStockLevel: z
    .number({
      error: 'Please enter a valid minimum stock level',
    })
    .int('Minimum stock level must be a whole number')
    .nonnegative('Minimum stock level cannot be negative'),
})

export type AddInventoryFormValues = z.infer<typeof addInventorySchema>

type AddInventoryModalProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  preselectedProductId?: string
}

export function AddInventoryModal({ isOpen, onOpenChange, preselectedProductId }: AddInventoryModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: productsData, isLoading: isLoadingProducts } = useQuery<RespProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await backendClient.data.products.$get()
      return await res.json()
    },
    enabled: isOpen,
  })

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddInventoryFormValues>({
    resolver: zodResolver(addInventorySchema),
    defaultValues: {
      productId: preselectedProductId ?? '',
      quantity: 1,
      minStockLevel: 0,
    },
  })

  const selectedProductId = useWatch({ control, name: 'productId' })
  const quantityValue = useWatch({ control, name: 'quantity' })

  const selectedProduct = useMemo(() => {
    if (!productsData || !selectedProductId) return null
    return productsData.find((p) => p.id === selectedProductId) ?? null
  }, [productsData, selectedProductId])

  const productOptions = useMemo(() => {
    if (!productsData) return []
    return productsData.map((p) => ({
      value: p.id,
      label: p.sku ? `${p.name} (${p.sku})` : p.name,
    }))
  }, [productsData])

  useEffect(() => {
    if (isOpen) {
      reset({
        productId: preselectedProductId ?? '',
        quantity: 1,
        minStockLevel: 0,
      })
    }
  }, [isOpen, preselectedProductId, reset])

  // Automatically sync minStockLevel when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setValue('minStockLevel', selectedProduct.minStockLevel ?? 0)
    }
  }, [selectedProduct, setValue])

  const addMutation = useMutation({
    mutationFn: async (values: AddInventoryFormValues) => {
      const payload = {
        productId: values.productId,
        quantity: values.quantity,
        minStockLevel: values.minStockLevel,
      }

      const res = await backendClient.data.inventory.$post({
        json: payload,
      })

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(errorData.error ?? 'Failed to add inventory record')
      }

      return await res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      onOpenChange(false)
      const pName = selectedProduct?.name ?? 'Product'
      toast({
        type: 'info',
        body: `Added ${variables.quantity} units to "${pName}".`,
      })
    },
    onError: (err: Error) => {
      toast({
        type: 'error',
        body: err.message || 'Error adding inventory. Please try again.',
      })
    },
  })

  const onSubmit = (values: AddInventoryFormValues) => {
    addMutation.mutate(values)
  }

  const estimatedExpense = useMemo(() => {
    if (!selectedProduct || !quantityValue || quantityValue <= 0) return null
    const cost = parseFloat(selectedProduct.cost)
    if (isNaN(cost)) return null
    return (cost * quantityValue).toFixed(2)
  }, [selectedProduct, quantityValue])

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={450}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Layout
          header={
            <DialogHeader
              title="Add Inventory Record"
              subtitle="Restock a product and update low stock threshold"
              onOpenChange={onOpenChange}
            />
          }
          content={
            <LayoutContent padding={4}>
              <VStack gap={4}>
                <FormLayout defaultOptionality="required">
                  <Controller
                    name="productId"
                    control={control}
                    render={({ field }) => (
                      <Selector
                        label="Product"
                        placeholder={
                          isLoadingProducts
                            ? 'Loading products...'
                            : productOptions.length === 0
                              ? 'No products in catalog'
                              : 'Select a product to restock...'
                        }
                        options={productOptions}
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        hasSearch
                        searchPlaceholder="Search product by name or SKU..."
                        isDisabled={isLoadingProducts || productOptions.length === 0}
                        status={
                          errors.productId
                            ? {
                                type: 'error',
                                message: errors.productId.message,
                              }
                            : undefined
                        }
                      />
                    )}
                  />

                  {selectedProduct && (
                    <VStack gap={1}>
                      <HStack gap={4} vAlign="center">
                        <Text type="supporting" color="secondary">
                          Current Stock: <Text weight="bold">{selectedProduct.quantity} units</Text>
                        </Text>
                        <Text type="supporting" color="secondary">
                          Unit Cost: <Text weight="bold">Rs. {parseFloat(selectedProduct.cost).toFixed(2)}</Text>
                        </Text>
                      </HStack>
                    </VStack>
                  )}

                  <FormLayout direction="horizontal" defaultOptionality="required">
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          label="Quantity to Add"
                          value={field.value}
                          onChange={field.onChange}
                          min={1}
                          step={1}
                          isIntegerOnly
                          hasNumberSteppers
                          isRequired
                          status={
                            errors.quantity
                              ? {
                                  type: 'error',
                                  message: errors.quantity.message,
                                }
                              : undefined
                          }
                        />
                      )}
                    />

                    <Controller
                      name="minStockLevel"
                      control={control}
                      render={({ field }) => (
                        <NumberInput
                          label="Minimum Stock Level"
                          value={field.value}
                          onChange={field.onChange}
                          min={0}
                          step={1}
                          isIntegerOnly
                          hasNumberSteppers
                          isRequired
                          labelTooltip="Threshold when stock is flagged as low"
                          status={
                            errors.minStockLevel
                              ? {
                                  type: 'error',
                                  message: errors.minStockLevel.message,
                                }
                              : undefined
                          }
                        />
                      )}
                    />
                  </FormLayout>
                </FormLayout>

                {estimatedExpense && (
                  <VStack gap={1}>
                    <Text type="supporting" color="secondary">
                      Supply Expense: <Text weight="bold">Rs. {estimatedExpense}</Text> will be automatically recorded
                      under Supply expenses.
                    </Text>
                  </VStack>
                )}
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Cancel"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  isDisabled={addMutation.isPending}
                />
                <Button label="Add stock" type="submit" variant="primary" isLoading={addMutation.isPending} />
              </HStack>
            </LayoutFooter>
          }
        />
      </form>
    </Dialog>
  )
}

// Update Inventory Schema & Modal
export const updateInventorySchema = z.object({
  quantity: z
    .number({
      error: 'Please enter a valid stock quantity',
    })
    .int('Quantity must be a whole number')
    .nonnegative('Stock quantity cannot be negative'),
  minStockLevel: z
    .number({
      error: 'Please enter a valid minimum stock level',
    })
    .int('Minimum stock level must be a whole number')
    .nonnegative('Minimum stock level cannot be negative'),
})

export type UpdateInventoryFormValues = z.infer<typeof updateInventorySchema>

type UpdateInventoryModalProps = {
  inventoryItem: EnrichedInventoryItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateInventoryModal({ inventoryItem, isOpen, onOpenChange }: UpdateInventoryModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateInventoryFormValues>({
    resolver: zodResolver(updateInventorySchema),
    defaultValues: {
      quantity: 0,
      minStockLevel: 0,
    },
  })

  const newQuantity = useWatch({ control, name: 'quantity' })

  useEffect(() => {
    if (inventoryItem && isOpen) {
      reset({
        quantity: inventoryItem.quantity >= 0 ? inventoryItem.quantity : 0,
        minStockLevel: inventoryItem.minStockLevel ?? 0,
      })
    }
  }, [inventoryItem, isOpen, reset])

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateInventoryFormValues) => {
      if (!inventoryItem) return

      if (inventoryItem.inventoryId) {
        // Update existing inventory entry
        const res = await backendClient.data.inventory[':id'].$put({
          param: { id: inventoryItem.inventoryId },
          json: {
            quantity: values.quantity,
            minStockLevel: values.minStockLevel,
          },
        })

        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(errorData.error ?? 'Failed to update inventory')
        }

        return await res.json()
      } else {
        // Initial inventory record creation for a product
        const res = await backendClient.data.inventory.$post({
          json: {
            productId: inventoryItem.productId,
            quantity: values.quantity,
            minStockLevel: values.minStockLevel,
          },
        })

        if (!res.ok) {
          const errorData = (await res.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(errorData.error ?? 'Failed to initialize inventory')
        }

        return await res.json()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      onOpenChange(false)
      toast({
        type: 'info',
        body: `Stock updated for "${inventoryItem?.productName}".`,
      })
    },
    onError: (err: Error) => {
      toast({
        type: 'error',
        body: err.message || 'Error updating stock. Please try again.',
      })
    },
  })

  const onSubmit = (values: UpdateInventoryFormValues) => {
    updateMutation.mutate(values)
  }

  const quantityDiff = inventoryItem && typeof newQuantity === 'number' ? newQuantity - inventoryItem.quantity : 0
  const addedExpense =
    inventoryItem?.cost && quantityDiff > 0 ? (parseFloat(inventoryItem.cost) * quantityDiff).toFixed(2) : null

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={480}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Layout
          header={
            <DialogHeader
              title="Update Inventory"
              subtitle={`Adjust stock for ${inventoryItem?.productName ?? 'product'}`}
              onOpenChange={onOpenChange}
            />
          }
          content={
            <LayoutContent padding={4}>
              <VStack gap={4}>
                <VStack gap={2}>
                  <HStack hAlign="between" vAlign="center">
                    <Text weight="bold">{inventoryItem?.productName}</Text>
                    {inventoryItem && (
                      <StockStatus quantity={inventoryItem.quantity} minStockLevel={inventoryItem.minStockLevel} />
                    )}
                  </HStack>
                  <Text type="supporting" color="secondary">
                    SKU: {inventoryItem?.sku ?? '—'} · Current in stock:{' '}
                    <Text weight="bold">{inventoryItem?.quantity ?? 0} units</Text>
                  </Text>
                </VStack>

                <FormLayout direction="horizontal" defaultOptionality="required">
                  <Controller
                    name="quantity"
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        label="Stock Quantity"
                        value={field.value}
                        onChange={field.onChange}
                        min={0}
                        step={1}
                        isIntegerOnly
                        hasNumberSteppers
                        isRequired
                        status={
                          errors.quantity
                            ? {
                                type: 'error',
                                message: errors.quantity.message,
                              }
                            : undefined
                        }
                      />
                    )}
                  />

                  <Controller
                    name="minStockLevel"
                    control={control}
                    render={({ field }) => (
                      <NumberInput
                        label="Minimum Stock Level"
                        value={field.value}
                        onChange={field.onChange}
                        min={0}
                        step={1}
                        isIntegerOnly
                        hasNumberSteppers
                        isRequired
                        labelTooltip="Threshold when stock is flagged as low"
                        status={
                          errors.minStockLevel
                            ? {
                                type: 'error',
                                message: errors.minStockLevel.message,
                              }
                            : undefined
                        }
                      />
                    )}
                  />
                </FormLayout>

                {quantityDiff > 0 && (
                  <Text type="supporting" color="secondary">
                    Increasing stock by +{quantityDiff} units
                    {addedExpense ? (
                      <>
                        {' '}
                        (
                        <Text weight="bold" color="primary">
                          Rs. {addedExpense}
                        </Text>
                        )
                      </>
                    ) : (
                      ''
                    )}{' '}
                    will log a Supply expense for the added items.
                  </Text>
                )}
                {quantityDiff < 0 && (
                  <Text type="supporting" color="secondary">
                    Adjusting stock count by {quantityDiff} units (inventory audit/shrinkage).
                  </Text>
                )}
              </VStack>
            </LayoutContent>
          }
          footer={
            <LayoutFooter hasDivider>
              <HStack gap={2} hAlign="end">
                <Button
                  label="Cancel"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  isDisabled={updateMutation.isPending}
                />
                <Button label="Save changes" type="submit" variant="primary" isLoading={updateMutation.isPending} />
              </HStack>
            </LayoutFooter>
          }
        />
      </form>
    </Dialog>
  )
}
