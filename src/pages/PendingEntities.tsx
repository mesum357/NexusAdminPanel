import { useState, useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Building2, 
  Store, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  User,
  Calendar,
  MapPin
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'

interface PendingEntity {
  _id: string
  name?: string
  shopName?: string
  title?: string
  type?: string
  city?: string
  description?: string
  owner: {
    _id: string
    username: string
    email: string
    fullName?: string
  }
  createdAt: string
  entityType: 'institute' | 'shop' | 'product'
}

interface PendingEntitiesData {
  institutes: PendingEntity[]
  shops: PendingEntity[]
  products: PendingEntity[]
}

export default function PendingEntities() {
  const { toast } = useToast()
  const [entities, setEntities] = useState<PendingEntitiesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEntity, setSelectedEntity] = useState<PendingEntity | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'institutes' | 'shops' | 'products'>('institutes')

  useEffect(() => {
    fetchPendingEntities()
  }, [])

  const fetchPendingEntities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/public/pending-entities`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending entities')
      }
      
      const data = await response.json()
      setEntities(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch pending entities',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (entity: PendingEntity) => {
    setSelectedEntity(entity)
    setReviewNotes('')
    setShowReviewDialog(true)
  }

  const handleApprove = async () => {
    if (!selectedEntity) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${selectedEntity.entityType}/${selectedEntity._id}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'approved',
          notes: reviewNotes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve entity')
      }

      toast({
        title: 'Success',
        description: 'Entity approved successfully',
        variant: 'default'
      })

      setShowReviewDialog(false)
      setSelectedEntity(null)
      fetchPendingEntities() // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve entity',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedEntity) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${selectedEntity.entityType}/${selectedEntity._id}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'rejected',
          notes: reviewNotes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reject entity')
      }

      toast({
        title: 'Success',
        description: 'Entity rejected successfully',
        variant: 'default'
      })

      setShowReviewDialog(false)
      setSelectedEntity(null)
      fetchPendingEntities() // Refresh the list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject entity',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'institute':
        return <Building2 className="h-5 w-5 text-blue-600" />
      case 'shop':
        return <Store className="h-5 w-5 text-green-600" />
      case 'product':
        return <Package className="h-5 w-5 text-purple-600" />
      default:
        return <Building2 className="h-5 w-5" />
    }
  }

  const getEntityName = (entity: PendingEntity) => {
    return entity.name || entity.shopName || entity.title || 'Unnamed Entity'
  }

  const renderEntityCard = (entity: PendingEntity) => (
    <Card key={entity._id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getEntityIcon(entity.entityType)}
            <div>
              <CardTitle className="text-lg">{getEntityName(entity)}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {entity.entityType}
                </Badge>
                {entity.type && (
                  <Badge variant="secondary">{entity.type}</Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReview(entity)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Review
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {entity.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {entity.description}
            </p>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Owner:</span>
              <span className="font-medium">{entity.owner.fullName || entity.owner.username}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{entity.city || 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Submitted:</span>
              <span className="font-medium">
                {new Date(entity.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="secondary">Pending Review</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderTabContent = () => {
    if (!entities) return null

    const entityList = entities[activeTab] || []
    
    if (entityList.length === 0) {
      return (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
          <p className="text-gray-500">All {activeTab} have been reviewed</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {entityList.map(renderEntityCard)}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading pending entities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Entities</h2>
          <p className="text-gray-600 text-sm sm:text-base">Review and approve or reject submitted entities</p>
        </div>
        <Button onClick={fetchPendingEntities} variant="outline" size="sm" className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'institutes', label: 'Institutes', count: entities?.institutes?.length || 0 },
            { key: 'shops', label: 'Shops', count: entities?.shops?.length || 0 },
            { key: 'products', label: 'Products', count: entities?.products?.length || 0 }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderTabContent()}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Entity</DialogTitle>
            <DialogDescription>
              Review the details and approve or reject this {selectedEntity?.entityType}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntity && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Entity Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{getEntityName(selectedEntity)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium capitalize">{selectedEntity.entityType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Owner:</span>
                    <p className="font-medium">{selectedEntity.owner.fullName || selectedEntity.owner.username}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedEntity.owner.email}</p>
                  </div>
                </div>
                {selectedEntity.description && (
                  <div className="mt-3">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="text-sm mt-1">{selectedEntity.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                <Textarea
                  id="reviewNotes"
                  placeholder="Add notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
