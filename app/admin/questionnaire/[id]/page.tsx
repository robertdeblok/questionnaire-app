'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2, QrCode, MapPin, Eye, Link2, Copy, ExternalLink, Check, Settings2 } from 'lucide-react'
import QuestionDialog from '@/components/QuestionDialog'
import LocationDialog from '@/components/LocationDialog'
import LogicDialog from '@/components/LogicDialog'
import SettingsDialog from '@/components/SettingsDialog'

interface Question {
  id: string
  text: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT'
  order: number
  options: any[]
  logicRules: any[]
}

interface Location {
  id: string
  name: string
  qrCode: string
}

interface Questionnaire {
  id: string
  title: string
  description: string | null
  questions: Question[]
  locations: Location[]
}

export default function QuestionnaireEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isLogicDialogOpen, setIsLogicDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchQuestionnaire()
  }, [params.id])

  const fetchQuestionnaire = async () => {
    try {
      const res = await fetch(`/api/questionnaires/${params.id}`)
      const data = await res.json()
      console.log('Fetched questionnaire:', data)
      setQuestionnaire(data)
    } catch (error) {
      console.error('Failed to fetch questionnaire:', error)
    } finally {
      setLoading(false)
    }
  }

  const openQuestionDialog = (question?: Question) => {
    setSelectedQuestion(question || null)
    setIsQuestionDialogOpen(true)
  }

  const deleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question?')) return
    try {
      await fetch(`/api/questions/${questionId}`, { method: 'DELETE' })
      fetchQuestionnaire()
    } catch (error) {
      console.error('Failed to delete question:', error)
    }
  }

  const downloadQR = async (locationId: string, locationName: string) => {
    const location = questionnaire?.locations.find(l => l.id === locationId)
    if (!location) return
    const url = `${window.location.origin}/q/${params.id}?location=${location.qrCode}`
    try {
      const QRCode = (await import('qrcode')).default
      const qrDataUrl = await QRCode.toDataURL(url, { width: 512 })
      const link = document.createElement('a')
      link.href = qrDataUrl
      link.download = `qr-${locationName.replace(/\s+/g, '-')}.png`
      link.click()
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const copyPublicLink = async () => {
    const publicUrl = `${window.location.origin}/q/${params.id}`
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const previewQuestionnaire = () => {
    const publicUrl = `${window.location.origin}/questionnaire/q/${params.id}`
    window.open(publicUrl, '_blank')
  }

  if (loading || !questionnaire) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <Button variant="ghost" onClick={() => router.push('/admin')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Admin
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900">{questionnaire.title}</h1>
              {questionnaire.description && <p className="text-gray-600 mt-2">{questionnaire.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)}>
                <Settings2 className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" onClick={previewQuestionnaire}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={copyPublicLink}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">Public Questionnaire URL</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-white px-3 py-1.5 rounded border border-blue-200 flex-1 overflow-x-auto">
                      {typeof window !== 'undefined' ? `${window.location.origin}/q/${params.id}` : '...'}
                    </code>
                    <Button size="sm" variant="ghost" onClick={() => previewQuestionnaire()}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Share this link with respondents or use QR codes for specific locations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Questions</h2>
              <Button onClick={() => openQuestionDialog()}><Plus className="w-4 h-4 mr-2" />Add Question</Button>
            </div>

            {questionnaire.questions.length === 0 ? (
              <Card><CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">No questions yet</p>
                <Button onClick={() => openQuestionDialog()}><Plus className="w-4 h-4 mr-2" />Add First Question</Button>
              </CardContent></Card>
            ) : (
              questionnaire.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <div className="flex-1"><span className="text-sm text-gray-500 mr-2">Q{index + 1}</span>{question.text}</div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openQuestionDialog(question)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteQuestion(question.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Type: {question.type.replace('_', ' ')}</p>
                      {question.options && question.options.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Options:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {question.options.map((opt: any, idx: number) => (
                              <li key={opt.id || idx}>
                                {opt.text}
                                {opt.isOther && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Other</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {question.type !== 'TEXT' && (
                        <Button variant="outline" size="sm" onClick={() => { setSelectedQuestion(question); setIsLogicDialogOpen(true); }}>
                          <Link2 className="w-4 h-4 mr-2" />
                          Manage Logic Rules
                        </Button>
                      )}
                      {question.logicRules && question.logicRules.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">{question.logicRules.length} logic rule(s) configured</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Locations & QR Codes</h2>
                <Button size="sm" onClick={() => setIsLocationDialogOpen(true)}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                {questionnaire.locations.map((location) => (
                  <Card key={location.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="font-medium">{location.name}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => downloadQR(location.id, location.name)}>
                          <QrCode className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {questionnaire.locations.length === 0 && (
                  <Card><CardContent className="pt-6 text-center text-sm text-gray-500">No locations yet. Add one to generate QR codes.</CardContent></Card>
                )}
              </div>
            </div>
          </div>
        </div>

        <QuestionDialog 
          open={isQuestionDialogOpen} 
          onOpenChange={setIsQuestionDialogOpen}
          questionnaireId={params.id}
          question={selectedQuestion}
          onSaved={fetchQuestionnaire}
        />

        <LocationDialog
          open={isLocationDialogOpen}
          onOpenChange={setIsLocationDialogOpen}
          questionnaireId={params.id}
          onSaved={fetchQuestionnaire}
        />

        <LogicDialog
          open={isLogicDialogOpen}
          onOpenChange={setIsLogicDialogOpen}
          question={selectedQuestion}
          questions={questionnaire.questions}
          onSaved={fetchQuestionnaire}
        />

        <SettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
          questionnaireId={params.id}
          onSaved={fetchQuestionnaire}
        />
      </div>
    </div>
  )
}
