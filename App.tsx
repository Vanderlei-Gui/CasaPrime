
import React, { useState, useEffect, useRef } from 'react';
import { storage } from './storage';
import { parseReceiptWithGemini } from './gemini';
import { Member, Category, Expense, Budget, Product, MarketItem, User, Household, FixedExpense } from './types';

// --- LOGO COMPONENT ---
const Logo = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl", className?: string }) => {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <svg className={`${sizes[size]} ${className}`} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* House Base */}
      <path d="M20 4L4 16H8V34C8 35.1046 8.89543 36 10 36H30C31.1046 36 32 35.1046 32 34V16H36L20 4Z" className="fill-primary" />
      {/* Bars Graph - Representing Management/Growth */}
      <path d="M14 28V22" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 28V18" stroke="white" strokeWidth="3" strokeLinecap="round" />
      {/* The 'Prime' bar in secondary color */}
      <path d="M26 28V14" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

// --- ICONS ---
const Icons = {
  Home: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  List: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Plus: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Cart: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  User: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Camera: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  ArrowLeft: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Chart: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Settings: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Moon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  LogOut: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Refresh: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Pencil: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
};

// --- VIEWS ENUM ---
type ViewState = 
  'LOGIN' | 'REGISTER' | 'CREATE_HOUSE' | 'DASHBOARD' | 
  'EXPENSE_NEW' | 'OCR_SCAN' | 'EXPENSE_LIST' | 
  'MARKET_LIST' | 'MARKET_ADD' | 'MARKET_HISTORY' | 
  'REPORTS' | 'PROFILE' | 'MEMBERS' | 'CATEGORIES' | 'BUDGET' |
  'FIXED_LIST' | 'FIXED_ADD' | 'FIXED_EDIT' |
  'MEMBER_ADD';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budget, setBudget] = useState<Budget>({ month: '', totalLimit: 0 });
  const [products, setProducts] = useState<Product[]>([]);

  // Temporary State for Edit/View
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFixedExpense, setSelectedFixedExpense] = useState<FixedExpense | null>(null);

  // Initialize
  useEffect(() => {
    // Splash Screen Timer
    const splashTimer = setTimeout(() => {
      const session = storage.getSession();
      if (session) {
        setUser(session);
        if (session.householdId) {
          setHousehold(storage.getHousehold(session.householdId));
          // Run check for recurring expenses
          storage.processFixedExpenses();
          loadData();
          setCurrentView('DASHBOARD');
        } else {
          setCurrentView('CREATE_HOUSE');
        }
      } else {
        setCurrentView('LOGIN');
      }
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  const loadData = () => {
    setMembers(storage.getMembers());
    setCategories(storage.getCategories());
    setExpenses(storage.getExpenses());
    setFixedExpenses(storage.getFixedExpenses());
    setBudget(storage.getBudget());
    setProducts(storage.getProducts());
  };

  const handleLogin = (u: User) => {
    setUser(u);
    if (u.householdId) {
      setHousehold(storage.getHousehold(u.householdId));
      storage.processFixedExpenses();
      loadData();
      setCurrentView('DASHBOARD');
    } else {
      setCurrentView('CREATE_HOUSE');
    }
  };

  const handleLogout = () => {
    storage.logout();
    setUser(null);
    setCurrentView('LOGIN');
  };

  // --- SPLASH SCREEN ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center animate-fade-in">
        <div className="animate-bounce">
          <Logo size="xl" className="text-white fill-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight">CasaPrime</h1>
        <p className="text-blue-200 mt-2 text-sm">Carregando seus dados...</p>
      </div>
    );
  }

  // --- NAVIGATION WRAPPER ---
  const MainLayout = ({ children, title, showBack = false }: { children: React.ReactNode, title?: string, showBack?: boolean }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      {/* Header */}
      {title && (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
          <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showBack && (
                <button onClick={() => setCurrentView('DASHBOARD')} className="text-gray-500 hover:text-primary">
                  <Icons.ArrowLeft />
                </button>
              )}
              {!showBack && <Logo size="sm" />}
              <h1 className="text-xl font-bold text-primary truncate">{title}</h1>
            </div>
            {user && (
              <div onClick={() => setCurrentView('PROFILE')} className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-xs cursor-pointer shadow-sm`}>
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-24 overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Footer Nav */}
      {user && household && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-30">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            <NavBtn icon={<Icons.Home />} label="Início" active={currentView === 'DASHBOARD'} onClick={() => setCurrentView('DASHBOARD')} />
            <NavBtn icon={<Icons.List />} label="Extrato" active={currentView === 'EXPENSE_LIST'} onClick={() => setCurrentView('EXPENSE_LIST')} />
            
            {/* FAB Placeholder */}
            <div className="w-12"></div>

            <NavBtn icon={<Icons.Cart />} label="Mercado" active={currentView.startsWith('MARKET')} onClick={() => setCurrentView('MARKET_LIST')} />
            <NavBtn icon={<Icons.Chart />} label="Relatórios" active={currentView === 'REPORTS'} onClick={() => setCurrentView('REPORTS')} />
          </div>
        </nav>
      )}
      
      {/* FAB - Central Add Button */}
      {user && household && (
        <button 
          onClick={() => setCurrentView('EXPENSE_NEW')}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95 z-40 border-4 border-gray-50 dark:border-gray-900"
        >
          <Icons.Plus />
        </button>
      )}
    </div>
  );

  const NavBtn = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center p-2 transition-colors ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );

  // --- SCREENS ---

  if (currentView === 'LOGIN') return <LoginScreen onLogin={handleLogin} onRegister={() => setCurrentView('REGISTER')} />;
  if (currentView === 'REGISTER') return <RegisterScreen onSuccess={() => setCurrentView('LOGIN')} onLogin={() => setCurrentView('LOGIN')} />;
  if (currentView === 'CREATE_HOUSE') return <CreateHouseScreen user={user!} onComplete={(h) => { setHousehold(h); loadData(); setCurrentView('DASHBOARD'); }} />;

  // --- DASHBOARD ---
  if (currentView === 'DASHBOARD') {
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const fixedTotal = expenses.filter(e => e.isFixed).reduce((acc, curr) => acc + curr.amount, 0);
    const varTotal = totalSpent - fixedTotal;
    
    const budgetLimit = budget.totalLimit || 1;
    const percent = Math.min((totalSpent / budgetLimit) * 100, 100);
    let barColor = 'bg-green-500';
    if (percent > 50) barColor = 'bg-yellow-500';
    if (percent > 85) barColor = 'bg-red-500';

    return (
      <MainLayout title={household?.name || 'CasaPrime'}>
        <div className="space-y-6 animate-fade-in">
          {/* Budget Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gasto Total</h2>
              <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
              </span>
            </div>
            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">R$ {totalSpent.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
              <div className={`h-2 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${percent}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0%</span>
              <span>Meta: R$ {budgetLimit}</span>
            </div>

            {/* Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
              <div>
                 <div className="text-xs text-gray-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Fixos</div>
                 <div className="font-bold dark:text-white">R$ {fixedTotal.toFixed(2)}</div>
              </div>
              <div>
                 <div className="text-xs text-gray-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Variáveis</div>
                 <div className="font-bold dark:text-white">R$ {varTotal.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-3 gap-3">
            <ActionCard icon={<Icons.Plus />} title="Registrar" color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" onClick={() => setCurrentView('EXPENSE_NEW')} />
            <ActionCard icon={<Icons.Camera />} title="OCR" color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" onClick={() => setCurrentView('OCR_SCAN')} />
            <ActionCard icon={<Icons.Clock />} title="Fixos" color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" onClick={() => setCurrentView('FIXED_LIST')} />
            <ActionCard icon={<Icons.Cart />} title="Mercado" color="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" onClick={() => setCurrentView('MARKET_LIST')} />
            <ActionCard icon={<Icons.Chart />} title="Relatórios" color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" onClick={() => setCurrentView('REPORTS')} />
            <ActionCard icon={<Icons.Users />} title="Membros" color="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" onClick={() => setCurrentView('MEMBERS')} />
            <ActionCard icon={<Icons.Settings />} title="Orçamento" color="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" onClick={() => setCurrentView('BUDGET')} />
            <ActionCard icon={<Icons.List />} title="Categorias" color="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" onClick={() => setCurrentView('CATEGORIES')} />
            <div className="col-span-1"></div> {/* Spacer if needed */}
          </div>

          {/* Recent List Mini */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-800 dark:text-white">Últimos Gastos</h3>
              <button onClick={() => setCurrentView('EXPENSE_LIST')} className="text-sm text-primary">Ver todos</button>
            </div>
            <div className="space-y-3">
              {expenses.slice(0, 3).map(e => (
                <ExpenseCard key={e.id} expense={e} categories={categories} members={members} />
              ))}
              {expenses.length === 0 && <p className="text-gray-500 text-center py-4 text-sm">Nenhum gasto registrado.</p>}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // --- FIXED EXPENSES SCREENS ---

  if (currentView === 'FIXED_LIST') {
    return (
      <MainLayout title="Gastos Fixos" showBack>
        <div className="space-y-4">
           <button onClick={() => setCurrentView('FIXED_ADD')} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition">
             + Adicionar Gasto Fixo
           </button>
           
           <div className="space-y-3">
              {fixedExpenses.map(f => (
                <div key={f.id} className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 ${f.isActive ? 'border-indigo-500' : 'border-gray-300'} flex justify-between items-center`}>
                   <div>
                      <h3 className="font-bold dark:text-white flex items-center gap-2">
                        {f.name}
                        {!f.isActive && <span className="text-[10px] bg-gray-200 text-gray-600 px-1 rounded">Pausado</span>}
                      </h3>
                      <p className="text-xs text-gray-500">Vence: {new Date(f.nextDueDate).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-gray-400 capitalize">{f.frequency}</p>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-lg dark:text-white">R$ {f.amount.toFixed(2)}</span>
                      <div className="flex gap-2">
                         <button onClick={() => { setSelectedFixedExpense(f); setCurrentView('FIXED_EDIT'); }} className="text-blue-500 hover:text-blue-700"><Icons.Pencil /></button>
                         <button onClick={() => {
                            if(window.confirm('Excluir este gasto recorrente?')) {
                               storage.deleteFixedExpense(f.id);
                               loadData();
                            }
                         }} className="text-red-500 hover:text-red-700"><Icons.Trash /></button>
                      </div>
                   </div>
                </div>
              ))}
              {fixedExpenses.length === 0 && <div className="text-center text-gray-400 py-10">Nenhum gasto fixo cadastrado.</div>}
           </div>
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'FIXED_ADD' || currentView === 'FIXED_EDIT') {
     return (
        <MainLayout title={currentView === 'FIXED_ADD' ? "Novo Gasto Fixo" : "Editar Gasto Fixo"} showBack>
           <FixedExpenseForm 
              categories={categories}
              members={members}
              currentUser={members.find(m => m.userId === user?.id) || members[0]}
              initialData={currentView === 'FIXED_EDIT' ? selectedFixedExpense : null}
              onSave={(fixed) => {
                 storage.saveFixedExpense(fixed);
                 loadData();
                 setCurrentView('FIXED_LIST');
              }}
           />
        </MainLayout>
     )
  }

  // --- STANDARD EXPENSE SCREENS ---

  if (currentView === 'EXPENSE_NEW' || currentView === 'OCR_SCAN') {
    return (
      <MainLayout title={currentView === 'OCR_SCAN' ? 'Escanear Nota' : 'Nova Despesa'} showBack>
        <ExpenseForm 
          categories={categories} 
          members={members} 
          currentUser={members.find(m => m.userId === user?.id) || members[0]}
          initialMode={currentView === 'OCR_SCAN' ? 'scan' : 'manual'}
          onSave={(expense, newProducts) => {
            // Duplication Check
            const duplicate = expenses.find(e => 
              e.amount === expense.amount && 
              e.date === expense.date && 
              e.description === expense.description
            );
            
            if (duplicate) {
              if (!window.confirm('Parece que esta despesa já foi registrada. Deseja continuar?')) return;
            }

            storage.saveExpense(expense);
            if (newProducts) {
               newProducts.forEach(p => storage.saveProduct(p));
            }
            loadData();
            setCurrentView('DASHBOARD');
          }}
          existingProducts={products}
        />
      </MainLayout>
    );
  }

  if (currentView === 'EXPENSE_LIST') {
    return (
      <MainLayout title="Extrato de Gastos" showBack>
        <ExpenseList expenses={expenses} categories={categories} members={members} onDelete={(id) => {
            if(window.confirm('Excluir gasto?')) {
                storage.deleteExpense(id);
                loadData();
            }
        }} isAdmin={user?.id === household?.adminId} />
      </MainLayout>
    );
  }

  if (currentView === 'MARKET_LIST') {
    return (
      <MainLayout title="Produtos de Mercado" showBack>
        <div className="space-y-4">
          <div className="flex gap-2">
             <button onClick={() => setCurrentView('MARKET_ADD')} className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold shadow-sm">Cadastrar Produto</button>
          </div>
          <div className="space-y-3">
             {products.map(p => (
                 <ProductCard key={p.id} product={p} onClick={() => {
                     setSelectedProduct(p);
                     setCurrentView('MARKET_HISTORY');
                 }} />
             ))}
             {products.length === 0 && <p className="text-center text-gray-500 py-10">Nenhum produto cadastrado.</p>}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'MARKET_ADD') {
    return (
        <MainLayout title="Novo Produto" showBack>
            <ProductForm onSave={(p) => {
                storage.saveProduct(p);
                loadData();
                setCurrentView('MARKET_LIST');
            }} />
        </MainLayout>
    )
  }

  if (currentView === 'MARKET_HISTORY' && selectedProduct) {
      return (
          <MainLayout title="Histórico de Preço" showBack>
              <ProductHistory product={selectedProduct} />
          </MainLayout>
      )
  }

  if (currentView === 'REPORTS') {
      return (
          <MainLayout title="Relatórios" showBack>
              <Reports expenses={expenses} categories={categories} members={members} />
          </MainLayout>
      )
  }

  if (currentView === 'MEMBERS') {
    return (
      <MainLayout title="Membros da Casa" showBack>
        <div className="space-y-4">
           {members.map(m => (
               <div key={m.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full ${m.avatarColor} flex items-center justify-center text-white font-bold`}>{m.name.charAt(0)}</div>
                       <div>
                           <div className="font-bold dark:text-white">{m.name}</div>
                           <div className="text-sm text-gray-500">{m.relation} • {m.role}</div>
                       </div>
                   </div>
               </div>
           ))}
           <button onClick={() => setCurrentView('MEMBER_ADD')} className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-500 rounded-xl font-medium mt-4 hover:bg-gray-50 dark:hover:bg-gray-800">
               + Adicionar Membro
           </button>
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'MEMBER_ADD') {
    return (
        <MainLayout title="Novo Membro" showBack>
            <AddMemberForm onSave={(m) => {
                storage.saveMember(m);
                loadData();
                setCurrentView('MEMBERS');
            }} />
        </MainLayout>
    )
  }

  if (currentView === 'CATEGORIES') {
    return (
      <MainLayout title="Categorias" showBack>
          <div className="space-y-3">
             {categories.map(c => (
                <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${c.color.replace('text-', 'bg-')} flex items-center justify-center text-white text-xs`}>
                         {c.name.charAt(0)}
                      </div>
                      <span className="font-medium dark:text-white">{c.name}</span>
                   </div>
                   <div className="flex items-center gap-3">
                       <span className="text-gray-500 text-sm">Meta: R$ {c.limit}</span>
                       <button onClick={() => {
                           if(window.confirm(`Excluir categoria ${c.name}?`)) {
                               storage.deleteCategory(c.id);
                               loadData();
                           }
                       }} className="text-red-400"><Icons.Trash /></button>
                   </div>
                </div>
             ))}
             
             <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                 <h3 className="font-bold mb-4 dark:text-white">Nova Categoria</h3>
                 <AddCategoryForm onSave={(c) => {
                     storage.saveCategory(c);
                     loadData();
                 }} />
             </div>
          </div>
      </MainLayout>
    )
  }

  if (currentView === 'BUDGET') {
      return (
          <MainLayout title="Orçamento" showBack>
              <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-2">Limite Mensal Global</label>
                      <div className="flex gap-2">
                          <span className="py-2 text-xl font-bold dark:text-white">R$</span>
                          <input 
                            type="number" 
                            className="w-full p-2 text-xl border-b border-gray-300 dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary"
                            defaultValue={budget.totalLimit}
                            onBlur={(e) => {
                                const newBudget = { ...budget, totalLimit: parseFloat(e.target.value) };
                                storage.saveBudget(newBudget);
                                setBudget(newBudget);
                            }}
                          />
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <h3 className="font-bold dark:text-white">Categorias</h3>
                      {categories.map(c => (
                          <div key={c.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                              <div className="flex items-center gap-2">
                                  <div className={`w-2 h-8 rounded-full ${c.color.replace('text-', 'bg-')}`}></div>
                                  <span className="font-medium dark:text-white">{c.name}</span>
                              </div>
                              <span className="text-gray-500">R$ {c.limit}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </MainLayout>
      )
  }

  if (currentView === 'PROFILE') {
    return (
      <MainLayout title="Perfil" showBack>
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold mb-4 ${user?.avatarColor}`}>
                    {user?.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold dark:text-white">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <div className="mt-4 inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                    {household?.name}
                </div>
            </div>

            <button 
                onClick={handleLogout}
                className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
                <Icons.LogOut /> Sair da conta
            </button>
            
            <div className="text-center text-gray-400 text-xs mt-10">
                CasaPrime v1.0 • Build by Vanderlei Barros
            </div>
        </div>
      </MainLayout>
    );
  }

  return null;
}

// --- SUB-COMPONENTS ---

function LoginScreen({ onLogin, onRegister }: { onLogin: (u: User) => void, onRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = storage.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size="xl" className="mb-4" />
          <h1 className="text-4xl font-extrabold text-primary mb-2">CasaPrime</h1>
          <p className="text-gray-500 font-medium text-lg">Gestão Inteligente de Gastos</p>
          <p className="text-gray-400 text-sm mt-4 max-w-xs leading-relaxed">
            Controle contas, compras de mercado e o orçamento familiar em um só lugar. Use a Inteligência Artificial para ler notas fiscais e nunca mais perca o controle do dinheiro.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl dark:text-white" placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl dark:text-white" placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition">Entrar</button>
        </form>
        
        <div className="mt-6 text-center">
          <button onClick={onRegister} className="text-primary font-medium hover:underline">Criar nova conta</button>
        </div>
      </div>
      
      <footer className="mt-auto py-6 text-center text-xs text-gray-400">
        <p>Desenvolvido por Vanderlei Barros</p>
        <p>Tecnologia • Gestão • Automação</p>
      </footer>
    </div>
  );
}

function RegisterScreen({ onSuccess, onLogin }: { onSuccess: () => void, onLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      storage.register(name, email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
       <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
             <Logo size="lg" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Criar Conta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl dark:text-white" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} required />
            <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl dark:text-white" placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl dark:text-white" placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg">Cadastrar</button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={onLogin} className="text-gray-500">Já tem conta? Entrar</button>
          </div>
       </div>
    </div>
  );
}

function CreateHouseScreen({ user, onComplete }: { user: User, onComplete: (h: Household) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const house = storage.createHousehold(name, user);
    onComplete(house);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo, {user.name}!</h2>
        <p className="text-gray-500 mb-8">Vamos configurar sua residência.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
           <input className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-xl dark:text-white text-center text-lg" placeholder="Nome da Casa (ex: Casa Silva)" value={name} onChange={e => setName(e.target.value)} required />
           <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg">Criar Residência</button>
        </form>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, color, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-2xl ${color} h-24 w-full transition-transform active:scale-95`}>
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-semibold leading-tight text-center">{title}</span>
    </button>
  );
}

function ExpenseCard({ expense, categories, members }: any) {
  const cat = categories.find((c: any) => c.id === expense.categoryId);
  const mem = members.find((m: any) => m.id === expense.memberId);
  
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border ${expense.isFixed ? 'border-indigo-100 dark:border-indigo-900' : 'border-gray-100 dark:border-gray-700'} flex justify-between items-center`}>
      <div className="flex gap-3 items-center">
         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${mem?.avatarColor || 'bg-gray-400'}`}>
            {mem?.name?.charAt(0)}
         </div>
         <div>
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              {expense.description}
              {expense.isFixed && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 rounded">FIXO</span>}
            </h4>
            <div className="text-xs text-gray-500 flex items-center gap-2">
                <span className={`font-medium ${cat?.color}`}>{cat?.name}</span>
                <span>• {new Date(expense.date).toLocaleDateString('pt-BR')}</span>
            </div>
         </div>
      </div>
      <span className="font-bold text-gray-900 dark:text-white">-R$ {expense.amount.toFixed(2)}</span>
    </div>
  );
}

// --- FORMS & LISTS ---

function AddMemberForm({ onSave }: any) {
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [role, setRole] = useState('user');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
             <div>
                <label className="text-sm text-gray-500">Nome</label>
                <input className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1 dark:text-white" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Maria" />
             </div>
             <div>
                <label className="text-sm text-gray-500">Parentesco / Função</label>
                <input className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1 dark:text-white" value={relation} onChange={e => setRelation(e.target.value)} placeholder="Ex: Esposa, Filho, etc." />
             </div>
             <div>
                <label className="text-sm text-gray-500">Permissão</label>
                <select className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1 dark:text-white" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="user">Usuário Comum (Vê apenas seus gastos)</option>
                    <option value="admin">Administrador (Vê tudo)</option>
                </select>
             </div>
             <button onClick={() => {
                 if(!name || !relation) return;
                 const colors = ['bg-pink-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                 onSave({
                     id: Date.now().toString(),
                     userId: Date.now().toString(), // Mock ID
                     name, relation, role,
                     avatarColor: colors[Math.floor(Math.random() * colors.length)]
                 })
             }} className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4">Salvar Membro</button>
        </div>
    )
}

function AddCategoryForm({ onSave }: any) {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    return (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl space-y-3 border border-gray-200 dark:border-gray-700">
             <input className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg dark:text-white border border-gray-200 dark:border-gray-700" value={name} onChange={e => setName(e.target.value)} placeholder="Nome da Categoria" />
             <input className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg dark:text-white border border-gray-200 dark:border-gray-700" type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Meta Mensal (R$)" />
             <button onClick={() => {
                 if(!name) return;
                 const colors = ['text-blue-500', 'text-green-500', 'text-purple-500', 'text-pink-500', 'text-orange-500'];
                 onSave({
                     id: Date.now().toString(),
                     name,
                     limit: parseFloat(limit) || 0,
                     icon: 'tag',
                     color: colors[Math.floor(Math.random() * colors.length)]
                 });
                 setName('');
                 setLimit('');
             }} className="w-full bg-secondary text-white py-2 rounded-lg font-bold">Adicionar</button>
        </div>
    )
}

function FixedExpenseForm({ categories, members, currentUser, initialData, onSave }: any) {
   const [name, setName] = useState(initialData?.name || '');
   const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
   const [catId, setCatId] = useState(initialData?.categoryId || '');
   const [nextDate, setNextDate] = useState(initialData?.nextDueDate || new Date().toISOString().split('T')[0]);
   const [freq, setFreq] = useState(initialData?.frequency || 'monthly');
   const [memberId, setMemberId] = useState(initialData?.memberId || currentUser.id);
   const [isActive, setIsActive] = useState(initialData ? initialData.isActive : true);

   const handleSubmit = () => {
      if(!name || !amount || !catId) return alert('Preencha os campos obrigatórios');
      
      const fixed: FixedExpense = {
         id: initialData?.id || Date.now().toString(),
         name,
         amount: parseFloat(amount),
         categoryId: catId,
         memberId,
         frequency: freq,
         nextDueDate: nextDate,
         isActive,
         paymentMethod: 'Outros'
      };
      onSave(fixed);
   };

   return (
      <div className="space-y-4">
         <div>
            <label className="text-sm font-medium text-gray-500">Nome da Despesa</label>
            <input className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg mt-1 dark:text-white border border-gray-200 dark:border-gray-700" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Aluguel" />
         </div>
         <div>
            <label className="text-sm font-medium text-gray-500">Valor Mensal</label>
            <input type="number" className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg mt-1 dark:text-white border border-gray-200 dark:border-gray-700" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-sm font-medium text-gray-500">Categoria</label>
               <select className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg mt-1 dark:text-white border border-gray-200 dark:border-gray-700" value={catId} onChange={e => setCatId(e.target.value)}>
                  <option value="">Selecione</option>
                  {categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div>
               <label className="text-sm font-medium text-gray-500">Próximo Vencimento</label>
               <input type="date" className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg mt-1 dark:text-white border border-gray-200 dark:border-gray-700" value={nextDate} onChange={e => setNextDate(e.target.value)} />
            </div>
         </div>
         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-sm font-medium text-gray-500">Frequência</label>
               <select className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg mt-1 dark:text-white border border-gray-200 dark:border-gray-700" value={freq} onChange={e => setFreq(e.target.value)}>
                  <option value="monthly">Mensal</option>
                  <option value="bimonthly">Bimestral</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
               </select>
            </div>
            <div>
               <label className="text-sm font-medium text-gray-500">Responsável</label>
               <select className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg mt-1 dark:text-white border border-gray-200 dark:border-gray-700" value={memberId} onChange={e => setMemberId(e.target.value)}>
                   {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
               </select>
            </div>
         </div>
         
         {initialData && (
             <div className="flex items-center gap-3 pt-4">
                 <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-6 h-6" />
                 <span className="dark:text-white">Gasto Ativo (Recorrência Automática)</span>
             </div>
         )}

         <button onClick={handleSubmit} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg mt-6">Salvar Gasto Fixo</button>
      </div>
   )
}

function ExpenseForm({ categories, members, currentUser, initialMode, onSave, existingProducts }: any) {
  const [isScanning, setIsScanning] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [catId, setCatId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberId, setMemberId] = useState(currentUser.id);
  const [items, setItems] = useState<MarketItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialMode === 'scan') {
        setTimeout(() => fileRef.current?.click(), 500);
    }
  }, [initialMode]);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
       try {
           const base64 = (reader.result as string).split(',')[1];
           const data = await parseReceiptWithGemini(base64);
           if (data) {
             setAmount(data.total?.toString() || '');
             setDesc(data.establishment ? `Compra em ${data.establishment}` : 'Despesa');
             if (data.date) setDate(data.date);
             if (data.items) {
                 setItems(data.items);
                 const mktCat = categories.find((c: any) => c.name.toLowerCase().includes('mercado'));
                 if (mktCat) setCatId(mktCat.id);
             }
           }
       } catch (err) {
           alert('Erro ao ler nota.');
       } finally {
           setIsScanning(false);
       }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
     if (!amount || !desc) return alert('Preencha os campos obrigatórios');
     
     const newExpense: Expense = {
         id: Date.now().toString(),
         amount: parseFloat(amount),
         description: desc,
         categoryId: catId || categories[0].id,
         date,
         memberId,
         paymentMethod: 'Outros',
         items
     };

     // Create Product updates
     let newProducts: Product[] = [];
     if (items.length > 0) {
         newProducts = items.map(item => {
             const existing = existingProducts.find((p: Product) => p.name.toLowerCase() === item.name.toLowerCase());
             const historyEntry = {
                 date,
                 price: item.unitPrice,
                 establishment: desc.replace('Compra em ', ''),
                 quantity: item.quantity
             };
             
             if (existing) {
                 return {
                     ...existing,
                     lastPrice: item.unitPrice,
                     history: [...existing.history, historyEntry]
                 };
             } else {
                 return {
                     id: Date.now().toString() + Math.random(),
                     name: item.name,
                     brand: 'Genérica',
                     category: 'Geral',
                     unit: item.unit || 'un',
                     lastPrice: item.unitPrice,
                     history: [historyEntry]
                 }
             }
         });
     }

     onSave(newExpense, newProducts.length > 0 ? newProducts : null);
  };

  return (
    <div className="space-y-6">
       {/* Scan Trigger */}
       <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleScan} />
       <button onClick={() => fileRef.current?.click()} className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 font-medium flex items-center justify-center gap-2">
           {isScanning ? 'Processando IA...' : <><Icons.Camera /> Escanear Nota Fiscal</>}
       </button>

       {/* Form */}
       <div className="space-y-4">
           <div>
               <label className="text-sm font-medium text-gray-500">Valor</label>
               <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full text-3xl font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 py-2 focus:outline-none focus:border-primary dark:text-white" placeholder="0.00" />
           </div>
           
           <div>
               <label className="text-sm font-medium text-gray-500">Descrição</label>
               <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-white" placeholder="Ex: Mercado Semanal" />
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                   <label className="text-sm font-medium text-gray-500">Categoria</label>
                   <select value={catId} onChange={e => setCatId(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-white">
                       <option value="">Selecione</option>
                       {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
               </div>
               <div>
                   <label className="text-sm font-medium text-gray-500">Data</label>
                   <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-white" />
               </div>
           </div>

           <div>
               <label className="text-sm font-medium text-gray-500">Membro</label>
               <select value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-white">
                   {members.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
               </select>
            </div>
           
           {items.length > 0 && (
               <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                   <p className="text-green-700 dark:text-green-400 font-medium text-sm flex items-center gap-2">
                       <Icons.Cart /> {items.length} itens extraídos da nota
                   </p>
               </div>
           )}

           <button onClick={handleSubmit} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg mt-4">Confirmar e Salvar</button>
       </div>
    </div>
  );
}

function ExpenseList({ expenses, categories, members, onDelete, isAdmin }: any) {
    const [filter, setFilter] = useState('');
    
    const filtered = expenses.filter((e: any) => e.description.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar gastos..." 
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-none shadow-sm dark:text-white"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <div className="absolute left-3 top-3.5 text-gray-400"><Icons.Search /></div>
            </div>
            
            <div className="space-y-3">
                {filtered.map((e: any) => (
                    <div key={e.id} className="relative group">
                         <ExpenseCard expense={e} categories={categories} members={members} />
                         {isAdmin && (
                             <button 
                                onClick={() => onDelete(e.id)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-2 rounded-full shadow"
                             >
                                 <Icons.Trash />
                             </button>
                         )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProductCard({ product, onClick }: { product: Product, onClick: () => void }) {
    const history = product.history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const currentPrice = history[0]?.price || 0;
    const prevPrice = history.length > 1 ? history[1].price : currentPrice;
    const diffPercent = prevPrice > 0 ? ((currentPrice - prevPrice) / prevPrice) * 100 : 0;
    const isUp = diffPercent > 0;
    
    return (
        <div onClick={onClick} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.brand} • {product.unit}</p>
                </div>
                <div className={`text-sm font-bold ${isUp && diffPercent !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {diffPercent !== 0 && (isUp ? '↑' : '↓')} {Math.abs(diffPercent).toFixed(0)}%
                </div>
            </div>
            <div className="mt-3 flex justify-between items-end border-t border-gray-100 dark:border-gray-700 pt-2">
                <div>
                    <p className="text-xs text-gray-400">Último Preço</p>
                    <p className="font-bold text-lg dark:text-white">R$ {currentPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                     <p className="text-xs text-gray-400">Em {history[0]?.establishment}</p>
                     <p className="text-xs text-gray-500">{new Date(history[0]?.date).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    )
}

function ProductForm({ onSave }: any) {
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [unit, setUnit] = useState('un');
    const [price, setPrice] = useState('');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
             <div>
                <label className="text-sm text-gray-500">Nome do Produto</label>
                <input className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1 dark:text-white" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Arroz Tipo 1" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-sm text-gray-500">Marca</label>
                    <input className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1 dark:text-white" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Ex: Tio João" />
                 </div>
                 <div>
                    <label className="text-sm text-gray-500">Unidade</label>
                    <select className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1 dark:text-white" value={unit} onChange={e => setUnit(e.target.value)}>
                        <option value="un">Unidade</option>
                        <option value="kg">Kg</option>
                        <option value="l">Litro</option>
                        <option value="pct">Pacote</option>
                    </select>
                 </div>
             </div>
             <div>
                <label className="text-sm text-gray-500">Preço Atual (Inicial)</label>
                <input type="number" className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mt-1 dark:text-white" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
             </div>
             <button onClick={() => {
                 if(!name || !price) return;
                 onSave({
                     id: Date.now().toString(),
                     name, brand, unit,
                     lastPrice: parseFloat(price),
                     category: 'Geral',
                     history: [{ date: new Date().toISOString(), price: parseFloat(price), establishment: 'Cadastro Manual', quantity: 1 }]
                 })
             }} className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4">Salvar Produto</button>
        </div>
    )
}

function ProductHistory({ product }: { product: Product }) {
    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center">
                <h2 className="text-xl font-bold dark:text-white">{product.name}</h2>
                <p className="text-gray-500">{product.brand} • {product.unit}</p>
                <div className="mt-4 text-3xl font-bold text-primary">R$ {product.lastPrice.toFixed(2)}</div>
                <p className="text-xs text-gray-400">Preço Atual</p>
            </div>
            
            <h3 className="font-bold dark:text-white px-1">Histórico de Variação</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                {product.history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div>
                            <p className="font-medium dark:text-white">R$ {h.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-gray-600 dark:text-gray-300">{h.establishment}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function Reports({ expenses, categories }: any) {
    const total = expenses.reduce((acc: number, cur: any) => acc + cur.amount, 0);
    const fixedTotal = expenses.filter((e: any) => e.isFixed).reduce((acc: any, cur: any) => acc + cur.amount, 0);
    
    // Group by Category
    const byCategory = categories.map((cat: any) => {
        const sum = expenses.filter((e: any) => e.categoryId === cat.id).reduce((acc: number, cur: any) => acc + cur.amount, 0);
        return { name: cat.name, value: sum, color: cat.color.replace('text-', 'bg-') };
    }).sort((a: any, b: any) => b.value - a.value);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-indigo-500">
                    <p className="text-xs text-gray-500">Total Fixo</p>
                    <p className="font-bold text-lg dark:text-white">R$ {fixedTotal.toFixed(2)}</p>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-orange-500">
                    <p className="text-xs text-gray-500">Total Variável</p>
                    <p className="font-bold text-lg dark:text-white">R$ {(total - fixedTotal).toFixed(2)}</p>
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold mb-4 dark:text-white">Gastos por Categoria</h3>
                <div className="space-y-4">
                    {byCategory.map((item: any) => (
                        <div key={item.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="dark:text-white">{item.name}</span>
                                <span className="text-gray-500">{total > 0 ? ((item.value/total)*100).toFixed(0) : 0}% (R$ {item.value})</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${total > 0 ? (item.value/total)*100 : 0}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <button className="w-full py-3 bg-white dark:bg-gray-800 text-primary font-medium rounded-xl shadow-sm flex justify-center items-center gap-2">
                Exportar Relatório PDF
            </button>
        </div>
    )
}
