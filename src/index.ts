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

// In-memory storage for development fallback
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let nextId = 3

// Database helper functions
async function getAllSubscriptions(db?: D1Database) {
  if (!db) {
    return subscriptions
  }
  
  try {
    const { results } = await db.prepare('SELECT * FROM subscriptions ORDER BY created_at DESC').all()
    return results || []
  } catch (error) {
    console.error('Database error:', error)
    return subscriptions // Fallback to in-memory
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
      INSERT INTO subscriptions (name, description, cost, billing_cycle, billing_date, category, website_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.description || '',
      data.cost,
      data.billing_cycle || 'monthly',
      data.billing_date,
      data.category || 'Other',
      data.website_url || '',
      data.is_active !== false ? 1 : 0
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
    // Fallback to in-memory
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
          billing_date = ?, category = ?, website_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
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
      id
    ).run()
    
    return await getSubscriptionById(id, db)
  } catch (error) {
    console.error('Database error:', error)
    // Fallback to in-memory
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
    // Fallback to in-memory
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
    is_active: body.is_active !== false
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
    is_active: body.is_active !== false
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

// Get monthly summary
app.get('/api/summary', async (c) => {
  const { env } = c
  const allSubscriptions = await getAllSubscriptions(env?.DB)
  const activeSubscriptions = allSubscriptions.filter((s: any) => s.is_active)
  
  const totalMonthly = activeSubscriptions
    .filter((s: any) => s.billing_cycle === 'monthly')
    .reduce((sum: number, s: any) => sum + s.cost, 0)
  
  const totalYearly = activeSubscriptions
    .filter((s: any) => s.billing_cycle === 'yearly')
    .reduce((sum: number, s: any) => sum + (s.cost / 12), 0) // Convert to monthly equivalent
  
  const totalMonthlyCost = totalMonthly + totalYearly
  
  const categories = activeSubscriptions.reduce((acc: Record<string, number>, sub: any) => {
    acc[sub.category] = (acc[sub.category] || 0) + 
      (sub.billing_cycle === 'monthly' ? sub.cost : sub.cost / 12)
    return acc
  }, {} as Record<string, number>)
  
  return c.json({
    total_monthly_cost: Math.round(totalMonthlyCost * 100) / 100,
    active_subscriptions: activeSubscriptions.length,
    total_subscriptions: allSubscriptions.length,
    categories
  })
})

// Categories endpoint
app.get('/api/categories', (c) => {
  const categories = [
    'Streaming', 'Software', 'Fitness', 'News & Media', 
    'Cloud Storage', 'Music', 'Gaming', 'Productivity', 'Other'
  ]
  return c.json({ categories })
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Tracker</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/style.css" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#3B82F6',
                  secondary: '#1E40AF'
                }
              }
            }
          }
        </script>
    </head>
    <body class="bg-gray-50">
        <div id="app">
            <!-- Loading spinner -->
            <div class="min-h-screen flex items-center justify-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app