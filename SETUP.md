# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ PostgreSQL installed and running
- ✅ npm or yarn installed

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /Users/robertdeblok/Documents/questionnaire-app
npm install
```

### 2. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE questionnaire_db;

# Exit psql
\q
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env file with your actual credentials
nano .env
```

Update the `.env` file:
```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/questionnaire_db?schema=public"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

**To generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# This will create all tables and relationships
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Testing the Application

### Create Your First Questionnaire

1. Open http://localhost:3000
2. Click "Go to Admin"
3. Click "Create Questionnaire"
4. Add a title like "Customer Feedback Survey"
5. Add questions:
   - Question 1: "How satisfied are you?" (Single Choice)
     - Options: Very Satisfied, Satisfied, Neutral, Dissatisfied
   - Question 2: "What can we improve?" (Text)

### Add Conditional Logic

1. On Question 1, click "Add Logic Rule"
2. If user selects "Dissatisfied", go to Question 2
3. Otherwise, skip to end

### Generate QR Code

1. In the right sidebar, click "+" under Locations
2. Add location name: "Main Store"
3. Click "Create Location"
4. Click the QR icon to download
5. Print the QR code and test by scanning with your phone

### View Analytics

1. Go back to Admin Panel
2. Click "Analytics" on your questionnaire
3. View completion rates and response distributions

## Database Management

### View Database in Prisma Studio

```bash
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can:
- View all tables
- Add/edit/delete records
- Explore relationships

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

⚠️ **Warning**: This will delete all data!

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Check DATABASE_URL in .env
3. Verify database exists: `psql -U postgres -l`

### Issue: "Prisma Client not initialized"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure you set:
- Secure `NEXTAUTH_SECRET`
- Production `DATABASE_URL`
- Correct `NEXTAUTH_URL` (your domain)

### Recommended Hosting

- **Vercel**: Best for Next.js (automatic deployment)
- **Railway**: Includes PostgreSQL database
- **Heroku**: All-in-one platform
- **DigitalOcean**: Full control with App Platform

## Next Steps

After setup is complete:

1. ✅ Create a few test questionnaires
2. ✅ Test conditional logic flows
3. ✅ Generate QR codes for different locations
4. ✅ Fill out questionnaires via QR codes
5. ✅ Review analytics dashboard
6. ✅ Customize styling if needed
7. ✅ Deploy to production

## Need Help?

- Check the main README.md for detailed documentation
- Review Prisma schema at `prisma/schema.prisma`
- Explore API routes in `app/api/`
- Check Next.js docs: https://nextjs.org/docs

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma generate     # Generate Prisma Client
npx prisma migrate dev  # Create new migration
npx prisma db push      # Push schema changes

# Other
npm run lint            # Run linter
```

Enjoy your TypeForm-like questionnaire app! 🎉
