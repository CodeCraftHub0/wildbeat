import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Heart, CreditCard, Smartphone, Building2, Wallet } from 'lucide-react'

interface DonationType {
  id: number
  title: string
  amount: number
  description: string
  icon_color: string
  benefits: string[]
}

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Visa, Mastercard, American Express',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'mobile',
    name: 'Mobile Money',
    icon: <Smartphone className="w-6 h-6" />,
    description: 'M-Pesa, Airtel Money, MTN',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: <Building2 className="w-6 h-6" />,
    description: 'Direct bank account transfer',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: <Wallet className="w-6 h-6" />,
    description: 'Google Pay, PayPal, Apple Pay',
    color: 'from-orange-500 to-orange-600'
  }
]

export const Support = () => {
  const [selectedType, setSelectedType] = useState<DonationType | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const { data: donationTypes = [], isLoading } = useQuery({
    queryKey: ['donation-types'],
    queryFn: async () => {
      const response = await fetch('/api/donation-types')
      if (!response.ok) throw new Error('Failed to fetch')
      return response.json()
    }
  })

  const handleDonate = async () => {
    if (!selectedType || !formData.name || !formData.email || !selectedMethod) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // For card payments, create a payment intent
      if (selectedMethod === 'card') {
        const intentResponse = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: selectedType.amount,
            email: formData.email,
            name: formData.name
          })
        })

        if (!intentResponse.ok) {
          const error = await intentResponse.json()
          throw new Error(error.error || 'Failed to create payment')
        }

        const { clientSecret } = await intentResponse.json()
        console.log('Payment intent created:', clientSecret)
        // In a real app, you'd redirect to Stripe or use Stripe Elements here
        // For now, we'll proceed with the donation recording
      }

      // Record the donation
      const donationResponse = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_type_id: selectedType.id,
          name: formData.name,
          email: formData.email,
          amount: selectedType.amount,
          payment_method: selectedMethod,
          transaction_id: `txn_${Date.now()}`,
          message: formData.message
        })
      })

      if (!donationResponse.ok) throw new Error('Failed to process donation')

      setSubmitMessage('✅ Thank you for your generous donation!')
      setSelectedType(null)
      setSelectedMethod(null)
      setFormData({ name: '', email: '', message: '' })

      setTimeout(() => setSubmitMessage(''), 5000)
    } catch (error) {
      setSubmitMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Support Our Mission</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your contribution directly supports wildlife conservation, community education, and sustainable tourism initiatives in Rwanda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Donation Types */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Impact Level</h2>
            {isLoading ? (
              <p className="text-gray-600">Loading donation tiers...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {donationTypes.map((type: DonationType) => (
                  <Card
                    key={type.id}
                    onClick={() => setSelectedType(type)}
                    className={`p-6 cursor-pointer transition-all border-2 ${
                      selectedType?.id === type.id
                        ? 'border-amber-600 shadow-lg'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: type.icon_color + '20' }}
                    >
                      <Heart className="w-6 h-6" style={{ color: type.icon_color }} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{type.title}</h3>
                    <p className="text-3xl font-bold text-amber-600 mb-3">${type.amount}</p>
                    <p className="text-gray-600 text-sm mb-4">{type.description}</p>

                    {type.benefits && type.benefits.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase">Your Benefits:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {type.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-600 mt-1 flex-shrink-0">✓</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Payment Methods */}
            {selectedType && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedMethod === method.id
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 bg-white hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${method.color} text-white`}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Donation Summary */}
          {selectedType && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Donation Summary</h3>

                <div className="bg-amber-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">Donation Tier</p>
                  <p className="text-2xl font-bold text-amber-600 mb-3">{selectedType.title}</p>
                  <p className="text-3xl font-bold text-gray-900">${selectedType.amount}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your message of support..."
                      rows={3}
                    />
                  </div>
                </div>

                {submitMessage && (
                  <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                    submitMessage.includes('✅')
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <Button
                  onClick={handleDonate}
                  disabled={!selectedMethod || isSubmitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-bold"
                >
                  {isSubmitting ? 'Processing...' : `Donate $${selectedType.amount}`}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Your payment will be processed securely.
                </p>
              </Card>
            </div>
          )}
        </div>

        {/* Impact Info */}
        <Card className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-8">
          <h2 className="text-2xl font-bold mb-4">Your Impact Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold mb-2">500+</p>
              <p className="text-amber-100">Wildlife documented</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">1000+</p>
              <p className="text-amber-100">Community members trained</p>
            </div>
            <div>
              <p className="text-3xl font-bold mb-2">100%</p>
              <p className="text-amber-100">Funds go to conservation</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
