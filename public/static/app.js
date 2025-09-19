// Elegant Subscription Tracker Frontend Application
class SubscriptionTracker {
    constructor() {
        this.subscriptions = []
        this.categories = []
        this.summary = {}
        this.editingId = null
        this.init()
    }

    async init() {
        await this.loadData()
        this.render()
        this.addAnimationDelays()
    }

    async loadData() {
        try {
            // Load subscriptions, categories, and summary
            const [subsResponse, catsResponse, summaryResponse] = await Promise.all([
                axios.get('/api/subscriptions'),
                axios.get('/api/categories'),
                axios.get('/api/summary')
            ])
            
            this.subscriptions = subsResponse.data.subscriptions
            this.categories = catsResponse.data.categories
            this.summary = summaryResponse.data
        } catch (error) {
            console.error('Error loading data:', error)
            this.showNotification('Error loading data', 'error')
        }
    }

    addAnimationDelays() {
        // Add staggered animation delays to cards
        const dashboardCards = document.querySelectorAll('.dashboard-card')
        dashboardCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`
        })

        const subscriptionCards = document.querySelectorAll('.subscription-card')
        subscriptionCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`
        })
    }

    render() {
        const app = document.getElementById('app')
        app.innerHTML = `
            <div class="min-h-screen">
                <!-- Elegant Header -->
                <header class="elegant-header">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-4xl elegant-title mb-2">
                                    <i class="fas fa-gem mr-4"></i>
                                    Subscription Tracker
                                </h1>
                                <p class="text-white/80 text-lg font-light">Elegantly manage your monthly subscriptions</p>
                            </div>
                            <button onclick="app.showAddForm()" class="btn-elegant">
                                <i class="fas fa-plus mr-2"></i>Add Subscription
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Elegant Dashboard -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    ${this.renderDashboard()}
                    ${this.renderSubscriptionsList()}
                </div>

                <!-- Elegant Modal -->
                <div id="modal" class="elegant-modal hidden">
                    <div class="modal-content">
                        <div id="modal-content"></div>
                    </div>
                </div>

                <!-- Elegant Notifications -->
                <div id="notifications" class="fixed top-6 right-6 z-50 space-y-3"></div>
            </div>
        `
    }

    renderDashboard() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <!-- Total Monthly Cost -->
                <div class="dashboard-card">
                    <div class="dashboard-icon category-streaming">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Monthly Total</h3>
                        <p class="text-3xl font-bold text-white mb-1">$${this.summary.total_monthly_cost || 0}</p>
                        <p class="text-white/60 text-sm">All active subscriptions</p>
                    </div>
                </div>

                <!-- Active Subscriptions -->
                <div class="dashboard-card">
                    <div class="dashboard-icon category-fitness">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Active</h3>
                        <p class="text-3xl font-bold text-white mb-1">${this.summary.active_subscriptions || 0}</p>
                        <p class="text-white/60 text-sm">Currently running</p>
                    </div>
                </div>

                <!-- Total Subscriptions -->
                <div class="dashboard-card">
                    <div class="dashboard-icon category-software">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Total</h3>
                        <p class="text-3xl font-bold text-white mb-1">${this.summary.total_subscriptions || 0}</p>
                        <p class="text-white/60 text-sm">All subscriptions</p>
                    </div>
                </div>

                <!-- Categories Overview -->
                <div class="dashboard-card">
                    <div class="dashboard-icon category-productivity">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Top Categories</h3>
                        <div class="space-y-2">
                            ${Object.entries(this.summary.categories || {})
                                .slice(0, 3)
                                .map(([category, cost]) => `
                                    <div class="flex justify-between text-sm">
                                        <span class="text-white/80">${category}</span>
                                        <span class="font-semibold text-white">$${cost.toFixed(2)}</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    renderSubscriptionsList() {
        if (this.subscriptions.length === 0) {
            return `
                <div class="dashboard-card text-center py-16">
                    <div class="dashboard-icon category-other mx-auto mb-6">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-3">No subscriptions yet</h3>
                    <p class="text-white/70 mb-6 max-w-md mx-auto">Start tracking your monthly expenses by adding your first subscription service.</p>
                    <button onclick="app.showAddForm()" class="btn-elegant">
                        <i class="fas fa-plus mr-2"></i>Add Your First Subscription
                    </button>
                </div>
            `
        }

        return `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-white">Your Subscriptions</h2>
                    <div class="text-white/70 text-sm">
                        ${this.subscriptions.length} subscription${this.subscriptions.length !== 1 ? 's' : ''}
                    </div>
                </div>
                <div class="space-y-4">
                    ${this.subscriptions.map(sub => this.renderSubscriptionItem(sub)).join('')}
                </div>
            </div>
        `
    }

    renderSubscriptionItem(subscription) {
        const nextBilling = new Date()
        nextBilling.setDate(subscription.billing_date)
        if (nextBilling < new Date()) {
            nextBilling.setMonth(nextBilling.getMonth() + 1)
        }

        const categoryClass = this.getCategoryClass(subscription.category)

        return `
            <div class="subscription-card">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-6">
                        <div class="subscription-avatar ${categoryClass}">
                            <i class="fas fa-${this.getCategoryIcon(subscription.category)}"></i>
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <h3 class="text-lg font-bold text-white">${subscription.name}</h3>
                                <span class="status-badge ${subscription.is_active ? 'status-active' : 'status-inactive'}">
                                    ${subscription.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span class="category-badge">${subscription.category}</span>
                            </div>
                            <p class="text-white/70 mb-2">${subscription.description}</p>
                            <div class="flex items-center space-x-4 text-sm text-white/60">
                                <span><i class="fas fa-calendar-alt mr-1"></i> Next: ${nextBilling.toLocaleDateString()}</span>
                                <span><i class="fas fa-sync-alt mr-1"></i> ${subscription.billing_cycle}</span>
                                ${subscription.website_url ? `
                                    <a href="${subscription.website_url}" target="_blank" 
                                       class="text-white/80 hover:text-white transition-colors">
                                        <i class="fas fa-external-link-alt mr-1"></i> Visit
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-white mb-1">$${subscription.cost}</div>
                        <div class="text-white/60 text-sm mb-4">${subscription.billing_cycle}</div>
                        <div class="flex space-x-2">
                            <button onclick="app.editSubscription(${subscription.id})" 
                                    class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="app.deleteSubscription(${subscription.id})" 
                                    class="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-white hover:text-red-300 transition-all hover:scale-110">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    getCategoryIcon(category) {
        const icons = {
            'Streaming': 'play-circle',
            'Software': 'laptop-code',
            'Fitness': 'dumbbell',
            'News & Media': 'newspaper',
            'Cloud Storage': 'cloud',
            'Music': 'music',
            'Gaming': 'gamepad',
            'Productivity': 'tasks',
            'Other': 'star'
        }
        return icons[category] || 'star'
    }

    getCategoryClass(category) {
        const classes = {
            'Streaming': 'category-streaming',
            'Software': 'category-software', 
            'Fitness': 'category-fitness',
            'News & Media': 'category-news',
            'Cloud Storage': 'category-cloud',
            'Music': 'category-music',
            'Gaming': 'category-gaming',
            'Productivity': 'category-productivity',
            'Other': 'category-other'
        }
        return classes[category] || 'category-other'
    }

    showAddForm() {
        this.editingId = null
        this.showForm()
    }

    editSubscription(id) {
        this.editingId = id
        this.showForm()
    }

    showForm() {
        const subscription = this.editingId ? this.subscriptions.find(s => s.id === this.editingId) : null
        const modal = document.getElementById('modal')
        const content = document.getElementById('modal-content')

        content.innerHTML = `
            <form onsubmit="app.handleSubmit(event)" class="elegant-form">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-bold text-white">
                        <i class="fas fa-${subscription ? 'edit' : 'plus'} mr-3"></i>
                        ${subscription ? 'Edit' : 'Add'} Subscription
                    </h2>
                    <button type="button" onclick="app.hideModal()" 
                            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-6">
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-tag mr-2"></i>Service Name
                        </label>
                        <input type="text" name="name" value="${subscription?.name || ''}" required
                               class="form-input" placeholder="Netflix, Spotify, etc.">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-info-circle mr-2"></i>Description
                        </label>
                        <input type="text" name="description" value="${subscription?.description || ''}"
                               class="form-input" placeholder="Brief description of the service">
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-dollar-sign mr-2"></i>Cost
                            </label>
                            <input type="number" name="cost" value="${subscription?.cost || ''}" step="0.01" required
                                   class="form-input" placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-calendar-day mr-2"></i>Billing Date
                            </label>
                            <input type="number" name="billing_date" value="${subscription?.billing_date || ''}" 
                                   min="1" max="31" required class="form-input" placeholder="1-31">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-sync-alt mr-2"></i>Billing Cycle
                            </label>
                            <select name="billing_cycle" class="form-input">
                                <option value="monthly" ${subscription?.billing_cycle === 'monthly' ? 'selected' : ''}>Monthly</option>
                                <option value="yearly" ${subscription?.billing_cycle === 'yearly' ? 'selected' : ''}>Yearly</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-folder mr-2"></i>Category
                            </label>
                            <select name="category" class="form-input">
                                ${this.categories.map(cat => `
                                    <option value="${cat}" ${subscription?.category === cat ? 'selected' : ''}>${cat}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <i class="fas fa-link mr-2"></i>Website URL
                        </label>
                        <input type="url" name="website_url" value="${subscription?.website_url || ''}"
                               class="form-input" placeholder="https://example.com">
                    </div>
                    
                    <div class="flex items-center space-x-3">
                        <input type="checkbox" name="is_active" ${subscription?.is_active !== false ? 'checked' : ''}
                               class="w-5 h-5 rounded border-2 border-white/30 bg-white/10 text-white focus:ring-2 focus:ring-white/50">
                        <label class="text-white font-medium">
                            <i class="fas fa-power-off mr-2"></i>Active Subscription
                        </label>
                    </div>
                </div>
                
                <div class="mt-8 flex justify-end space-x-4">
                    <button type="button" onclick="app.hideModal()" 
                            class="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                        Cancel
                    </button>
                    <button type="submit" class="btn-elegant">
                        <i class="fas fa-${subscription ? 'save' : 'plus'} mr-2"></i>
                        ${subscription ? 'Update' : 'Add'} Subscription
                    </button>
                </div>
            </form>
        `

        modal.classList.remove('hidden')
    }

    hideModal() {
        document.getElementById('modal').classList.add('hidden')
    }

    async handleSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.target)
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            cost: parseFloat(formData.get('cost')),
            billing_cycle: formData.get('billing_cycle'),
            billing_date: parseInt(formData.get('billing_date')),
            category: formData.get('category'),
            website_url: formData.get('website_url'),
            is_active: formData.has('is_active')
        }

        try {
            if (this.editingId) {
                await axios.put(`/api/subscriptions/${this.editingId}`, data)
                this.showNotification('Subscription updated successfully! ✨', 'success')
            } else {
                await axios.post('/api/subscriptions', data)
                this.showNotification('Subscription added successfully! 🎉', 'success')
            }

            this.hideModal()
            await this.loadData()
            this.render()
            this.addAnimationDelays()
        } catch (error) {
            console.error('Error saving subscription:', error)
            this.showNotification('Error saving subscription 😞', 'error')
        }
    }

    async deleteSubscription(id) {
        if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) return

        try {
            await axios.delete(`/api/subscriptions/${id}`)
            this.showNotification('Subscription deleted successfully! 🗑️', 'success')
            await this.loadData()
            this.render()
            this.addAnimationDelays()
        } catch (error) {
            console.error('Error deleting subscription:', error)
            this.showNotification('Error deleting subscription 😞', 'error')
        }
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications')
        const notification = document.createElement('div')
        
        notification.className = `notification notification-${type} transform translate-x-full`
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="flex items-center">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-3"></i>
                    ${message}
                </span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 p-1">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `

        notifications.appendChild(notification)
        
        // Animate in
        setTimeout(() => notification.classList.remove('translate-x-full'), 100)
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full')
            setTimeout(() => notification.remove(), 300)
        }, 4000)
    }
}

// Initialize the elegant application
const app = new SubscriptionTracker()