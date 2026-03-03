'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface ClockRecordWithUser {
  id: string
  store_id: string
  user_id: string
  clock_in: string
  clock_out: string | null
  hours_worked: number | null
  break_minutes: number
  status: 'active' | 'completed' | 'edited'
  notes: string | null
  user: {
    id: string
    name: string
    email: string
  }
}

interface ClockRecordsTableProps {
  records: ClockRecordWithUser[]
}

export function ClockRecordsTable({ records }: ClockRecordsTableProps) {
  const [search, setSearch] = useState('')

  const filtered = records.filter(
    (r) =>
      r.user.name.toLowerCase().includes(search.toLowerCase()) ||
      r.user.email.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'edited':
        return <Badge className="bg-yellow-100 text-yellow-800">Edited</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name..."
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
              <TableHead>Date</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>Break</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No clock records found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {formatDate(record.clock_in)}
                  </TableCell>
                  <TableCell>{record.user.name}</TableCell>
                  <TableCell>{formatTime(record.clock_in)}</TableCell>
                  <TableCell>
                    {record.clock_out ? formatTime(record.clock_out) : '-'}
                  </TableCell>
                  <TableCell>
                    {record.break_minutes > 0 ? `${record.break_minutes} min` : '-'}
                  </TableCell>
                  <TableCell className="font-mono">
                    {record.hours_worked ? `${record.hours_worked.toFixed(2)}h` : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
