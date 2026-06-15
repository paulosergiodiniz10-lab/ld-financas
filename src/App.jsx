import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  sendPasswordResetEmail, signOut, onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot 
} from "firebase/firestore";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDlnaN0rfER6AAOBYJJ_uvsZN5LhtnR08k",
  authDomain: "ld-financas.firebaseapp.com",
  projectId: "ld-financas",
  storageBucket: "ld-financas.firebasestorage.app",
  messagingSenderId: "624668062422",
  appId: "1:624668062422:web:ef3c197c249d0952e44f77"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = 'ld-financas';

// --- ÍCONES (Material Symbols) ---
const IconWrapper = ({ name, size = 24, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>{name}</span>
);

const Home = (p) => <IconWrapper name="home" {...p} />;
const ArrowUpCircle = (p) => <IconWrapper name="arrow_circle_up" {...p} />;
const ArrowDownCircle = (p) => <IconWrapper name="arrow_circle_down" {...p} />;
const Settings = (p) => <IconWrapper name="settings" {...p} />;
const HelpCircle = (p) => <IconWrapper name="help" {...p} />;
const LogOut = (p) => <IconWrapper name="logout" {...p} />;
const Plus = (p) => <IconWrapper name="add" {...p} />;
const Trash2 = (p) => <IconWrapper name="delete" {...p} />;
const ShieldAlert = (p) => <IconWrapper name="security" {...p} />;
const Menu = (p) => <IconWrapper name="menu" {...p} />;
const X = (p) => <IconWrapper name="close" {...p} />;
const CreditCard = (p) => <IconWrapper name="credit_card" {...p} />;
const Edit2 = (p) => <IconWrapper name="edit" {...p} />;
const Calendar = (p) => <IconWrapper name="calendar_today" {...p} />;
const Wallet = (p) => <IconWrapper name="account_balance_wallet" {...p} />;
const PlayCircle = (p) => <IconWrapper name="play_circle" {...p} />;
const Download = (p) => <IconWrapper name="download" {...p} />;
const Tag = (p) => <IconWrapper name="sell" {...p} />;
const Visibility = (p) => <IconWrapper name="visibility" {...p} />;
const VisibilityOff = (p) => <IconWrapper name="visibility_off" {...p} />;
const CardIcon = CreditCard;
const AlertTriangle = (p) => <IconWrapper name="warning" {...p} />;
const Lock = (p) => <IconWrapper name="lock" {...p} />;
const LockOpen = (p) => <IconWrapper name="lock_open" {...p} />;
const Crown = (p) => <IconWrapper name="workspace_premium" {...p} />;

// --- CONFIGURAÇÕES DO SISTEMA ---
const ADMIN_EMAIL = "paulosergiodiniz20@gmail.com";
const PAYMENT_METHODS = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência Bancária', 'Boleto', 'Outros'];

// --- UTILITÁRIOS ---
const formatNumber = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};
const capitalizeFirstLetter = (string) => string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : "";

// --- COMPONENTES BÁSICOS ---
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', icon: Icon, disabled = false }) => {
  const baseStyle = "font-medium rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-emerald-600 hover:text-emerald-600"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}{children}
    </button>
  );
};

