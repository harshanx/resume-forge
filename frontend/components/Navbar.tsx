'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const navigation = [
  { href: '/builder', label: 'Builder' },
  { href: '/job-analyzer', label: 'Analyzer' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/applications', label: 'Applications' },
]

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const isDark = theme === 'dark'
  const authAction = pathname === '/login'
    ? { href: '/register', label: 'Create account' }
    : pathname === '/register'
      ? { href: '/login', label: 'Sign in' }
      : { href: '/builder', label: 'Create resume' }

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/75 backdrop-blur-xl dark:border-white/[0.08] dark:bg-black/75">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 px-5 py-3 sm:px-8 md:flex-nowrap md:py-0">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]" aria-label="ResumeForge home">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-black/[0.08] bg-[#f5f5f7] dark:border-white/[0.1] dark:bg-[#161617]">
            <FileText className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          ResumeForge
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto md:order-none md:w-auto md:flex-1 md:justify-center" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined} className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-all hover:bg-black/[0.05] hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/[0.05] dark:hover:text-[#f5f5f7] dark:focus-visible:ring-white/30 ${pathname === item.href ? 'bg-black/[0.05] text-[#1d1d1f] dark:bg-white/[0.08] dark:text-[#f5f5f7]' : 'text-[#6e6e73] dark:text-[#a1a1a6]'}`}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.08] text-[#1d1d1f] transition-all hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/[0.12] dark:text-[#f5f5f7] dark:hover:bg-white/[0.08] dark:focus-visible:ring-white/30"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link href={authAction.href} className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 active:scale-[0.98] dark:bg-white dark:text-black dark:focus-visible:ring-white/30">
            {authAction.label}
          </Link>
        </div>
      </div>
    </header>
  )
}
