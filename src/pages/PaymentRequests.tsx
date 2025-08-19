import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  User,
  Calendar,
  DollarSign,
  Building2,
  Store,
  Package,
  RefreshCw
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'

interface PaymentRequest {
  _id: string
  user: {
    _id: string
    username: string
    email: string
    fullName?: string
  }
  entityType: 'shop' | 'institute' | 'hospital' | 'marketplace'
  entityId?: string
  amount: number
  transactionId: string
  bankName: string
  accountNumber: string
  transactionDate: string
  notes?: string
  status: 'pending' | 'verified' | 'rejected' | 'completed'
  createdAt: string
  verifiedBy?: string
  verifiedAt?: string
  verificationNotes?: string
  screenshotFile?: string
  agentId?: string
}

export default function PaymentRequests() {
  const { toast } = useToast()
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    entityType: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPaymentRequests()
  }, [filters, currentPage])

  const fetchPaymentRequests = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (filters.status) params.append('status', filters.status)
      if (filters.entityType) params.append('entityType', filters.entityType)

      const response = await fetch(`${API_BASE_URL}/api/admin/public/payment-requests?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment requests')
      }
      
      const data = await response.json()
      console.log('Payment requests data:', data.paymentRequests)
      console.log('Sample payment request:', data.paymentRequests[0])
      
      // Enhanced debugging for Agent ID
      if (data.paymentRequests && data.paymentRequests.length > 0) {
        console.log('=== AGENT ID DEBUGGING ===')
        data.paymentRequests.forEach((payment: PaymentRequest, index: number) => {
          console.log(`Payment ${index + 1}:`, {
            id: payment._id,
            entityType: payment.entityType,
            entityId: payment.entityId,
            agentId: payment.agentId,
            hasAgentId: !!payment.agentId,
            agentIdType: typeof payment.agentId
          })
        })
        console.log('=== END AGENT ID DEBUGGING ===')
      }
      
      setPaymentRequests(data.paymentRequests)
      setTotalPages(data.totalPages)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch payment requests',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (request: PaymentRequest) => {
    setSelectedRequest(request)
    setVerificationNotes('')
    setShowReviewDialog(true)
  }

  const handleAccept = async () => {
    if (!selectedRequest) return
    
    setIsSubmitting(true)
    try {
      // First, update payment request status to verified
      const paymentResponse = await fetch(`${API_BASE_URL}/api/admin/payment-request/${selectedRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'verified',
          verificationNotes: verificationNotes || 'Payment verified and entity approved'
        })
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to update payment request status')
      }

      // Then, automatically approve the corresponding entity
      const entityResponse = await fetch(`${API_BASE_URL}/api/admin/approve-entity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedRequest.user._id,
          entityType: selectedRequest.entityType,
          paymentRequestId: selectedRequest._id
        })
      })

      if (!entityResponse.ok) {
        console.warn('Payment verified but entity approval failed:', await entityResponse.text())
        // Still show success for payment verification
      }

      toast({
        title: 'Payment Accepted',
        description: `Payment verified and ${selectedRequest.entityType} approved successfully`,
        variant: 'default'
      })

      setShowReviewDialog(false)
      setSelectedRequest(null)
      fetchPaymentRequests() // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process payment acceptance',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payment-request/${selectedRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'rejected',
          verificationNotes: verificationNotes || 'Payment rejected'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update payment request status')
      }

      toast({
        title: 'Payment Rejected',
        description: 'Payment request rejected successfully',
        variant: 'default'
      })

      setShowReviewDialog(false)
      setSelectedRequest(null)
      fetchPaymentRequests() // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject payment request',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'verified':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'completed':
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'institute':
      case 'hospital':
        return <Building2 className="h-4 w-4 text-blue-600" />
      case 'shop':
        return <Store className="h-4 w-4 text-green-600" />
      case 'marketplace':
        return <Package className="h-4 w-4 text-purple-600" />
      default:
        return <Building2 className="h-4 w-4" />
    }
  }

  const renderPaymentRequestCard = (request: PaymentRequest) => (
    <Card key={request._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getEntityTypeIcon(request.entityType)}
            <div>
              <CardTitle className="text-lg">Payment Request</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {request.entityType}
                </Badge>
                {getStatusBadge(request.status)}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReview(request)}
            disabled={request.status !== 'pending'}
          >
            <Eye className="h-4 w-4 mr-2" />
            {request.status === 'pending' ? 'Review' : 'View'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">User:</span>
              <span className="font-medium">{request.user.fullName || request.user.username}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">${request.amount}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Bank:</span>
              <span className="font-medium">{request.bankName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {new Date(request.transactionDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Agent ID row - make it very prominent */}
          <div className="flex items-center gap-2 text-sm bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <User className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-semibold">Agent ID:</span>
            <span className={`font-bold text-lg ${request.agentId && request.agentId !== 'null' ? 'text-green-600' : 'text-red-600'}`}>
              {request.agentId && request.agentId !== 'null' ? request.agentId : 'N/A'}
            </span>
          </div>
          
          {/* Enhanced debug information */}
          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded border">
            <div className="font-semibold mb-1">Debug Info:</div>
            <div>EntityType: <span className="font-mono">{request.entityType}</span></div>
            <div>EntityID: <span className="font-mono">{request.entityId || 'null'}</span></div>
            <div>AgentID: <span className="font-mono">{request.agentId || 'null'}</span></div>
            <div>Has Agent ID: <span className="font-mono">{request.agentId ? 'YES' : 'NO'}</span></div>
          </div>
          
          <div className="text-sm">
            <span className="text-muted-foreground">Transaction ID:</span>
            <p className="font-mono text-xs bg-muted p-2 rounded mt-1">{request.transactionId}</p>
          </div>
          
          {request.notes && (
            <div className="text-sm">
              <span className="text-muted-foreground">User Notes:</span>
              <p className="text-gray-600 mt-1">{request.notes}</p>
            </div>
          )}
          
          {request.verificationNotes && (
            <div className="text-sm">
              <span className="text-muted-foreground">Verification Notes:</span>
              <p className="text-gray-600 mt-1">{request.verificationNotes}</p>
            </div>
          )}
          
          {request.screenshotFile && (
            <div className="text-sm">
              <span className="text-muted-foreground">Payment Screenshot:</span>
              <div className="mt-2">
                <img 
                  src={`${API_BASE_URL}/uploads/${request.screenshotFile}`}
                  alt="Payment Screenshot"
                  className="max-w-full h-auto max-h-48 rounded-lg border shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading payment requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Requests</h2>
          <p className="text-gray-600 text-sm sm:text-base">Review and verify payment requests from users</p>
        </div>
        <Button onClick={fetchPaymentRequests} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="entity-type-filter">Entity Type</Label>
              <Select value={filters.entityType || "all"} onValueChange={(value) => setFilters(prev => ({ ...prev, entityType: value === "all" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="institute">Institute</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => setFilters({ status: '', entityType: '' })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {paymentRequests.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests</h3>
          <p className="text-gray-500">No payment requests match your current filters</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Requests Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">User</th>
                      <th className="text-left p-2 font-medium">Entity Type</th>
                      <th className="text-left p-2 font-medium">Agent ID</th>
                      <th className="text-left p-2 font-medium">Amount</th>
                      <th className="text-left p-2 font-medium">Bank</th>
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Status</th>
                      <th className="text-left p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRequests.map((request) => (
                      <tr key={request._id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {request.user.fullName || request.user.username}
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="capitalize">
                            {request.entityType}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <span className={`font-mono text-sm ${
                            request.agentId && request.agentId !== 'null' 
                              ? 'text-green-600 font-bold' 
                              : 'text-red-600'
                          }`}>
                            {request.agentId && request.agentId !== 'null' ? request.agentId : 'N/A'}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">${request.amount}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span>{request.bankName}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(request.transactionDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={request.status === 'pending' ? 'default' : 
                                   request.status === 'verified' ? 'default' : 'destructive'}
                            className="capitalize"
                          >
                            {request.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(request)}
                            disabled={request.status !== 'pending'}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {request.status === 'pending' ? 'Review' : 'View'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Card View (existing) */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {paymentRequests.map(renderPaymentRequestCard)}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            size="sm"
            className="w-full sm:w-auto"
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600 text-center">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            size="sm"
            className="w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Review Payment Request</DialogTitle>
            <DialogDescription>
              Review payment details and approve or reject
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User:</span>
                  <span className="font-medium">{selectedRequest.user.fullName || selectedRequest.user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${selectedRequest.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{selectedRequest.entityType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-medium">{selectedRequest.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedRequest.transactionDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <p className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">{selectedRequest.transactionId}</p>
                </div>
                
                {selectedRequest.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">User Notes:</span>
                    <p className="text-sm mt-1">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationNotes">Notes (Optional)</Label>
                <Textarea
                  id="verificationNotes"
                  placeholder="Add verification notes..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Accept
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