const Input = ({ label, name, type = 'text', value, onChange, placeholder, required = false, step, rightElement, inputMode }) => {
  const handleChange = (e) => {
    let newValue = e.target.value;
    if (type === 'text' && name !== 'password' && name !== 'amount') newValue = capitalizeFirstLetter(newValue);
    if (onChange) onChange({ target: { name, value: newValue } });
  };
  return (
    <div className="flex flex-col gap-1.5 mb-4 w-full">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative w-full">
        <input
          type={type} name={name} value={value} onChange={handleChange} placeholder={placeholder} required={required} step={step} inputMode={inputMode}
          className={`w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white text-slate-800 ${rightElement ? 'pr-12' : ''}`}
        />
        {rightElement && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
    </div>
  );
};

const Select = ({ label, name, value, onChange, options, required = false }) => (
  <div className="flex flex-col gap-1.5 mb-4 w-full">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <select
      name={name} value={value} onChange={onChange} required={required}
      className="border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white text-slate-800 appearance-none"
    >
      <option value="" disabled>Selecione uma opção</option>
      {options.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
    </select>
  </div>
);

// --- TELA DE LOGIN E CADASTRO REAL ---
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({ name: '', whatsapp: '', email: '', password: '' });

  const showMsg = (text, type = 'error') => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCred.user;
        // Salva os dados extras do utilizador na base de dados
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid), {
          name: formData.name || 'Novo Usuário',
          whatsapp: formData.whatsapp,
          email: formData.email,
          plan: formData.email === ADMIN_EMAIL ? 'Admin' : 'Free',
          daysRemaining: formData.email === ADMIN_EMAIL ? 999 : 30,
          status: 'Ativo',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(error);
      let erroMsg = "Ocorreu um erro.";
      if (error.code === 'auth/email-already-in-use') erroMsg = "Este e-mail já está em uso.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') erroMsg = "E-mail ou senha incorretos.";
      if (error.code === 'auth/weak-password') erroMsg = "A senha deve ter pelo menos 6 caracteres.";
      showMsg(erroMsg, 'error');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) return showMsg("Digite o seu e-mail no campo acima primeiro.", "error");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, formData.email);
      showMsg("E-mail de recuperação enviado! Verifique a sua caixa de entrada.", "success");
    } catch (error) {
      showMsg("Erro ao enviar e-mail. Verifique se digitou corretamente.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-500 border border-slate-100">
        <div className="text-center mb-6">
           <div className="flex items-center justify-center gap-2 font-black text-2xl text-slate-800 tracking-tight mb-2">
             <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg">LD</div>FINANÇAS
           </div>
           <h2 className="text-2xl font-bold text-slate-800">{isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}</h2>
           <p className="text-slate-500 text-sm mt-1">Controle as suas finanças de onde estiver.</p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium mb-4 text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
           {!isLogin && (
             <div className="animate-in slide-in-from-top-2 duration-300">
               <Input label="Seu Nome Completo" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: João Silva" required={!isLogin} />
               <Input label="WhatsApp (com DDD)" name="whatsapp" type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} placeholder="Ex: 64999999999" required={!isLogin} />
             </div>
           )}
           
           <Input label="Seu E-mail" type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="exemplo@email.com" required />
           
           <Input 
             label="Sua Senha" type={showPassword ? 'text' : 'password'} name="password" 
             value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
             placeholder="••••••••" required 
             rightElement={
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors">
                 {showPassword ? <VisibilityOff size={20} /> : <Visibility size={20} />}
               </button>
             }
           />

           {isLogin && (
             <div className="flex justify-end mt-[-8px] mb-4">
               <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Esqueci a minha senha</button>
             </div>
           )}

           <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm mt-4 active:scale-[0.98]">
             {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
           </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
            <button type="button" onClick={() => {setIsLogin(!isLogin); setMessage({type:'', text:''});}} className="font-bold text-emerald-600 hover:text-emerald-700">
              {isLogin ? "Crie uma agora." : "Faça login."}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- PAINEL PRINCIPAL (DASHBOARD REAL) ---
function DashboardApp({ userProfile }) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados dos Dados que virão do Firebase
  const [transactions, setTransactions] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState(['Outros']);
  const [expenseCategories, setExpenseCategories] = useState(['Outros']);
  const [adminUsers, setAdminUsers] = useState([]);

  // Filtros
  const [filterPeriod, setFilterPeriod] = useState('month'); 
  const [filterCategory, setFilterCategory] = useState('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');

  // Modais e Formulários
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], category: '', customDescription: '', paymentMethod: PAYMENT_METHODS[0] });
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, type: 'income', originalName: '', currentName: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isAlert: false });
  const [editingAdminUser, setEditingAdminUser] = useState(null);

  const openConfirm = (title, message, onConfirm, isAlert = false) => setConfirmDialog({ isOpen: true, title, message, onConfirm, isAlert });
  const closeConfirm = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isAlert: false });

  // CONSTANTES DERIVADAS DO PERFIL (Para saber se é o Dono do Sistema)
  const isAdmin = userProfile?.email === ADMIN_EMAIL || userProfile?.plan === 'Admin';

  // BUSCA DADOS DO FIREBASE EM TEMPO REAL
  useEffect(() => {
    if (!userProfile?.uid) return;

    // Segurança extra: se a view for admin e o usuário não for admin, volta pro início
    if (currentView === 'admin' && !isAdmin) {
      setCurrentView('dashboard');
    }

    // Puxa Lançamentos
    const txRef = collection(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions');
    const unsubTx = onSnapshot(txRef, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTransactions(data);
    }, (error) => console.error(error));

    // Puxa Categorias
    const catRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'settings', 'categories');
    const unsubCat = onSnapshot(catRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setIncomeCategories(data.income || ['Outros']);
            setExpenseCategories(data.expense || ['Outros']);
        } else {
            // Cria arquivo de categorias padrão
            setDoc(catRef, { income: ['Serviço', 'Venda', 'Outros'], expense: ['Alimentação', 'Moradia', 'Transporte', 'Outros'] });
        }
    }, (error) => console.error(error));

    // Se for ADMIN, puxa todos os clientes
    let unsubUsers = () => {};
    if (isAdmin) {
        const usersRef = collection(db, 'artifacts', APP_ID, 'users');
        unsubUsers = onSnapshot(usersRef, (snapshot) => {
             const data = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
             setAdminUsers(data);
        });
    }

    return () => { unsubTx(); unsubCat(); unsubUsers(); }
  }, [userProfile?.uid, isAdmin, currentView]);

  const handleLogout = () => {
    openConfirm('Sair do Sistema', 'Tem certeza que deseja encerrar a sua sessão?', () => {
      signOut(auth);
      closeConfirm();
    });
  };

  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      let cat = transaction.category;
      let customDesc = '';
      const match = cat.match(/^(.*) \((.*)\)$/);
      if (match && match[1].toLowerCase().includes('outros')) {
        cat = match[1]; customDesc = match[2];
      }
      setFormData({ amount: transaction.amount, type: transaction.type, date: transaction.date, category: cat, customDescription: customDesc, paymentMethod: transaction.paymentMethod });
      setEditingId(transaction.id);
    } else {
      setFormData({ amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], category: expenseCategories[0] || '', customDescription: '', paymentMethod: PAYMENT_METHODS[0] });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleTypeToggle = (newType) => setFormData(prev => ({ ...prev, type: newType, category: newType === 'income' ? (incomeCategories[0] || '') : (expenseCategories[0] || ''), customDescription: '' }));

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) return;
    
    let finalCategory = formData.category;
    if (formData.category.toLowerCase().includes('outros') && formData.customDescription.trim()) {
       finalCategory = `${formData.category} (${formData.customDescription.trim()})`;
    }
    
    let amountStr = formData.amount.toString().trim().replace(/[^\d.,]/g, '');
    if (amountStr.includes(',')) amountStr = amountStr.replace(/\./g, '').replace(',', '.'); 
    let parsedAmount = parseFloat(amountStr) || 0;
    let finalAmount = Math.round(parsedAmount * 100) / 100;

    const idToSave = editingId || Date.now().toString();
    const newTx = { 
        amount: finalAmount, type: formData.type, date: formData.date, 
        category: finalCategory, paymentMethod: formData.paymentMethod, updatedAt: new Date().toISOString()
    };
    
    // SALVAR NO FIREBASE
    const txRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions', idToSave);
    await setDoc(txRef, newTx);
    
    handleCloseModal();
  };

  const requestDeleteTransaction = (id) => {
    openConfirm('Excluir Lançamento', 'Tem certeza que deseja excluir? Isso afetará o seu saldo.', async () => {
        // DELETAR DO FIREBASE
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions', id));
        closeConfirm();
    });
  };

  const handleOpenCategoryModal = (type, categoryName = null) => {
    setCategoryModal({ isOpen: true, type: type, originalName: categoryName || '', currentName: categoryName || '' });
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const { originalName, currentName, type } = categoryModal;
    const trimmedName = currentName.trim();
    if (!trimmedName) return;
    
    let updatedIncomes = [...incomeCategories];
    let updatedExpenses = [...expenseCategories];

    if (type === 'income') {
      if (originalName) updatedIncomes = updatedIncomes.map(c => c === originalName ? trimmedName : c);
      else if (!updatedIncomes.includes(trimmedName)) updatedIncomes.push(trimmedName);
    } else {
      if (originalName) updatedExpenses = updatedExpenses.map(c => c === originalName ? trimmedName : c);
      else if (!updatedExpenses.includes(trimmedName)) updatedExpenses.push(trimmedName);
    }
    
    // SALVA CATEGORIAS NO FIREBASE
    const catRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'settings', 'categories');
    await setDoc(catRef, { income: updatedIncomes, expense: updatedExpenses }, { merge: true });
    
    setCategoryModal({ isOpen: false, type: 'income', originalName: '', currentName: '' });
  };

  const requestDeleteCategory = (categoryName, type) => {
    openConfirm('Excluir Categoria', `Tem certeza que deseja excluir "${categoryName}"?`, async () => {
        let updatedIncomes = [...incomeCategories];
        let updatedExpenses = [...expenseCategories];
        
        if (type === 'income') updatedIncomes = updatedIncomes.filter(c => c !== categoryName);
        else updatedExpenses = updatedExpenses.filter(c => c !== categoryName);

        const catRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'settings', 'categories');
        await setDoc(catRef, { income: updatedIncomes, expense: updatedExpenses }, { merge: true });
        closeConfirm();
    });
  };

  // Funções Diretas do Painel Administrativo
  const handleToggleUserStatus = async (user) => {
    const isCurrentlyActive = user.status === 'Ativo';
    const userRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
    // Bloqueia ou Ativa instantaneamente sem perguntar
    await setDoc(userRef, { status: isCurrentlyActive ? 'Bloqueado' : 'Ativo' }, { merge: true });
  };

  const handleDeleteAdminUser = (user) => {
    openConfirm('Excluir Empresa', `Tem certeza que deseja excluir a conta de "${user.name}" permanentemente? Todos os dados dele serão apagados.`, async () => {
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid));
        closeConfirm();
    });
  };

  const handleSaveAdminUser = async (e) => {
    e.preventDefault();
    if (!editingAdminUser) return;
    const userRef = doc(db, 'artifacts', APP_ID, 'users', editingAdminUser.uid);
    await setDoc(userRef, { 
        plan: editingAdminUser.plan,
        daysRemaining: parseInt(editingAdminUser.daysRemaining) || 0
    }, { merge: true });
    setEditingAdminUser(null);
  };

  const filteredTransactions = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    let filtered = transactions.filter(tx => {
      if (filterPeriod === 'all') return true;
      const txTime = new Date(tx.date + 'T00:00:00').getTime();
      if (filterPeriod === 'today') return tx.date === today.toISOString().split('T')[0];
      if (filterPeriod === '15days') {
         const past = new Date(today); past.setDate(today.getDate() - 15);
         return txTime >= past.getTime() && txTime <= today.getTime();
      }
      if (filterPeriod === 'month') {
         const start = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
         const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).getTime();
         return txTime >= start && txTime <= end;
      }
      if (filterPeriod === 'custom') {
         if (!customDateStart || !customDateEnd) return true; 
         const start = new Date(customDateStart + 'T00:00:00').getTime();
         const end = new Date(customDateEnd + 'T23:59:59').getTime();
         return txTime >= start && txTime <= end;
      }
      return true;
    });
    if (filterCategory !== 'all') filtered = filtered.filter(tx => tx.category === filterCategory);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
  }, [transactions, filterPeriod, customDateStart, customDateEnd, filterCategory]);

  const usedCategoriesInPeriod = useMemo(() => Array.from(new Set(filteredTransactions.map(tx => tx.category))).filter(Boolean), [filteredTransactions]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return; 
    const headers = ['Data', 'Tipo', 'Descrição (Categoria)', 'Forma de Pagamento', 'Valor'];
    const rows = filteredTransactions.map(tx => [formatDate(tx.date), tx.type === 'income' ? 'Entrada' : 'Saída', tx.category || '-', tx.paymentMethod || '-', formatCurrency(tx.amount)]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Extrato_${filterCategory !== 'all' ? filterCategory : 'Completo'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const renderDashboard = () => {
    const totals = filteredTransactions.reduce((acc, curr) => {
      const val = parseFloat(curr.amount) || 0;
      if (curr.type === 'income') acc.income += val;
      if (curr.type === 'expense') acc.expense += val;
      return acc;
    }, { income: 0, expense: 0 });
    const balance = totals.income - totals.expense;
    const recent = filteredTransactions.slice(0, 8); 
    
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

    const incomePaymentData = incomeTransactions.reduce((acc, tx) => { acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + parseFloat(tx.amount); return acc; }, {});
    const sortedIncomePayments = Object.entries(incomePaymentData).sort((a, b) => b[1] - a[1]);

    const expensePaymentData = expenseTransactions.reduce((acc, tx) => { acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + parseFloat(tx.amount); return acc; }, {});
    const sortedExpensePayments = Object.entries(expensePaymentData).sort((a, b) => b[1] - a[1]);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Painel Principal</h2></header>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-white p-2 rounded-xl border border-slate-200 flex gap-2 overflow-x-auto scrollbar-hide shadow-sm flex-1">
            {['all', 'today', '15days', 'month', 'custom'].map(period => (
              <button key={period} onClick={() => setFilterPeriod(period)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterPeriod === period ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                {period === 'all' && 'Todos'} {period === 'today' && 'Hoje'} {period === '15days' && '15 dias'} {period === 'month' && 'Este Mês'} {period === 'custom' && 'Personalizado'}
              </button>
            ))}
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0 min-w-[200px]">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none p-2">
              <option value="all">Todas as Categorias</option>
              {usedCategoriesInPeriod.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {filterPeriod === 'custom' && (
           <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
             <Input label="Data Inicial" type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} />
             <Input label="Data Final" type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} />
           </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 border-none shadow-md bg-slate-800 text-white">
            <p className="font-bold mb-1 text-slate-300 uppercase text-xs tracking-wider">Saldo do Período</p>
            <h3 className={`text-3xl font-black ${balance < 0 ? 'text-red-400' : 'text-white'}`}>{balance < 0 ? `-R$ ${formatNumber(Math.abs(balance))}` : `R$ ${formatNumber(balance)}`}</h3>
          </Card>
          <Card className="p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <p className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider">Entradas</p>
            <h3 className="text-2xl font-bold text-emerald-600">R$ {formatNumber(totals.income)}</h3>
          </Card>
          <Card className="p-6 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <p className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider">Saídas</p>
            <h3 className="text-2xl font-bold text-red-600">R$ {formatNumber(totals.expense)}</h3>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
           <div className="space-y-6">
             <Card className="p-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><CreditCard className="text-emerald-500" size={20}/> Formas de Pagamento (Entradas)</h3>
                {sortedIncomePayments.length > 0 ? (
                  <div className="space-y-5">
                    {sortedIncomePayments.map(([method, val]) => {
                      const percent = ((val / totals.income) * 100).toFixed(1);
                      return (
                        <div key={method}>
                          <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-slate-700">{method}</span><span className="font-bold text-slate-800 text-emerald-600">+R$ {formatNumber(val)} <span className="text-slate-400 font-normal text-xs ml-1">({percent}%)</span></span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div></div>
                        </div>
                      )
                    })}
                  </div>
                ) : (<p className="text-sm text-slate-500 text-center py-4">Nenhuma entrada registrada.</p>)}
             </Card>
             <Card className="p-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><CreditCard className="text-red-500" size={20}/> Formas de Pagamento (Saídas)</h3>
                {sortedExpensePayments.length > 0 ? (
                  <div className="space-y-5">
                    {sortedExpensePayments.map(([method, val]) => {
                      const percent = ((val / totals.expense) * 100).toFixed(1);
                      return (
                        <div key={method}>
                          <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-slate-700">{method}</span><span className="font-bold text-slate-800 text-red-600">-R$ {formatNumber(val)} <span className="text-slate-400 font-normal text-xs ml-1">({percent}%)</span></span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div></div>
                        </div>
                      )
                    })}
                  </div>
                ) : (<p className="text-sm text-slate-500 text-center py-4">Nenhuma saída registrada.</p>)}
             </Card>
           </div>
           <Card className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar className="text-blue-500" size={20}/> Atividade Recente</h3>
                <button onClick={() => setCurrentView('transactions')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Ver tudo</button>
              </div>
              <div className="space-y-4 flex-1">
                {recent.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{tx.type === 'income' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}</div>
                      <div className="min-w-0"><p className="font-bold text-slate-800 text-sm truncate">{tx.category}</p><p className="text-xs text-slate-500 truncate">{formatDate(tx.date)} &bull; {tx.paymentMethod}</p></div>
                    </div>
                    <div className={`font-bold text-sm shrink-0 pl-4 ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{tx.type === 'income' ? `+R$ ${formatNumber(tx.amount)}` : `-R$ ${formatNumber(tx.amount)}`}</div>
                  </div>
                ))}
                {recent.length === 0 && <div className="text-center py-12 h-full flex items-center justify-center border border-dashed border-slate-200 rounded-xl"><p className="text-slate-500 font-medium">Nenhuma atividade recente.</p></div>}
              </div>
           </Card>
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Lançamentos</h2><p className="text-slate-500 text-sm mt-1">Gerencie todas as suas entradas e saídas.</p></div>
          <div className="flex gap-2 w-full sm:w-auto"><Button onClick={handleExportCSV} variant="outline" className="flex-1 sm:flex-none bg-white" icon={Download}>Excel</Button><Button onClick={() => handleOpenModal()} icon={Plus} className="flex-1 sm:flex-none">Novo Lançamento</Button></div>
        </header>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="bg-white p-2 rounded-xl border border-slate-200 flex gap-2 overflow-x-auto scrollbar-hide shadow-sm flex-1">
            {['all', 'today', '15days', 'month', 'custom'].map(period => (
              <button key={period} onClick={() => setFilterPeriod(period)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterPeriod === period ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                {period === 'all' && 'Todos'} {period === 'today' && 'Hoje'} {period === '15days' && 'Últimos 15 dias'} {period === 'month' && 'Este Mês'} {period === 'custom' && 'Personalizado'}
              </button>
            ))}
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0 min-w-[200px] flex items-center">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none px-2 cursor-pointer">
              <option value="all">Todas as Categorias</option>
              {usedCategoriesInPeriod.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
        {filterPeriod === 'custom' && (
           <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
             <Input label="Data Inicial" type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} />
             <Input label="Data Final" type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} />
           </div>
        )}
        <div className="space-y-3">
            {filteredTransactions.map(tx => (
              <Card key={tx.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group border-l-4 ${tx.type === 'income' ? 'border-l-emerald-500 hover:border-emerald-200' : 'border-l-red-500 hover:border-red-200'}`}>
                <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-base truncate">{tx.category}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <p className="text-sm text-slate-500 flex items-center gap-1 shrink-0"><Calendar size={14}/> {formatDate(tx.date)}</p>
                      <span className="hidden sm:flex text-xs items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"><CardIcon size={12}/> {tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0">
                  <div className={`font-bold text-lg ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{tx.type === 'income' ? `+R$ ${formatNumber(tx.amount)}` : `-R$ ${formatNumber(tx.amount)}`}</div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleOpenModal(tx)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={18}/></button>
                    <button onClick={() => requestDeleteTransaction(tx.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredTransactions.length === 0 && <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200"><p className="text-slate-500 font-medium">Nenhum lançamento encontrado neste filtro.</p></div>}
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Categorias</h2><p className="text-slate-500 mt-1">Crie as "gavetas" onde os seus lançamentos serão guardados.</p></header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-lg text-emerald-700 flex items-center gap-2"><ArrowUpCircle size={20}/> Entradas</h3>
            <button onClick={() => handleOpenCategoryModal('income')} className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 flex items-center gap-1"><Plus size={16}/> Nova</button>
          </div>
          <div className="space-y-2">
            {incomeCategories.map(cat => (
              <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 transition-colors">
                <span className="font-medium text-slate-700">{cat}</span>
                {cat.toLowerCase() === 'outros' ? <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-200 text-slate-500">Padrão</span> : (
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenCategoryModal('income', cat)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"><Edit2 size={16}/></button>
                    <button onClick={() => requestDeleteCategory(cat, 'income')} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md"><Trash2 size={16}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-lg text-red-600 flex items-center gap-2"><ArrowDownCircle size={20}/> Saídas</h3>
            <button onClick={() => handleOpenCategoryModal('expense')} className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 flex items-center gap-1"><Plus size={16}/> Nova</button>
          </div>
          <div className="space-y-2">
            {expenseCategories.map(cat => (
              <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100 transition-colors">
                <span className="font-medium text-slate-700">{cat}</span>
                {cat.toLowerCase() === 'outros' ? <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-200 text-slate-500">Padrão</span> : (
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenCategoryModal('expense', cat)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md"><Edit2 size={16}/></button>
                    <button onClick={() => requestDeleteCategory(cat, 'expense')} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md"><Trash2 size={16}/></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto md:mx-0">
      <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Suporte e Ajuda</h2></header>
      <Card className="bg-emerald-50/50 border border-emerald-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4"><div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"><span className="material-symbols-outlined text-3xl">support_agent</span></div><div><h3 className="text-emerald-800 font-bold text-xl mb-1">Fale com um Humano</h3><p className="text-emerald-600/80 font-medium text-sm">Atendimento seg. a sex. das 09h às 18h</p></div></div>
          <div className="w-full md:w-auto"><p className="text-slate-600 mb-4 font-medium md:max-w-[300px]">Precisa de ajuda para usar o sistema, relatar um problema ou reativar o seu plano? Clique no botão para chamar a nossa equipa técnica.</p><a href="https://wa.me/5564981005505?text=Olá, preciso de suporte no LD Finanças." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-700 shadow-sm transition-colors"><span className="material-symbols-outlined">chat</span> Chamar Suporte</a></div>
        </div>
      </Card>
      <div className="mt-10"><h3 className="font-bold text-slate-800 text-lg mb-4">Dúvidas Frequentes</h3><div className="space-y-3"><Card className="p-5 hover:border-emerald-200 transition-colors border-l-4 border-l-emerald-500 shadow-sm"><h4 className="font-bold text-slate-800 mb-2">O meu plano expirou, como renovar?</h4><p className="text-slate-600 text-sm">Aceda ao separador <b>"Meu Plano"</b> e clique em <b>"Renovar Assinatura"</b>. Será direcionado para o nosso WhatsApp para reativar o seu acesso na hora!</p></Card><Card className="p-5 hover:border-slate-300 transition-colors"><h4 className="font-bold text-slate-800 mb-2">Os meus dados estão seguros?</h4><p className="text-slate-600 text-sm">Sim! Os seus dados são guardados no Firebase da Google em tempo real. Pode aceder de qualquer telemóvel ou computador.</p></Card></div></div>
    </div>
  );

  const renderTutorial = () => (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Como Funciona</h2><p className="text-slate-500 mt-1">Um passo a passo simples para dominar o sistema.</p></header>
      <div className="space-y-4">
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-emerald-400"><div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">1</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Cadastre as suas Categorias</h3><p className="text-slate-600">Aceda ao separador "Categorias" e crie os nomes dos seus tipos de despesas e receitas.</p></div></Card>
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-blue-400"><div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">2</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Registe as Movimentações</h3><p className="text-slate-600">Vá a "Lançamentos" &gt; "Novo Lançamento". Selecione a categoria e guarde.</p></div></Card>
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-purple-400"><div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">3</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Acompanhe e Exporte</h3><p className="text-slate-600">Use os botões de Filtro para ver o Mês. Em Lançamentos, clique em "Excel" para exportar.</p></div></Card>
      </div>
    </div>
  );

  const renderPlans = () => {
    // SE FOR O ADMINISTRADOR, MOSTRA O PAINEL VIP DOURADO VITALÍCIO
    if (isAdmin) {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Meu Plano</h2><p className="text-slate-500 mt-1">Gerencie a sua assinatura do LD Finanças.</p></header>
          <Card className="p-6 sm:p-8 max-w-3xl border-t-4 border-t-amber-500 bg-amber-50/10">
            <div className="flex items-center justify-between border-b border-amber-100 pb-6 mb-6">
                <div>
                  <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Crown size={16} className="text-amber-500" /> Plano Atual
                  </p>
                  <h3 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                    Admin
                  </h3>
                </div>
                <div className="text-right">
                  <span className={`inline-block font-bold px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700 border border-amber-200 shadow-sm`}>
                    Ativo
                  </span>
                  <p className="text-sm text-slate-500 mt-2 font-bold tracking-wide uppercase">Vitalício</p>
                </div>
            </div>
            <div className="text-center py-6">
               <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
                  <Crown size={40} />
               </div>
               <h4 className="text-xl font-bold text-slate-800 mb-2">Conta de Administrador</h4>
               <p className="text-slate-600 max-w-md mx-auto">Você tem acesso ilimitado e vitalício ao sistema, incluindo o painel de gestão de todos os clientes.</p>
            </div>
          </Card>
        </div>
      );
    }

    // SE FOR UM CLIENTE NORMAL, MOSTRA O PAINEL VERDE COM DIAS RESTANTES
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Meu Plano</h2><p className="text-slate-500 mt-1">Gerencie a sua assinatura do LD Finanças.</p></header>
        <Card className="p-6 sm:p-8 max-w-3xl border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-6">
              <div><p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Plano Atual</p><h3 className="text-3xl font-black text-slate-800">{userProfile.plan}</h3></div>
              <div className="text-right"><span className={`inline-block font-bold px-3 py-1 rounded-full text-sm ${userProfile.daysRemaining > 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{userProfile.daysRemaining > 0 ? 'Ativo' : 'Expirado'}</span><p className="text-sm text-slate-500 mt-2 font-medium">{userProfile.daysRemaining > 900 ? 'Vitalício' : `${userProfile.daysRemaining} dias restantes`}</p></div>
          </div>
          <div className="space-y-6">
              <h4 className="font-bold text-slate-800 text-lg">Atualizar Assinatura</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`border-2 rounded-xl p-5 relative transition-all border-emerald-500 bg-emerald-50/20 shadow-md`}>
                  <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">Atual</div>
                  <h5 className="font-bold text-slate-800 text-xl mb-1">Plano Pro</h5><p className="text-slate-500 text-sm mb-4 h-10">Acesso completo ao sistema e atualizações.</p><p className="text-2xl font-black text-emerald-600 mb-6">R$ 10,00<span className="text-sm font-normal text-slate-500">/mês</span></p>
                  <Button className="w-full" onClick={() => window.open('https://wa.me/5564981005505?text=Olá, quero renovar meu plano do LD Finanças!', '_blank')}>Renovar no WhatsApp</Button>
                </div>
              </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderAdmin = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Painel Administrativo</h2><p className="text-slate-500 mt-1">Visão geral dos clientes do SaaS.</p></header>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-bold text-slate-500"><th className="p-4 whitespace-nowrap">Usuário</th><th className="p-4 whitespace-nowrap">WhatsApp</th><th className="p-4 whitespace-nowrap">Plano</th><th className="p-4 whitespace-nowrap">Dias</th><th className="p-4 whitespace-nowrap">Status</th><th className="p-4 whitespace-nowrap">Ações</th></tr></thead>
          <tbody className="text-sm">
            {adminUsers.map(user => {
              const isThisUserAdmin = user.email === ADMIN_EMAIL || user.plan === 'Admin';
              const displayPlan = isThisUserAdmin ? 'Admin' : user.plan;
              const displayDays = isThisUserAdmin || user.daysRemaining > 900 ? 'Vitalício' : `${user.daysRemaining} d`;

              return (
                <tr key={user.uid} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4"><p className="font-bold text-slate-800 whitespace-nowrap">{user.name}</p><p className="text-slate-500 text-xs">{user.email}</p></td>
                  <td className="p-4 text-slate-500 whitespace-nowrap">{user.whatsapp || '-'}</td>
                  <td className="p-4"><span className={`font-bold px-2 py-1 rounded text-xs uppercase shadow-sm ${isThisUserAdmin ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-700'}`}>{displayPlan}</span></td>
                  <td className="p-4 font-medium text-slate-800">{displayDays}</td>
                  <td className="p-4">
                    {user.status === 'Ativo' 
                      ? <span className="text-emerald-700 bg-emerald-50 font-bold px-2 py-1 rounded text-xs uppercase">Ativo</span>
                      : <span className="text-red-700 bg-red-50 font-bold px-2 py-1 rounded text-xs uppercase">Bloqueado</span>
                    }
                  </td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => handleToggleUserStatus(user)} disabled={isThisUserAdmin} className={`p-2 rounded-lg transition-colors border disabled:opacity-30 disabled:cursor-not-allowed ${user.status === 'Ativo' ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`} title={user.status === 'Ativo' ? "Bloquear" : "Ativar"}>
                      {user.status === 'Ativo' ? <Lock size={16} /> : <LockOpen size={16} />}
                    </button>
                    <button onClick={() => setEditingAdminUser(user)} className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors" title="Editar Plano">
                      <Edit2 size={16}/>
                    </button>
                    <button onClick={() => handleDeleteAdminUser(user)} disabled={isThisUserAdmin} className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Excluir">
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              )
            })}
            {adminUsers.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">A carregar clientes...</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  const NavItem = ({ id, icon: Icon, label }) => {
    const isActive = currentView === id;
    
    // VISUAL DO BOTÃO ADMIN DESTACADO NO MENU LATERAL
    if (id === 'admin' && isAdmin) {
      return (
        <button onClick={() => { setCurrentView(id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold ${isActive ? 'bg-slate-800 text-white shadow-md shadow-slate-800/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
          <ShieldAlert size={20} className={isActive ? 'text-amber-400' : 'text-slate-400'} />{label}
        </button>
      );
    }

    return (
      <button onClick={() => { setCurrentView(id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}>
        <Icon size={20} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />{label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 md:flex font-sans text-slate-900">
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm"><div className="flex items-center gap-2 font-black text-xl text-slate-800 tracking-tight"><div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm">LD</div>FINANÇAS</div><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 bg-slate-50 rounded-xl active:bg-slate-100">{isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}</button></div>
      <aside className={`fixed md:sticky top-0 left-0 h-[100dvh] w-72 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 hidden md:flex items-center gap-2 font-black text-2xl text-slate-800 tracking-tight border-b border-slate-100"><div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg">LD</div>FINANÇAS</div>
        <div className="p-4 flex-1 space-y-1 overflow-y-auto mt-4 md:mt-0">
          <NavItem id="dashboard" icon={Home} label="Início" />
          <NavItem id="transactions" icon={Wallet} label="Lançamentos" />
          <NavItem id="categories" icon={Tag} label="Categorias" />
          <NavItem id="plans" icon={CreditCard} label="Meu Plano" />
          <NavItem id="tutorial" icon={PlayCircle} label="Como Funciona" />
          <NavItem id="support" icon={HelpCircle} label="Suporte" />
          
          {/* SEPARAÇÃO VISUAL DO MENU ADMIN */}
          {isAdmin && (
            <div className="pt-4 mt-6 border-t border-slate-100">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gestão do SaaS</p>
              <NavItem id="admin" icon={ShieldAlert} label="Administração" />
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="font-bold text-slate-800 text-sm truncate">{userProfile.name}</p><p className="text-xs text-slate-500 truncate mt-0.5">{userProfile.email}</p><div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${isAdmin ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-emerald-600 bg-emerald-50'}`}>{isAdmin ? 'Admin' : userProfile.plan}</span><span className="text-xs font-medium text-slate-500">{isAdmin || userProfile.daysRemaining > 900 ? 'Vitalício' : `${userProfile.daysRemaining} dias`}</span></div></div>
          <button type="button" onClick={handleLogout} className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-red-600 rounded-xl text-sm hover:bg-red-50 hover:border-red-100 font-bold transition-colors"><LogOut size={16} /> Sair do Sistema</button>
        </div>
      </aside>
      {isMobileMenuOpen && (<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />)}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 pb-24 overflow-x-hidden">
        {userProfile.status === 'Bloqueado' ? (
          <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-3xl shadow-xl border border-red-100 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Acesso Restrito</h2>
            <p className="text-slate-600 mb-8 font-medium">A sua conta foi bloqueada temporariamente ou a sua assinatura expirou.</p>
            
            <div className="space-y-3">
              <a href="https://wa.me/5564981005505?text=Olá, o meu acesso ao LD Finanças está bloqueado. Pode ajudar-me?" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-bold px-6 py-4 rounded-xl hover:bg-emerald-700 shadow-sm transition-colors active:scale-[0.98]">
                <span className="material-symbols-outlined">chat</span> Falar com Suporte (WhatsApp)
              </a>
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-700 font-bold px-6 py-4 rounded-xl hover:bg-slate-200 transition-colors active:scale-[0.98]">
                <LogOut size={20} /> Sair da Conta
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && renderDashboard()}{currentView === 'transactions' && renderTransactions()}{currentView === 'categories' && renderCategories()}{currentView === 'support' && renderSupport()}{currentView === 'plans' && renderPlans()}{currentView === 'tutorial' && renderTutorial()}{currentView === 'admin' && renderAdmin()}
          </>
        )}
      </main>

      {/* MODAL DE LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex items-center justify-between z-20"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">{formData.type === 'income' ? <ArrowUpCircle className="text-emerald-500"/> : <ArrowDownCircle className="text-red-500"/>}{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3><button onClick={handleCloseModal} className="p-2 text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button></div>
             <div className="p-6">
                <form onSubmit={handleSaveTransaction}>
                  <div className="flex bg-slate-100 p-1 rounded-xl mb-6"><button type="button" onClick={() => handleTypeToggle('income')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Entrada (+)</button><button type="button" onClick={() => handleTypeToggle('expense')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}>Saída (-)</button></div>
                  <Select label="Categoria" name="category" value={formData.category} onChange={handleFormChange} required options={formData.type === 'income' ? incomeCategories : expenseCategories} />
                  {formData.category.toLowerCase().includes('outros') && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input label="O que foi? (Breve descrição)" name="customDescription" value={formData.customDescription} onChange={handleFormChange} placeholder="Ex: Feira, Assinatura de Revista..." required />
                    </div>
                  )}
                  <Input label="Valor (R$)" name="amount" type="text" inputMode="decimal" value={formData.amount} onChange={handleFormChange} placeholder="0,00" required />
                  <Select label="Forma de Pagamento" name="paymentMethod" value={formData.paymentMethod} onChange={handleFormChange} options={PAYMENT_METHODS} required />
                  <Input label="Data" name="date" type="date" value={formData.date} onChange={handleFormChange} required />
                  <div className="mt-8 flex gap-3"><button type="button" onClick={handleCloseModal} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className={`flex-1 py-3 px-4 font-bold rounded-xl text-white transition-colors shadow-sm ${formData.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>{editingId ? 'Salvar' : 'Confirmar'}</button></div>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* MODAL DE CATEGORIA */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCategoryModal({ ...categoryModal, isOpen: false })}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Tag className="text-slate-400" size={24}/>{categoryModal.originalName ? 'Editar Categoria' : 'Nova Categoria'}</h3><button onClick={() => setCategoryModal({ ...categoryModal, isOpen: false })} className="p-2 text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button></div>
             <form onSubmit={handleSaveCategory} className="p-6">
                <Input label="Nome da Categoria" name="currentName" value={categoryModal.currentName} onChange={(e) => setCategoryModal({...categoryModal, currentName: e.target.value})} placeholder="Ex: Aluguel" required />
                <div className="mt-6 flex gap-3"><button type="button" onClick={() => setCategoryModal({ ...categoryModal, isOpen: false })} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className="flex-1 py-3 px-4 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm">{categoryModal.originalName ? 'Atualizar' : 'Salvar'}</button></div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PLANO DO CLIENTE (ADMIN) */}
      {editingAdminUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingAdminUser(null)}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ShieldAlert className="text-slate-400" size={24}/>Alterar Plano</h3><button onClick={() => setEditingAdminUser(null)} className="p-2 text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button></div>
             <form onSubmit={handleSaveAdminUser} className="p-6">
                <Select label="Plano do Cliente" name="plan" value={editingAdminUser.plan} onChange={(e) => setEditingAdminUser({...editingAdminUser, plan: e.target.value})} options={['Free', 'Pro', 'Admin']} required />
                <Input label="Dias Restantes (999 para Vitalício)" name="daysRemaining" type="number" value={editingAdminUser.daysRemaining} onChange={(e) => setEditingAdminUser({...editingAdminUser, daysRemaining: e.target.value})} placeholder="Ex: 30" required />
                <div className="mt-6 flex gap-3"><button type="button" onClick={() => setEditingAdminUser(null)} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className="flex-1 py-3 px-4 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm">Salvar Alterações</button></div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO (LIXEIRA, BLOQUEIO, ETC) */}
      {confirmDialog.isOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeConfirm}></div>
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmDialog.isAlert ? 'bg-orange-100 text-orange-500' : 'bg-red-100 text-red-500'}`}><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmDialog.title}</h3><p className="text-slate-600 mb-8">{confirmDialog.message}</p>
              <div className="flex gap-3">
                {!confirmDialog.isAlert && <button onClick={closeConfirm} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button>}
                <button onClick={confirmDialog.onConfirm} className={`flex-1 py-3 px-4 font-bold rounded-xl text-white transition-colors ${confirmDialog.isAlert ? 'bg-slate-800 hover:bg-slate-900' : 'bg-red-600 hover:bg-red-700'}`}>{confirmDialog.isAlert ? 'Entendi' : 'Confirmar'}</button>
              </div>
            </div>
         </div>
      )}
    </div>
  );
}

// --- APP PRINCIPAL (CONTROLE DE SESSÃO) ---
export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (user) {
        // Busca o perfil do utilizador ligado no Firestore
        const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
        const unsubProfile = onSnapshot(docRef, (docSnap) => {
           if(docSnap.exists()) {
              setUserProfile({ uid: user.uid, ...docSnap.data() });
           } else {
              // Se por algum motivo não encontrar perfil, cria um básico
              const basicProfile = { name: 'Utilizador', email: user.email, plan: 'Free', daysRemaining: 30, status: 'Ativo' };
              setDoc(docRef, basicProfile);
              setUserProfile({ uid: user.uid, ...basicProfile });
           }
           setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-emerald-600 font-bold text-xl animate-pulse flex items-center gap-2">
           <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg">LD</div> A carregar...
        </div>
      </div>
    );
  }

  if (!authUser || !userProfile) {
    return <Auth />;
  }

  return <DashboardApp userProfile={userProfile} />;
}
