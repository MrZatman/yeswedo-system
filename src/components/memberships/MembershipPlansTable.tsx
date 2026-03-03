'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { MoreHorizontal, Search, Pencil, Trash2, Scissors, Percent } from 'lucide-react'
import { deleteMembershipPlanAction, toggleMembershipPlanActiveAction } from '@/actions/memberships'
import { MembershipPlanModal } from './MembershipPlanModal'
import type { MembershipPlan } from '@/types/database'

interface MembershipPlansTableProps {
  plans: MembershipPlan[]
  storeId: string
}

export function MembershipPlansTable({ plans, storeId }: MembershipPlansTableProps) {
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const filtered = plans.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortcode.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteMembershipPlanAction(deleteId)
      if (result.error) {
        alert(result.error)
        setDeleteId(null)
        return
      }
      setDeleteId(null)
      router.refresh()
    })
  }

  const handleToggleActive = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      await toggleMembershipPlanActiveAction(id, !currentActive)
      router.refresh()
    })
  }

  const formatPrice = (price: number, period: string) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
    return `${formatted}/${period === 'monthly' ? 'mo' : 'yr'}`
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Benefits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No membership plans found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{plan.name}</span>
                      {plan.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {plan.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {plan.shortcode}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(plan.price, plan.billing_period)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {plan.haircuts_included > 0 && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Scissors className="h-3 w-3 mr-1" />
                          {plan.haircuts_included === 999 ? 'Unlimited' : plan.haircuts_included} cuts
                        </Badge>
                      )}
                      {plan.discount_percentage > 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          <Percent className="h-3 w-3 mr-1" />
                          {plan.discount_percentage}% off
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={() => handleToggleActive(plan.id, plan.is_active)}
                      disabled={isPending}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <MembershipPlanModal
                          storeId={storeId}
                          plan={plan}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => setDeleteId(plan.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Membership Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plan? Plans with active memberships cannot be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
