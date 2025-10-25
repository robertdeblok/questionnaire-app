# Questionnaire App - TypeForm-like Application

A modern, TypeForm-like questionnaire application with QR code tracking, conditional logic, and comprehensive analytics.

## Features

### Core Features
- **Questionnaire Builder**: Create questionnaires with multiple question types
- **Question Types**: Single choice, multiple choice, and text answers
- **"Other" Option**: Allow respondents to provide custom text when selecting "Other" as an answer
- **Conditional Logic**: Set up branching logic based on user answers (if user chooses A, go to question 2, else go to 3)
- **Multi-Language Support**: Built-in English and Dutch support with customizable button labels
- **Language Toggle**: Respondents can switch between languages while filling out the form
- **QR Code Generation**: Generate unique QR codes for different poster locations
- **Location Tracking**: Track which QR code/location each response came from
- **Analytics Dashboard**: View completion rates, location statistics, and response distributions

### Admin Panel
- Create and manage multiple questionnaires
- Add/edit/delete questions with drag-and-drop ordering
- Configure conditional logic rules
- Generate QR codes for different locations
- **Preview public form** directly from admin panel
- **Copy shareable links** with one-click
- View detailed analytics per questionnaire

### Public Questionnaire Interface
- Clean, modern UI similar to TypeForm
- Progress bar showing completion status
- Mobile-responsive design
- Session tracking (scanned but not completed)

### Analytics
- Total scans vs completed responses
- Completion rates overall and by location
- Question response distributions with charts
- Track incomplete sessions (scanned QR but didn't finish)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: TailwindCSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts
- **QR Codes**: qrcode library
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /Users/robertdeblok/Documents/questionnaire-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your database credentials:**
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/questionnaire_db?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

5. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev --name init

   # (Optional) Open Prisma Studio to view your database
   npx prisma studio
   ```

6. **Run the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
questionnaire-app/
├── app/
│   ├── admin/                    # Admin panel pages
│   │   ├── page.tsx             # Questionnaire list
│   │   ├── questionnaire/[id]/  # Questionnaire editor
│   │   └── analytics/[id]/      # Analytics dashboard
│   ├── api/                      # API routes
│   │   ├── questionnaires/      # CRUD for questionnaires
│   │   ├── questions/           # CRUD for questions
│   │   ├── logic-rules/         # Conditional logic
│   │   ├── locations/           # QR code locations
│   │   ├── sessions/            # User sessions
│   │   ├── answers/             # Answer storage
│   │   └── analytics/           # Analytics data
│   ├── q/[id]/                  # Public questionnaire page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── QuestionDialog.tsx       # Question editor dialog
│   ├── LocationDialog.tsx       # Location creator dialog
│   └── LogicDialog.tsx          # Logic rule dialog
├── lib/
│   ├── prisma.ts                # Prisma client
│   └── utils.ts                 # Utility functions
├── prisma/
│   └── schema.prisma            # Database schema
└── package.json
```

## Usage Guide

### Creating a Questionnaire

1. Go to the Admin Panel
2. Click "Create Questionnaire"
3. Enter title and description
4. Click "Create"

### Adding Questions

1. In the questionnaire editor, click "Add Question"
2. Enter question text
3. Select question type (Single Choice, Multiple Choice, or Text)
4. For choice questions, add answer options
5. **Optional**: Toggle "Allow custom text input" for any option to make it an "Other" option
   - When respondents select this option, they'll see a text field to specify their answer
   - Perfect for "Other (please specify)" or "None of the above" type options
6. Click "Save Question"

### Setting Up Conditional Logic

1. Find the question you want to add logic to
2. Click "Add Logic Rule"
3. Select which answer option triggers the rule
4. Choose which question to show next
5. Click "Add Rule"

### Configuring Language Settings

1. In the questionnaire editor, click the "Settings" button in the top-right
2. Configure language preferences:
   - Set the default language (English or Dutch)
   - Customize button labels for each language:
     - **English**: Previous, Next, Submit
     - **Dutch**: Vorige, Volgende, Afronden
3. Click "Save Settings"

**Note:** Respondents can toggle between languages using the language button in the public form.

### Previewing and Sharing Your Questionnaire

**Preview the Public Form:**
1. In the questionnaire editor, click the "Preview" button in the top-right
2. This opens the actual form respondents will see in a new tab
3. Test the flow, conditional logic, language toggle, and user experience

**Share the Questionnaire:**
1. Click "Copy Link" to copy the public URL to clipboard
2. Share the link directly with respondents via email, messaging, etc.
3. The public URL is also displayed in a highlighted box for easy access

### Generating QR Codes

1. In the questionnaire editor, find the "Locations & QR Codes" section
2. Click the "+" button
3. Enter a location name (e.g., "Main Entrance", "Store #1")
4. Click "Create Location"
5. Click the QR code icon to download the QR code image
6. Print and place the QR code at the specified location

### Viewing Analytics

1. From the Admin Panel, click "Analytics" on any questionnaire
2. View:
   - Total scans vs completed responses
   - Completion rate percentage
   - Statistics by location
   - Response distributions per question

## Database Schema

### Key Models

- **Questionnaire**: Main questionnaire container
- **Question**: Individual questions with type (single/multiple choice, text)
- **Option**: Answer options for choice questions
- **LogicRule**: Conditional logic (if answer X, go to question Y)
- **Location**: Physical locations with unique QR codes
- **Session**: User sessions tracking completion status
- **Answer**: User responses linked to sessions

## API Endpoints

### Questionnaires
- `GET /api/questionnaires` - List all questionnaires
- `POST /api/questionnaires` - Create new questionnaire
- `GET /api/questionnaires/[id]` - Get questionnaire details
- `PUT /api/questionnaires/[id]` - Update questionnaire
- `DELETE /api/questionnaires/[id]` - Delete questionnaire

### Questions
- `POST /api/questions` - Create question
- `PUT /api/questions/[id]` - Update question
- `DELETE /api/questions/[id]` - Delete question

### Logic Rules
- `POST /api/logic-rules` - Create logic rule
- `DELETE /api/logic-rules/[id]` - Delete logic rule

### Locations
- `POST /api/locations` - Create location with QR code

### Sessions
- `POST /api/sessions` - Create user session
- `PUT /api/sessions/[id]` - Update session (mark as completed)

### Answers
- `POST /api/answers` - Save answer

### Analytics
- `GET /api/analytics/[id]` - Get analytics for questionnaire

## Deployment

### Building for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure these are set in your production environment:
- `DATABASE_URL` - Production PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secure random string
- `NEXTAUTH_URL` - Your production domain

## Future Enhancements

- User authentication for admin panel
- Email notifications for completed surveys
- Export responses to CSV/Excel
- Multi-language support
- Custom branding/themes
- Question templates
- Duplicate questionnaire feature
- Advanced logic (multiple conditions, AND/OR operators)
- File upload question type
- Rating scale question type

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
