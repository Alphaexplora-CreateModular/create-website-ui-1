# Resend API Integration Guide

## Quick Start (Local Development)

### Step 1: Get Resend API Key
1. Visit [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to API Keys section and copy your API key
4. Update `server/.env.local`:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

### Step 3: Run Both Servers
Open two terminal windows:

**Terminal 1 - Frontend (Vite):**
```bash
npm run dev
```
Runs on: `http://localhost:5173`

**Terminal 2 - Backend (Express):**
```bash
cd server
npm run dev
```
Runs on: `http://localhost:3001`

### Step 4: Test the Form
1. Navigate to the Contact page
2. Fill out the form
3. Submit and check:
   - Admin email: `rsd@alphaexplora.com`
   - User confirmation email: The email entered in the form

---

## Environment Variables Summary

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3001
```

### Backend (server/.env.local)
```
RESEND_API_KEY=re_your_actual_api_key_here
PORT=3001
CLIENT_URL=http://localhost:5173
```

---

## Production Deployment Options

### Option A: Vercel (Recommended for Full-Stack)
Best for: Complete front-end + back-end hosting

1. **Create Vercel API Routes** (instead of Express)
   - Replace `server/` with `/api/` folder at root
   - Create `/api/contact.ts` with Resend handler

2. **Deploy:**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Add Environment Variable:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add: `RESEND_API_KEY=re_your_key`

### Option B: Separate Backend Deployment
Best for: Existing backend infrastructure

**Deploy Backend:**
- Use Heroku, Railway, AWS EC2, DigitalOcean, etc.
- Set `CLIENT_URL` in environment variables
- Use backend URL in frontend `.env.production`

**Example for Production Frontend (.env.production):**
```
VITE_API_URL=https://your-backend-domain.com
```

### Option C: Cloudflare Workers (Lightweight)
Best for: Serverless without infrastructure

---

## Important Notes

### 1. Email Sender Address
- Currently using `onboarding@resend.dev` (Resend's test email)
- **For Production:** 
  - Verify your own domain in Resend
  - Update `from: "your-email@yourdomain.com"`

### 2. CORS Configuration
- Backend only accepts requests from `http://localhost:5173` (local) or your production frontend
- Update `CLIENT_URL` in `server/.env.local` for deployment

### 3. Security Checklist
- ✅ API key hidden in `.env.local`
- ✅ Form validation on backend
- ✅ CORS enabled for specific origin only
- ✅ Email validation before sending
- ✅ Error messages don't expose sensitive info

### 4. Resend Dashboard
- Monitor email delivery: [https://resend.com/emails](https://resend.com/emails)
- Check bounce rate and email analytics
- Verify domain DNS records for production

---

## Troubleshooting

### 1. CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Ensure backend is running and `CLIENT_URL` matches your frontend URL

### 2. API Key Error
```
Error: Unauthorized (401)
```
**Fix:** Check `RESEND_API_KEY` in `server/.env.local`

### 3. Email Not Received
- Check spam/junk folder
- Verify admin email in `server/src/routes/contact.ts`
- Check Resend dashboard for delivery logs

### 4. Form Stays in Loading State
- Check browser console for errors
- Verify backend is running (`npm run dev` in `server/` folder)
- Check network tab in DevTools

---

## File Structure
```
create-website-ui-1/
├── src/
│   ├── features/contact/
│   │   ├── viewModels/
│   │   │   └── useContactFormViewModel.ts (UPDATED)
│   │   └── views/
│   │       └── ContactForm.tsx (UPDATED)
│   └── shared/models/
│       └── contactService.ts (NEW)
├── server/ (NEW)
│   ├── src/
│   │   ├── routes/
│   │   │   └── contact.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── .env.local
│   ├── package.json
│   └── tsconfig.json
├── .env.local (UPDATED)
├── vite.config.ts
└── RESEND_SETUP.md (THIS FILE)
```

---

## Next Steps

1. ✅ Get Resend API key
2. ✅ Install server dependencies
3. ✅ Run both dev servers
4. ✅ Test form submission
5. ✅ Deploy backend (Vercel/other)
6. ✅ Update frontend API URL for production
7. ✅ Verify domain with Resend for production emails

---

## Support

For issues with:
- **Resend:** https://resend.com/docs
- **Express:** https://expressjs.com
- **Vite:** https://vitejs.dev
