import { useMemo, useState } from 'react'
import type { ElementType } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { apiUrl } from '@/lib/api-local'
import {
  Heart,
  ArrowRight,
  Mountain,
  Users,
  GraduationCap,
  Globe2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  PhoneCall,
  Wallet,
  Loader2
} from 'lucide-react'

interface SupportSettings {
  hero_kicker: string | null
  hero_title: string | null
  hero_subtitle: string | null
  hero_description: string | null
  hero_cta_label: string | null
  hero_cta_link: string | null
  stats_label_one: string | null
  stats_value_one: string | null
  stats_label_two: string | null
  stats_value_two: string | null
  stats_label_three: string | null
  stats_value_three: string | null
  custom_title: string | null
  custom_description: string | null
  custom_button_label: string | null
  custom_button_link: string | null
}

interface SupportCause {
  id: number
  title: string
  description: string
  icon?: string | null
}

interface DonationTier {
  id: number
  title: string
  amount: number
  description: string
  icon_color: string
  benefits: string[]
}

interface PaymentMethod {
  id: number
  name: string
  tagline?: string | null
  description?: string | null
  integration_key: string
  button_label?: string | null
  icon?: string | null
  currency?: string | null
}

interface SupportPageResponse {
  settings?: SupportSettings | null
  causes: SupportCause[]
  donationTypes: DonationTier[]
  paymentMethods: PaymentMethod[]
}

type SelectedTier =
  | (DonationTier & { isCustom?: false })
  | ({
      id: 'custom'
      title: string
      amount: number
      description: string
      benefits: string[]
      icon_color?: string
      isCustom: true
    })

const iconLibrary: Record<string, ElementType> = {
  Heart,
  Mountain,
  Users,
  GraduationCap,
  Globe2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  PhoneCall,
  Wallet
}

