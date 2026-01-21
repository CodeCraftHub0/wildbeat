import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Edit2, Trash2, Plus, DollarSign, Users } from 'lucide-react'

type DonationType = {
  id: number
  title: string
  amount: number
  description: string
  icon_color: string
  benefits: string[]
  sort_order: number
}

type Donation = {
  id: number
  name: string | null
  email: string | null
  donation_type_title: string
  amount: number
  payment_method: string
  created_at: string
}

type DonationStat = {
  id: number
  total: number
  count: number
}

export function AdminDonations() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState<'types' | 'donations'>('types')
  const [editingType, setEditingType] = useState<DonationType | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
    icon_color: '#D4A574',
    benefits: ''
  })

  // Fetch donation types
  const { data: donationTypes = [], refetch: refetchTypes, isLoading: typesLoading } = useQuery<DonationType[]>({
    queryKey: ['donation-types-admin'],
    queryFn: async () => {
      const response = await fetch('/api/donation-types/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch donation types')
      return response.json()
    },
    enabled: Boolean(token)
  })

  // Fetch donations
  const { data: donations = [], isLoading: donationsLoading } = useQuery<Donation[]>({
    queryKey: ['donations-admin'],
    queryFn: async () => {
      const response = await fetch('/api/donations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch donations')
      return response.json()
    },
    enabled: Boolean(token)
  })

  // Fetch statistics
  const { data: stats = [] } = useQuery<DonationStat[]>({
    queryKey: ['donations-stats'],
    queryFn: async () => {
      const response = await fetch('/api/donations/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    enabled: Boolean(token)
  })

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

  const handleSaveType = async () => {
    if (!formData.title || !formData.amount || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/donation-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          id: editingType?.id,
          amount: parseFloat(formData.amount),
          benefits: formData.benefits.split('\n').filter(b => b.trim()),
          is_active: 1,
          sort_order: editingType?.sort_order || donationTypes.length
        })
      })

      if (!response.ok) throw new Error('Failed to save donation type')
      
      await refetchTypes()
      resetForm()
      alert(editingType ? 'Donation type updated!' : 'Donation type created!')
    } catch (error) {
      alert('Error saving donation type: ' + error)
    }
  }

  const handleDeleteType = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this donation type?')) return

    try {
      const response = await fetch(`/api/donation-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete donation type')
      
      await refetchTypes()
      alert('Donation type deactivated!')
    } catch (error) {
      alert('Error deleting donation type: ' + error)
    }
  }

  const handleEditType = (type: DonationType) => {
    setEditingType(type)
    setFormData({
      title: type.title,
      amount: type.amount.toString(),
      description: type.description,
      icon_color: type.icon_color,
      benefits: type.benefits.join('\n')
    })
  }

  const resetForm = () => {
    setEditingType(null)
    setFormData({
      title: '',
      amount: '',
      description: '',
      icon_color: '#D4A574',
      benefits: ''
    })
  }

  const totalDonations = donations.reduce((sum: number, d: Donation) => sum + d.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Donation Management</h1>
        <p className="text-gray-600 mb-8">Manage donation types and view donor information</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('types')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'types'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Donation Types
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'donations'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Donations ({donations.length})
          </button>
        </div>

        {/* Donation Types Tab */}
        {activeTab === 'types' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <Card className="lg:col-span-1 p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingType ? 'Edit Donation Type' : 'Create Donation Type'}
              </h2>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveType() }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Guardian"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this donation supports"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.icon_color}
                      onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                      className="h-10 w-16 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.icon_color}
                      onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                      placeholder="#D4A574"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (one per line)</label>
                  <Textarea
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder="Benefit 1&#10;Benefit 2&#10;Benefit 3"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveType} className="flex-1 bg-amber-600 hover:bg-amber-700">
                    {editingType ? 'Update' : 'Create'}
                  </Button>
                  {editingType && (
                    <Button onClick={resetForm} variant="outline">
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* Donation Types List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {typesLoading ? (
                  <p className="text-gray-600">Loading...</p>
                ) : donationTypes.length === 0 ? (
                  <p className="text-gray-600">No donation types yet</p>
                ) : (
                  donationTypes.map((type) => {
                    const stats_item = stats.find((s) => s.id === type.id)
                    return (
                      <Card key={type.id} className="p-4 border-l-4" style={{ borderLeftColor: type.icon_color }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{type.title}</h3>
                            <p className="text-2xl font-bold text-amber-600 my-1">${type.amount}</p>
                            <p className="text-gray-600 text-sm mb-2">{type.description}</p>
                            <div className="flex gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-600">
                                <Users className="w-4 h-4" />
                                {stats_item?.count || 0} donors
                              </span>
                              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                <DollarSign className="w-4 h-4" />
                                ${stats_item?.total || 0}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditType(type)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteType(type.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {type.benefits && type.benefits.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Benefits:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {type.benefits.map((benefit: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-amber-600 mt-1">•</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-amber-600">${totalDonations.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Donors</p>
                    <p className="text-2xl font-bold text-blue-600">{donations.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Donation</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${donations.length > 0 ? (totalDonations / donations.length).toFixed(2) : '0'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="overflow-hidden">
              {donationsLoading ? (
                <p className="p-4 text-gray-600">Loading...</p>
              ) : donations.length === 0 ? (
                <p className="p-4 text-gray-600">No donations yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Donor</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {donations.map((donation: any) => (
                        <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{donation.name || 'Anonymous'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{donation.email || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                              {donation.donation_type_title}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-amber-600">${donation.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">{donation.payment_method}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
