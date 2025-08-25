import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { API_BASE_URL } from '@/lib/config'
import { RefreshCw, Eye, CheckCircle, XCircle, CreditCard, Filter } from 'lucide-react'

interface PaymentRequest {
  _id: string
  user?: { username?: string; email?: string }
  entityType?: 'shop' | 'institute' | 'hospital' | 'marketplace'
  entityId?: string | null
  agentId?: string | null
  amount: number
  transactionId: string
  bankName?: string
  accountNumber?: string
  transactionDate?: string
  notes?: string
  status?: 'pending' | 'verified' | 'rejected' | 'completed'
  processingFee?: number
  totalAmount?: number
  screenshotFile?: string
  createdAt?: string
}

export default function PendingPayments() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [verifiedPayments, setVerifiedPayments] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingVerified, setLoadingVerified] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [pages, setPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'rejected' | 'completed' | ''>('pending')
  const [entityFilter, setEntityFilter] = useState<'shop' | 'institute' | 'hospital' | 'marketplace' | ''>('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')

  useEffect(() => {
    fetchPayments()
    fetchVerifiedPayments()
  }, [page, statusFilter, entityFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))
      if (statusFilter) params.set('status', statusFilter)
      if (entityFilter) params.set('entityType', entityFilter)

      const res = await fetch(`${API_BASE_URL}/api/payment/admin/all?${params.toString()}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load payments')
      setPayments(data.payments || [])
      setPages(data.pagination?.pages || 1)
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to load payments', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const fetchVerifiedPayments = async () => {
    try {
      setLoadingVerified(true)
      const params = new URLSearchParams()
      params.set('page', '1')
      params.set('limit', '20')
      params.set('status', 'verified')
      if (entityFilter) params.set('entityType', entityFilter)

      const res = await fetch(`${API_BASE_URL}/api/payment/admin/all?${params.toString()}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load verified payments')
      setVerifiedPayments(data.payments || [])
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to load verified payments', variant: 'destructive' })
    } finally {
      setLoadingVerified(false)
    }
  }

  const openPayment = (p: PaymentRequest) => {
    setSelectedPayment(p)
    setVerificationNotes('')
    setShowDialog(true)
  }

  const updateStatus = async (paymentId: string, newStatus: 'verified' | 'rejected') => {
    try {
      // Use admin endpoint that also auto-approves related entities
      const res = await fetch(`${API_BASE_URL}/api/admin/payment-request/${paymentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, verificationNotes })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Failed to mark as ${newStatus}`)
      toast({ title: 'Updated', description: `Payment ${newStatus === 'verified' ? 'approved' : 'rejected'}` })
      // Optimistically update local state
      setShowDialog(false)
      setSelectedPayment(null)
      if (newStatus === 'verified') {
        const updated = data.payment as PaymentRequest
        setPayments(prev => prev.filter(p => p._id !== paymentId))
        setVerifiedPayments(prev => [updated, ...prev])
      } else {
        // For other statuses, refresh pending list
        fetchPayments()
      }
      // Always refresh verified list to be safe
      fetchVerifiedPayments()
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update payment', variant: 'destructive' })
    }
  }

  const canPrev = page > 1
  const canNext = page < pages

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Payments</h2>
          <p className="text-gray-600 text-sm sm:text-base">Review and verify uploaded payment screenshots</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => { setPage(1); fetchPayments() }} variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Status</Label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1) }} className="border rounded px-3 py-2 w-full">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <Label>Entity Type</Label>
            <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value as any); setPage(1) }} className="border rounded px-3 py-2 w-full">
              <option value="">All</option>
              <option value="shop">Shop</option>
              <option value="institute">Institute</option>
              <option value="hospital">Hospital</option>
              <option value="marketplace">Marketplace</option>
            </select>
          </div>
          <div className="flex items-end">
            <Badge variant="secondary" className="w-full justify-center">Page {page} / {pages}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {statusFilter !== 'verified' && (
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">No payments found.</div>
        ) : (
          payments.map((p) => (
            <Card key={p._id} className="hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{p.transactionId}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="capitalize">{p.entityType || 'N/A'}</Badge>
                        {p.status && (
                          <Badge variant="secondary" className="capitalize">{p.status === 'verified' ? 'Approved' : p.status}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {(!p.status || p.status === 'pending' || p.status === 'rejected' || p.status === 'completed') && (
                    <Button size="sm" variant="outline" onClick={() => openPayment(p)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground">User:</span>
                    <div className="font-medium">{p.user?.username || p.user?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <div className="font-medium">PKR {p.amount}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Agent ID:</span>
                    <div className={`font-medium ${p.agentId ? 'text-green-600' : 'text-red-600'}`}>{p.agentId || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bank:</span>
                    <div className="font-medium">{p.bankName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <div className="font-medium">{p.transactionDate ? new Date(p.transactionDate).toLocaleString() : 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Linked Entity:</span>
                    <div className="font-medium">{p.entityId || 'Not linked'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      )}

      {statusFilter !== 'verified' && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={!canPrev}>Prev</Button>
          <div className="text-sm">Page {page} of {pages}</div>
          <Button variant="outline" size="sm" onClick={() => setPage((v) => v + 1)} disabled={!canNext}>Next</Button>
        </div>
      )}

      {/* Approved (Verified) Payments Section - only when Approved filter selected */}
      {statusFilter === 'verified' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Approved Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingVerified ? (
              <div className="text-center py-8">Loading approved payments...</div>
            ) : verifiedPayments.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No approved payments yet.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {verifiedPayments.map((p) => (
                  <Card key={p._id} className="border-green-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-green-600" />
                          <div>
                            <CardTitle className="text-base">{p.transactionId}</CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="capitalize">{p.entityType || 'N/A'}</Badge>
                              <Badge variant="secondary" className="bg-green-100 text-green-700">Approved</Badge>
                            </div>
                          </div>
                        </div>
                        {/* No action buttons for approved */}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <span className="text-muted-foreground">User:</span>
                          <div className="font-medium">{p.user?.username || p.user?.email || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <div className="font-medium">PKR {p.amount}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Entity:</span>
                          <div className="font-medium capitalize">{p.entityType || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Agent ID:</span>
                          <div className="font-medium">{p.agentId || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Linked Entity:</span>
                          <div className="font-medium">{p.entityId || 'Not linked'}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg md:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Payment</DialogTitle>
            <DialogDescription>Verify or reject this payment. You may add notes.</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Transaction ID</Label>
                  <div className="font-medium">{selectedPayment.transactionId}</div>
                </div>
                <div>
                  <Label>Amount</Label>
                  <div className="font-medium">PKR {selectedPayment.amount}</div>
                </div>
                <div>
                  <Label>User</Label>
                  <div className="font-medium">{selectedPayment.user?.username || selectedPayment.user?.email || 'N/A'}</div>
                </div>
                <div>
                  <Label>Entity</Label>
                  <div className="font-medium capitalize">{selectedPayment.entityType || 'N/A'}</div>
                </div>
                <div>
                  <Label>Agent ID</Label>
                  <div className="font-medium">{selectedPayment.agentId || 'N/A'}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="font-medium capitalize">{selectedPayment.status}</div>
                </div>
              </div>

              {selectedPayment.screenshotFile && (
                <div>
                  <Label>Screenshot</Label>
                  <div className="mt-2">
                    <img src={`${API_BASE_URL}/uploads/${selectedPayment.screenshotFile}`} alt="Payment Screenshot" className="max-h-80 rounded border" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Verification Notes (optional)</Label>
                <Input value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} placeholder="Notes..." />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button onClick={() => updateStatus(selectedPayment._id, 'verified')} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => updateStatus(selectedPayment._id, 'rejected')} className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
