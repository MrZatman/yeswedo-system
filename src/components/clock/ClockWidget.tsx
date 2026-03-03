'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Coffee, LogIn, LogOut } from 'lucide-react'
import { clockInAction, clockOutAction, addBreakAction } from '@/actions/clock'
import type { ClockRecord } from '@/types/database'

interface ClockWidgetProps {
  storeId: string
  activeRecord: ClockRecord | null
}

export function ClockWidget({ storeId, activeRecord }: ClockWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const [elapsed, setElapsed] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!activeRecord) {
      setElapsed('')
      return
    }

    const updateElapsed = () => {
      const start = new Date(activeRecord.clock_in)
      const now = new Date()
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000)

      const hours = Math.floor(diff / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60

      setElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [activeRecord])

  const handleClockIn = () => {
    startTransition(async () => {
      const result = await clockInAction(storeId)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  const handleClockOut = () => {
    if (!activeRecord) return
    startTransition(async () => {
      const result = await clockOutAction(activeRecord.id)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  const handleAddBreak = (minutes: number) => {
    if (!activeRecord) return
    startTransition(async () => {
      const result = await addBreakAction(activeRecord.id, minutes)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeRecord ? (
          <div className="space-y-4">
            <div className="text-center">
              <Badge className="bg-green-100 text-green-800 mb-2">Clocked In</Badge>
              <div className="text-4xl font-mono font-bold">{elapsed}</div>
              <p className="text-sm text-gray-500 mt-1">
                Started at {new Date(activeRecord.clock_in).toLocaleTimeString()}
              </p>
              {activeRecord.break_minutes > 0 && (
                <p className="text-sm text-gray-500">
                  Break: {activeRecord.break_minutes} min
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleAddBreak(15)}
                disabled={isPending}
              >
                <Coffee className="h-4 w-4 mr-1" />
                +15 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleAddBreak(30)}
                disabled={isPending}
              >
                <Coffee className="h-4 w-4 mr-1" />
                +30 min
              </Button>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={handleClockOut}
              disabled={isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isPending ? 'Processing...' : 'Clock Out'}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-gray-500">You are not clocked in</p>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleClockIn}
              disabled={isPending}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isPending ? 'Processing...' : 'Clock In'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
