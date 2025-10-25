# Deployment Information

## 🎉 Successfully Deployed!

Your Questionnaire App is now live and accessible.

### Access URL
**http://95.98.13.159/questionnaire/**

**Note:** The app is configured with a base path `/questionnaire` in `next.config.js`. All routes are prefixed with this path.

**API Proxy:** Nginx is configured to proxy `/api/*` requests to `/questionnaire/api/*` to support client-side fetch calls.

### Server Details
- **Server IP:** 95.98.13.159
- **User:** rjblok
- **App Directory:** `/home/rjblok/questionnaire-app/`
- **Internal Port:** 3002
- **Process Manager:** PM2
- **Web Server:** Nginx (reverse proxy)
- **Database:** SQLite (file: `~/questionnaire-app/prisma/dev.db`)

### Application Status
- ✅ Running on PM2 (auto-starts on server reboot)
- ✅ Nginx configured for path-based routing
- ✅ Completely isolated from h105news app
- ✅ Environment configured for production

### Management Commands

SSH into the server:
```bash
ssh rjblok@95.98.13.159
```

#### PM2 Commands (Process Management)
```bash
# View app status
pm2 status

# View logs (live)
pm2 logs questionnaire-app

# View last 50 lines of logs
pm2 logs questionnaire-app --lines 50

# Restart app
pm2 restart questionnaire-app

# Stop app
pm2 stop questionnaire-app

# Start app
pm2 start questionnaire-app

# Delete app from PM2
pm2 delete questionnaire-app
```

#### Application Commands
```bash
# Navigate to app directory
cd ~/questionnaire-app

# Load Node 18
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18

# Install dependencies (if needed)
npm ci

# Build app (after code changes)
npm run build

# Run database migrations
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

#### Nginx Commands
```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx (after config changes)
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# View nginx config
cat /etc/nginx/sites-available/questionnaire
```

### Environment Variables
Located at: `~/questionnaire-app/.env`

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="[auto-generated]"
NEXTAUTH_URL="http://95.98.13.159/questionnaire"
```

### Updating the Application

1. **On your local machine**, make changes and test
2. **Upload changes** to server:
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.env' \
     /Users/robertdeblok/Documents/questionnaire-app/ \
     rjblok@95.98.13.159:~/questionnaire-app/
   ```
3. **On the server**, rebuild and restart:
   ```bash
   ssh rjblok@95.98.13.159
   cd ~/questionnaire-app
   export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   nvm use 18
   npm ci
   npm run build
   pm2 restart questionnaire-app
   ```

### Database Backup
```bash
# Backup database
cp ~/questionnaire-app/prisma/dev.db ~/questionnaire-app/prisma/dev.db.backup-$(date +%Y%m%d)

# Restore from backup
cp ~/questionnaire-app/prisma/dev.db.backup-YYYYMMDD ~/questionnaire-app/prisma/dev.db
```

### Troubleshooting

#### App not responding
```bash
pm2 logs questionnaire-app --lines 50
pm2 restart questionnaire-app
```

#### Nginx issues
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx
```

#### Port conflicts
```bash
# Check what's using port 3002
sudo lsof -i :3002
```

#### Database issues
```bash
cd ~/questionnaire-app
npx prisma migrate status
npx prisma generate
```

### Security Notes
- App runs under user `rjblok` (non-root)
- Database is SQLite file-based (local only)
- No external database connections
- Nginx handles all external traffic
- Internal port 3002 not exposed externally

### Features Deployed
- ✅ Questionnaire creation and management
- ✅ Question types: Single choice, Multiple choice, Text
- ✅ Conditional logic (branching)
- ✅ Multi-language support (EN/NL)
- ✅ QR code generation for locations
- ✅ Analytics dashboard
- ✅ Duplicate questionnaire feature
- ✅ Clear analytics feature
- ✅ Session tracking

### Next Steps
1. Access the app at: http://95.98.13.159/questionnaire/
2. Click "Go to Admin" to create your first questionnaire
3. Add questions and configure logic
4. Generate QR codes for different locations
5. View analytics as responses come in

---

**Deployed on:** October 23, 2025
**Node Version:** 18.20.8
**Next.js Version:** 14.1.0
