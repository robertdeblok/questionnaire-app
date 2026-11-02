'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, ArrowRight, ArrowLeft, Languages } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT'
  options: any[]
  logicRules: any[]
}

interface Questionnaire {
  id: string
  title: string
  description: string | null
  questions: Question[]
}

export default function QuestionnairePage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Onbekende vragenlijst (kapotte/verkeerde QR) → Nederlandse standaardlijst
  const DEFAULT_ID = 'f5b9b7b7-22c0-4eb2-8404-097270ad401d' // "Voedselbank"

  const locationCode = searchParams.get('location')

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [completed, setCompleted] = useState(false)
  const [language, setLanguage] = useState<'en' | 'nl'>('en')
  const [settings, setSettings] = useState<any>(null)
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchQuestionnaire()
    fetchSettings()
    createSession()
  }, [params.id])

  const fetchQuestionnaire = async () => {
    try {
      const res = await fetch(`/api/questionnaires/${params.id}`)
      if (res.status === 404 && params.id !== DEFAULT_ID) {
        const q = locationCode ? `?location=${encodeURIComponent(locationCode)}` : ''
        router.replace(`/q/${DEFAULT_ID}${q}`)
        return
      }
      const data = await res.json()
      setQuestionnaire(data)
    } catch (error) {
      console.error('Failed to fetch questionnaire:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings/${params.id}`)
      const data = await res.json()
      setSettings(data)
      setLanguage(data.defaultLanguage || 'en')
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const createSession = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaireId: params.id,
          locationId: locationCode,
          ipAddress: null,
          userAgent: navigator.userAgent
        })
      })
      const session = await res.json()
      setSessionId(session.id)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleNext = async () => {
    if (!questionnaire || !sessionId) return

    const currentQuestion = questionnaire.questions[currentQuestionIndex]
    const answer = answers[currentQuestion.id]

    // Delete existing answers for this question (in case user went back and changed answer)
    try {
      await fetch(`/api/answers?sessionId=${sessionId}&questionId=${currentQuestion.id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to delete previous answers:', error)
    }

    // Save answer
    if (answer !== undefined) {
      try {
        // For multiple choice questions, save each selected option separately
        if (currentQuestion.type === 'MULTIPLE_CHOICE' && Array.isArray(answer)) {
          for (const optionId of answer) {
            const selectedOption = currentQuestion.options.find((opt: any) => opt.id === optionId)
            const otherText = otherTexts[currentQuestion.id]
            
            let textAnswerValue = null
            if (selectedOption?.isOther && otherText) {
              textAnswerValue = otherText
            }

            await fetch('/api/answers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId,
                questionId: currentQuestion.id,
                optionId: optionId,
                textAnswer: textAnswerValue
              })
            })
          }
        } else {
          // For single choice and text questions
          const selectedOption = currentQuestion.options.find((opt: any) => opt.id === answer)
          const otherText = otherTexts[currentQuestion.id]
          
          let textAnswerValue = null
          if (currentQuestion.type === 'TEXT') {
            textAnswerValue = answer
          } else if (selectedOption?.isOther && otherText) {
            textAnswerValue = otherText
          }

          await fetch('/api/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              questionId: currentQuestion.id,
              optionId: typeof answer === 'string' && currentQuestion.type !== 'TEXT' ? answer : null,
              textAnswer: textAnswerValue
            })
          })
        }
      } catch (error) {
        console.error('Failed to save answer:', error)
      }
    }

    // Check for conditional logic
    let nextIndex = currentQuestionIndex + 1
    if (currentQuestion.type !== 'TEXT' && answer) {
      const logicRule = currentQuestion.logicRules.find(rule => rule.optionId === answer)
      if (logicRule && logicRule.nextQuestionId) {
        const targetIndex = questionnaire.questions.findIndex(q => q.id === logicRule.nextQuestionId)
        if (targetIndex !== -1) {
          nextIndex = targetIndex
        }
      }
    }

    if (nextIndex >= questionnaire.questions.length) {
      // Complete the session
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
      })
      setCompleted(true)
    } else {
      setCurrentQuestionIndex(nextIndex)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Get labels based on selected language
  const getLabel = (key: 'previous' | 'next' | 'submit' | 'thankYou' | 'completed' | 'singleChoice' | 'multipleChoice' | 'yourAnswer' | 'textPlaceholder' | 'otherPlaceholder' | 'loading' | 'questionOf') => {
    if (!settings) {
      const defaults: Record<string, string> = {
        previous: 'Previous',
        next: 'Next',
        submit: 'Submit',
        thankYou: 'Thank You!',
        completed: 'Your responses have been submitted successfully.',
        singleChoice: 'Select one option',
        multipleChoice: 'Select all that apply',
        yourAnswer: 'Your Answer',
        textPlaceholder: 'Type your answer here...',
        otherPlaceholder: 'Please specify...',
        loading: 'Loading...',
        questionOf: 'Question {current} of {total}'
      }
      return defaults[key] || ''
    }
    
    const labelMap: Record<string, string> = {
      previous: language === 'nl' ? settings.labelPreviousNl : settings.labelPreviousEn,
      next: language === 'nl' ? settings.labelNextNl : settings.labelNextEn,
      submit: language === 'nl' ? settings.labelSubmitNl : settings.labelSubmitEn,
      thankYou: language === 'nl' ? settings.labelThankYouNl : settings.labelThankYouEn,
      completed: language === 'nl' ? settings.labelCompletedNl : settings.labelCompletedEn,
      singleChoice: language === 'nl' ? settings.labelSingleChoiceNl : settings.labelSingleChoiceEn,
      multipleChoice: language === 'nl' ? settings.labelMultipleChoiceNl : settings.labelMultipleChoiceEn,
      yourAnswer: language === 'nl' ? settings.labelYourAnswerNl : settings.labelYourAnswerEn,
      textPlaceholder: language === 'nl' ? settings.labelTextPlaceholderNl : settings.labelTextPlaceholderEn,
      otherPlaceholder: language === 'nl' ? settings.labelOtherPlaceholderNl : settings.labelOtherPlaceholderEn,
      loading: language === 'nl' ? settings.labelLoadingNl : settings.labelLoadingEn,
      questionOf: language === 'nl' ? settings.labelQuestionOfNl : settings.labelQuestionOfEn
    }
    
    return labelMap[key] || ''
  }

  if (loading || !questionnaire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-500">{getLabel('loading')}</p>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getLabel('thankYou')}</h2>
            <p className="text-gray-600 text-center">{getLabel('completed')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questionnaire.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">This questionnaire has no questions yet.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questionnaire.questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestion.id]
  const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'nl' : 'en')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">{questionnaire.title}</h2>
          {settings && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              {language === 'en' ? 'NL' : 'EN'}
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{getLabel('questionOf').replace('{current}', String(currentQuestionIndex + 1)).replace('{total}', String(questionnaire.questions.length))}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">{currentQuestion.text}</CardTitle>
            {currentQuestion.type !== 'TEXT' && (
              <CardDescription>
                {currentQuestion.type === 'SINGLE_CHOICE' ? getLabel('singleChoice') : getLabel('multipleChoice')}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === 'TEXT' ? (
              <div>
                <Label htmlFor="text-answer">{getLabel('yourAnswer')}</Label>
                <Input
                  id="text-answer"
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                  placeholder={getLabel('textPlaceholder')}
                  className="mt-2"
                />
              </div>
            ) : currentQuestion.type === 'SINGLE_CHOICE' ? (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <div key={option.id}>
                    <button
                      onClick={() => handleAnswer(currentQuestion.id, option.id)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                        currentAnswer === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {option.text}
                    </button>
                    {option.isOther && currentAnswer === option.id && (
                      <div className="mt-2 ml-4">
                        <Input
                          placeholder={getLabel('otherPlaceholder')}
                          value={otherTexts[currentQuestion.id] || ''}
                          onChange={(e) => {
                            setOtherTexts({ ...otherTexts, [currentQuestion.id]: e.target.value })
                          }}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <div key={option.id}>
                    <label
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-blue-300"
                    >
                      <input
                        type="checkbox"
                        checked={Array.isArray(currentAnswer) && currentAnswer.includes(option.id)}
                        onChange={(e) => {
                          const current = Array.isArray(currentAnswer) ? currentAnswer : []
                          if (e.target.checked) {
                            handleAnswer(currentQuestion.id, [...current, option.id])
                          } else {
                            handleAnswer(currentQuestion.id, current.filter((id: string) => id !== option.id))
                          }
                        }}
                        className="w-5 h-5 text-blue-600 mr-3"
                      />
                      {option.text}
                    </label>
                    {option.isOther && Array.isArray(currentAnswer) && currentAnswer.includes(option.id) && (
                      <div className="mt-2 ml-4">
                        <Input
                          placeholder={getLabel('otherPlaceholder')}
                          value={otherTexts[currentQuestion.id] || ''}
                          onChange={(e) => {
                            setOtherTexts({ ...otherTexts, [currentQuestion.id]: e.target.value })
                          }}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {getLabel('previous')}
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentAnswer === undefined || (currentQuestion.type === 'TEXT' && !currentAnswer?.trim())}
              >
                {currentQuestionIndex === questionnaire.questions.length - 1 ? getLabel('submit') : getLabel('next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
