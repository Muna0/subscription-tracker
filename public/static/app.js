// Premium Subscription Tracker with AI Insights
class PremiumSubscriptionTracker {
    constructor() {
        this.subscriptions = []
        this.categories = []
        this.summary = {}
        this.insights = []
        this.budget = {}
        this.templates = {}
        this.currencies = []
        this.editingId = null
        this.currentView = 'dashboard'
        this.userSettings = {
            currency: 'USD',
            theme: 'elegant'
        }
        this.init()
    }

    async init() {
        await this.loadAllData()
        this.render()
        this.addAnimationDelays()
        this.startPeriodicUpdates()
    }

    async loadAllData() {
        try {
            const [subsResponse, catsResponse, summaryResponse, templatesResponse, currenciesResponse] = await Promise.all([
                axios.get('/api/subscriptions'),
                axios.get('/api/categories'),
                axios.get('/api/summary'),
                axios.get('/api/templates'),
                axios.get('/api/currencies')
            ])
            
            this.subscriptions = subsResponse.data.subscriptions
            this.categories = catsResponse.data.categories
            this.summary = summaryResponse.data
            this.insights = summaryResponse.data.insights || []
            this.budget = summaryResponse.data.budget || {}
            this.templates = templatesResponse.data.templates
            this.currencies = currenciesResponse.data.currencies
        } catch (error) {
            console.error('Error loading data:', error)
            this.showNotification('Error loading data', 'error')
        }
    }

    startPeriodicUpdates() {
        // Refresh insights every 30 seconds
        setInterval(async () => {
            try {
                const response = await axios.get('/api/summary')
                this.insights = response.data.insights || []
                this.budget = response.data.budget || {}
                this.updateInsightsDisplay()
            } catch (error) {
                console.log('Background update failed:', error)
            }
        }, 30000)
    }