export const Support = () => {
  const [selectedTier, setSelectedTier] = useState<SelectedTier | null>(null)
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  const { data, isLoading, error } = useQuery<SupportPageResponse>({
    queryKey: ['support-page'],
    queryFn: async () => {
      const response = await fetch(apiUrl('/support-page'))
      if (!response.ok) {
        throw new Error('Failed to load support details')
      }
      return response.json()
    }
  })

  const settings = data?.settings ?? null
  const causes = data?.causes ?? []
  const donationTypes = data?.donationTypes ?? []
  const paymentMethods = data?.paymentMethods ?? []

  const buttonLabel = useMemo(() => {
    if (!selectedTier) return 'Select an amount'
    const amount = selectedTier.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `Support $${amount}`
  }, [selectedTier])

  const handleCustomSelection = () => {
    const amountValue = Number(customAmount)
    if (!amountValue || amountValue <= 0) {
      setSubmitMessage('Please enter a valid custom amount.')
      return
    }

    setSelectedTier({
      id: 'custom',
      title: settings?.custom_title || 'Custom Amount',
      amount: amountValue,
      description: settings?.custom_description || '',
      benefits: [],
      icon_color: '#D4A574',
      isCustom: true
    })
    setSubmitMessage('')
  }

  const resetForm = () => {
    setSelectedTier(null)
    setSelectedMethodId(null)
    setCustomAmount('')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  const handleDonate = async () => {
    if (!selectedTier) {
      setSubmitMessage('Select a support level to continue.')
      return
    }

    if (!selectedMethodId) {
      setSubmitMessage('Choose a payment method to continue.')
      return
    }

    if (!formData.name || !formData.email) {
      setSubmitMessage('Name and email are required.')
      return
    }

    if (!selectedTier.amount || selectedTier.amount <= 0) {
      setSubmitMessage('The selected amount is not valid.')
      return
    }

    const method = paymentMethods.find((m) => m.id === selectedMethodId)
    if (!method) {
      setSubmitMessage('Unable to find the selected payment method.')
      return
    }

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const response = await fetch(apiUrl('/payments/initiate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method_id: method.id,
          donation_type_id: selectedTier.id === 'custom' ? null : selectedTier.id,
          amount: selectedTier.amount,
          currency: method.currency,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          return_url: `${window.location.origin}/support/thank-you`
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initiate payment')
      }

      const transactionReference = result.reference || `initiated-${Date.now()}`

      await fetch(apiUrl('/donations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_type_id: selectedTier.id === 'custom' ? null : selectedTier.id,
          name: formData.name,
          email: formData.email,
          amount: selectedTier.amount,
          payment_method: method.integration_key,
          transaction_id: transactionReference,
          message: formData.message,
          status: result.type === 'mpesa' ? 'pending' : 'processing'
        })
      })

      if (result.type === 'redirect' && result.link) {
        setSubmitMessage('Redirecting you to our secure payment partner...')
        setTimeout(() => {
          window.location.href = result.link
        }, 1200)
        return
      }

      if (result.type === 'mpesa') {
        setSubmitMessage(`Check your phone to authorize the M-Pesa payment. Reference: ${transactionReference}`)
        resetForm()
        return
      }

      if (result.type === 'stripe') {
        setSubmitMessage('Payment initiated. Please complete the transaction in the secure card form that follows.')
        return
      }

      setSubmitMessage('Payment initiated. Follow the provider instructions to complete your donation.')
      resetForm()
    } catch (err) {
      setSubmitMessage(`❌ ${err instanceof Error ? err.message : 'Unable to process your donation right now.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="flex items-center gap-2 text-amber-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Preparing the support experience...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <Card className="p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">We could not load the support page</h2>
          <p className="text-sm text-gray-600">Please refresh the page or contact the administrator.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f1e7] pb-24">
      <div className="bg-gradient-to-b from-[#f4e6d6] via-[#f8f1e7] to-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fdf3ea] rounded-full mb-6">
            <Heart className="w-8 h-8 text-[#d58b28]" />
          </div>
          <p className="uppercase tracking-[0.3em] text-sm text-[#b2762c] mb-3">
            {(settings?.hero_kicker || 'Join the Movement').toUpperCase()}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#3c2a1d] leading-tight mb-4">
            {settings?.hero_title || "Support Wildbeat's Mission"}
          </h1>
          <p className="text-lg md:text-xl text-[#6d5a4a] max-w-3xl mx-auto">
            {settings?.hero_subtitle || 'Help lyce “Wildbeat” Umuhoza promote sustainable tourism, protect wildlife, and empower local communities in Rwanda. Every contribution makes a difference.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#3c2a1d] mb-4">Why Your Support Matters</h2>
          <p className="text-[#6d5a4a] max-w-2xl mx-auto text-lg">
            {settings?.hero_description || 'Tourism has the power to transform lives and protect our natural heritage. Your support helps create lasting positive impact in Rwanda.'}
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {causes.map((cause) => {
              const Icon = iconLibrary[cause.icon || 'ShieldCheck'] || ShieldCheck
              return (
                <Card key={cause.id} className="p-8 text-left bg-white/80 shadow-sm border border-[#f0e2d4]">
                  <div className="w-14 h-14 rounded-full bg-[#fdf3ea] flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-[#d58b28]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#3c2a1d] mb-3">{cause.title}</h3>
                  <p className="text-[#6d5a4a] text-sm leading-relaxed">{cause.description}</p>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="flex flex-col gap-4 mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-serif text-[#3c2a1d]">Choose Your Level of Support</h2>
              <p className="text-[#6d5a4a] text-lg">
                Select a giving tier or choose a custom amount and invest in conservation, community empowerment, and eco-tourism education.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
              {donationTypes.map((tier) => {
                const isActive = selectedTier?.id === tier.id
                return (
                  <Card
                    key={tier.id}
                    className={`relative h-full cursor-pointer border transition-all duration-200 ${
                      isActive ? 'border-[#d58b28] shadow-lg ring-2 ring-[#f7d9ab]/80' : 'border-[#f0e2d4] hover:border-[#d58b28]/70 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTier({ ...tier, isCustom: false })}
                  >
                    <div className="p-7 flex flex-col h-full">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: `${tier.icon_color || '#d58b28'}20` }}>
                        <Heart className="w-6 h-6" style={{ color: tier.icon_color || '#d58b28' }} />
                      </div>
                      <h3 className="text-2xl font-semibold text-[#3c2a1d]">{tier.title}</h3>
                      <p className="text-4xl font-bold text-[#d58b28] mt-2 mb-4">${tier.amount.toLocaleString()}</p>
                      <p className="text-sm text-[#6d5a4a] leading-relaxed flex-1">{tier.description}</p>
                      {tier.benefits?.length > 0 && (
                        <ul className="mt-5 space-y-2 text-sm text-[#5a4636]">
                          {tier.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[#d58b28] mt-1">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Button
                        type="button"
                        variant={isActive ? 'hero' : 'safari'}
                        className="mt-8 w-full flex items-center justify-center gap-2"
                      >
                        Support {tier.title}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>

            <Card className="mt-8 p-8 bg-white/90 border border-[#f0e2d4]">
              <h3 className="text-xl font-semibold text-[#3c2a1d] mb-2">{settings?.custom_title || 'Custom Amount'}</h3>
              <p className="text-sm text-[#6d5a4a] mb-6">{settings?.custom_description || 'Want to contribute a different amount? Every donation helps support our mission.'}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  type="number"
                  min="1"
                  placeholder="Enter custom amount"
                  className="bg-white border-[#e4d4c5] text-[#3c2a1d]"
                />
                <Button
                  type="button"
                  onClick={handleCustomSelection}
                  className="bg-[#d58b28] hover:bg-[#c37a22] text-white"
                >
                  {settings?.custom_button_label || 'Donate Custom Amount'}
                </Button>
              </div>
            </Card>

            {selectedTier && (
              <div className="mt-12">
                <h3 className="text-2xl font-serif text-[#3c2a1d] mb-6">Select Your Preferred Payment Method</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {paymentMethods.map((method) => {
                    const Icon = iconLibrary[method.icon || 'CreditCard'] || CreditCard
                    const isActive = selectedMethodId === method.id
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethodId(method.id)}
                        className={`text-left rounded-xl border p-5 transition-all ${
                          isActive
                            ? 'border-[#d58b28] bg-[#fff7ec] shadow-md'
                            : 'border-[#f0e2d4] bg-white hover:border-[#d58b28]/70'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#fdf3ea] flex items-center justify-center">
                            <Icon className="w-6 h-6 text-[#d58b28]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#3c2a1d]">{method.name}</p>
                            {method.tagline && <p className="text-sm text-[#b08354]">{method.tagline}</p>}
                            {method.description && <p className="text-sm text-[#6d5a4a] mt-2">{method.description}</p>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:pl-4">
            <Card className="sticky top-8 border border-[#f0e2d4] bg-white/90 shadow-sm">
              <div className="p-8">
                <h3 className="text-2xl font-serif text-[#3c2a1d] mb-6">Donation Summary</h3>
                <div className="rounded-xl bg-[#fff7ec] border border-[#f0e2d4] p-6 mb-6">
                  <p className="text-sm uppercase tracking-wide text-[#b08354] mb-2">Selected Tier</p>
                  <p className="text-xl font-semibold text-[#3c2a1d]">{selectedTier?.title || 'None selected yet'}</p>
                  <p className="text-4xl font-bold text-[#d58b28] mt-3">{selectedTier ? `$${selectedTier.amount.toLocaleString()}` : '$0.00'}</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#5a4636] mb-1">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                      placeholder="Your full name"
                      className="border-[#e4d4c5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5a4636] mb-1">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                      placeholder="you@example.com"
                      className="border-[#e4d4c5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5a4636] mb-1">Mobile Number</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                      placeholder="Include country code for mobile money"
                      className="border-[#e4d4c5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5a4636] mb-1">Message (optional)</label>
                    <Textarea
                      value={formData.message}
                      onChange={(event) => setFormData({ ...formData, message: event.target.value })}
                      placeholder="Share your message of support"
                      rows={3}
                      className="border-[#e4d4c5]"
                    />
                  </div>
                </div>

                {submitMessage && (
                  <div className={`mt-6 rounded-lg p-4 text-sm font-medium ${
                    submitMessage.startsWith('❌')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {submitMessage}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleDonate}
                  disabled={isSubmitting || !selectedTier || !selectedMethodId}
                  className="mt-8 w-full bg-[#d58b28] hover:bg-[#c37a22] text-white flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Processing...' : buttonLabel}
                </Button>
                <p className="text-xs text-[#6d5a4a] text-center mt-4">Secure processing via trusted regional partners.</p>
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-20">
          <Card className="bg-gradient-to-r from-[#d58b28] to-[#c37a22] text-white p-10 border-0">
            <h2 className="text-3xl font-serif mb-6">Your Impact Matters</h2>
            <div className="grid gap-6 sm:grid-cols-3 text-left">
              <div>
                <p className="text-4xl font-bold">{settings?.stats_value_one || '500+'}</p>
                <p className="text-sm opacity-80 mt-2">{settings?.stats_label_one || 'Wildlife documented'}</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{settings?.stats_value_two || '1000+'}</p>
                <p className="text-sm opacity-80 mt-2">{settings?.stats_label_two || 'Community members trained'}</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{settings?.stats_value_three || '100%'}</p>
                <p className="text-sm opacity-80 mt-2">{settings?.stats_label_three || 'Funds go to conservation'}</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
