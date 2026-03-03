# Form Patterns - YesWeDo

Patrones para formularios con React Hook Form + Zod + Server Actions.

## Setup Básico

```typescript
// lib/validations/client.ts
import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>
```

## Componente de Formulario

```tsx
// components/forms/ClientForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { clientSchema, type ClientFormData } from '@/lib/validations/client'
import { createClient, updateClient } from '@/actions/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface ClientFormProps {
  client?: Client
  storeId: string
  onSuccess?: () => void
}

export function ClientForm({ client, storeId, onSuccess }: ClientFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? '',
      email: client?.email ?? '',
      phone: client?.phone ?? '',
    },
  })

  function onSubmit(data: ClientFormData) {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.set('store_id', storeId)
        Object.entries(data).forEach(([key, value]) => {
          if (value) formData.set(key, value)
        })

        if (client) {
          await updateClient(client.id, formData)
        } else {
          await createClient(formData)
        }

        onSuccess?.()
      } catch (error) {
        form.setError('root', {
          message: error instanceof Error ? error.message : 'Something went wrong',
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </form>
    </Form>
  )
}
```

## Server Action

```typescript
// actions/clients.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/client'

export async function createClient(formData: FormData) {
  const supabase = createClient()

  // Validar con Zod
  const raw = Object.fromEntries(formData)
  const result = clientSchema.safeParse(raw)

  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }

  // Insertar
  const { data, error } = await supabase
    .from('clients')
    .insert({
      store_id: formData.get('store_id') as string,
      ...result.data,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/clients')
  return data
}
```

## Formulario en Modal

```tsx
// components/modals/ClientModal.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ClientForm } from '@/components/forms/ClientForm'
import { Plus } from 'lucide-react'

export function ClientModal({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <ClientForm storeId={storeId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
```

## Validaciones Comunes

```typescript
// lib/validations/common.ts
import { z } from 'zod'

export const phoneSchema = z
  .string()
  .regex(/^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''))

export const emailSchema = z
  .string()
  .email('Invalid email')
  .optional()
  .or(z.literal(''))

export const uuidSchema = z.string().uuid('Invalid ID')

export const dateSchema = z.coerce.date()

export const priceSchema = z.coerce
  .number()
  .min(0, 'Price must be positive')
  .transform((val) => Math.round(val * 100) / 100)
```

## Form con File Upload

```tsx
<FormField
  control={form.control}
  name="avatar"
  render={({ field: { onChange, value, ...field } }) => (
    <FormItem>
      <FormLabel>Photo</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0])}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Form con Select

```tsx
<FormField
  control={form.control}
  name="membership_plan"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Membership Plan</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.name} - ${plan.price}/mo
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```