    addAnimationDelays() {
        const cards = document.querySelectorAll('.dashboard-card, .subscription-card, .insight-card')
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`
        })
    }

    render() {
        const app = document.getElementById('app')
        app.innerHTML = `
            <div class="min-h-screen">
                ${this.renderHeader()}
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    ${this.renderNavigation()}
                    ${this.renderCurrentView()}
                </div>
                ${this.renderModal()}
                ${this.renderNotifications()}
            </div>
        `
    }

    renderHeader() {
        return `
            <header class="elegant-header">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-4xl elegant-title mb-2">
                                <i class="fas fa-brain mr-4"></i>
                                Smart Subscription Manager
                            </h1>
                            <p class="text-white/80 text-lg font-light">AI-powered insights • Budget tracking • Premium analytics</p>
                        </div>
                        <div class="flex space-x-4">
                            <button onclick="app.showExportMenu()" class="btn-elegant bg-white/10 hover:bg-white/20">
                                <i class="fas fa-download mr-2"></i>Export
                            </button>
                            <button onclick="app.showAddForm()" class="btn-elegant">
                                <i class="fas fa-plus mr-2"></i>Add Subscription
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `
    }

    renderNavigation() {
        const navItems = [
            { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
            { id: 'insights', icon: 'lightbulb', label: 'AI Insights' },
            { id: 'budget', icon: 'chart-line', label: 'Budget' },
            { id: 'subscriptions', icon: 'list', label: 'Subscriptions' },
            { id: 'settings', icon: 'cog', label: 'Settings' }
        ]

        return `
            <nav class="mb-8">
                <div class="flex space-x-2 bg-white/10 backdrop-blur-20 rounded-2xl p-2">
                    ${navItems.map(item => `
                        <button onclick="app.switchView('${item.id}')" 
                                class="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all ${
                                    this.currentView === item.id ? 
                                    'bg-white/20 text-white shadow-lg' : 
                                    'text-white/70 hover:bg-white/10 hover:text-white'
                                }">
                            <i class="fas fa-${item.icon}"></i>
                            <span class="hidden sm:inline font-medium">${item.label}</span>
                        </button>
                    `).join('')}
                </div>
            </nav>
        `
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'dashboard': return this.renderDashboard()
            case 'insights': return this.renderInsights()
            case 'budget': return this.renderBudget()
            case 'subscriptions': return this.renderSubscriptionsList()
            case 'settings': return this.renderSettings()
            default: return this.renderDashboard()
        }
    }

    switchView(view) {
        this.currentView = view
        this.render()
        this.addAnimationDelays()
    }

    renderDashboard() {
        return `
            <div class="space-y-8">
                <!-- Quick Stats -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="dashboard-card">
                        <div class="dashboard-icon category-streaming">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Monthly Total</h3>
                            <p class="text-3xl font-bold text-white mb-1">$${this.summary.total_monthly_cost || 0}</p>
                            <p class="text-white/60 text-sm">Yearly: $${this.summary.yearly_projection || 0}</p>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <div class="dashboard-icon category-fitness">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Active</h3>
                            <p class="text-3xl font-bold text-white mb-1">${this.summary.active_subscriptions || 0}</p>
                            <p class="text-white/60 text-sm">${this.summary.inactive_subscriptions || 0} inactive</p>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <div class="dashboard-icon ${this.budget.status === 'over' ? 'category-streaming' : 'category-software'}">
                            <i class="fas fa-${this.budget.status === 'over' ? 'exclamation-triangle' : 'chart-pie'}"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Budget Status</h3>
                            <p class="text-3xl font-bold text-white mb-1">${this.budget.percentage_used || 0}%</p>
                            <p class="text-white/60 text-sm">${this.budget.status === 'over' ? 'Over budget' : 'Within budget'}</p>
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <div class="dashboard-icon category-productivity">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">AI Insights</h3>
                            <p class="text-3xl font-bold text-white mb-1">${this.insights.length}</p>
                            <p class="text-white/60 text-sm">Smart recommendations</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Insights Preview -->
                ${this.insights.length > 0 ? `
                    <div class="dashboard-card">
                        <h3 class="text-xl font-bold text-white mb-6 flex items-center">
                            <i class="fas fa-brain mr-3"></i>
                            Latest AI Insights
                        </h3>
                        <div class="space-y-4">
                            ${this.insights.slice(0, 2).map(insight => `
                                <div class="insight-card bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div class="flex items-start space-x-4">
                                        <div class="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                            <i class="fas fa-${insight.icon} text-white text-sm"></i>
                                        </div>
                                        <div class="flex-1">
                                            <h4 class="font-semibold text-white mb-1">${insight.title}</h4>
                                            <p class="text-white/70 text-sm mb-2">${insight.message}</p>
                                            <p class="text-white/60 text-xs">${insight.action}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="app.switchView('insights')" class="mt-4 text-white/80 hover:text-white transition-colors text-sm">
                            View all insights <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                ` : ''}

                <!-- Quick Actions -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button onclick="app.showTemplatesModal()" class="dashboard-card text-left hover:scale-105 transition-transform">
                        <div class="dashboard-icon category-music mb-4">
                            <i class="fas fa-magic"></i>
                        </div>
                        <h3 class="font-bold text-white mb-2">Quick Add Templates</h3>
                        <p class="text-white/70 text-sm">Popular subscriptions with pre-filled data</p>
                    </button>

                    <button onclick="app.switchView('budget')" class="dashboard-card text-left hover:scale-105 transition-transform">
                        <div class="dashboard-icon category-productivity mb-4">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <h3 class="font-bold text-white mb-2">Manage Budgets</h3>
                        <p class="text-white/70 text-sm">Set limits and track spending goals</p>
                    </button>

                    <button onclick="app.showExportMenu()" class="dashboard-card text-left hover:scale-105 transition-transform">
                        <div class="dashboard-icon category-cloud mb-4">
                            <i class="fas fa-share-alt"></i>
                        </div>
                        <h3 class="font-bold text-white mb-2">Export & Share</h3>
                        <p class="text-white/70 text-sm">Download reports or share data</p>
                    </button>
                </div>
            </div>
        `
    }

    renderInsights() {
        return `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-brain mr-3"></i>
                        AI-Powered Insights
                    </h2>
                    <div class="text-white/70 text-sm">
                        Last updated: ${new Date().toLocaleTimeString()}
                    </div>
                </div>

                ${this.insights.length === 0 ? `
                    <div class="dashboard-card text-center py-16">
                        <div class="dashboard-icon category-other mx-auto mb-6">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">No insights yet</h3>
                        <p class="text-white/70 mb-6">Add more subscriptions to get personalized recommendations</p>
                    </div>
                ` : `
                    <div class="grid gap-6">
                        ${this.insights.map(insight => `
                            <div class="insight-card dashboard-card">
                                <div class="flex items-start space-x-6">
                                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-r ${this.getInsightGradient(insight.type)} flex items-center justify-center">
                                        <i class="fas fa-${insight.icon} text-white text-xl"></i>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between mb-3">
                                            <h3 class="text-xl font-bold text-white">${insight.title}</h3>
                                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${this.getInsightBadgeClass(insight.type)}">
                                                ${insight.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <p class="text-white/80 mb-3 text-lg">${insight.message}</p>
                                        <p class="text-white/60 mb-4">${insight.action}</p>
                                        
                                        ${insight.savings ? `
                                            <div class="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                                                <div class="flex items-center space-x-2">
                                                    <i class="fas fa-piggy-bank text-green-400"></i>
                                                    <span class="text-green-400 font-semibold">Potential yearly savings: $${insight.savings}</span>
                                                </div>
                                            </div>
                                        ` : ''}
                                        
                                        ${insight.subscriptions ? `
                                            <div class="mt-3">
                                                <p class="text-white/60 text-sm mb-2">Affected subscriptions:</p>
                                                <div class="flex flex-wrap gap-2">
                                                    ${insight.subscriptions.map(sub => `
                                                        <span class="px-2 py-1 bg-white/10 rounded-lg text-white/80 text-sm">${sub}</span>
                                                    `).join('')}
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `
    }

    renderBudget() {
        return `
            <div class="space-y-8">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-white flex items-center">
                        <i class="fas fa-chart-line mr-3"></i>
                        Budget Management
                    </h2>
                    <button onclick="app.showBudgetSettings()" class="btn-elegant bg-white/10 hover:bg-white/20">
                        <i class="fas fa-cog mr-2"></i>Settings
                    </button>
                </div>

                <!-- Overall Budget Status -->
                <div class="dashboard-card">
                    <h3 class="text-xl font-bold text-white mb-6">Monthly Budget Overview</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <p class="text-white/70 text-sm mb-2">Budget</p>
                            <p class="text-2xl font-bold text-white">$${this.budget.total_budget || 0}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-white/70 text-sm mb-2">Spending</p>
                            <p class="text-2xl font-bold text-white">$${this.budget.total_spending || 0}</p>
                        </div>
                        <div class="text-center">
                            <p class="text-white/70 text-sm mb-2">Remaining</p>
                            <p class="text-2xl font-bold ${this.budget.remaining >= 0 ? 'text-green-400' : 'text-red-400'}">
                                $${this.budget.remaining || 0}
                            </p>
                        </div>
                    </div>
                    
                    <div class="mt-6">
                        <div class="flex justify-between text-sm mb-2">
                            <span class="text-white/70">Progress</span>
                            <span class="text-white font-semibold">${this.budget.percentage_used || 0}%</span>
                        </div>
                        <div class="w-full bg-white/20 rounded-full h-3">
                            <div class="h-3 rounded-full transition-all duration-500 ${
                                this.budget.status === 'over' ? 'bg-red-500' :
                                this.budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                            }" style="width: ${Math.min(this.budget.percentage_used || 0, 100)}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Category Budgets -->
                <div class="dashboard-card">
                    <h3 class="text-xl font-bold text-white mb-6">Category Budgets</h3>
                    <div class="grid gap-4">
                        ${(this.budget.categories || []).map(cat => `
                            <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div class="flex justify-between items-center mb-3">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 rounded-lg ${this.getCategoryClass(cat.category)} flex items-center justify-center">
                                            <i class="fas fa-${this.getCategoryIcon(cat.category)} text-white text-sm"></i>
                                        </div>
                                        <span class="font-semibold text-white">${cat.category}</span>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-white font-semibold">$${cat.spending} / $${cat.budget}</p>
                                        <p class="text-white/60 text-sm">${cat.percentage}%</p>
                                    </div>
                                </div>
                                <div class="w-full bg-white/20 rounded-full h-2">
                                    <div class="h-2 rounded-full transition-all duration-500 ${
                                        cat.status === 'over' ? 'bg-red-500' :
                                        cat.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                                    }" style="width: ${Math.min(cat.percentage, 100)}%"></div>
                                </div>
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
                    <div class="flex items-center space-x-4">
                        <div class="text-white/70 text-sm">
                            ${this.subscriptions.length} subscription${this.subscriptions.length !== 1 ? 's' : ''}
                        </div>
                        <button onclick="app.showTemplatesModal()" class="btn-elegant bg-white/10 hover:bg-white/20">
                            <i class="fas fa-magic mr-2"></i>Templates
                        </button>
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

        const daysUntilBilling = Math.ceil((nextBilling.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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
                                ${daysUntilBilling <= 7 && subscription.is_active ? `
                                    <span class="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-lg font-semibold">
                                        <i class="fas fa-clock mr-1"></i>Renews in ${daysUntilBilling} day${daysUntilBilling !== 1 ? 's' : ''}
                                    </span>
                                ` : ''}
                            </div>
                            <p class="text-white/70 mb-2">${subscription.description}</p>
                            <div class="flex items-center space-x-4 text-sm text-white/60">
                                <span><i class="fas fa-calendar-alt mr-1"></i> Next: ${nextBilling.toLocaleDateString()}</span>
                                <span><i class="fas fa-sync-alt mr-1"></i> ${subscription.billing_cycle}</span>
                                <span><i class="fas fa-chart-bar mr-1"></i> Usage: ${subscription.usage_frequency || 'weekly'}</span>
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
                        <div class="text-2xl font-bold text-white mb-1">
                            ${this.formatCurrency(subscription.cost, subscription.currency || 'USD')}
                        </div>
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

    renderSettings() {
        return `
            <div class="space-y-8">
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fas fa-cog mr-3"></i>
                    Settings & Preferences
                </h2>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Budget Settings -->
                    <div class="dashboard-card">
                        <h3 class="text-xl font-bold text-white mb-6">Budget Settings</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-white/80 text-sm font-medium mb-2">Monthly Budget Limit</label>
                                <div class="flex items-center space-x-2">
                                    <input type="number" id="monthlyBudget" value="${this.budget.total_budget || 100}" 
                                           class="form-input flex-1" placeholder="100.00">
                                    <button onclick="app.updateBudget()" class="btn-elegant px-4 py-2">
                                        <i class="fas fa-save"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <span class="text-white/80">Budget Alerts</span>
                                <button onclick="app.toggleBudgetAlerts()" class="relative w-12 h-6 rounded-full transition-colors ${this.userSettings.budget_alerts !== false ? 'bg-green-500' : 'bg-gray-600'}">
                                    <div class="absolute top-1 transition-transform duration-200 w-4 h-4 bg-white rounded-full ${this.userSettings.budget_alerts !== false ? 'left-7' : 'left-1'}"></div>
                                </button>
                            </div>
                            
                            <div class="flex items-center justify-between">
                                <span class="text-white/80">Renewal Notifications</span>
                                <button onclick="app.toggleRenewalNotifications()" class="relative w-12 h-6 rounded-full transition-colors ${this.userSettings.renewal_notifications !== false ? 'bg-green-500' : 'bg-gray-600'}">
                                    <div class="absolute top-1 transition-transform duration-200 w-4 h-4 bg-white rounded-full ${this.userSettings.renewal_notifications !== false ? 'left-7' : 'left-1'}"></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Currency Settings -->
                    <div class="dashboard-card">
                        <h3 class="text-xl font-bold text-white mb-6">Currency & Display</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-white/80 text-sm font-medium mb-2">Default Currency</label>
                                <select id="defaultCurrency" class="form-input w-full">
                                    ${this.currencies.map(currency => `
                                        <option value="${currency.code}" ${(this.userSettings.currency || 'USD') === currency.code ? 'selected' : ''}>
                                            ${currency.code} - ${currency.name} (${currency.symbol})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Export & Backup -->
                <div class="dashboard-card">
                    <h3 class="text-xl font-bold text-white mb-6">Data Management</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onclick="app.exportData('csv')" class="btn-elegant bg-white/10 hover:bg-white/20 justify-center">
                            <i class="fas fa-file-csv mr-2"></i>Export CSV
                        </button>
                        <button onclick="app.exportData('json')" class="btn-elegant bg-white/10 hover:bg-white/20 justify-center">
                            <i class="fas fa-file-code mr-2"></i>Export JSON
                        </button>
                        <button onclick="app.showImportModal()" class="btn-elegant bg-white/10 hover:bg-white/20 justify-center">
                            <i class="fas fa-file-upload mr-2"></i>Import Data
                        </button>
                    </div>
                </div>
            </div>
        `
    }

    // Modal and form rendering methods
    renderModal() {
        return `
            <div id="modal" class="elegant-modal hidden">
                <div class="modal-content">
                    <div id="modal-content"></div>
                </div>
            </div>
        `
    }

    renderNotifications() {
        return `<div id="notifications" class="fixed top-6 right-6 z-50 space-y-3"></div>`
    }

    // Utility methods
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

    getInsightGradient(type) {
        const gradients = {
            'warning': 'from-yellow-500 to-orange-500',
            'danger': 'from-red-500 to-pink-500',
            'success': 'from-green-500 to-emerald-500',
            'info': 'from-blue-500 to-purple-500'
        }
        return gradients[type] || 'from-blue-500 to-purple-500'
    }

    getInsightBadgeClass(type) {
        const classes = {
            'warning': 'bg-yellow-500/20 text-yellow-300',
            'danger': 'bg-red-500/20 text-red-300',
            'success': 'bg-green-500/20 text-green-300',
            'info': 'bg-blue-500/20 text-blue-300'
        }
        return classes[type] || 'bg-blue-500/20 text-blue-300'
    }

    formatCurrency(amount, currency = 'USD') {
        const currencyData = this.currencies.find(c => c.code === currency) || { symbol: '$' }
        return `${currencyData.symbol}${amount.toFixed(2)}`
    }

    // Action methods
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
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-tag mr-2"></i>Service Name
                            </label>
                            <input type="text" name="name" value="${subscription?.name || ''}" required
                                   class="form-input" placeholder="Netflix, Spotify, etc.">
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
                            <i class="fas fa-info-circle mr-2"></i>Description
                        </label>
                        <input type="text" name="description" value="${subscription?.description || ''}"
                               class="form-input" placeholder="Brief description of the service">
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-dollar-sign mr-2"></i>Cost
                            </label>
                            <input type="number" name="cost" value="${subscription?.cost || ''}" step="0.01" required
                                   class="form-input" placeholder="0.00">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-money-bill mr-2"></i>Currency
                            </label>
                            <select name="currency" class="form-input">
                                ${this.currencies.map(currency => `
                                    <option value="${currency.code}" ${(subscription?.currency || this.userSettings.currency || 'USD') === currency.code ? 'selected' : ''}>
                                        ${currency.code} (${currency.symbol})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-sync-alt mr-2"></i>Billing Cycle
                            </label>
                            <select name="billing_cycle" class="form-input">
                                <option value="monthly" ${subscription?.billing_cycle === 'monthly' ? 'selected' : ''}>Monthly</option>
                                <option value="yearly" ${subscription?.billing_cycle === 'yearly' ? 'selected' : ''}>Yearly</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-calendar-day mr-2"></i>Billing Date
                            </label>
                            <input type="number" name="billing_date" value="${subscription?.billing_date || ''}" 
                                   min="1" max="31" required class="form-input" placeholder="1-31">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-chart-bar mr-2"></i>Usage Frequency
                            </label>
                            <select name="usage_frequency" class="form-input">
                                <option value="daily" ${subscription?.usage_frequency === 'daily' ? 'selected' : ''}>Daily</option>
                                <option value="weekly" ${subscription?.usage_frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                                <option value="monthly" ${subscription?.usage_frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                                <option value="rarely" ${subscription?.usage_frequency === 'rarely' ? 'selected' : ''}>Rarely</option>
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

    showTemplatesModal() {
        const modal = document.getElementById('modal')
        const content = document.getElementById('modal-content')

        content.innerHTML = `
            <div class="elegant-form">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-bold text-white">
                        <i class="fas fa-magic mr-3"></i>
                        Quick Add Templates
                    </h2>
                    <button type="button" onclick="app.hideModal()" 
                            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="space-y-6">
                    ${Object.entries(this.templates).map(([category, items]) => `
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-4 capitalize">
                                <i class="fas fa-${this.getCategoryIcon(category)} mr-2"></i>
                                ${category}
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                ${items.map(template => `
                                    <button onclick="app.addFromTemplate(${JSON.stringify(template).replace(/"/g, '&quot;')})" 
                                            class="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-left transition-all border border-white/10 hover:border-white/20">
                                        <div class="flex justify-between items-center">
                                            <div>
                                                <h4 class="font-semibold text-white">${template.name}</h4>
                                                <p class="text-white/70 text-sm">${template.category}</p>
                                            </div>
                                            <div class="text-right">
                                                <p class="font-bold text-white">$${template.cost}</p>
                                                <p class="text-white/60 text-xs">monthly</p>
                                            </div>
                                        </div>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `

        modal.classList.remove('hidden')
    }

    showExportMenu() {
        const modal = document.getElementById('modal')
        const content = document.getElementById('modal-content')

        content.innerHTML = `
            <div class="elegant-form">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-bold text-white">
                        <i class="fas fa-download mr-3"></i>
                        Export & Share
                    </h2>
                    <button type="button" onclick="app.hideModal()" 
                            class="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="grid gap-4">
                    <button onclick="app.exportData('csv')" class="bg-white/5 hover:bg-white/10 rounded-xl p-6 text-left transition-all border border-white/10 hover:border-white/20">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <i class="fas fa-file-csv text-green-400 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-white">Export as CSV</h3>
                                <p class="text-white/70 text-sm">Spreadsheet-friendly format for analysis</p>
                            </div>
                        </div>
                    </button>
                    
                    <button onclick="app.exportData('json')" class="bg-white/5 hover:bg-white/10 rounded-xl p-6 text-left transition-all border border-white/10 hover:border-white/20">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <i class="fas fa-file-code text-blue-400 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-white">Export as JSON</h3>
                                <p class="text-white/70 text-sm">Complete backup including insights and settings</p>
                            </div>
                        </div>
                    </button>
                    
                    <button onclick="app.shareData()" class="bg-white/5 hover:bg-white/10 rounded-xl p-6 text-left transition-all border border-white/10 hover:border-white/20">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <i class="fas fa-share-alt text-purple-400 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-white">Share Summary</h3>
                                <p class="text-white/70 text-sm">Create shareable summary of your subscriptions</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
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
            is_active: formData.has('is_active'),
            currency: formData.get('currency'),
            usage_frequency: formData.get('usage_frequency')
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
            await this.loadAllData()
            this.render()
            this.addAnimationDelays()
        } catch (error) {
            console.error('Error saving subscription:', error)
            this.showNotification('Error saving subscription 😞', 'error')
        }
    }

    async addFromTemplate(template) {
        try {
            const data = {
                ...template,
                billing_cycle: 'monthly',
                billing_date: 1,
                is_active: true,
                currency: this.userSettings.currency || 'USD',
                usage_frequency: 'weekly',
                description: template.description || `${template.category} service`
            }
            
            await axios.post('/api/subscriptions', data)
            this.showNotification(`Added ${template.name} successfully! 🎉`, 'success')
            this.hideModal()
            await this.loadAllData()
            this.render()
            this.addAnimationDelays()
        } catch (error) {
            console.error('Error adding from template:', error)
            this.showNotification('Error adding subscription 😞', 'error')
        }
    }

    async deleteSubscription(id) {
        if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) return

        try {
            await axios.delete(`/api/subscriptions/${id}`)
            this.showNotification('Subscription deleted successfully! 🗑️', 'success')
            await this.loadAllData()
            this.render()
            this.addAnimationDelays()
        } catch (error) {
            console.error('Error deleting subscription:', error)
            this.showNotification('Error deleting subscription 😞', 'error')
        }
    }

    async exportData(format) {
        try {
            const response = await axios.get(`/api/export/${format}`, {
                responseType: format === 'csv' ? 'blob' : 'json'
            })
            
            if (format === 'csv') {
                const blob = new Blob([response.data], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`
                a.click()
                window.URL.revokeObjectURL(url)
            } else {
                const dataStr = JSON.stringify(response.data, null, 2)
                const blob = new Blob([dataStr], { type: 'application/json' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `subscription-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
                a.click()
                window.URL.revokeObjectURL(url)
            }
            
            this.showNotification(`Data exported successfully! 📊`, 'success')
            this.hideModal()
        } catch (error) {
            console.error('Export error:', error)
            this.showNotification('Export failed 😞', 'error')
        }
    }

    shareData() {
        const summary = `🎯 My Subscription Summary\n\n💰 Monthly Total: $${this.summary.total_monthly_cost}\n📊 Active Subscriptions: ${this.summary.active_subscriptions}\n📈 Yearly Projection: $${this.summary.yearly_projection}\n\nManaged with Smart Subscription Tracker 🚀`
        
        if (navigator.share) {
            navigator.share({
                title: 'My Subscription Summary',
                text: summary
            })
        } else {
            navigator.clipboard.writeText(summary)
            this.showNotification('Summary copied to clipboard! 📋', 'success')
        }
        this.hideModal()
    }

    updateInsightsDisplay() {
        if (this.currentView === 'insights') {
            this.render()
            this.addAnimationDelays()
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
        
        setTimeout(() => notification.classList.remove('translate-x-full'), 100)
        setTimeout(() => {
            notification.classList.add('translate-x-full')
            setTimeout(() => notification.remove(), 300)
        }, 5000)
    }
}

// Initialize the premium application
const app = new PremiumSubscriptionTracker()