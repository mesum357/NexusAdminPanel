import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { 
  Building2, 
  Store, 
  Package, 
  CreditCard, 
  Users, 
  Clock, 
  TrendingUp,
  BarChart3,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'

interface AdminStats {
  entities: {
    institutes: { total: number; pending: number }
    shops: { total: number; pending: number }
    products: { total: number; pending: number }
  }
  payments: {
    total: number
    pending: number
  }
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin statistics')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch admin statistics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast({
      title: 'Logged Out',
      description: 'You have been logged out.',
    })
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Institutes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.entities.institutes.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.entities.institutes.pending || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.entities.shops.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.entities.shops.pending || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.entities.products.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.entities.products.pending || 0} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Requests</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.payments.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.payments.pending || 0} pending verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={() => setActiveTab('pending-entities')}
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
            >
              <Clock className="h-6 w-6 text-blue-600" />
              <span className="text-sm font-medium">Review Pending</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab('payment-requests')}
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
            >
              <CreditCard className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Payment Requests</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab('users')}
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
            >
              <Users className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">User Management</span>
            </Button>
            
            <Button 
              onClick={() => setActiveTab('payment-settings')}
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
            >
              <BarChart3 className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">Payment Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Entity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg gap-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="text-sm sm:text-base">Educational Institutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats?.entities.institutes.total || 0} total</Badge>
                {(stats?.entities.institutes.pending || 0) > 0 && (
                  <Badge variant="destructive">{stats?.entities.institutes.pending} pending</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg gap-3">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-green-600" />
                <span className="text-sm sm:text-base">Business Shops</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats?.entities.shops.total || 0} total</Badge>
                {(stats?.entities.shops.pending || 0) > 0 && (
                  <Badge variant="destructive">{stats?.entities.shops.pending} pending</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg gap-3">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-purple-600" />
                <span className="text-sm sm:text-base">Marketplace Products</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats?.entities.products.total || 0} total</Badge>
                {(stats?.entities.products.pending || 0) > 0 && (
                  <Badge variant="destructive">{stats?.entities.products.pending} pending</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg gap-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <span className="text-sm sm:text-base">Payment Requests</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats?.payments.total || 0} total</Badge>
                {(stats?.payments.pending || 0) > 0 && (
                  <Badge variant="destructive">{stats?.payments.pending} pending</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
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
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'pending-entities', label: 'Pending Entities', icon: Clock },
                { id: 'payment-requests', label: 'Payment Requests', icon: CreditCard },
                { id: 'users', label: 'User Management', icon: Users },
                { id: 'payment-settings', label: 'Payment Settings', icon: BarChart3 }
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage entities, payments, and system operations</p>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {user?.fullName || user?.username || 'Admin'}</span>
                {user?.isAdmin && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
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
                 { id: 'dashboard', label: 'Dashboard' },
                 { id: 'pending-entities', label: 'Pending Entities' },
                 { id: 'payment-requests', label: 'Payment Requests' },
                 { id: 'users', label: 'User Management' },
                 { id: 'payment-settings', label: 'Payment Settings' }
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
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'pending-entities' && <PendingEntities />}
          {activeTab === 'payment-requests' && <PaymentRequests />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'payment-settings' && <PaymentSettings />}
        </motion.div>
      </div>
    </div>
  )
}

import PendingEntities from './PendingEntities'
import PaymentRequests from './PaymentRequests'
import UserManagement from './UserManagement'
import PaymentSettings from './PaymentSettings'
