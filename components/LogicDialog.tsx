'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface LogicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: any
  questions: any[]
  onSaved: () => void
}

export default function LogicDialog({ open, onOpenChange, question, questions, onSaved }: LogicDialogProps) {
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [nextQuestionId, setNextQuestionId] = useState('')
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (open) {
      setShowForm(false)
      setEditingRuleId(null)
      setSelectedOptionId('')
      setNextQuestionId('')
    }
  }, [open])

  const saveLogicRule = async () => {
    if (!selectedOptionId || !nextQuestionId) return

    try {
      if (editingRuleId) {
        // Update existing rule
        await fetch(`/api/logic-rules/${editingRuleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            optionId: selectedOptionId,
            nextQuestionId,
            condition: 'equals'
          })
        })
      } else {
        // Create new rule
        await fetch('/api/logic-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: question?.id,
            optionId: selectedOptionId,
            nextQuestionId,
            condition: 'equals'
          })
        })
      }
      setSelectedOptionId('')
      setNextQuestionId('')
      setEditingRuleId(null)
      setShowForm(false)
      onSaved()
    } catch (error) {
      console.error('Failed to save logic rule:', error)
    }
  }

  const deleteLogicRule = async (ruleId: string) => {
    if (!confirm('Delete this logic rule?')) return
    
    try {
      await fetch(`/api/logic-rules/${ruleId}`, {
        method: 'DELETE'
      })
      onSaved()
    } catch (error) {
      console.error('Failed to delete logic rule:', error)
    }
  }

  const editLogicRule = (rule: any) => {
    setEditingRuleId(rule.id)
    setSelectedOptionId(rule.optionId)
    setNextQuestionId(rule.nextQuestionId)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setEditingRuleId(null)
    setSelectedOptionId('')
    setNextQuestionId('')
    setShowForm(false)
  }

  const getOptionText = (optionId: string) => {
    const option = question?.options.find((opt: any) => opt.id === optionId)
    return option?.text || 'Unknown option'
  }

  const getQuestionText = (questionId: string) => {
    const q = questions.find(q => q.id === questionId)
    const idx = questions.findIndex(q => q.id === questionId)
    return q ? `Q${idx + 1}: ${q.text}` : 'Unknown question'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conditional Logic Rules</DialogTitle>
          <DialogDescription>Manage logic rules for this question</DialogDescription>
        </DialogHeader>

        {/* Existing Rules List */}
        {!showForm && question?.logicRules && question.logicRules.length > 0 && (
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium">Existing Rules</h3>
            {question.logicRules.map((rule: any) => (
              <Card key={rule.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">If</span> user selects <span className="font-medium text-blue-600">{getOptionText(rule.optionId)}</span>
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Then</span> go to <span className="font-medium text-green-600">{getQuestionText(rule.nextQuestionId)}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => editLogicRule(rule)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteLogicRule(rule.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{editingRuleId ? 'Edit Rule' : 'Add New Rule'}</h3>
            <div>
              <Label>If user selects</Label>
              <Select value={selectedOptionId} onValueChange={setSelectedOptionId}>
                <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                <SelectContent>
                  {question?.options.map((opt: any) => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.text}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Then go to question</Label>
              <Select value={nextQuestionId} onValueChange={setNextQuestionId}>
                <SelectTrigger><SelectValue placeholder="Select next question" /></SelectTrigger>
                <SelectContent>
                  {questions.filter(q => q.id !== question?.id).map((q, idx) => (
                    <SelectItem key={q.id} value={q.id}>Q{idx + 1}: {q.text}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={saveLogicRule} disabled={!selectedOptionId || !nextQuestionId}>
                {editingRuleId ? 'Update Rule' : 'Add Rule'}
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowForm(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add New Logic Rule
          </Button>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
