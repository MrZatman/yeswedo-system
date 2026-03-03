'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  CreditCard,
  Package,
  Scissors,
  BarChart,
  Settings,
  LogOut,
  Store,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'My Work Today', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients Database', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/services', label: 'Services', icon: Scissors },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/memberships', label: 'Memberships', icon: CreditCard },
  { href: '/clock', label: 'Clock In & Out', icon: Clock },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: BarChart },
]

interface UserStore {
  store_id: string
  store: {
    id: string
    name: string
  }
}

interface SidebarProps {
  userName?: string
  stores?: UserStore[]
  currentStoreId?: string
}

export function Sidebar({ userName = 'User', stores = [], currentStoreId }: SidebarProps) {
  const pathname = usePathname()
  const [storeMenuOpen, setStoreMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const currentStore = stores.find(s => s.store_id === currentStoreId)
  const hasMultipleStores = stores.length > 1

  const handleStoreChange = (storeId: string) => {
    setStoreMenuOpen(false)
    startTransition(async () => {
      await fetch('/api/store/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId }),
      })
      router.refresh()
    })
  }

  return (
    <aside className="w-64 bg-[#8B3A3A] text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">☰</span> MENU
        </h1>

        {hasMultipleStores && currentStore && (
          <div className="mt-4 relative">
            <button
              onClick={() => setStoreMenuOpen(!storeMenuOpen)}
              disabled={isPending}
              className="flex items-center gap-2 w-full px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Store className="h-4 w-4" />
              <span className="flex-1 text-left text-sm truncate">
                {currentStore.store.name}
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", storeMenuOpen && "rotate-180")} />
            </button>

            {storeMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#722F2F] rounded-lg shadow-lg z-50 overflow-hidden">
                {stores.map((userStore) => (
                  <button
                    key={userStore.store_id}
                    onClick={() => handleStoreChange(userStore.store_id)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors",
                      userStore.store_id === currentStoreId && "bg-white/20"
                    )}
                  >
                    {userStore.store.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-sm mt-4">Hey {userName}!</p>
        <p className="text-xs opacity-80">Here&apos;s how things are going...</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-6 py-3 text-sm transition-colors border-l-4 border-transparent',
              pathname === item.href
                ? 'bg-white/20 border-l-white font-semibold'
                : 'hover:bg-white/10'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/20">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-6 py-3 text-sm transition-colors border-l-4 border-transparent',
            pathname === '/settings'
              ? 'bg-white/20 border-l-white'
              : 'hover:bg-white/10'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-white/10 w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </form>
      </div>

      <div className="p-4 text-xs opacity-60 border-t border-white/20">
        <p>Privacy Policy | Terms & Conditions</p>
        <p className="mt-2">(915) 585.0713</p>
        <p>info@yeswedoapp.com</p>
      </div>
    </aside>
  )
}
