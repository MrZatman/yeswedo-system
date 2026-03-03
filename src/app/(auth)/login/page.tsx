'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#8B3A3A] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your Email Here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#8B3A3A] hover:bg-[#722F2F]"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login Now'}
            </Button>

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>
                Don&apos;t have an Account?{' '}
                <Link href="/register" className="text-[#8B3A3A] hover:underline">
                  Sign Up Here
                </Link>
              </p>
              <p>
                <Link href="/forgot-password" className="text-[#8B3A3A] hover:underline">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
            <p>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              {' | '}
              <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
            </p>
            <p className="mt-2">
              Get in touch with us at{' '}
              <a href="tel:9155850713" className="hover:underline">(915) 585.0713</a>
            </p>
            <p>
              Email us at:{' '}
              <a href="mailto:info@yeswedoapp.com" className="hover:underline">info@yeswedoapp.com</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
