'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createProductAction, updateProductAction } from '@/actions/products'
import type { Product } from '@/types/database'

interface ProductFormProps {
  product?: Product
  storeId: string
  onSuccess?: () => void
}

export function ProductForm({ product, storeId, onSuccess }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('store_id', storeId)
    formData.set('is_active', String(isActive))

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, formData)
        : await createProductAction(formData)

      if (result.error) {
        alert(result.error)
        return
      }

      onSuccess?.()
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name}
            required
            placeholder="e.g., Hair Pomade"
          />
        </div>

        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            name="sku"
            defaultValue={product?.sku ?? ''}
            placeholder="e.g., POMADE-001"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            defaultValue={product?.category ?? ''}
            placeholder="e.g., Hair Products"
          />
        </div>

        <div>
          <Label htmlFor="price">Sell Price ($) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.price ?? 0}
            required
          />
        </div>

        <div>
          <Label htmlFor="cost">Cost ($)</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.cost ?? ''}
            placeholder="Optional"
          />
        </div>

        <div>
          <Label htmlFor="quantity_in_stock">Quantity in Stock *</Label>
          <Input
            id="quantity_in_stock"
            name="quantity_in_stock"
            type="number"
            min="0"
            defaultValue={product?.quantity_in_stock ?? 0}
            required
          />
        </div>

        <div>
          <Label htmlFor="low_stock_threshold">Low Stock Alert</Label>
          <Input
            id="low_stock_threshold"
            name="low_stock_threshold"
            type="number"
            min="0"
            defaultValue={product?.low_stock_threshold ?? 5}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={product?.description ?? ''}
            placeholder="Product description..."
            rows={3}
          />
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending} className="bg-[#8B3A3A] hover:bg-[#722F2F]">
          {isPending ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
