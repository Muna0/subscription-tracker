import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// Type definitions for Cloudflare bindings
type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Enhanced in-memory storage with premium features
let subscriptions: any[] = [
  {
    id: 1,
    name: 'Netflix',
    description: 'Video streaming service',
    cost: 15.99,
    billing_cycle: 'monthly',
    billing_date: 15,
    category: 'Streaming',
    website_url: 'https://netflix.com',
    is_active: true,
    currency: 'USD',
    usage_frequency: 'daily',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Spotify Premium',
    description: 'Music streaming service',
    cost: 9.99,
    billing_cycle: 'monthly',
    billing_date: 5,
    category: 'Music',
    website_url: 'https://spotify.com',
    is_active: true,
    currency: 'USD',
    usage_frequency: 'daily',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Adobe Creative Cloud',
    description: 'Design and creative software suite',
    cost: 52.99,
    billing_cycle: 'monthly',
    billing_date: 1,
    category: 'Software',
    website_url: 'https://adobe.com',
    is_active: false,
    currency: 'USD',
    usage_frequency: 'rarely',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
]

let nextId = 4

// User settings and budgets (in real app, this would be per-user)
let userSettings = {
  monthly_budget: 100,
  currency: 'USD',
  budget_alerts: true,
  renewal_notifications: true,
  theme: 'elegant'
}

let categoryBudgets = {
  'Streaming': 30,
  'Software': 50,
  'Music': 15,
  'Gaming': 25,
  'Other': 20
}

// Smart insights engine
function generateSmartInsights(subs: any[]) {
  const insights = []
  const activeSubs = subs.filter(s => s.is_active)
  const inactiveSubs = subs.filter(s => !s.is_active)
  const totalMonthly = activeSubs.reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.cost : s.cost / 12), 0)
  
  // Unused subscriptions insight
  if (inactiveSubs.length > 0) {
    const wastedMoney = inactiveSubs.reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.cost : s.cost / 12), 0)
    insights.push({
      type: 'warning',
      title: 'Unused Subscriptions Found',
      message: `You have ${inactiveSubs.length} inactive subscription${inactiveSubs.length > 1 ? 's' : ''} costing $${wastedMoney.toFixed(2)}/month`,
      action: 'Consider canceling to save money',
      savings: wastedMoney * 12,
      icon: 'exclamation-triangle'
    })
  }

  // High spending insight
  if (totalMonthly > userSettings.monthly_budget) {
    const overspend = totalMonthly - userSettings.monthly_budget
    insights.push({
      type: 'danger',
      title: 'Budget Exceeded',
      message: `You're spending $${overspend.toFixed(2)} over your monthly budget`,
      action: 'Review and optimize your subscriptions',
      impact: 'high',
      icon: 'chart-line'
    })
  }

  // Optimization suggestions
  const expensiveSubs = activeSubs.filter(s => s.cost > 20).sort((a, b) => b.cost - a.cost)
  if (expensiveSubs.length > 0) {
    insights.push({
      type: 'info',
      title: 'Optimization Opportunity',
      message: `Your most expensive subscription is ${expensiveSubs[0].name} at $${expensiveSubs[0].cost}/${expensiveSubs[0].billing_cycle}`,
      action: 'Consider annual billing for potential savings',
      icon: 'lightbulb'
    })
  }

  // Category analysis
  const categories = activeSubs.reduce((acc, sub) => {
    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12
    acc[sub.category] = (acc[sub.category] || 0) + monthlyCost
    return acc
  }, {})

  const topCategory = Object.entries(categories).sort(([,a], [,b]) => (b as number) - (a as number))[0]
  if (topCategory) {
    insights.push({
      type: 'success',
      title: 'Spending Pattern',
      message: `You invest most in ${topCategory[0]} category ($${(topCategory[1] as number).toFixed(2)}/month)`,
      action: 'This represents good digital lifestyle balance',
      icon: 'chart-pie'
    })
  }

  // Renewal alerts
  const today = new Date()
  const upcoming = activeSubs.filter(sub => {
    const nextBilling = new Date()
    nextBilling.setDate(sub.billing_date)
    if (nextBilling < today) {
      nextBilling.setMonth(nextBilling.getMonth() + 1)
    }
    const daysUntil = Math.ceil((nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 7
  })

  if (upcoming.length > 0) {
    insights.push({
      type: 'info',
      title: 'Upcoming Renewals',
      message: `${upcoming.length} subscription${upcoming.length > 1 ? 's' : ''} renewing this week`,
      action: 'Review before automatic renewal',
      subscriptions: upcoming.map(s => s.name),
      icon: 'calendar-alt'
    })
  }

  return insights
}

// Budget analysis
function analyzeBudget(subs: any[]) {
  const activeSubs = subs.filter(s => s.is_active)
  const totalMonthly = activeSubs.reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.cost : s.cost / 12), 0)
  
  const categorySpending = activeSubs.reduce((acc, sub) => {
    const monthlyCost = sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12
    acc[sub.category] = (acc[sub.category] || 0) + monthlyCost
    return acc
  }, {})

  const budgetStatus = {
    total_budget: userSettings.monthly_budget,
    total_spending: Math.round(totalMonthly * 100) / 100,
    remaining: Math.round((userSettings.monthly_budget - totalMonthly) * 100) / 100,
    percentage_used: Math.round((totalMonthly / userSettings.monthly_budget) * 100),
    status: totalMonthly > userSettings.monthly_budget ? 'over' : 
            totalMonthly > userSettings.monthly_budget * 0.8 ? 'warning' : 'good',
    categories: Object.entries(categoryBudgets).map(([category, budget]) => ({
      category,
      budget,
      spending: Math.round((categorySpending[category] || 0) * 100) / 100,
      percentage: Math.round(((categorySpending[category] || 0) / budget) * 100),
      status: (categorySpending[category] || 0) > budget ? 'over' : 
              (categorySpending[category] || 0) > budget * 0.8 ? 'warning' : 'good'
    }))
  }

  return budgetStatus
}

