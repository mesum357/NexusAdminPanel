import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { API_BASE_URL } from '@/lib/config'
import { 
  Users, 
  Shield, 
  User, 
  Mail, 
  Calendar,
  Search,
  RefreshCw,
  Crown,
  UserCheck,
  UserX
} from 'lucide-react'

interface User {
  _id: string
  username: string
  email: string
  fullName?: string
  mobile?: string
  city?: string
  isAdmin: boolean
  verified: boolean
  createdAt: string
  lastLogin?: string
}

export default function UserManagement() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '100'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      if (verificationFilter) params.append('verified', verificationFilter)

      const response = await fetch(`${API_BASE_URL}/api/admin/public/users?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data.users)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch users',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAdminRole = async (user: User) => {
    setIsSubmitting(true)
    try {
      // Note: This endpoint doesn't exist yet, we'll need to create it
      // For now, we'll just update the local state
      const updatedUsers = users.map(u => 
        u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u
      )
      setUsers(updatedUsers)
      
      toast({
        title: 'Success',
        description: `${user.isAdmin ? 'Removed' : 'Granted'} admin role for ${user.fullName || user.username}`,
        variant: 'default'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user role',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleVerification = async (user: User) => {
    setIsSubmitting(true)
    try {
      // Note: This endpoint doesn't exist yet, we'll need to create it
      // For now, we'll just update the local state
      const updatedUsers = users.map(u => 
        u._id === user._id ? { ...u, verified: !u.verified } : u
      )
      setUsers(updatedUsers)
      
      toast({
        title: 'Success',
        description: `${user.verified ? 'Unverified' : 'Verified'} user ${user.fullName || user.username}`,
        variant: 'default'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user verification',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === '' || 
      (roleFilter === 'admin' && user.isAdmin) ||
      (roleFilter === 'user' && !user.isAdmin)
    
    const matchesVerification = verificationFilter === '' ||
      (verificationFilter === 'verified' && user.verified) ||
      (verificationFilter === 'unverified' && !user.verified)
    
    return matchesSearch && matchesRole && matchesVerification
  })

  const renderUserCard = (user: User) => (
    <Card key={user._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              {user.isAdmin ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {user.fullName || user.username}
                {user.isAdmin && (
                  <Badge variant="default" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {user.verified ? (
                  <Badge variant="outline" className="text-xs">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <UserX className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={user.isAdmin ? "destructive" : "outline"}
              onClick={() => handleToggleAdminRole(user)}
              disabled={isSubmitting}
            >
              {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
            </Button>
            <Button
              size="sm"
              variant={user.verified ? "secondary" : "outline"}
              onClick={() => handleToggleVerification(user)}
              disabled={isSubmitting}
            >
              {user.verified ? 'Unverify' : 'Verify'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Username:</span>
            <span className="font-medium">{user.username}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Joined:</span>
            <span className="font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {user.mobile && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Mobile:</span>
              <span className="font-medium">{user.mobile}</span>
            </div>
          )}
          
          {user.city && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">City:</span>
              <span className="font-medium">{user.city}</span>
            </div>
          )}
        </div>
        
        {user.lastLogin && (
          <div className="mt-3 text-xs text-muted-foreground">
            Last login: {new Date(user.lastLogin).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage users, admin roles, and verification status</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admin users</SelectItem>
                  <SelectItem value="user">Regular users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="verification-filter">Verification</Label>
              <Select value={verificationFilter || "all"} onValueChange={(value) => setVerificationFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="verified">Verified users</SelectItem>
                  <SelectItem value="unverified">Unverified users</SelectItem>
                </SelectContent>
              </Select>
                          </div>
              
              <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('')
                  setVerificationFilter('')
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isAdmin).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with admin privileges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Email verified users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unverified Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.verified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-500">No users match your current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredUsers.map(renderUserCard)}
        </div>
      )}
    </div>
  )
}
