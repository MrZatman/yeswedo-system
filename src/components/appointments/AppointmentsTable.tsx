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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Check, X, Clock, Play } from 'lucide-react'
import { updateAppointmentStatusAction } from '@/actions/appointments'

interface Appointment {
  id: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  services: { id: string; name: string; price: number }[]
  total: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  client: { id: string; name: string; phone: string | null }
  staff: { id: string; name: string }
}

interface AppointmentsTableProps {
  appointments: Appointment[]
}

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      await updateAppointmentStatusAction(id, status)
      router.refresh()
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'no_show':
        return <Badge className="bg-gray-100 text-gray-800">No Show</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Barber</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                No appointments found
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell className="font-medium">
                  {formatDate(apt.date)}
                </TableCell>
                <TableCell>
                  {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{apt.client.name}</p>
                    {apt.client.phone && (
                      <p className="text-sm text-gray-500">{apt.client.phone}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{apt.staff.name}</TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    {apt.services.map(s => s.name).join(', ') || '-'}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  ${apt.total.toFixed(2)}
                </TableCell>
                <TableCell>{getStatusBadge(apt.status)}</TableCell>
                <TableCell>
                  {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {apt.status === 'scheduled' && (
                          <DropdownMenuItem onSelect={() => handleStatusChange(apt.id, 'confirmed')}>
                            <Check className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )}
                        {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                          <DropdownMenuItem onSelect={() => handleStatusChange(apt.id, 'in_progress')}>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </DropdownMenuItem>
                        )}
                        {apt.status === 'in_progress' && (
                          <DropdownMenuItem onSelect={() => handleStatusChange(apt.id, 'completed')}>
                            <Check className="mr-2 h-4 w-4" />
                            Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleStatusChange(apt.id, 'no_show')}>
                          <Clock className="mr-2 h-4 w-4" />
                          No Show
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={() => handleStatusChange(apt.id, 'cancelled')}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
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
  )
}
