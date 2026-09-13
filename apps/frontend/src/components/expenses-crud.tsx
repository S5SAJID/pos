import { backendClient } from '#/lib/backend.ts'
import { formatPriceForApi } from '#/lib/utils'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import { FormLayout } from '@astryxdesign/core/FormLayout'
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup'
import { HStack, Layout, LayoutContent, LayoutFooter, VStack } from '@astryxdesign/core/Layout'
import { Selector } from '@astryxdesign/core/Selector'
import { Text } from '@astryxdesign/core/Text'
import { TextArea } from '@astryxdesign/core/TextArea'
import { TextInput } from '@astryxdesign/core/TextInput'
import { useToast } from '@astryxdesign/core/Toast'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ExpenseCategory } from '@pos/backend'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

export const EXPENSE_CATEGORY_OPTIONS: {
  value: ExpenseCategory
  label: string
}[] = [
  { value: 'SUPPLY', label: 'Supply & Inventory' },
  { value: 'SALARIES', label: 'Salaries & Wages' },
  { value: 'RENT', label: 'Rent & Lease' },
  { value: 'UTILITIES', label: 'Utilities (Electricity, Water, Internet)' },
  { value: 'MARKETING', label: 'Marketing & Advertising' },
  { value: 'SOFTWARE', label: 'Software & Subscriptions' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'TAXES', label: 'Taxes & Government Fees' },
  { value: 'TRAVEL', label: 'Travel & Transport' },
  { value: 'OTHER', label: 'Other Miscellaneous' },
]

export const expenseFormSchema = z.object({
  category: z.enum(
    ['RENT', 'SUPPLY', 'UTILITIES', 'SALARIES', 'MARKETING', 'SOFTWARE', 'TRAVEL', 'INSURANCE', 'TAXES', 'OTHER'],
    {
      error: 'Please select an expense category',
    },
  ),
  amount: z
    .string()
    .trim()
    .min(1, 'Expense amount is required')
    .regex(/^(\d+|\d{1,3}(,\d{3})+)(\.\d{1,2})?$/, 'Please enter a valid amount (e.g. 500 or 500.00)')
    .transform((v) => v.replace(/,/g, ''))
    .pipe(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid amount (e.g. 500 or 500.00)')
        .refine((v) => Number(v) > 0, 'Expense amount must be greater than zero'),
    ),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters'),
})

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

type AddExpenseModalProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseModal({ isOpen, onOpenChange }: AddExpenseModalProps) {
  const queryClient = useQueryClient()
  const toast = useToast()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: 'SUPPLY',
      amount: '',
      description: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        category: 'SUPPLY',
        amount: '',
        description: '',
      })
    }
  }, [isOpen, reset])

  const createMutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      const payload = {
        category: values.category,
        amount: formatPriceForApi(values.amount),
        description: values.description.trim(),
      }

      const res = await backendClient.data.expenses.$post({
        json: payload,
      })

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(errorData.error ?? 'Failed to record expense')
      }

      return await res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      onOpenChange(false)
      toast({
        type: 'info',
        body: `Expense of Rs. ${formatPriceForApi(variables.amount)} recorded successfully.`,
      })
    },
    onError: (err: Error) => {
      toast({
        type: 'error',
        body: err.message || 'Error recording expense. Please try again.',
      })
    },
  })

  const onSubmit = (values: ExpenseFormValues) => {
    createMutation.mutate(values)
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} purpose="form" width={480}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Layout
          header={
            <DialogHeader
              title="Add Expense"
              subtitle="Record a new operational or store expense"
              onOpenChange={onOpenChange}
            />
          }
          content={
            <LayoutContent padding={4}>
              <VStack gap={4}>
                <FormLayout defaultOptionality="required">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Selector
                        label="Expense Category"
                        placeholder="Select category..."
                        options={EXPENSE_CATEGORY_OPTIONS}
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        hasSearch
                        searchPlaceholder="Search category..."
                        status={
                          errors.category
                            ? {
                                type: 'error',
                                message: errors.category.message,
                              }
                            : undefined
                        }
                      />
                    )}
                  />

                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <InputGroup
                        label="Amount"
                        isRequired
                        status={
                          errors.amount
                            ? {
                                type: 'error',
                                message: errors.amount.message,
                              }
                            : undefined
                        }
                      >
                        <InputGroupText>Rs.</InputGroupText>
                        <TextInput
                          label="Amount"
                          isLabelHidden
                          placeholder="0.00"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </InputGroup>
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        label="Description"
                        placeholder="e.g. Monthly internet bill or store cleaning supplies"
                        value={field.value}
                        onChange={field.onChange}
                        isRequired
                        rows={3}
                        maxLength={500}
                        status={
                          errors.description
                            ? {
                                type: 'error',
                                message: errors.description.message,
                              }
                            : undefined
                        }
                      />
                    )}
                  />
                </FormLayout>
                <Text type="supporting" color="secondary">
                  Recorded expenses are automatically accounted in financial reports.
                </Text>
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
                  isDisabled={createMutation.isPending}
                />
                <Button label="Record expense" type="submit" variant="primary" isLoading={createMutation.isPending} />
              </HStack>
            </LayoutFooter>
          }
        />
      </form>
    </Dialog>
  )
}
