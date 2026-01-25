import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Edit2, RefreshCw, Save, Trash2 } from 'lucide-react'
import { apiUrl } from '@/lib/api-local'

type SettingsForm = {
  hero_kicker: string
  hero_title: string
  hero_subtitle: string
  hero_description: string
  hero_cta_label: string
  hero_cta_link: string
  stats_label_one: string
  stats_value_one: string
  stats_label_two: string
  stats_value_two: string
  stats_label_three: string
  stats_value_three: string
  custom_title: string
  custom_description: string
  custom_button_label: string
  custom_button_link: string
}

type Cause = {
  id: number
  title: string
  description: string
  icon: string | null
  sort_order: number
  is_active: number
}

type PaymentMethod = {
  id: number
  name: string
  tagline?: string | null
  description?: string | null
  integration_key: string
  button_label?: string | null
  icon?: string | null
  currency?: string | null
  config?: Record<string, unknown>
  sort_order: number
  is_active: number
}

const defaultSettings: SettingsForm = {
  hero_kicker: '',
  hero_title: '',
  hero_subtitle: '',
  hero_description: '',
  hero_cta_label: '',
  hero_cta_link: '',
  stats_label_one: '',
  stats_value_one: '',
  stats_label_two: '',
  stats_value_two: '',
  stats_label_three: '',
  stats_value_three: '',
  custom_title: '',
  custom_description: '',
  custom_button_label: '',
  custom_button_link: ''
}

