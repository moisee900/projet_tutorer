import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Briefcase, HelpCircle, Users, LogIn, UserPlus, Menu, X, Moon, Sun, Crown } from 'lucide-react'
import { BrandMark } from './BrandMark'

export const PublicNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const toggleDark = () => {
    const newDark = !isDark
    setIsDark(newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark')
  }

  const navLinks = [
    { name: 'Accueil', href: '/', icon: Home, isLink: true },
    { name: 'Offres d\'emploi', href: '/offres', icon: Briefcase, isLink: true },
    { name: 'Creer entreprise', href: '/create-entreprise', icon: Crown, isLink: true, highlight: true },
    { name: 'Fonctionnalites', href: '/#features', icon: Users, isLink: false },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-b border-slate-200 dark:border-slate-800' 
        : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link to="/" className="group">
            <BrandMark label="RH PRO" />
          </Link>

          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              link.isLink ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`flex items-center space-x-1.5 font-medium transition-colors ${
                    link.highlight 
                      ? 'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </a>
              )
            ))}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={toggleDark}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <Link to="/login" className="flex items-center space-x-2 px-5 py-2.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full font-semibold transition-all">
              <LogIn className="w-4 h-4" />
              <span>Connexion</span>
            </Link>
            <Link to="/register" className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 hover:from-primary-700 hover:via-purple-700 hover:to-primary-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              <UserPlus className="w-4 h-4" />
              <span>S'inscrire</span>
            </Link>
          </div>

          <div className="flex lg:hidden items-center space-x-2">
            <button onClick={toggleDark} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800">
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              link.isLink ? (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 font-medium py-3 px-4 rounded-lg transition-colors ${
                    link.highlight
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </a>
              )
            ))}
            <div className="pt-3 space-y-2 border-t border-slate-200 dark:border-slate-800">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center space-x-2 w-full px-5 py-3 text-primary-600 border-2 border-primary-200 dark:border-primary-800 rounded-full font-semibold">
                <LogIn className="w-4 h-4" />
                <span>Connexion</span>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center space-x-2 w-full px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-600 text-white rounded-full font-semibold shadow-lg">
                <UserPlus className="w-4 h-4" />
                <span>S'inscrire</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}