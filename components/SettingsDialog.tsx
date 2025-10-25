'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, Languages } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionnaireId: string
  onSaved: () => void
}

interface Settings {
  defaultLanguage: string
  enabledLanguages: string
  // Button labels
  labelPreviousEn: string
  labelNextEn: string
  labelSubmitEn: string
  labelPreviousNl: string
  labelNextNl: string
  labelSubmitNl: string
  // Completion page
  labelThankYouEn: string
  labelThankYouNl: string
  labelCompletedEn: string
  labelCompletedNl: string
  // Question type instructions
  labelSingleChoiceEn: string
  labelSingleChoiceNl: string
  labelMultipleChoiceEn: string
  labelMultipleChoiceNl: string
  // Text question labels
  labelYourAnswerEn: string
  labelYourAnswerNl: string
  labelTextPlaceholderEn: string
  labelTextPlaceholderNl: string
  // Other option placeholder
  labelOtherPlaceholderEn: string
  labelOtherPlaceholderNl: string
  // Progress and status
  labelLoadingEn: string
  labelLoadingNl: string
  labelQuestionOfEn: string
  labelQuestionOfNl: string
}

export default function SettingsDialog({ open, onOpenChange, questionnaireId, onSaved }: SettingsDialogProps) {
  const [settings, setSettings] = useState<Settings>({
    defaultLanguage: 'en',
    enabledLanguages: 'en,nl',
    // Button labels
    labelPreviousEn: 'Previous',
    labelNextEn: 'Next',
    labelSubmitEn: 'Submit',
    labelPreviousNl: 'Vorige',
    labelNextNl: 'Volgende',
    labelSubmitNl: 'Afronden',
    // Completion page
    labelThankYouEn: 'Thank You!',
    labelThankYouNl: 'Bedankt!',
    labelCompletedEn: 'Your responses have been submitted successfully.',
    labelCompletedNl: 'Uw antwoorden zijn succesvol verzonden.',
    // Question type instructions
    labelSingleChoiceEn: 'Select one option',
    labelSingleChoiceNl: 'Selecteer één optie',
    labelMultipleChoiceEn: 'Select all that apply',
    labelMultipleChoiceNl: 'Selecteer alle opties die van toepassing zijn',
    // Text question labels
    labelYourAnswerEn: 'Your Answer',
    labelYourAnswerNl: 'Uw antwoord',
    labelTextPlaceholderEn: 'Type your answer here...',
    labelTextPlaceholderNl: 'Typ hier uw antwoord...',
    // Other option placeholder
    labelOtherPlaceholderEn: 'Please specify...',
    labelOtherPlaceholderNl: 'Gelieve te specificeren...',
    // Progress and status
    labelLoadingEn: 'Loading...',
    labelLoadingNl: 'Laden...',
    labelQuestionOfEn: 'Question {current} of {total}',
    labelQuestionOfNl: 'Vraag {current} van {total}'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchSettings()
    }
  }, [open, questionnaireId])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings/${questionnaireId}`)
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      await fetch(`/api/settings/${questionnaireId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      onOpenChange(false)
      onSaved()
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (key: keyof Settings, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Language & Label Settings
          </DialogTitle>
          <DialogDescription>
            Customize button labels for different languages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Language Configuration</CardTitle>
              <CardDescription>Set the default language for your questionnaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Language</Label>
                <Select value={settings.defaultLanguage} onValueChange={(v) => updateSetting('defaultLanguage', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="nl">Nederlands (Dutch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* English Labels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">English Labels</CardTitle>
              <CardDescription>Customize button text for English language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Previous Button</Label>
                  <Input
                    value={settings.labelPreviousEn}
                    onChange={(e) => updateSetting('labelPreviousEn', e.target.value)}
                    placeholder="Previous"
                  />
                </div>
                <div>
                  <Label>Next Button</Label>
                  <Input
                    value={settings.labelNextEn}
                    onChange={(e) => updateSetting('labelNextEn', e.target.value)}
                    placeholder="Next"
                  />
                </div>
                <div>
                  <Label>Submit Button</Label>
                  <Input
                    value={settings.labelSubmitEn}
                    onChange={(e) => updateSetting('labelSubmitEn', e.target.value)}
                    placeholder="Submit"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dutch Labels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dutch Labels (Nederlands)</CardTitle>
              <CardDescription>Customize button text for Dutch language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Vorige Button</Label>
                  <Input
                    value={settings.labelPreviousNl}
                    onChange={(e) => updateSetting('labelPreviousNl', e.target.value)}
                    placeholder="Vorige"
                  />
                </div>
                <div>
                  <Label>Volgende Button</Label>
                  <Input
                    value={settings.labelNextNl}
                    onChange={(e) => updateSetting('labelNextNl', e.target.value)}
                    placeholder="Volgende"
                  />
                </div>
                <div>
                  <Label>Afronden Button</Label>
                  <Input
                    value={settings.labelSubmitNl}
                    onChange={(e) => updateSetting('labelSubmitNl', e.target.value)}
                    placeholder="Afronden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Page - English */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completion Page - English</CardTitle>
              <CardDescription>Customize thank you message for English</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Thank You Title</Label>
                  <Input
                    value={settings.labelThankYouEn}
                    onChange={(e) => updateSetting('labelThankYouEn', e.target.value)}
                    placeholder="Thank You!"
                  />
                </div>
                <div>
                  <Label>Completion Message</Label>
                  <Input
                    value={settings.labelCompletedEn}
                    onChange={(e) => updateSetting('labelCompletedEn', e.target.value)}
                    placeholder="Your responses have been submitted successfully."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Page - Dutch */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completion Page - Dutch</CardTitle>
              <CardDescription>Customize thank you message for Dutch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bedankt Titel</Label>
                  <Input
                    value={settings.labelThankYouNl}
                    onChange={(e) => updateSetting('labelThankYouNl', e.target.value)}
                    placeholder="Bedankt!"
                  />
                </div>
                <div>
                  <Label>Voltooiingsbericht</Label>
                  <Input
                    value={settings.labelCompletedNl}
                    onChange={(e) => updateSetting('labelCompletedNl', e.target.value)}
                    placeholder="Uw antwoorden zijn succesvol verzonden."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Instructions - English */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Instructions - English</CardTitle>
              <CardDescription>Customize instruction text for different question types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Single Choice Instruction</Label>
                  <Input
                    value={settings.labelSingleChoiceEn}
                    onChange={(e) => updateSetting('labelSingleChoiceEn', e.target.value)}
                    placeholder="Select one option"
                  />
                </div>
                <div>
                  <Label>Multiple Choice Instruction</Label>
                  <Input
                    value={settings.labelMultipleChoiceEn}
                    onChange={(e) => updateSetting('labelMultipleChoiceEn', e.target.value)}
                    placeholder="Select all that apply"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Instructions - Dutch */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Instructions - Dutch</CardTitle>
              <CardDescription>Customize instruction text for different question types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Enkele Keuze Instructie</Label>
                  <Input
                    value={settings.labelSingleChoiceNl}
                    onChange={(e) => updateSetting('labelSingleChoiceNl', e.target.value)}
                    placeholder="Selecteer één optie"
                  />
                </div>
                <div>
                  <Label>Meerkeuze Instructie</Label>
                  <Input
                    value={settings.labelMultipleChoiceNl}
                    onChange={(e) => updateSetting('labelMultipleChoiceNl', e.target.value)}
                    placeholder="Selecteer alle opties die van toepassing zijn"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Question Labels - English */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Text Question Labels - English</CardTitle>
              <CardDescription>Customize labels for text input questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Answer Label</Label>
                  <Input
                    value={settings.labelYourAnswerEn}
                    onChange={(e) => updateSetting('labelYourAnswerEn', e.target.value)}
                    placeholder="Your Answer"
                  />
                </div>
                <div>
                  <Label>Text Placeholder</Label>
                  <Input
                    value={settings.labelTextPlaceholderEn}
                    onChange={(e) => updateSetting('labelTextPlaceholderEn', e.target.value)}
                    placeholder="Type your answer here..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Question Labels - Dutch */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Text Question Labels - Dutch</CardTitle>
              <CardDescription>Customize labels for text input questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Antwoord Label</Label>
                  <Input
                    value={settings.labelYourAnswerNl}
                    onChange={(e) => updateSetting('labelYourAnswerNl', e.target.value)}
                    placeholder="Uw antwoord"
                  />
                </div>
                <div>
                  <Label>Tekst Placeholder</Label>
                  <Input
                    value={settings.labelTextPlaceholderNl}
                    onChange={(e) => updateSetting('labelTextPlaceholderNl', e.target.value)}
                    placeholder="Typ hier uw antwoord..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Placeholders & Status - English */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Other Labels - English</CardTitle>
              <CardDescription>Customize other interface text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>"Other" Placeholder</Label>
                  <Input
                    value={settings.labelOtherPlaceholderEn}
                    onChange={(e) => updateSetting('labelOtherPlaceholderEn', e.target.value)}
                    placeholder="Please specify..."
                  />
                </div>
                <div>
                  <Label>Loading Text</Label>
                  <Input
                    value={settings.labelLoadingEn}
                    onChange={(e) => updateSetting('labelLoadingEn', e.target.value)}
                    placeholder="Loading..."
                  />
                </div>
                <div>
                  <Label>Progress Text</Label>
                  <Input
                    value={settings.labelQuestionOfEn}
                    onChange={(e) => updateSetting('labelQuestionOfEn', e.target.value)}
                    placeholder="Question {current} of {total}"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use {'{current}'} and {'{total}'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Placeholders & Status - Dutch */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Other Labels - Dutch</CardTitle>
              <CardDescription>Customize other interface text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>"Anders" Placeholder</Label>
                  <Input
                    value={settings.labelOtherPlaceholderNl}
                    onChange={(e) => updateSetting('labelOtherPlaceholderNl', e.target.value)}
                    placeholder="Gelieve te specificeren..."
                  />
                </div>
                <div>
                  <Label>Laadtekst</Label>
                  <Input
                    value={settings.labelLoadingNl}
                    onChange={(e) => updateSetting('labelLoadingNl', e.target.value)}
                    placeholder="Laden..."
                  />
                </div>
                <div>
                  <Label>Voortgangstekst</Label>
                  <Input
                    value={settings.labelQuestionOfNl}
                    onChange={(e) => updateSetting('labelQuestionOfNl', e.target.value)}
                    placeholder="Vraag {current} van {total}"
                  />
                  <p className="text-xs text-gray-500 mt-1">Gebruik {'{current}'} en {'{total}'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