export const AdminSupport = () => {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState<'settings' | 'causes' | 'payments'>('settings')
  const [settingsForm, setSettingsForm] = useState<SettingsForm>(defaultSettings)
  const [causeForm, setCauseForm] = useState({
    id: null as number | null,
    title: '',
    description: '',
    icon: '',
    sort_order: 0,
    is_active: true
  })
  const [paymentForm, setPaymentForm] = useState({
    id: null as number | null,
    name: '',
    tagline: '',
    description: '',
    integration_key: '',
    button_label: '',
    icon: '',
    currency: 'USD',
    config: '{\n  "payment_options": ""\n}',
    sort_order: 0,
    is_active: true
  })

  const { data: pageData, refetch: refetchPage } = useQuery({
    queryKey: ['support-page-admin'],
    queryFn: async () => {
      const response = await fetch(apiUrl('/support-page'))
      if (!response.ok) throw new Error('Failed to load support settings')
      return response.json()
    }
  })

  const { data: causes = [], refetch: refetchCauses, isLoading: loadingCauses } = useQuery<Cause[]>({
    queryKey: ['support-causes'],
    queryFn: async () => {
      const response = await fetch(apiUrl('/support-causes'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load support focus areas')
      return response.json()
    },
    enabled: Boolean(token)
  })

  const { data: paymentMethods = [], refetch: refetchPayments, isLoading: loadingPayments } = useQuery<PaymentMethod[]>({
    queryKey: ['support-payment-methods'],
    queryFn: async () => {
      const response = await fetch(apiUrl('/support-payment-methods'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to load payment methods')
      return response.json()
    },
    enabled: Boolean(token)
  })

  useEffect(() => {
    if (pageData?.settings) {
      setSettingsForm({
        hero_kicker: pageData.settings.hero_kicker || '',
        hero_title: pageData.settings.hero_title || '',
        hero_subtitle: pageData.settings.hero_subtitle || '',
        hero_description: pageData.settings.hero_description || '',
        hero_cta_label: pageData.settings.hero_cta_label || '',
        hero_cta_link: pageData.settings.hero_cta_link || '',
        stats_label_one: pageData.settings.stats_label_one || '',
        stats_value_one: pageData.settings.stats_value_one || '',
        stats_label_two: pageData.settings.stats_label_two || '',
        stats_value_two: pageData.settings.stats_value_two || '',
        stats_label_three: pageData.settings.stats_label_three || '',
        stats_value_three: pageData.settings.stats_value_three || '',
        custom_title: pageData.settings.custom_title || '',
        custom_description: pageData.settings.custom_description || '',
        custom_button_label: pageData.settings.custom_button_label || '',
        custom_button_link: pageData.settings.custom_button_link || ''
      })
    }
  }, [pageData])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <div className="p-6 flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>You do not have permission to access this page.</p>
          </div>
        </Card>
      </div>
    )
  }

  const handleSaveSettings = async () => {
    if (!settingsForm.hero_title || !settingsForm.hero_subtitle) {
      alert('Please fill in the hero title and subtitle')
      return
    }

    try {
      const response = await fetch(apiUrl('/support-page/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      })

      if (!response.ok) throw new Error('Failed to save settings')

      await refetchPage()
      alert('Support page settings updated!')
    } catch (error) {
      console.error(error)
      alert('Unable to save settings. Please try again.')
    }
  }

  const handleEditCause = (cause: Cause) => {
    setCauseForm({
      id: cause.id,
      title: cause.title,
      description: cause.description,
      icon: cause.icon || '',
      sort_order: cause.sort_order,
      is_active: cause.is_active === 1
    })
  }

  const handleResetCause = () => {
    setCauseForm({ id: null, title: '', description: '', icon: '', sort_order: 0, is_active: true })
  }

  const handleSaveCause = async () => {
    if (!causeForm.title) {
      alert('Please provide a title for the focus area')
      return
    }

    try {
      const response = await fetch(apiUrl('/support-causes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: causeForm.id || undefined,
          title: causeForm.title,
          description: causeForm.description,
          icon: causeForm.icon || null,
          sort_order: Number(causeForm.sort_order) || 0,
          is_active: causeForm.is_active
        })
      })

      if (!response.ok) throw new Error('Failed to save focus area')

      await refetchCauses()
      handleResetCause()
      alert(causeForm.id ? 'Focus area updated!' : 'Focus area created!')
    } catch (error) {
      console.error(error)
      alert('Unable to save focus area.')
    }
  }

  const handleDeactivateCause = async (id: number) => {
    if (!confirm('Deactivate this focus area?')) return

    try {
      const response = await fetch(apiUrl(`/support-causes/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to deactivate focus area')

      await refetchCauses()
    } catch (error) {
      console.error(error)
      alert('Unable to deactivate focus area.')
    }
  }

  const handleEditPayment = (method: PaymentMethod) => {
    setPaymentForm({
      id: method.id,
      name: method.name,
      tagline: method.tagline || '',
      description: method.description || '',
      integration_key: method.integration_key,
      button_label: method.button_label || '',
      icon: method.icon || '',
      currency: method.currency || 'USD',
      config: JSON.stringify(method.config || {}, null, 2),
      sort_order: method.sort_order,
      is_active: method.is_active === 1
    })
  }

  const handleResetPayment = () => {
    setPaymentForm({
      id: null,
      name: '',
      tagline: '',
      description: '',
      integration_key: '',
      button_label: '',
      icon: '',
      currency: 'USD',
      config: '{\n  "payment_options": ""\n}',
      sort_order: 0,
      is_active: true
    })
  }

  const handleSavePayment = async () => {
    if (!paymentForm.name || !paymentForm.integration_key) {
      alert('Payment method name and integration key are required')
      return
    }

    let parsedConfig: Record<string, unknown> | string = {}
    const trimmedConfig = paymentForm.config.trim()
    if (trimmedConfig) {
      try {
        parsedConfig = JSON.parse(trimmedConfig)
      } catch (error) {
        console.error(error)
        alert('Config must be valid JSON')
        return
      }
    }

    try {
      const response = await fetch(apiUrl('/support-payment-methods'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: paymentForm.id || undefined,
          name: paymentForm.name,
          tagline: paymentForm.tagline || null,
          description: paymentForm.description || null,
          integration_key: paymentForm.integration_key,
          button_label: paymentForm.button_label || null,
          icon: paymentForm.icon || null,
          currency: paymentForm.currency || 'USD',
          config: parsedConfig,
          sort_order: Number(paymentForm.sort_order) || 0,
          is_active: paymentForm.is_active
        })
      })

      if (!response.ok) throw new Error('Failed to save payment method')

      await refetchPayments()
      handleResetPayment()
      alert(paymentForm.id ? 'Payment method updated!' : 'Payment method created!')
    } catch (error) {
      console.error(error)
      alert('Unable to save payment method.')
    }
  }

  const handleDeactivatePayment = async (id: number) => {
    if (!confirm('Deactivate this payment method?')) return

    try {
      const response = await fetch(apiUrl(`/support-payment-methods/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to deactivate payment method')

      await refetchPayments()
    } catch (error) {
      console.error(error)
      alert('Unable to deactivate payment method.')
    }
  }

  const activeCauses = useMemo(() => causes.filter((cause) => cause.is_active === 1), [causes])
  const inactiveCauses = useMemo(() => causes.filter((cause) => cause.is_active === 0), [causes])
  const activePayments = useMemo(() => paymentMethods.filter((method) => method.is_active === 1), [paymentMethods])
  const inactivePayments = useMemo(() => paymentMethods.filter((method) => method.is_active === 0), [paymentMethods])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Support Page Manager</h1>
            <p className="text-gray-600">Update hero content, impact areas, and donor payment options.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => refetchPage()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button type="button" variant="safari" onClick={() => setActiveTab('settings')}>
              Support Overview
            </Button>
          </div>
        </div>

        <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 whitespace-nowrap font-medium transition-colors ${
              activeTab === 'settings' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hero & Stats
          </button>
          <button
            onClick={() => setActiveTab('causes')}
            className={`px-4 py-2 whitespace-nowrap font-medium transition-colors ${
              activeTab === 'causes' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Impact Focus Areas
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 whitespace-nowrap font-medium transition-colors ${
              activeTab === 'payments' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Payment Methods
          </button>
        </div>

        {activeTab === 'settings' && (
          <Card className="p-6">
            <form
              className="grid gap-6"
              onSubmit={(event) => {
                event.preventDefault()
                handleSaveSettings()
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero kicker</label>
                  <Input
                    value={settingsForm.hero_kicker}
                    onChange={(event) => setSettingsForm({ ...settingsForm, hero_kicker: event.target.value })}
                    placeholder="JOIN THE MOVEMENT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero CTA label</label>
                  <Input
                    value={settingsForm.hero_cta_label}
                    onChange={(event) => setSettingsForm({ ...settingsForm, hero_cta_label: event.target.value })}
                    placeholder="Donate Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero CTA link</label>
                  <Input
                    value={settingsForm.hero_cta_link}
                    onChange={(event) => setSettingsForm({ ...settingsForm, hero_cta_link: event.target.value })}
                    placeholder="/support"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero title *</label>
                  <Input
                    value={settingsForm.hero_title}
                    onChange={(event) => setSettingsForm({ ...settingsForm, hero_title: event.target.value })}
                    placeholder="Support Wildbeat's Mission"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero subtitle *</label>
                  <Textarea
                    value={settingsForm.hero_subtitle}
                    onChange={(event) => setSettingsForm({ ...settingsForm, hero_subtitle: event.target.value })}
                    rows={3}
                    placeholder="Help lyce 'Wildbeat' Umuhoza promote sustainable tourism..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Why support description</label>
                  <Textarea
                    value={settingsForm.hero_description}
                    onChange={(event) => setSettingsForm({ ...settingsForm, hero_description: event.target.value })}
                    rows={3}
                    placeholder="Tourism has the power to transform lives..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Statistic label 1</label>
                  <Input
                    value={settingsForm.stats_label_one}
                    onChange={(event) => setSettingsForm({ ...settingsForm, stats_label_one: event.target.value })}
                    placeholder="Wildlife documented"
                  />
                  <Input
                    value={settingsForm.stats_value_one}
                    onChange={(event) => setSettingsForm({ ...settingsForm, stats_value_one: event.target.value })}
                    placeholder="500+"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Statistic label 2</label>
                  <Input
                    value={settingsForm.stats_label_two}
                    onChange={(event) => setSettingsForm({ ...settingsForm, stats_label_two: event.target.value })}
                    placeholder="Community members trained"
                  />
                  <Input
                    value={settingsForm.stats_value_two}
                    onChange={(event) => setSettingsForm({ ...settingsForm, stats_value_two: event.target.value })}
                    placeholder="1000+"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Statistic label 3</label>
                  <Input
                    value={settingsForm.stats_label_three}
                    onChange={(event) => setSettingsForm({ ...settingsForm, stats_label_three: event.target.value })}
                    placeholder="Funds go to conservation"
                  />
                  <Input
                    value={settingsForm.stats_value_three}
                    onChange={(event) => setSettingsForm({ ...settingsForm, stats_value_three: event.target.value })}
                    placeholder="100%"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom card title</label>
                  <Input
                    value={settingsForm.custom_title}
                    onChange={(event) => setSettingsForm({ ...settingsForm, custom_title: event.target.value })}
                    placeholder="Custom Amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custom button label</label>
                  <Input
                    value={settingsForm.custom_button_label}
                    onChange={(event) => setSettingsForm({ ...settingsForm, custom_button_label: event.target.value })}
                    placeholder="Donate Custom Amount"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom description</label>
                <Textarea
                  value={settingsForm.custom_description}
                  onChange={(event) => setSettingsForm({ ...settingsForm, custom_description: event.target.value })}
                  rows={3}
                  placeholder="Want to contribute a different amount?..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom link</label>
                <Input
                  value={settingsForm.custom_button_link}
                  onChange={(event) => setSettingsForm({ ...settingsForm, custom_button_link: event.target.value })}
                  placeholder="/support/custom"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Save className="w-4 h-4 mr-2" />Save settings
                </Button>
              </div>
            </form>
          </Card>
        )}

        {activeTab === 'causes' && (
          <div className="grid gap-8 lg:grid-cols-[1fr,2fr]">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{causeForm.id ? 'Edit focus area' : 'Create focus area'}</h2>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  handleSaveCause()
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <Input
                    value={causeForm.title}
                    onChange={(event) => setCauseForm({ ...causeForm, title: event.target.value })}
                    placeholder="Wildlife Conservation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    value={causeForm.description}
                    onChange={(event) => setCauseForm({ ...causeForm, description: event.target.value })}
                    rows={3}
                    placeholder="Protecting Rwanda's incredible biodiversity..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Lucide name)</label>
                  <Input
                    value={causeForm.icon}
                    onChange={(event) => setCauseForm({ ...causeForm, icon: event.target.value })}
                    placeholder="Mountain"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
                  <Input
                    type="number"
                    value={causeForm.sort_order}
                    onChange={(event) => setCauseForm({ ...causeForm, sort_order: Number(event.target.value) })}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={causeForm.is_active}
                    onChange={(event) => setCauseForm({ ...causeForm, is_active: event.target.checked })}
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                    <Save className="w-4 h-4 mr-2" />
                    {causeForm.id ? 'Update' : 'Create'}
                  </Button>
                  {causeForm.id && (
                    <Button type="button" variant="outline" onClick={handleResetCause}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Active focus areas</h2>
                <span className="text-sm text-gray-500">{activeCauses.length} active</span>
              </div>
              <Card className="p-4">
                {loadingCauses ? (
                  <p className="text-gray-600">Loading...</p>
                ) : activeCauses.length === 0 ? (
                  <p className="text-gray-600">No focus areas yet</p>
                ) : (
                  <div className="space-y-4">
                    {activeCauses.map((cause) => (
                      <div
                        key={cause.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-start justify-between"
                      >
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{cause.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{cause.description}</p>
                          <p className="text-xs text-gray-500 mt-2 uppercase">Icon: {cause.icon || 'None'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCause(cause)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivateCause(cause.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {inactiveCauses.length > 0 && (
                <Card className="p-4 border-dashed border-gray-300">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Inactive focus areas</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {inactiveCauses.map((cause) => (
                      <li key={cause.id} className="flex items-center justify-between">
                        <span>{cause.title}</span>
                        <Button type="button" variant="ghost" onClick={() => handleEditCause(cause)}>
                          Reactivate
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="grid gap-8 lg:grid-cols-[1fr,2fr]">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{paymentForm.id ? 'Edit payment method' : 'Add payment method'}</h2>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  handleSavePayment()
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input
                    value={paymentForm.name}
                    onChange={(event) => setPaymentForm({ ...paymentForm, name: event.target.value })}
                    placeholder="Mobile Money"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Integration key *</label>
                  <Input
                    value={paymentForm.integration_key}
                    onChange={(event) => setPaymentForm({ ...paymentForm, integration_key: event.target.value })}
                    placeholder="flutterwave_mobile"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <Input
                      value={paymentForm.tagline}
                      onChange={(event) => setPaymentForm({ ...paymentForm, tagline: event.target.value })}
                      placeholder="M-Pesa, MTN, Airtel..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button label</label>
                    <Input
                      value={paymentForm.button_label}
                      onChange={(event) => setPaymentForm({ ...paymentForm, button_label: event.target.value })}
                      placeholder="Pay with Mobile Money"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    value={paymentForm.description}
                    onChange={(event) => setPaymentForm({ ...paymentForm, description: event.target.value })}
                    rows={3}
                    placeholder="Fast mobile money payments across East Africa."
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Lucide name)</label>
                    <Input
                      value={paymentForm.icon}
                      onChange={(event) => setPaymentForm({ ...paymentForm, icon: event.target.value })}
                      placeholder="Smartphone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <Input
                      value={paymentForm.currency}
                      onChange={(event) => setPaymentForm({ ...paymentForm, currency: event.target.value })}
                      placeholder="USD"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
                  <Input
                    type="number"
                    value={paymentForm.sort_order}
                    onChange={(event) => setPaymentForm({ ...paymentForm, sort_order: Number(event.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Integration config (JSON)</label>
                  <Textarea
                    value={paymentForm.config}
                    onChange={(event) => setPaymentForm({ ...paymentForm, config: event.target.value })}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={paymentForm.is_active}
                    onChange={(event) => setPaymentForm({ ...paymentForm, is_active: event.target.checked })}
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                    <Save className="w-4 h-4 mr-2" />
                    {paymentForm.id ? 'Update' : 'Create'}
                  </Button>
                  {paymentForm.id && (
                    <Button type="button" variant="outline" onClick={handleResetPayment}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Active payment methods</h2>
                <span className="text-sm text-gray-500">{activePayments.length} active</span>
              </div>
              <Card className="p-4">
                {loadingPayments ? (
                  <p className="text-gray-600">Loading...</p>
                ) : activePayments.length === 0 ? (
                  <p className="text-gray-600">No payment methods yet</p>
                ) : (
                  <div className="space-y-4">
                    {activePayments.map((method) => (
                      <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                            <p className="text-xs text-gray-500 mt-2 uppercase">Integration: {method.integration_key}</p>
                            <p className="text-xs text-gray-500">Currency: {method.currency || 'USD'}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPayment(method)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeactivatePayment(method.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {method.config && (
                          <pre className="mt-3 bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600 overflow-auto">
                            {JSON.stringify(method.config, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {inactivePayments.length > 0 && (
                <Card className="p-4 border-dashed border-gray-300">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Inactive payment methods</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {inactivePayments.map((method) => (
                      <li key={method.id} className="flex items-center justify-between">
                        <span>{method.name}</span>
                        <Button type="button" variant="ghost" onClick={() => handleEditPayment(method)}>
                          Reactivate
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
