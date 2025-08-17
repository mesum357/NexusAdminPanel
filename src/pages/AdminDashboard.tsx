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
  User
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

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <BarChart3 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setActiveTab('pending-entities')}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Clock className="h-6 w-6" />
              <span>Review Pending Entities</span>
              <Badge variant="secondary">
                {((stats?.entities.institutes.pending || 0) + 
                  (stats?.entities.shops.pending || 0) + 
                  (stats?.entities.products.pending || 0))} pending
              </Badge>
            </Button>

            <Button 
              onClick={() => setActiveTab('payment-requests')}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <CreditCard className="h-6 w-6" />
              <span>Payment Requests</span>
              <Badge variant="secondary">
                {stats?.payments.pending || 0} pending
              </Badge>
            </Button>

            <Button 
              onClick={() => setActiveTab('users')}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Users className="h-6 w-6" />
              <span>User Management</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Education & Healthcare Institutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats?.entities.institutes.total || 0} total</Badge>
                {(stats?.entities.institutes.pending || 0) > 0 && (
                  <Badge variant="destructive">{stats?.entities.institutes.pending} pending</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-green-600" />
                <span>Business Shops</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats?.entities.shops.total || 0} total</Badge>
                {(stats?.entities.shops.pending || 0) > 0 && (
                  <Badge variant="destructive">{stats?.entities.shops.pending} pending</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-purple-600" />
                <span>Marketplace Products</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{stats?.entities.products.total || 0} total</Badge>
                {(stats?.entities.products.pending || 0) > 0 && (
                  <Badge variant="destructive">{stats?.entities.products.pending} pending</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <span>Payment Requests</span>
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage entities, payments, and system operations</p>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
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
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('pending-entities')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending-entities'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Entities
              </button>
              <button
                onClick={() => setActiveTab('payment-requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment-requests'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Requests
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('payment-settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment-settings'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Settings
              </button>
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