// Enhanced database helpers (keeping existing functionality)
async function getAllSubscriptions(db?: D1Database) {
  if (!db) {
    return subscriptions
  }
  
  try {
    const { results } = await db.prepare('SELECT * FROM subscriptions ORDER BY created_at DESC').all()
    return results || []
  } catch (error) {
    console.error('Database error:', error)
    return subscriptions
  }
}

async function getSubscriptionById(id: number, db?: D1Database) {
  if (!db) {
    return subscriptions.find(s => s.id === id)
  }
  
  try {
    const result = await db.prepare('SELECT * FROM subscriptions WHERE id = ?').bind(id).first()
    return result
  } catch (error) {
    console.error('Database error:', error)
    return subscriptions.find(s => s.id === id)
  }
}

async function createSubscription(data: any, db?: D1Database) {
  if (!db) {
    const subscription = {
      id: nextId++,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    subscriptions.push(subscription)
    return subscription
  }
  
  try {
    const result = await db.prepare(`
      INSERT INTO subscriptions (name, description, cost, billing_cycle, billing_date, category, website_url, is_active, currency, usage_frequency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.description || '',
      data.cost,
      data.billing_cycle || 'monthly',
      data.billing_date,
      data.category || 'Other',
      data.website_url || '',
      data.is_active !== false ? 1 : 0,
      data.currency || 'USD',
      data.usage_frequency || 'weekly'
    ).run()
    
    return {
      id: result.meta.last_row_id,
      ...data,
      is_active: data.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  } catch (error) {
    console.error('Database error:', error)
    const subscription = {
      id: nextId++,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    subscriptions.push(subscription)
    return subscription
  }
}

async function updateSubscription(id: number, data: any, db?: D1Database) {
  if (!db) {
    const index = subscriptions.findIndex(s => s.id === id)
    if (index === -1) return null
    
    subscriptions[index] = {
      ...subscriptions[index],
      ...data,
      id,
      updated_at: new Date().toISOString()
    }
    return subscriptions[index]
  }
  
  try {
    await db.prepare(`
      UPDATE subscriptions 
      SET name = ?, description = ?, cost = ?, billing_cycle = ?, 
          billing_date = ?, category = ?, website_url = ?, is_active = ?, 
          currency = ?, usage_frequency = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.name,
      data.description || '',
      data.cost,
      data.billing_cycle || 'monthly',
      data.billing_date,
      data.category || 'Other',
      data.website_url || '',
      data.is_active !== false ? 1 : 0,
      data.currency || 'USD',
      data.usage_frequency || 'weekly',
      id
    ).run()
    
    return await getSubscriptionById(id, db)
  } catch (error) {
    console.error('Database error:', error)
    const index = subscriptions.findIndex(s => s.id === id)
    if (index === -1) return null
    
    subscriptions[index] = {
      ...subscriptions[index],
      ...data,
      id,
      updated_at: new Date().toISOString()
    }
    return subscriptions[index]
  }
}

async function deleteSubscription(id: number, db?: D1Database) {
  if (!db) {
    const index = subscriptions.findIndex(s => s.id === id)
    if (index === -1) return false
    subscriptions.splice(index, 1)
    return true
  }
  
  try {
    await db.prepare('DELETE FROM subscriptions WHERE id = ?').bind(id).run()
    return true
  } catch (error) {
    console.error('Database error:', error)
    const index = subscriptions.findIndex(s => s.id === id)
    if (index === -1) return false
    subscriptions.splice(index, 1)
    return true
  }
}

// API Routes for subscription management
app.get('/api/subscriptions', async (c) => {
  const { env } = c
  const results = await getAllSubscriptions(env?.DB)
  return c.json({ subscriptions: results })
})

app.get('/api/subscriptions/:id', async (c) => {
  const { env } = c
  const id = parseInt(c.req.param('id'))
  const subscription = await getSubscriptionById(id, env?.DB)
  
  if (!subscription) {
    return c.json({ error: 'Subscription not found' }, 404)
  }
  
  return c.json({ subscription })
})

app.post('/api/subscriptions', async (c) => {
  const { env } = c
  const body = await c.req.json()
  
  const data = {
    name: body.name,
    description: body.description || '',
    cost: parseFloat(body.cost),
    billing_cycle: body.billing_cycle || 'monthly',
    billing_date: parseInt(body.billing_date),
    category: body.category || 'Other',
    website_url: body.website_url || '',
    is_active: body.is_active !== false,
    currency: body.currency || 'USD',
    usage_frequency: body.usage_frequency || 'weekly'
  }
  
  const subscription = await createSubscription(data, env?.DB)
  return c.json({ subscription }, 201)
})

app.put('/api/subscriptions/:id', async (c) => {
  const { env } = c
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()
  
  const data = {
    name: body.name,
    description: body.description || '',
    cost: parseFloat(body.cost),
    billing_cycle: body.billing_cycle || 'monthly',
    billing_date: parseInt(body.billing_date),
    category: body.category || 'Other',
    website_url: body.website_url || '',
    is_active: body.is_active !== false,
    currency: body.currency || 'USD',
    usage_frequency: body.usage_frequency || 'weekly'
  }
  
  const subscription = await updateSubscription(id, data, env?.DB)
  
  if (!subscription) {
    return c.json({ error: 'Subscription not found' }, 404)
  }
  
  return c.json({ subscription })
})

app.delete('/api/subscriptions/:id', async (c) => {
  const { env } = c
  const id = parseInt(c.req.param('id'))
  
  const success = await deleteSubscription(id, env?.DB)
  
  if (!success) {
    return c.json({ error: 'Subscription not found' }, 404)
  }
  
  return c.json({ message: 'Subscription deleted successfully' })
})

// Enhanced summary with insights
app.get('/api/summary', async (c) => {
  const { env } = c
  const allSubscriptions = await getAllSubscriptions(env?.DB)
  const activeSubscriptions = allSubscriptions.filter((s: any) => s.is_active)
  
  const totalMonthly = activeSubscriptions
    .filter((s: any) => s.billing_cycle === 'monthly')
    .reduce((sum: number, s: any) => sum + s.cost, 0)
  
  const totalYearly = activeSubscriptions
    .filter((s: any) => s.billing_cycle === 'yearly')
    .reduce((sum: number, s: any) => sum + (s.cost / 12), 0)
  
  const totalMonthlyCost = totalMonthly + totalYearly
  
  const categories = activeSubscriptions.reduce((acc: Record<string, number>, sub: any) => {
    acc[sub.category] = (acc[sub.category] || 0) + 
      (sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12)
    return acc
  }, {} as Record<string, number>)
  
  return c.json({
    total_monthly_cost: Math.round(totalMonthlyCost * 100) / 100,
    yearly_projection: Math.round(totalMonthlyCost * 12 * 100) / 100,
    active_subscriptions: activeSubscriptions.length,
    total_subscriptions: allSubscriptions.length,
    inactive_subscriptions: allSubscriptions.length - activeSubscriptions.length,
    categories,
    insights: generateSmartInsights(allSubscriptions),
    budget: analyzeBudget(allSubscriptions)
  })
})

// Smart insights endpoint
app.get('/api/insights', async (c) => {
  const { env } = c
  const allSubscriptions = await getAllSubscriptions(env?.DB)
  const insights = generateSmartInsights(allSubscriptions)
  return c.json({ insights })
})

// Budget management endpoints
app.get('/api/budget', async (c) => {
  const { env } = c
  const allSubscriptions = await getAllSubscriptions(env?.DB)
  const budgetAnalysis = analyzeBudget(allSubscriptions)
  return c.json({ budget: budgetAnalysis, settings: userSettings, category_budgets: categoryBudgets })
})

app.put('/api/budget', async (c) => {
  const body = await c.req.json()
  
  if (body.monthly_budget) userSettings.monthly_budget = body.monthly_budget
  if (body.currency) userSettings.currency = body.currency
  if (body.budget_alerts !== undefined) userSettings.budget_alerts = body.budget_alerts
  if (body.renewal_notifications !== undefined) userSettings.renewal_notifications = body.renewal_notifications
  
  if (body.category_budgets) {
    Object.assign(categoryBudgets, body.category_budgets)
  }
  
  return c.json({ settings: userSettings, category_budgets: categoryBudgets })
})

// Data export endpoints
app.get('/api/export/csv', async (c) => {
  const { env } = c
  const allSubscriptions = await getAllSubscriptions(env?.DB)
  
  const csvHeader = 'Name,Description,Cost,Billing Cycle,Billing Date,Category,Website,Status,Currency,Usage,Created Date\n'
  const csvData = allSubscriptions.map((sub: any) => 
    `"${sub.name}","${sub.description}",${sub.cost},"${sub.billing_cycle}",${sub.billing_date},"${sub.category}","${sub.website_url || ''}","${sub.is_active ? 'Active' : 'Inactive'}","${sub.currency || 'USD'}","${sub.usage_frequency || 'weekly'}","${sub.created_at}"`
  ).join('\n')
  
  return c.text(csvHeader + csvData, 200, {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="subscriptions.csv"'
  })
})

app.get('/api/export/json', async (c) => {
  const { env } = c
  const allSubscriptions = await getAllSubscriptions(env?.DB)
  const insights = generateSmartInsights(allSubscriptions)
  const budget = analyzeBudget(allSubscriptions)
  
  const exportData = {
    export_date: new Date().toISOString(),
    subscriptions: allSubscriptions,
    insights,
    budget,
    settings: userSettings,
    category_budgets: categoryBudgets
  }
  
  return c.json(exportData, 200, {
    'Content-Disposition': 'attachment; filename="subscription-tracker-export.json"'
  })
})

// Subscription templates endpoint
app.get('/api/templates', (c) => {
  const templates = {
    streaming: [
      { name: 'Netflix', cost: 15.99, category: 'Streaming', website_url: 'https://netflix.com' },
      { name: 'Disney+', cost: 7.99, category: 'Streaming', website_url: 'https://disneyplus.com' },
      { name: 'HBO Max', cost: 14.99, category: 'Streaming', website_url: 'https://hbomax.com' },
      { name: 'Amazon Prime Video', cost: 8.99, category: 'Streaming', website_url: 'https://primevideo.com' }
    ],
    productivity: [
      { name: 'Microsoft 365', cost: 6.99, category: 'Productivity', website_url: 'https://microsoft.com/microsoft-365' },
      { name: 'Adobe Creative Cloud', cost: 52.99, category: 'Software', website_url: 'https://adobe.com' },
      { name: 'Notion Pro', cost: 8.00, category: 'Productivity', website_url: 'https://notion.so' },
      { name: 'Slack Pro', cost: 7.25, category: 'Productivity', website_url: 'https://slack.com' }
    ],
    music: [
      { name: 'Spotify Premium', cost: 9.99, category: 'Music', website_url: 'https://spotify.com' },
      { name: 'Apple Music', cost: 9.99, category: 'Music', website_url: 'https://music.apple.com' },
      { name: 'YouTube Music', cost: 9.99, category: 'Music', website_url: 'https://music.youtube.com' }
    ],
    gaming: [
      { name: 'Xbox Game Pass', cost: 14.99, category: 'Gaming', website_url: 'https://xbox.com/game-pass' },
      { name: 'PlayStation Plus', cost: 9.99, category: 'Gaming', website_url: 'https://playstation.com' },
      { name: 'Nintendo Switch Online', cost: 3.99, category: 'Gaming', website_url: 'https://nintendo.com' }
    ]
  }
  
  return c.json({ templates })
})

// Categories endpoint (enhanced)
app.get('/api/categories', (c) => {
  const categories = [
    'Streaming', 'Software', 'Fitness', 'News & Media', 
    'Cloud Storage', 'Music', 'Gaming', 'Productivity', 'Other'
  ]
  return c.json({ categories })
})

// Currencies endpoint
app.get('/api/currencies', (c) => {
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
  ]
  return c.json({ currencies })
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Tracker - Premium Management</title>
        <meta name="description" content="Premium AI-powered subscription management with smart insights and budget tracking">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#667eea',
                  secondary: '#764ba2'
                },
                fontFamily: {
                  'elegant': ['Inter', 'system-ui', 'sans-serif']
                }
              }
            }
          }
        </script>
    </head>
    <body>
        <div id="app">
            <!-- Premium loading experience -->
            <div class="min-h-screen flex items-center justify-center">
                <div class="text-center">
                    <div class="loading-spinner mx-auto mb-6"></div>
                    <p class="text-white text-lg font-light">Loading your premium dashboard...</p>
                    <p class="text-white/60 text-sm mt-2">AI insights • Budget tracking • Smart recommendations</p>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app