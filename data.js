/* ══════════════════════════════════════════════════════════════
   Fam FINANCE — Data Layer (Supabase Backend)
   ══════════════════════════════════════════════════════════════ */

const FamData = (() => {

  // ── Category definitions (static, no DB needed) ─────────────
  const EXPENSE_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: 'restaurant' },
    { id: 'transport', name: 'Transportation', icon: 'directions_car' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping_bag' },
    { id: 'entertainment', name: 'Entertainment', icon: 'movie' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'receipt_long' },
    { id: 'health', name: 'Healthcare', icon: 'medical_services' },
    { id: 'education', name: 'Education', icon: 'school' },
    { id: 'travel', name: 'Travel', icon: 'flight' },
    { id: 'subscriptions', name: 'Subscriptions', icon: 'subscriptions' },
    { id: 'other', name: 'Other', icon: 'more_horiz' }
  ];

  const INCOME_SOURCES = [
    { id: 'salary', name: 'Salary', icon: 'work' },
    { id: 'freelance', name: 'Freelance', icon: 'laptop' },
    { id: 'investment', name: 'Investment Returns', icon: 'trending_up' },
    { id: 'rental', name: 'Rental Income', icon: 'home' },
    { id: 'gift', name: 'Gift', icon: 'redeem' },
    { id: 'refund', name: 'Refund', icon: 'replay' },
    { id: 'other', name: 'Other', icon: 'more_horiz' }
  ];

  // ── Cached profile for sync access to currency ──────────────
  let _cachedProfile = null;

  async function _getUserId() {
    const { data: { user } } = await _supabase.auth.getUser();
    return user?.id;
  }

  // ── Profile / Settings ──────────────────────────────────────
  async function getSettings() {
    const uid = await _getUserId();
    if (!uid) return { displayName: 'User', email: '', currency: 'USD', currencySymbol: '$', notifications: {} };
    const { data, error } = await _supabase.from('profiles').select('*').eq('id', uid).single();
    if (error || !data) return { displayName: 'User', email: '', currency: 'USD', currencySymbol: '$', notifications: {} };
    _cachedProfile = {
      displayName: data.display_name,
      email: data.email,
      currency: data.currency,
      currencySymbol: data.currency_symbol,
      notifications: data.notifications || {},
    };
    return _cachedProfile;
  }

  async function updateSettings(updates) {
    const uid = await _getUserId();
    if (!uid) return;
    const dbUpdates = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.currencySymbol !== undefined) dbUpdates.currency_symbol = updates.currencySymbol;
    if (updates.notifications !== undefined) dbUpdates.notifications = updates.notifications;
    await _supabase.from('profiles').update(dbUpdates).eq('id', uid);
    _cachedProfile = null; // bust cache
  }

  // ── Transactions ────────────────────────────────────────────
  async function getTransactions() {
    const uid = await _getUserId();
    if (!uid) return [];
    const { data, error } = await _supabase
      .from('transactions')
      .select('*')
      .eq('user_id', uid)
      .order('date', { ascending: false });
    if (error) { console.error('getTransactions error:', error); return []; }
    return data.map(t => ({ ...t, amount: parseFloat(t.amount) }));
  }

  async function addTransaction(t) {
    const uid = await _getUserId();
    if (!uid) return null;
    const { data, error } = await _supabase.from('transactions').insert({
      user_id: uid,
      type: t.type,
      category: t.category,
      description: t.description,
      amount: t.amount,
      date: t.date,
      recurring: t.recurring || false,
      notes: t.notes || null,
    }).select().single();
    if (error) { console.error('addTransaction error:', error); return null; }
    return data;
  }

  async function deleteTransaction(id) {
    const { error } = await _supabase.from('transactions').delete().eq('id', id);
    if (error) console.error('deleteTransaction error:', error);
  }

  async function getTransactionStats() {
    const txns = await getTransactions();
    const now = new Date();
    const thisMonth = txns.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear();
    });
    const lastMonth = txns.filter(t => {
      const td = new Date(t.date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return td.getMonth() === lm.getMonth() && td.getFullYear() === lm.getFullYear();
    });

    const thisIncome = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const thisExpense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastIncome = lastMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastExpense = lastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalIncome = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    return {
      balance: totalIncome - totalExpense,
      thisMonthIncome: thisIncome,
      thisMonthExpense: thisExpense,
      lastMonthIncome: lastIncome,
      lastMonthExpense: lastExpense,
      incomeChange: lastIncome ? ((thisIncome - lastIncome) / lastIncome * 100).toFixed(1) : 0,
      expenseChange: lastExpense ? ((thisExpense - lastExpense) / lastExpense * 100).toFixed(1) : 0,
    };
  }

  async function getSpendingByCategory() {
    const txns = await getTransactions();
    const now = new Date();
    const thisMonth = txns.filter(t => {
      const td = new Date(t.date);
      return t.type === 'expense' && td.getMonth() === now.getMonth() && td.getFullYear() === now.getFullYear();
    });
    const map = {};
    thisMonth.forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([cat, amount]) => ({
      category: cat,
      amount,
      info: EXPENSE_CATEGORIES.find(c => c.id === cat) || { name: cat, icon: 'more_horiz' }
    })).sort((a, b) => b.amount - a.amount);
  }

  async function getMonthlyTotals(months = 6) {
    const txns = await getTransactions();
    const result = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const monthTxns = txns.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
      });
      result.push({
        label,
        income: monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return result;
  }

  // ── Budgets ─────────────────────────────────────────────────
  async function getBudgets() {
    const uid = await _getUserId();
    if (!uid) return [];
    const { data, error } = await _supabase.from('budgets').select('*').eq('user_id', uid);
    if (error) { console.error('getBudgets error:', error); return []; }
    return data.map(b => ({ ...b, limit: parseFloat(b.limit_amount) }));
  }

  async function addBudget(b) {
    const uid = await _getUserId();
    if (!uid) return null;
    const { data, error } = await _supabase.from('budgets').insert({
      user_id: uid, category: b.category, limit_amount: b.limit, period: b.period || 'monthly'
    }).select().single();
    if (error) { console.error('addBudget error:', error); return null; }
    return data;
  }

  async function updateBudget(id, updates) {
    const dbUpdates = {};
    if (updates.limit !== undefined) dbUpdates.limit_amount = updates.limit;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.period !== undefined) dbUpdates.period = updates.period;
    const { error } = await _supabase.from('budgets').update(dbUpdates).eq('id', id);
    if (error) console.error('updateBudget error:', error);
  }

  async function deleteBudget(id) {
    const { error } = await _supabase.from('budgets').delete().eq('id', id);
    if (error) console.error('deleteBudget error:', error);
  }

  async function getBudgetSpending() {
    const budgets = await getBudgets();
    const spending = await getSpendingByCategory();
    return budgets.map(b => {
      const spent = spending.find(s => s.category === b.category);
      const catInfo = EXPENSE_CATEGORIES.find(c => c.id === b.category) || { name: b.category, icon: 'more_horiz' };
      return { ...b, spent: spent ? spent.amount : 0, categoryName: catInfo.name, icon: catInfo.icon };
    });
  }

  // ── Savings Goals ───────────────────────────────────────────
  async function getSavings() {
    const uid = await _getUserId();
    if (!uid) return [];
    const { data, error } = await _supabase.from('savings_goals').select('*').eq('user_id', uid);
    if (error) { console.error('getSavings error:', error); return []; }
    return data.map(s => ({ ...s, target: parseFloat(s.target), current: parseFloat(s.current) }));
  }

  async function addSaving(s) {
    const uid = await _getUserId();
    if (!uid) return null;
    const { data, error } = await _supabase.from('savings_goals').insert({
      user_id: uid, name: s.name, target: s.target, current: s.current || 0,
      deadline: s.deadline || null, icon: s.icon || 'flag'
    }).select().single();
    if (error) { console.error('addSaving error:', error); return null; }
    return data;
  }

  async function updateSaving(id, updates) {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.target !== undefined) dbUpdates.target = updates.target;
    if (updates.current !== undefined) dbUpdates.current = updates.current;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    const { error } = await _supabase.from('savings_goals').update(dbUpdates).eq('id', id);
    if (error) console.error('updateSaving error:', error);
  }

  async function deleteSaving(id) {
    const { error } = await _supabase.from('savings_goals').delete().eq('id', id);
    if (error) console.error('deleteSaving error:', error);
  }

  async function contributeSaving(id, amount) {
    const goals = await getSavings();
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newCurrent = Math.min(goal.target, goal.current + amount);
    await _supabase.from('savings_goals').update({ current: newCurrent }).eq('id', id);
  }

  // ── Format helpers (sync) ──────────────────────────────────
  function formatCurrency(amount) {
    const symbol = _cachedProfile?.currencySymbol || '$';
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  async function resetAllData() {
    const uid = await _getUserId();
    if (!uid) return;
    await _supabase.from('transactions').delete().eq('user_id', uid);
    await _supabase.from('budgets').delete().eq('user_id', uid);
    await _supabase.from('savings_goals').delete().eq('user_id', uid);
    await _supabase.from('profiles').update({
      display_name: 'User', currency: 'USD', currency_symbol: '$',
      notifications: { email: true, push: true, weekly: true, budget: true }
    }).eq('id', uid);
    _cachedProfile = null;
  }

  return {
    EXPENSE_CATEGORIES, INCOME_SOURCES,
    getSettings, updateSettings,
    getTransactions, addTransaction, deleteTransaction,
    getTransactionStats, getSpendingByCategory, getMonthlyTotals,
    getBudgets, addBudget, updateBudget, deleteBudget, getBudgetSpending,
    getSavings, addSaving, updateSaving, deleteSaving, contributeSaving,
    formatCurrency, formatDate, resetAllData
  };
})();

