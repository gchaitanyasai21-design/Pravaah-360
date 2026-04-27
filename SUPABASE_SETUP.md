# Supabase Setup Guide for PRAVAH + LifeLane

## 🚀 Quick Setup Steps:

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/login with GitHub
4. Create new project: "pravaah-lifelane"
5. Choose a region closest to your users
6. Set database password (save it!)
7. Wait for project to be created

### 2. Get Your Credentials
From your Supabase project dashboard:
- **Project URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → anon/public key

### 3. Set Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. This will create all tables and sample data

### 5. Test the Connection
Run your app locally:
```bash
npm run dev
```
Visit: http://localhost:3000

### 6. Deploy to Vercel
1. Add environment variables to Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
2. Deploy:
   ```bash
   vercel --prod
   ```

## 📋 Database Tables Created:
- ✅ `ambulances` - Emergency vehicle tracking
- ✅ `emergencies` - Emergency requests
- ✅ `hospitals` - Medical facility data
- ✅ `traffic_junctions` - Traffic signal control

## 🌍 Sample Data Included:
- 4 Delhi hospitals (AIIMS, Safdarjung, LNJP, GTB)
- 4 traffic junctions in Delhi
- 4 sample ambulances

## 🔧 Features Working:
- ✅ Real-time ambulance tracking
- ✅ Emergency request management
- ✅ Hospital capacity tracking
- ✅ Traffic signal preemption
- ✅ Permanent URLs
- ✅ All service interfaces

## 🚨 Important Notes:
- Database is automatically backed up
- Real-time subscriptions work out of the box
- Row Level Security (RLS) can be added later
- Free tier includes 500MB database storage
- API rate limits apply (60 requests/minute)

Your PRAVAH + LifeLane platform is now ready with Supabase database! 🎉
