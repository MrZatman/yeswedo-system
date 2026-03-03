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
import { ProductForm } from './ProductForm'
import { Plus } from 'lucide-react'
import type { Product } from '@/types/database'

interface ProductModalProps {
  storeId: string
  product?: Product
  trigger?: React.ReactNode
}

export function ProductModal({ storeId, product, trigger }: ProductModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#8B3A3A] hover:bg-[#722F2F]">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <ProductForm
          product={product}
          storeId={storeId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
