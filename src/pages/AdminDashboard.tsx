import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Clock, 
  BarChart3,
  User,
  Menu,
  X
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending-entities')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={closeMobileMenu}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Menu</h3>
                <Button variant="ghost" size="sm" onClick={closeMobileMenu}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {[
                { id: 'pending-entities', label: 'Pending Entities', icon: Clock },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'payment-settings', label: 'Payment Settings', icon: BarChart3 },
                { id: 'profile', label: 'Profile', icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    closeMobileMenu()
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage entities, users, and system operations</p>
            </div>
            
            {/* User Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, Admin</span>
                <Badge variant="secondary" className="text-xs">Admin</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <Button
            onClick={toggleMobileMenu}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Menu className="h-4 w-4" />
            Menu
          </Button>
        </div>

        {/* Navigation Tabs - Hidden on mobile, shown in mobile menu */}
        <div className="hidden lg:block mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-2">
              {[
                { id: 'pending-entities', label: 'Pending Entities' },
                { id: 'users', label: 'User Management' },
                { id: 'payment-settings', label: 'Payment Settings' },
                { id: 'profile', label: 'Profile' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'pending-entities' && <PendingEntities />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'payment-settings' && <PaymentSettings />}
          {activeTab === 'profile' && <UserProfile />}
        </motion.div>
      </div>
    </div>
  )
}

import PendingEntities from './PendingEntities'
import UserManagement from './UserManagement'
import PaymentSettings from './PaymentSettings'
import UserProfile from './UserProfile'
