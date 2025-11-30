
import { Member, Category, Expense, Budget, Product, User, Household, FixedExpense } from './types';

const STORAGE_KEYS = {
  USERS: 'app_users',
  SESSION: 'app_session',
  HOUSEHOLDS: 'app_households',
  MEMBERS: 'app_members',
  CATEGORIES: 'app_categories',
  EXPENSES: 'app_expenses',
  FIXED_EXPENSES: 'app_fixed_expenses',
  BUDGET: 'app_budget',
  PRODUCTS: 'app_products'
};

// Seed Data Helpers
const createDefaultCategories = (): Category[] => [
  { id: 'c1', name: 'Mercado', icon: 'shopping-cart', limit: 2000, color: 'text-blue-500' },
  { id: 'c2', name: 'Contas', icon: 'zap', limit: 1000, color: 'text-yellow-500' },
  { id: 'c3', name: 'Lazer', icon: 'coffee', limit: 500, color: 'text-pink-500' },
  { id: 'c4', name: 'Transporte', icon: 'car', limit: 400, color: 'text-gray-500' },
  { id: 'c5', name: 'Saúde', icon: 'activity', limit: 300, color: 'text-red-500' },
];

export const storage = {
  // --- AUTH ---
  register: (name: string, email: string, password: string): User => {
    const users = storage.getUsers();
    if (users.find(u => u.email === email)) throw new Error('E-mail já cadastrado');
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password, // Mock: In real app, never store plain password
      avatarColor: 'bg-blue-500' 
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  },

  login: (email: string, password: string): User => {
    const users = storage.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Credenciais inválidas');
    
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getSession: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  // --- HOUSEHOLD ---
  createHousehold: (name: string, adminUser: User): Household => {
    const households = storage.getHouseholds();
    const newHouse: Household = {
      id: Date.now().toString(),
      name,
      adminId: adminUser.id,
      createdAt: new Date().toISOString()
    };
    households.push(newHouse);
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(households));

    // Update User
    const users = storage.getUsers();
    const userIndex = users.findIndex(u => u.id === adminUser.id);
    if (userIndex >= 0) {
      users[userIndex].householdId = newHouse.id;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(users[userIndex])); // Update session
    }

    // Add Member
    const member: Member = {
      id: adminUser.id, // Link member ID to User ID for simplicity in this mock
      userId: adminUser.id,
      name: adminUser.name,
      role: 'admin',
      avatarColor: adminUser.avatarColor,
      relation: 'Responsável'
    };
    const members = storage.getMembers();
    members.push(member);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));

    return newHouse;
  },

  getHouseholds: (): Household[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HOUSEHOLDS);
    return data ? JSON.parse(data) : [];
  },

  getHousehold: (id: string): Household | undefined => {
    return storage.getHouseholds().find(h => h.id === id);
  },

  // --- DATA ---

  getMembers: (): Member[] => {
    // In real app, filter by householdId
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : [];
  },
  
  saveMember: (member: Member) => {
    const members = storage.getMembers();
    const idx = members.findIndex(m => m.id === member.id);
    if (idx >= 0) members[idx] = member;
    else members.push(member);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },

  deleteMember: (id: string) => {
    const members = storage.getMembers().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },

  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : createDefaultCategories();
  },
  
  saveCategory: (category: Category) => {
    const cats = storage.getCategories();
    const idx = cats.findIndex(c => c.id === category.id);
    if (idx >= 0) cats[idx] = category;
    else cats.push(category);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  },

  deleteCategory: (id: string) => {
    const cats = storage.getCategories().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  },

  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },

  saveExpense: (expense: Expense) => {
    const expenses = storage.getExpenses();
    const existingIndex = expenses.findIndex(e => e.id === expense.id);
    if (existingIndex >= 0) {
      expenses[existingIndex] = expense;
    } else {
      expenses.unshift(expense);
    }
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  deleteExpense: (id: string) => {
    const expenses = storage.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },

  // --- FIXED EXPENSES & RECURRENCE ---
  
  getFixedExpenses: (): FixedExpense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FIXED_EXPENSES);
    return data ? JSON.parse(data) : [];
  },

  saveFixedExpense: (fixed: FixedExpense) => {
    const list = storage.getFixedExpenses();
    const idx = list.findIndex(f => f.id === fixed.id);
    if (idx >= 0) list[idx] = fixed;
    else list.push(fixed);
    localStorage.setItem(STORAGE_KEYS.FIXED_EXPENSES, JSON.stringify(list));
  },

  deleteFixedExpense: (id: string) => {
    const list = storage.getFixedExpenses().filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FIXED_EXPENSES, JSON.stringify(list));
  },

  processFixedExpenses: () => {
    const fixedExpenses = storage.getFixedExpenses();
    const expenses = storage.getExpenses();
    const today = new Date();
    today.setHours(0,0,0,0);
    let hasChanges = false;

    fixedExpenses.forEach(fixed => {
      if (!fixed.isActive) return;

      const dueDate = new Date(fixed.nextDueDate + 'T12:00:00'); // Safe parsing
      
      // If due date is today or passed
      if (dueDate <= today) {
        // Create actual expense
        const newExpense: Expense = {
          id: Date.now().toString() + Math.random(),
          amount: fixed.amount,
          categoryId: fixed.categoryId,
          description: fixed.name + ' (Automático)',
          date: fixed.nextDueDate,
          memberId: fixed.memberId,
          paymentMethod: fixed.paymentMethod || 'Outros',
          isFixed: true,
          fixedExpenseId: fixed.id
        };
        expenses.unshift(newExpense);

        // Calculate Next Due Date
        const nextDate = new Date(dueDate);
        switch (fixed.frequency) {
          case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
          case 'bimonthly': nextDate.setMonth(nextDate.getMonth() + 2); break;
          case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
          case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
          default: nextDate.setMonth(nextDate.getMonth() + 1);
        }
        
        fixed.nextDueDate = nextDate.toISOString().split('T')[0];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      localStorage.setItem(STORAGE_KEYS.FIXED_EXPENSES, JSON.stringify(fixedExpenses));
    }
  },

  // --- BUDGET & PRODUCTS ---

  getBudget: (): Budget => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGET);
    return data ? JSON.parse(data) : { month: new Date().toISOString().slice(0, 7), totalLimit: 5000 };
  },

  saveBudget: (budget: Budget) => {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  },

  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  saveProduct: (product: Product) => {
    const products = storage.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
};
