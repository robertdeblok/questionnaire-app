# Testing Guide

## Multiple Choice Answer Saving - Test Case

### Issue Fixed
Multiple choice answers were not being saved properly. Each selected option now creates a separate answer record.

### How to Test

#### 1. Create a Multiple Choice Question

1. Go to Admin Panel → Create or edit a questionnaire
2. Add a new question:
   - Type: **Multiple Choice**
   - Question: "What features do you use? (Select all that apply)"
   - Options:
     - Feature A
     - Feature B
     - Feature C
     - Other (toggle "Allow custom text input")

#### 2. Fill Out the Form

1. Click "Preview" to open the public form
2. Select **multiple options** (e.g., Feature A, Feature B, and Other)
3. If you selected "Other", type custom text (e.g., "Feature D")
4. Click "Next" or "Submit"

#### 3. Verify in Database

Using Prisma Studio (`npx prisma studio`):

1. Open the **Answer** table
2. Find answers for your session
3. You should see **multiple answer records** for the same question:
   - Answer 1: questionId = [your question], optionId = [Feature A]
   - Answer 2: questionId = [your question], optionId = [Feature B]
   - Answer 3: questionId = [your question], optionId = [Other], textAnswer = "Feature D"

#### 4. Check Analytics

1. Go to Admin Panel → Analytics for your questionnaire
2. Find the multiple choice question
3. Verify the count shows correctly for each option:
   - Feature A: 1
   - Feature B: 1
   - Feature C: 0
   - Other: 1

### Edge Cases to Test

#### Test Case 1: Change Answer After Going Back
1. Answer a multiple choice question with 2 options
2. Click "Next"
3. Click "Previous" to go back
4. Change your selections (uncheck 1, check a different one)
5. Click "Next" again
6. **Expected**: Only the new selections are saved (old ones are deleted)

#### Test Case 2: Multiple Choice with "Other"
1. Select multiple options including "Other"
2. Type custom text in the "Other" field
3. Submit
4. **Expected**: All options saved + custom text stored

#### Test Case 3: Uncheck All Options
1. Select some options
2. Go back and uncheck all options
3. Try to click "Next"
4. **Expected**: Button should be disabled (no answer provided)

---

## Other Test Scenarios

### Language Toggle Test

1. Create a questionnaire with custom labels
2. Preview the form
3. Click the language toggle (EN/NL)
4. **Expected**: Button labels change (Next ↔ Volgende, Previous ↔ Vorige)

### "Other" Option Test

1. Create a single choice question with an "Other" option
2. Select the "Other" option
3. **Expected**: Text field appears below
4. Type custom text and submit
5. **Expected**: Both option and text are saved

### Conditional Logic Test

1. Create Q1: "Do you like feature X?" (Yes/No)
2. Add logic: If "Yes" → skip to Q3, If "No" → go to Q2
3. Test both paths
4. **Expected**: Questions flow according to the rules

### QR Code Location Tracking

1. Create a location "Store 1"
2. Download QR code
3. Open QR code URL (includes `?location=...`)
4. Complete the questionnaire
5. Check analytics
6. **Expected**: Response is tracked under "Store 1"

---

## Known Issues

None currently reported.

---

## Reporting Issues

If you find a bug:
1. Note the steps to reproduce
2. Check browser console for errors
3. Check terminal/server logs
4. Document expected vs actual behavior
