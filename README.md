# Subscription Tracker

## Project Overview
- **Name**: Subscription Tracker
- **Goal**: Help users track and manage their monthly subscription services and expenses
- **Features**: Add, edit, delete subscriptions; view monthly totals; categorize subscriptions; dashboard analytics

## URLs
- **Production**: https://c52d0d93.subscription-tracker-bqw.pages.dev
- **Development**: https://3000-iap6d14t3ltqti088z527-6532622b.e2b.dev
- **GitHub**: https://github.com/Muna0/subscription-tracker
- **API Base**: https://c52d0d93.subscription-tracker-bqw.pages.dev/api

## Functional Entry Points

### API Endpoints
- `GET /api/subscriptions` - List all subscriptions
- `GET /api/subscriptions/:id` - Get specific subscription
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `GET /api/summary` - Get monthly spending summary and analytics
- `GET /api/categories` - Get available subscription categories

### Frontend Features
- **Dashboard**: Monthly cost overview, active subscription count, category breakdown
- **Subscription Management**: Add, edit, delete subscriptions with full form validation
- **Categories**: Streaming, Software, Fitness, News & Media, Cloud Storage, Music, Gaming, Productivity, Other
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Automatic refresh after CRUD operations

## Data Architecture

### Data Models
```typescript
Subscription {
  id: number
  name: string
  description: string
  cost: number
  billing_cycle: 'monthly' | 'yearly'
  billing_date: number (1-31)
  category: string
  website_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

Summary {
  total_monthly_cost: number
  active_subscriptions: number
  total_subscriptions: number
  categories: Record<string, number>
}
```

### Storage Services
- **Current**: In-memory storage for development
- **Production Ready**: Cloudflare D1 SQLite database (migrations prepared)
- **Migration Files**: `/migrations/0001_initial_schema.sql` with full schema and indexes

## User Guide

### Adding a Subscription
1. Click "Add Subscription" button
2. Fill in required fields (Name, Cost, Billing Date)
3. Select category and billing cycle
4. Optionally add description and website URL
5. Set active/inactive status
6. Click "Add Subscription"

### Managing Subscriptions
- **Edit**: Click the edit icon next to any subscription
- **Delete**: Click the trash icon (with confirmation)
- **View Details**: All subscription info displayed in card format
- **External Links**: Click external link icon to visit subscription website

### Dashboard Features
- **Monthly Total**: See total monthly cost (yearly subscriptions calculated as monthly equivalent)
- **Active Count**: Number of currently active subscriptions
- **Category Breakdown**: Top spending categories with amounts
- **Next Billing**: See upcoming billing dates for each subscription

## Development Features

### Currently Completed
✅ Full CRUD API for subscriptions  
✅ Responsive frontend interface with modern UI  
✅ Dashboard with spending analytics  
✅ Category management system  
✅ Form validation and error handling  
✅ Modal-based editing interface  
✅ Real-time notifications  
✅ Mobile-responsive design  

### Features Not Yet Implemented
❌ D1 database integration (using in-memory storage)  
❌ User authentication  
❌ Data export/import  
❌ Subscription renewal notifications  
❌ Spending history and trends  
❌ Budget setting and alerts  
❌ Multiple currency support  

## Recommended Next Steps
1. **Deploy to Cloudflare Pages** - Set up D1 database and deploy to production
2. **Add User Authentication** - Implement user accounts for personal data
3. **Implement Notifications** - Email/push notifications for upcoming renewals
4. **Add Data Visualization** - Charts for spending trends over time
5. **Export/Import Features** - CSV/JSON data export and import capabilities
6. **Budget Management** - Set monthly budgets and spending alerts

## Tech Stack
- **Backend**: Hono Framework (TypeScript)
- **Frontend**: Vanilla JavaScript with Tailwind CSS
- **Database**: Cloudflare D1 (SQLite) - ready for production
- **Icons**: Font Awesome
- **HTTP Client**: Axios
- **Deployment**: Cloudflare Pages (prepared)

## Deployment Status
- **Platform**: Cloudflare Pages (Production)
- **Status**: ✅ Live and Deployed
- **Production URL**: https://c52d0d93.subscription-tracker-bqw.pages.dev
- **Last Updated**: 2025-09-19
- **Database**: In-memory (data resets on deployment)

## Quick Start Commands
```bash
# Start development server
npm run dev:sandbox

# Build for production
npm run build

# Database setup (when deploying)
npm run db:migrate:local
npm run db:seed

# Deploy to Cloudflare Pages
npm run deploy:prod
```