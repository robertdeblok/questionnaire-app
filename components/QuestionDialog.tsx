'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Save, FileText } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface QuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionnaireId: string
  question: any
  onSaved: () => void
}

export default function QuestionDialog({ open, onOpenChange, questionnaireId, question, onSaved }: QuestionDialogProps) {
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT'>('SINGLE_CHOICE')
  const [options, setOptions] = useState<Array<{ text: string; isOther: boolean }>>([
    { text: '', isOther: false },
    { text: '', isOther: false }
  ])

  useEffect(() => {
    if (question) {
      console.log('Loading question into dialog:', question)
      setQuestionText(question.text)
      setQuestionType(question.type)
      // Ensure options exist and map them properly
      const questionOptions = question.options || []
      console.log('Question options:', questionOptions)
      if (questionOptions.length > 0) {
        setOptions(questionOptions.map((o: any) => ({ text: o.text, isOther: o.isOther || false })))
      } else {
        setOptions([{ text: '', isOther: false }, { text: '', isOther: false }])
      }
    } else {
      setQuestionText('')
      setQuestionType('SINGLE_CHOICE')
      setOptions([{ text: '', isOther: false }, { text: '', isOther: false }])
    }
  }, [question, open])

  const saveQuestion = async () => {
    if (!questionText.trim()) return

    const questionData = {
      questionnaireId,
      text: questionText,
      type: questionType,
      order: question ? question.order : 0,
      required: true,
      options: questionType !== 'TEXT' 
        ? options.filter(o => o.text.trim()).map(opt => ({ text: opt.text, isOther: opt.isOther })) 
        : []
    }

    console.log('Saving question:', questionData)

    try {
      let response
      if (question) {
        response = await fetch(`/api/questions/${question.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData)
        })
      } else {
        response = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ SERVER ERROR - Copy this:', errorData)
        console.error('Full error JSON:', JSON.stringify(errorData, null, 2))
        
        // Show simple alert
        alert(`Failed to save question. Check browser console (F12) for full error details.`)
        return
      }

      const savedQuestion = await response.json()
      console.log('Question saved successfully:', savedQuestion)
      
      onOpenChange(false)
      onSaved()
    } catch (error) {
      console.error('❌ EXCEPTION - Copy this:', error)
      alert('Failed to save question. Check browser console (F12) for full error details.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Add New Question'}</DialogTitle>
          <DialogDescription>Configure your question and answer options</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Question Text</Label>
            <Input value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="What is your question?" />
          </div>
          <div>
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={(v: any) => setQuestionType(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                <SelectItem value="TEXT">Text Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {questionType !== 'TEXT' && (
            <div>
              <Label>Answer Options</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="space-y-2 mt-3 p-3 border rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...options]
                        newOpts[idx].text = e.target.value
                        setOptions(newOpts)
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button variant="ghost" size="icon" onClick={() => setOptions(options.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={opt.isOther}
                        onCheckedChange={(checked) => {
                          const newOpts = [...options]
                          newOpts[idx].isOther = checked
                          if (checked && !newOpts[idx].text) {
                            newOpts[idx].text = 'Other'
                          }
                          setOptions(newOpts)
                        }}
                      />
                      <Label className="text-sm text-gray-600 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Allow custom text input
                      </Label>
                    </div>
                    {opt.isOther && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        "Other" option
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setOptions([...options, { text: '', isOther: false }])}>
                <Plus className="w-4 h-4 mr-2" />Add Option
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={saveQuestion} disabled={!questionText.trim()}>
            <Save className="w-4 h-4 mr-2" />Save Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