// ── Auth helpers ──────────────────────────────────────────────
async function checkAuth() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (!session) {
    window.location.href = 'signin.html';
    return false;
  }
  // Pre-load profile for currency formatting
  await FamData.getSettings();
  return true;
}

async function signOut() {
  await _supabase.auth.signOut();
  window.location.href = 'index.html';
}

// ── Shared UI builders (unchanged) ───────────────────────────
function buildSidebar(activePage) {
  const links = [
    { page: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { page: 'transactions', icon: 'receipt_long', label: 'Transactions' },
    { page: 'budgets', icon: 'account_balance_wallet', label: 'Budgets' },
    { page: 'savings', icon: 'savings', label: 'Savings' },
    { page: 'analytics', icon: 'analytics', label: 'Analytics' },
  ];
  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">Fam</div>
      <nav class="sidebar-nav">
        ${links.map(l => `
          <a href="${l.page}.html" class="sidebar-link ${activePage === l.page ? 'active' : ''}">
            <span class="material-symbols-outlined">${l.icon}</span>
            ${l.label}
          </a>
        `).join('')}
        <div class="sidebar-divider"></div>
        <a href="settings.html" class="sidebar-link ${activePage === 'settings' ? 'active' : ''}">
          <span class="material-symbols-outlined">settings</span>
          Settings
        </a>
      </nav>
      <div class="sidebar-bottom">
        <a href="javascript:void(0)" onclick="signOut()" class="sidebar-link">
          <span class="material-symbols-outlined">logout</span>
          Sign Out
        </a>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>
  `;
}

function buildTopbar(title) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const initial = (FamData._cachedProfile?.displayName || 'U').charAt(0).toUpperCase();
  return `
    <header class="topbar">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="hamburger" onclick="toggleSidebar()">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="topbar-title"><strong>${title}</strong> · ${today}</div>
      </div>
      <div class="topbar-right">
        <div class="topbar-avatar">${initial}</div>
      </div>
    </header>
  `;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}
