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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'My Work Today', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients Database', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/services', label: 'Services', icon: Scissors },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/memberships', label: 'Memberships', icon: CreditCard },
  { href: '/clock', label: 'Clock In & Out', icon: Clock },
  { href: '/appointments', label: 'Appointments', icon: Calendar },
  { href: '/reports', label: 'Reports', icon: BarChart },
]

interface SidebarProps {
  userName?: string
}

export function Sidebar({ userName = 'User' }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#8B3A3A] text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">☰</span> MENU
        </h1>
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
