'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Users, CheckCircle, XCircle, MapPin, Eye, Edit, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Analytics {
  totalSessions: number
  completedSessions: number
  incompleteSessions: number
  completionRate: string
  locationStats: any[]
  questionStats: any[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [questionnaire, setQuestionnaire] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [analyticsRes, questionnaireRes] = await Promise.all([
        fetch(`/api/analytics/${params.id}`),
        fetch(`/api/questionnaires/${params.id}`)
      ])
      const analyticsData = await analyticsRes.json()
      const questionnaireData = await questionnaireRes.json()
      setAnalytics(analyticsData)
      setQuestionnaire(questionnaireData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearAnalytics = async () => {
    if (!confirm('This will delete all analytics (sessions and answers) for this questionnaire. Continue?')) return
    try {
      setClearing(true)
      const res = await fetch(`/api/analytics/${params.id}`, { method: 'DELETE' })
      if (!res.ok) {
        console.error('Failed to clear analytics')
        return
      }
      await fetchData()
    } finally {
      setClearing(false)
    }
  }

  if (loading || !analytics || !questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearAnalytics}
              disabled={clearing}
              title="Clear all analytics"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {clearing ? 'Clearing...' : 'Clear Analytics'}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/admin/questionnaire/${params.id}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Questionnaire
            </Button>
            <Button variant="outline" onClick={() => window.open(`/questionnaire/q/${params.id}`, '_blank')}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Form
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">{questionnaire.title}</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Scans</CardDescription>
              <CardTitle className="text-4xl">{analytics.totalSessions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-2" />
                All sessions
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-4xl text-green-600">{analytics.completedSessions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 mr-2" />
                Finished surveys
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Incomplete</CardDescription>
              <CardTitle className="text-4xl text-orange-600">{analytics.incompleteSessions}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <XCircle className="w-4 h-4 mr-2" />
                Not finished
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completion Rate</CardDescription>
              <CardTitle className="text-4xl text-blue-600">{analytics.completionRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                Overall completion
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Stats */}
        {analytics.locationStats.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Statistics by Location</CardTitle>
              <CardDescription>Performance metrics for each QR code location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.locationStats.map((location, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-semibold">{location.locationName}</span>
                      </div>
                      <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        {location.completionRate}% completion
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Scans</p>
                        <p className="text-2xl font-semibold">{location.totalScans}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Completed</p>
                        <p className="text-2xl font-semibold text-green-600">{location.completedResponses}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Incomplete</p>
                        <p className="text-2xl font-semibold text-orange-600">{location.incompleteSessions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Answer Distribution */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Question Response Distribution</h2>
          {analytics.questionStats.map((question, qIdx) => (
            <Card key={qIdx}>
              <CardHeader>
                <CardTitle className="text-lg">Q{qIdx + 1}: {question.questionText}</CardTitle>
                <CardDescription>Type: {question.type.replace('_', ' ')}</CardDescription>
              </CardHeader>
              <CardContent>
                {question.answerDistribution.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      {question.answerDistribution.map((answer: any, aIdx: number) => (
                        <div key={aIdx} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{answer.optionText}</span>
                          <span className="font-semibold text-blue-600">{answer.count} votes</span>
                        </div>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={question.answerDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="optionText" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
