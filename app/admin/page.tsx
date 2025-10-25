'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, FileText, BarChart3, Trash2, Settings, Eye, Copy } from 'lucide-react'

interface Questionnaire {
  id: string
  title: string
  description: string | null
  createdAt: string
  _count: {
    sessions: number
  };
}

export default function AdminPage() {
  const router = useRouter()
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchQuestionnaires()
  }, [])

  const fetchQuestionnaires = async () => {
    try {
      const res = await fetch('/api/questionnaires')
      const data = await res.json()
      setQuestionnaires(data)
    } catch (error) {
      console.error('Failed to fetch questionnaires:', error)
    } finally {
      setLoading(false)
    }
  }

  const createQuestionnaire = async () => {
    if (!newTitle.trim()) return

    try {
      const res = await fetch('/api/questionnaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription
        })
      })

      if (res.ok) {
        const questionnaire = await res.json()
        setIsDialogOpen(false)
        setNewTitle('')
        setNewDescription('')
        router.push(`/admin/questionnaire/${questionnaire.id}`)
      }
    } catch (error) {
      console.error('Failed to create questionnaire:', error)
    }
  }

  const deleteQuestionnaire = async (id: string) => {
    if (!confirm('Are you sure you want to delete this questionnaire?')) return

    try {
      await fetch(`/api/questionnaires/${id}`, { method: 'DELETE' })
      fetchQuestionnaires()
    } catch (error) {
      console.error('Failed to delete questionnaire:', error)
    }
  }

  const duplicateQuestionnaire = async (q: Questionnaire) => {
    const suggested = `${q.title} (Copy)`
    const newTitle = window.prompt('Duplicate questionnaire as:', suggested)
    if (newTitle === null) return
    try {
      setDuplicatingId(q.id)
      const res = await fetch('/api/questionnaires/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaireId: q.id, newTitle })
      })
      if (!res.ok) return
      const duplicated = await res.json()
      router.push(`/admin/questionnaire/${duplicated.id}`)
    } catch (error) {
      console.error('Failed to duplicate questionnaire:', error)
    } finally {
      setDuplicatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage your questionnaires</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Questionnaire
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Questionnaire</DialogTitle>
                <DialogDescription>
                  Enter the details for your new questionnaire
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Customer Satisfaction Survey"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Help us improve our services"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createQuestionnaire} disabled={!newTitle.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {questionnaires.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No questionnaires yet</h3>
              <p className="text-gray-500 mb-4">Create your first questionnaire to get started</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Questionnaire
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {questionnaires.map((q) => (
              <Card key={q.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="line-clamp-2">{q.title}</span>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 -mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateQuestionnaire(q)
                        }}
                        disabled={duplicatingId === q.id}
                        aria-busy={duplicatingId === q.id}
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 -mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteQuestionnaire(q.id)
                        }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardTitle>
                  {q.description && (
                    <CardDescription className="line-clamp-2">
                      {q.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-2" />
                      {q._count.sessions} responses
                    </div>
                    <div className="text-xs text-gray-400">
                      Created {new Date(q.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => router.push(`/admin/questionnaire/${q.id}`)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => router.push(`/admin/analytics/${q.id}`)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`/questionnaire/q/${q.id}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
