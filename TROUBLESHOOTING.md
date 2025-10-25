# Troubleshooting Guide

## Issue: Options Disappearing After Save

### Debug Steps

#### 1. Check Browser Console

1. Open the questionnaire editor page
2. Open browser Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Create or edit a multiple choice question
5. Add some options (e.g., "Option A", "Option B")
6. Click "Save Question"
7. Look for the log message: `Fetched questionnaire: { ... }`

**What to check:**
- Do the questions have an `options` array?
- Are the options populated with text?
- Example of what you should see:
  ```json
  {
    "id": "...",
    "questions": [
      {
        "id": "...",
        "text": "Your question",
        "type": "MULTIPLE_CHOICE",
        "options": [
          { "id": "...", "text": "Option A", "isOther": false },
          { "id": "...", "text": "Option B", "isOther": false }
        ]
      }
    ]
  }
  ```

#### 2. Check Database Directly

Using Prisma Studio:
```bash
npx prisma studio
```

1. Open the **Question** table
2. Find your question
3. Note the question ID

4. Open the **Option** table
5. Filter by the questionId
6. **Verify options exist** in the database

If options are in the database but not showing in the UI, it's a display issue.
If options are NOT in the database, it's a saving issue.

#### 3. Check Network Tab

1. Open Developer Tools → **Network** tab
2. Create/edit a question with options
3. Click Save
4. Look for the POST/PUT request to `/api/questions`
5. Click on the request
6. Go to **Payload** or **Request** tab
7. Verify the `options` array is being sent:
   ```json
   {
     "options": [
       { "text": "Option A", "isOther": false },
       { "text": "Option B", "isOther": false }
     ]
   }
   ```

8. Go to **Response** tab
9. Verify the response includes the options:
   ```json
   {
     "id": "...",
     "options": [
       { "id": "...", "text": "Option A" },
       { "id": "...", "text": "Option B" }
     ]
   }
   ```

### Common Causes & Solutions

#### Cause 1: Empty Options Being Saved
**Symptom:** Options array is `[]` in the response

**Solution:**
- Make sure you're typing text into each option field
- Don't leave option fields empty
- The system filters out empty options: `options.filter(o => o.text.trim())`

#### Cause 2: Dialog Not Refreshing After Save
**Symptom:** Options are saved but don't appear until page reload

**Solution:**
- The `fetchQuestionnaire()` function should be called after save
- Check if `onSaved()` callback is being triggered
- Try manually refreshing the page to see if options appear

#### Cause 3: Question Type Changed
**Symptom:** Had options, then disappeared

**Solution:**
- If you change question type from MULTIPLE_CHOICE to TEXT, options are removed
- This is expected behavior - TEXT questions don't have options

#### Cause 4: API Not Returning Options
**Symptom:** Network response doesn't include options array

**Check the API routes:**
- `/app/api/questions/route.ts` (POST) - includes `options: true`
- `/app/api/questions/[id]/route.ts` (PUT) - includes `options: { orderBy: { order: 'asc' } }`

### Quick Fix Attempt

Try these steps:
1. **Hard refresh** the page: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear browser cache** for localhost
3. **Restart the dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again:
   npm run dev
   ```

### Test Case

Create a test question to verify it's working:

1. Go to Admin → Edit any questionnaire
2. Click "Add Question"
3. Enter: "What is your favorite color?"
4. Type: Multiple Choice
5. Options:
   - Red
   - Blue
   - Green
   - Other (toggle "Allow custom text input")
6. Click "Save Question"
7. **Check**: Do all 4 options appear in the list?

### If Still Not Working

Please provide this information:
1. Screenshot of browser console after saving
2. Screenshot of the Network tab showing the API response
3. Screenshot of Prisma Studio showing the Option table
4. The exact steps you're taking

This will help diagnose whether it's a:
- Frontend display issue
- API response issue  
- Database saving issue
