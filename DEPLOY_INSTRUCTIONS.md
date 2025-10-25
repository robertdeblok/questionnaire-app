# Deployment Instructions

## GitHub Repository
**Repository URL:** https://github.com/robertdeblok/questionnaire-app

## Production Server
**Server:** http://95.98.13.159/questionnaire  
**SSH:** rjblok@95.98.13.159  
**App Directory:** ~/questionnaire-app

## Workflow for Making Changes

### 1. Make Changes Locally
Edit files in your local repository at:
```
/Users/robertdeblok/Documents/questionnaire-app
```

### 2. Commit and Push to GitHub
```bash
cd /Users/robertdeblok/Documents/questionnaire-app
git add .
git commit -m "Description of your changes"
git push origin main
```

### 3. Deploy to Production Server
SSH into the server and run the deployment script:
```bash
ssh rjblok@95.98.13.159
cd ~/questionnaire-app
./deploy.sh
```

Or run it in one command:
```bash
ssh rjblok@95.98.13.159 "cd ~/questionnaire-app && ./deploy.sh"
```

## What the Deploy Script Does
1. Pulls latest changes from GitHub
2. Installs any new dependencies
3. Builds the Next.js application
4. Restarts the PM2 process
5. Shows the application status

## Manual Deployment Steps
If you prefer to deploy manually:
```bash
ssh rjblok@95.98.13.159
cd ~/questionnaire-app
git pull origin main
source ~/.nvm/nvm.sh
npm install
npm run build
pm2 restart questionnaire-app
```

## Quick Commands

### Check server status
```bash
ssh rjblok@95.98.13.159 "source ~/.nvm/nvm.sh && pm2 status questionnaire-app"
```

### View server logs
```bash
ssh rjblok@95.98.13.159 "source ~/.nvm/nvm.sh && pm2 logs questionnaire-app"
```

### Check git status on server
```bash
ssh rjblok@95.98.13.159 "cd ~/questionnaire-app && git status"
```

## Important Notes
- The `.env` file is not tracked in git (for security)
- The database file (`prisma/dev.db`) is not tracked in git
- Always test changes locally before deploying to production
- The app runs on port 3002 internally, proxied through Nginx
