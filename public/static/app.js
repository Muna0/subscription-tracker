// Subscription Tracker Frontend Application
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

    render() {
        const app = document.getElementById('app')
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Header -->
                <header class="bg-white shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900">
                                    <i class="fas fa-credit-card mr-3 text-primary"></i>
                                    Subscription Tracker
                                </h1>
                                <p class="text-gray-600 mt-1">Manage your monthly subscriptions</p>
                            </div>
                            <button onclick="app.showAddForm()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                                <i class="fas fa-plus mr-2"></i>Add Subscription
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Dashboard -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    ${this.renderDashboard()}
                    ${this.renderSubscriptionsList()}
                </div>

                <!-- Modal -->
                <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                    <div class="min-h-screen flex items-center justify-center p-4">
                        <div class="bg-white rounded-lg max-w-md w-full">
                            <div id="modal-content"></div>
                        </div>
                    </div>
                </div>

                <!-- Notifications -->
                <div id="notifications" class="fixed top-4 right-4 z-50"></div>
            </div>
        `
    }

    renderDashboard() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Monthly Cost -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-lg bg-primary/10">
                            <i class="fas fa-dollar-sign text-primary text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Monthly Total</h3>
                            <p class="text-2xl font-bold text-gray-900">$${this.summary.total_monthly_cost || 0}</p>
                        </div>
                    </div>
                </div>

                <!-- Active Subscriptions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-lg bg-green-100">
                            <i class="fas fa-check-circle text-green-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Active</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.summary.active_subscriptions || 0}</p>
                        </div>
                    </div>
                </div>

                <!-- Total Subscriptions -->
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center">
                        <div class="p-3 rounded-lg bg-blue-100">
                            <i class="fas fa-list text-blue-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Total</h3>
                            <p class="text-2xl font-bold text-gray-900">${this.summary.total_subscriptions || 0}</p>
                        </div>
                    </div>
                </div>

                <!-- Categories Overview -->
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-sm font-medium text-gray-500 mb-3">Categories</h3>
                    <div class="space-y-2">
                        ${Object.entries(this.summary.categories || {})
                            .slice(0, 3)
                            .map(([category, cost]) => `
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-600">${category}</span>
                                    <span class="font-medium">$${cost.toFixed(2)}</span>
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>
        `
    }

    renderSubscriptionsList() {
        if (this.subscriptions.length === 0) {
            return `
                <div class="bg-white rounded-lg shadow p-8 text-center">
                    <i class="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
                    <p class="text-gray-600 mb-4">Add your first subscription to get started tracking your monthly expenses.</p>
                    <button onclick="app.showAddForm()" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                        <i class="fas fa-plus mr-2"></i>Add Subscription
                    </button>
                </div>
            `
        }

        return `
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b">
                    <h2 class="text-xl font-semibold text-gray-900">Your Subscriptions</h2>
                </div>
                <div class="divide-y">
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

        return `
            <div class="p-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <i class="fas fa-${this.getCategoryIcon(subscription.category)} text-primary"></i>
                        </div>
                        <div>
                            <div class="flex items-center space-x-2">
                                <h3 class="font-medium text-gray-900">${subscription.name}</h3>
                                <span class="px-2 py-1 text-xs rounded-full ${subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                                    ${subscription.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">${subscription.category}</span>
                            </div>
                            <p class="text-sm text-gray-600">${subscription.description}</p>
                            <p class="text-xs text-gray-500">
                                Next billing: ${nextBilling.toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-lg font-semibold text-gray-900">$${subscription.cost}</div>
                        <div class="text-sm text-gray-500">${subscription.billing_cycle}</div>
                        <div class="mt-2 space-x-2">
                            <button onclick="app.editSubscription(${subscription.id})" class="text-blue-600 hover:text-blue-700">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="app.deleteSubscription(${subscription.id})" class="text-red-600 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                            ${subscription.website_url ? `
                                <a href="${subscription.website_url}" target="_blank" class="text-gray-600 hover:text-gray-700">
                                    <i class="fas fa-external-link-alt"></i>
                                </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    getCategoryIcon(category) {
        const icons = {
            'Streaming': 'play',
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
            <form onsubmit="app.handleSubmit(event)" class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold">${subscription ? 'Edit' : 'Add'} Subscription</h2>
                    <button type="button" onclick="app.hideModal()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input type="text" name="name" value="${subscription?.name || ''}" required
                               class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input type="text" name="description" value="${subscription?.description || ''}"
                               class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cost *</label>
                            <input type="number" name="cost" value="${subscription?.cost || ''}" step="0.01" required
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Billing Date</label>
                            <input type="number" name="billing_date" value="${subscription?.billing_date || ''}" min="1" max="31" required
                                   class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                            <select name="billing_cycle" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option value="monthly" ${subscription?.billing_cycle === 'monthly' ? 'selected' : ''}>Monthly</option>
                                <option value="yearly" ${subscription?.billing_cycle === 'yearly' ? 'selected' : ''}>Yearly</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="category" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                                ${this.categories.map(cat => `
                                    <option value="${cat}" ${subscription?.category === cat ? 'selected' : ''}>${cat}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                        <input type="url" name="website_url" value="${subscription?.website_url || ''}"
                               class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" name="is_active" ${subscription?.is_active !== false ? 'checked' : ''}
                               class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                        <label class="ml-2 block text-sm text-gray-900">Active subscription</label>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-end space-x-3">
                    <button type="button" onclick="app.hideModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">
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
                this.showNotification('Subscription updated successfully!', 'success')
            } else {
                await axios.post('/api/subscriptions', data)
                this.showNotification('Subscription added successfully!', 'success')
            }

            this.hideModal()
            await this.loadData()
            this.render()
        } catch (error) {
            console.error('Error saving subscription:', error)
            this.showNotification('Error saving subscription', 'error')
        }
    }

    async deleteSubscription(id) {
        if (!confirm('Are you sure you want to delete this subscription?')) return

        try {
            await axios.delete(`/api/subscriptions/${id}`)
            this.showNotification('Subscription deleted successfully!', 'success')
            await this.loadData()
            this.render()
        } catch (error) {
            console.error('Error deleting subscription:', error)
            this.showNotification('Error deleting subscription', 'error')
        }
    }

    showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications')
        const notification = document.createElement('div')
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        }

        notification.className = `${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg mb-2 transition-all transform translate-x-full`
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `

        notifications.appendChild(notification)
        
        // Animate in
        setTimeout(() => notification.classList.remove('translate-x-full'), 100)
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full')
            setTimeout(() => notification.remove(), 300)
        }, 3000)
    }
}

// Initialize the application
const app = new SubscriptionTracker()