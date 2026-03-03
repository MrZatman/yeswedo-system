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
  DropdownMenuSeparator,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Search, Shield, User, UserX } from 'lucide-react'
import { updateStaffRoleAction, toggleStaffActiveAction, removeStaffAction } from '@/actions/staff'

interface StaffMember {
  id: string
  user_id: string
  store_id: string
  role: 'super_admin' | 'store_manager' | 'staff'
  is_active: boolean
  is_default: boolean
  created_at: string
  user: {
    id: string
    email: string
    name: string
    phone: string | null
    avatar_url: string | null
  }
}

interface StaffTableProps {
  staff: StaffMember[]
  currentUserId: string
}

export function StaffTable({ staff, currentUserId }: StaffTableProps) {
  const [search, setSearch] = useState('')
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const filtered = staff.filter(
    (s) =>
      s.user.name.toLowerCase().includes(search.toLowerCase()) ||
      s.user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleRemove = () => {
    if (!removeId) return
    startTransition(async () => {
      await removeStaffAction(removeId)
      setRemoveId(null)
      router.refresh()
    })
  }

  const handleRoleChange = (id: string, newRole: 'store_manager' | 'staff') => {
    startTransition(async () => {
      await updateStaffRoleAction(id, newRole)
      router.refresh()
    })
  }

  const handleToggleActive = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      await toggleStaffActiveAction(id, !currentActive)
      router.refresh()
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
      case 'store_manager':
        return <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
      default:
        return <Badge variant="outline">Staff</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search staff..."
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#8B3A3A] text-white text-xs">
                          {getInitials(member.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.user.email}</TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>
                    {member.is_active ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.user_id === currentUserId || member.role === 'super_admin' ? (
                      <span className="text-sm text-gray-400">-</span>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {member.role === 'staff' ? (
                            <DropdownMenuItem
                              onSelect={() => handleRoleChange(member.id, 'store_manager')}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Promote to Manager
                            </DropdownMenuItem>
                          ) : member.role === 'store_manager' ? (
                            <DropdownMenuItem
                              onSelect={() => handleRoleChange(member.id, 'staff')}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Demote to Staff
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            onSelect={() => handleToggleActive(member.id, member.is_active)}
                          >
                            {member.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => setRemoveId(member.id)}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Remove from Store
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!removeId} onOpenChange={() => setRemoveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this staff member from the store?
              They will lose access to this store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={isPending}
            >
              {isPending ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
