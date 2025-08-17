import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  Save,
  RefreshCw
} from 'lucide-react'
import { API_BASE_URL } from '@/lib/config'

interface PaymentSettings {
  bankName: string
  accountTitle: string
  accountNumber: string
  iban: string
  branchCode: string
  swiftCode: string
  qrCodeImage: string
  paymentAmounts: {
    shop: number
    institute: number
    hospital: number
    marketplace: number
  }
}

export default function PaymentSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<PaymentSettings>({
    bankName: '',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    branchCode: '',
    swiftCode: '',
    qrCodeImage: '',
    paymentAmounts: {
      shop: 5000,
      institute: 10000,
      hospital: 15000,
      marketplace: 2000
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string>('')

  useEffect(() => {
    fetchPaymentSettings()
  }, [])

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payment-settings`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        if (data.settings.qrCodeImage) {
          setQrCodePreview(data.settings.qrCodeImage)
        }
      } else {
        // If no settings exist, use defaults
        console.log('No payment settings found, using defaults')
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PaymentSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentAmountChange = (entityType: keyof PaymentSettings['paymentAmounts'], value: number) => {
    setSettings(prev => ({
      ...prev,
      paymentAmounts: {
        ...prev.paymentAmounts,
        [entityType]: value
      }
    }))
  }

  const handleQrCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 5MB',
          variant: 'destructive'
        })
        return
      }
      
      setQrCodeFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setQrCodePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append('bankName', settings.bankName)
      formData.append('accountTitle', settings.accountTitle)
      formData.append('accountNumber', settings.accountNumber)
      formData.append('iban', settings.iban)
      formData.append('branchCode', settings.branchCode)
      formData.append('swiftCode', settings.swiftCode)
      formData.append('paymentAmounts', JSON.stringify(settings.paymentAmounts))
      
      if (qrCodeFile) {
        formData.append('qrCodeImage', qrCodeFile)
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/payment-settings`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save payment settings')
      }

      toast({
        title: 'Success',
        description: 'Payment settings saved successfully'
      })

      // Refresh settings
      await fetchPaymentSettings()
      setQrCodeFile(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save payment settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading payment settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
          <p className="text-gray-600 text-sm sm:text-base">Manage bank details and payment amounts for entity creation</p>
        </div>
        <Button onClick={fetchPaymentSettings} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Bank Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={settings.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="e.g., HBL Bank"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountTitle">Account Title *</Label>
                <Input
                  id="accountTitle"
                  value={settings.accountTitle}
                  onChange={(e) => handleInputChange('accountTitle', e.target.value)}
                  placeholder="e.g., Pak Nexus Services"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={settings.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="e.g., 1234-5678-9012-3456"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN *</Label>
                <Input
                  id="iban"
                  value={settings.iban}
                  onChange={(e) => handleInputChange('iban', e.target.value)}
                  placeholder="e.g., PK36HABB0000001234567890"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  value={settings.branchCode}
                  onChange={(e) => handleInputChange('branchCode', e.target.value)}
                  placeholder="e.g., 1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="swiftCode">SWIFT Code</Label>
                <Input
                  id="swiftCode"
                  value={settings.swiftCode}
                  onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                  placeholder="e.g., HABBPKKA"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code & Payment Amounts */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <QrCode className="h-5 w-5" />
                QR Code Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrCode">Upload QR Code Image</Label>
                <Input
                  id="qrCode"
                  type="file"
                  accept="image/*"
                  onChange={handleQrCodeUpload}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Upload a QR code image (PNG, JPG, JPEG). Max size: 5MB
                </p>
              </div>

              {qrCodePreview && (
                <div className="text-center">
                  <div className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <img 
                      src={qrCodePreview} 
                      alt="QR Code Preview" 
                      className="h-32 w-32 mx-auto object-contain"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    QR Code Preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Amounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5" />
                Payment Amounts (PKR)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopAmount">Shop Creation</Label>
                  <Input
                    id="shopAmount"
                    type="number"
                    value={settings.paymentAmounts.shop}
                    onChange={(e) => handlePaymentAmountChange('shop', parseInt(e.target.value) || 0)}
                    placeholder="5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituteAmount">Institute Creation</Label>
                  <Input
                    id="instituteAmount"
                    type="number"
                    value={settings.paymentAmounts.institute}
                    onChange={(e) => handlePaymentAmountChange('institute', parseInt(e.target.value) || 0)}
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospitalAmount">Hospital Creation</Label>
                  <Input
                    id="hospitalAmount"
                    type="number"
                    value={settings.paymentAmounts.hospital}
                    onChange={(e) => handlePaymentAmountChange('hospital', parseInt(e.target.value) || 0)}
                    placeholder="15000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketplaceAmount">Marketplace Listing</Label>
                  <Input
                    id="marketplaceAmount"
                    type="number"
                    value={settings.paymentAmounts.marketplace}
                    onChange={(e) => handlePaymentAmountChange('marketplace', parseInt(e.target.value) || 0)}
                    placeholder="2000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto"
            size="lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
