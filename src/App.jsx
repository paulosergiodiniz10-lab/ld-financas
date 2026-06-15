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
const Receipt = (p) => <IconWrapper name="receipt_long" {...p} />;
const CheckCircle = (p) => <IconWrapper name="check_circle" {...p} />;
const PendingIcon = (p) => <IconWrapper name="pending_actions" {...p} />;

// --- CONFIGURAÇÕES DO SISTEMA ---
const ADMIN_EMAIL = "paulosergiodiniz20@gmail.com";
const PAYMENT_METHODS = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência Bancária', 'Boleto', 'Outros'];

const MONTHS_OPTIONS = [
  { val: '0', label: 'Janeiro' }, { val: '1', label: 'Fevereiro' }, { val: '2', label: 'Março' },
  { val: '3', label: 'Abril' }, { val: '4', label: 'Maio' }, { val: '5', label: 'Junho' },
  { val: '6', label: 'Julho' }, { val: '7', label: 'Agosto' }, { val: '8', label: 'Setembro' },
  { val: '9', label: 'Outubro' }, { val: '10', label: 'Novembro' }, { val: '11', label: 'Dezembro' }
];

const YEARS_OPTIONS = Array.from({length: 10}, (_, i) => new Date().getFullYear() - 2 + i);

// --- UTILITÁRIOS ---
const formatNumber = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

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

const Input = ({ label, name, type = 'text', value, onChange, placeholder, required = false, step, rightElement, inputMode, min, max }) => {
  const handleChange = (e) => {
    let newValue = e.target.value;
    if (onChange) onChange({ target: { name, value: newValue } });
  };
  return (
    <div className="flex flex-col gap-1.5 mb-4 w-full">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative w-full">
        <input
          type={type} name={name} value={value} onChange={handleChange} placeholder={placeholder} required={required} step={step} inputMode={inputMode} min={min} max={max}
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

  // Estados dos Dados
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState(['Outros']);
  const [expenseCategories, setExpenseCategories] = useState(['Outros']);
  const [adminUsers, setAdminUsers] = useState([]);

  // Filtros
  const [filterPeriod, setFilterPeriod] = useState('month'); 
  const [filterCategory, setFilterCategory] = useState('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  
  // Novos Filtros por Mês Específico
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], category: '', customDescription: '', paymentMethod: PAYMENT_METHODS[0] });
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, type: 'income', originalName: '', currentName: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isAlert: false });
  const [adminEditModal, setAdminEditModal] = useState({ isOpen: false, user: null, plan: 'Free', daysRemaining: 30 });
  const [billModal, setBillModal] = useState({ isOpen: false, id: null });
  const [billFormData, setBillFormData] = useState({ title: '', amount: '', type: 'expense', dueDate: new Date().toISOString().split('T')[0], category: '', recurrenceMonths: 1 });
  const [payBillModal, setPayBillModal] = useState({ isOpen: false, bill: null });
  const [payFormData, setPayFormData] = useState({ finalAmount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMethod: PAYMENT_METHODS[0] });

  const openConfirm = (title, message, onConfirm, isAlert = false) => setConfirmDialog({ isOpen: true, title, message, onConfirm, isAlert });
  const closeConfirm = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isAlert: false });

  // ORDENAÇÃO DAS CATEGORIAS
  const sortCategories = (cats) => {
    return [...cats].sort((a, b) => {
      if (a.toLowerCase() === 'outros') return -1;
      if (b.toLowerCase() === 'outros') return 1;
      return a.localeCompare(b);
    });
  };
  const sortedIncomeCats = sortCategories(incomeCategories);
  const sortedExpenseCats = sortCategories(expenseCategories);

  // BUSCA DADOS DO FIREBASE
  useEffect(() => {
    if (!userProfile?.uid) return;

    const txRef = collection(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions');
    const unsubTx = onSnapshot(txRef, (snapshot) => {
        setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => console.error(error));

    const billsRef = collection(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills');
    const unsubBills = onSnapshot(billsRef, (snapshot) => {
        setBills(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => console.error(error));

    const catRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'settings', 'categories');
    const unsubCat = onSnapshot(catRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setIncomeCategories(data.income || ['Outros']);
            setExpenseCategories(data.expense || ['Outros']);
        } else {
            setDoc(catRef, { income: ['Serviço', 'Venda', 'Outros'], expense: ['Alimentação', 'Moradia', 'Transporte', 'Outros'] });
        }
    }, (error) => console.error(error));

    let unsubUsers = () => {};
    if (userProfile.email === ADMIN_EMAIL) {
        const usersRef = collection(db, 'artifacts', APP_ID, 'users');
        unsubUsers = onSnapshot(usersRef, (snapshot) => {
             setAdminUsers(snapshot.docs.map(d => ({ uid: d.id, ...d.data() })));
        });
    }

    return () => { unsubTx(); unsubBills(); unsubCat(); unsubUsers(); }
  }, [userProfile?.uid]);

  const handleLogout = () => openConfirm('Sair do Sistema', 'Tem certeza que deseja encerrar a sua sessão?', () => { signOut(auth); closeConfirm(); });

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
      setFormData({ amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], category: sortedExpenseCats[0] || '', customDescription: '', paymentMethod: PAYMENT_METHODS[0] });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); };
  const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleTypeToggle = (newType) => setFormData(prev => ({ ...prev, type: newType, category: newType === 'income' ? (sortedIncomeCats[0] || '') : (sortedExpenseCats[0] || ''), customDescription: '' }));

  const parseAmountToFloat = (valueStr) => {
    let str = valueStr.toString().trim().replace(/[^\d.,-]/g, '');
    if (str.includes(',')) str = str.replace(/\./g, '').replace(',', '.'); 
    return Math.round((parseFloat(str) || 0) * 100) / 100;
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) return;
    let finalCategory = formData.category;
    if (formData.category.toLowerCase().includes('outros') && formData.customDescription.trim()) {
       finalCategory = `${formData.category} (${formData.customDescription.trim()})`;
    }
    const finalAmount = parseAmountToFloat(formData.amount);
    const idToSave = editingId || Date.now().toString();
    const newTx = { amount: finalAmount, type: formData.type, date: formData.date, category: finalCategory, paymentMethod: formData.paymentMethod, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions', idToSave), newTx);
    handleCloseModal();
  };

  const requestDeleteTransaction = (id) => openConfirm('Excluir Lançamento', 'Tem certeza que deseja excluir?', async () => { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions', id)); closeConfirm(); });

  const handleOpenBillModal = (bill = null) => {
    if (bill) {
      setBillFormData({ title: bill.title, amount: bill.amount, type: bill.type, dueDate: bill.dueDate, category: bill.category, recurrenceMonths: 1 });
      setBillModal({ isOpen: true, id: bill.id });
    } else {
      setBillFormData({ title: '', amount: '', type: 'expense', dueDate: new Date().toISOString().split('T')[0], category: sortedExpenseCats[0] || '', recurrenceMonths: 1 });
      setBillModal({ isOpen: true, id: null });
    }
  };
  const handleBillTypeToggle = (newType) => setBillFormData(prev => ({ ...prev, type: newType, category: newType === 'income' ? (sortedIncomeCats[0] || '') : (sortedExpenseCats[0] || '') }));

  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!billFormData.title || !billFormData.amount) return;
    const finalAmount = parseAmountToFloat(billFormData.amount);
    const months = billModal.id ? 1 : (parseInt(billFormData.recurrenceMonths) || 1);
    let currentDate = new Date(billFormData.dueDate + 'T12:00:00'); 
    for(let i=0; i<months; i++) {
        const idToSave = billModal.id || (Date.now() + i).toString();
        const nextDate = new Date(currentDate);
        nextDate.setMonth(currentDate.getMonth() + i);
        const formattedDate = nextDate.toISOString().split('T')[0];
        const newBill = { title: billFormData.title, amount: finalAmount, type: billFormData.type, dueDate: formattedDate, category: billFormData.category, status: 'pending', createdAt: new Date().toISOString() };
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills', idToSave), newBill);
    }
    setBillModal({ isOpen: false, id: null });
  };

  const requestDeleteBill = (id) => openConfirm('Excluir Previsão', 'Tem certeza que deseja excluir esta conta agendada?', async () => { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills', id)); closeConfirm(); });

  const handleOpenPayBillModal = (bill) => {
    setPayFormData({ finalAmount: bill.amount, paymentDate: new Date().toISOString().split('T')[0], paymentMethod: PAYMENT_METHODS[0] });
    setPayBillModal({ isOpen: true, bill: bill });
  };

  const handleSettleBill = async (e) => {
    e.preventDefault();
    const finalPaidAmount = parseAmountToFloat(payFormData.finalAmount);
    const bill = payBillModal.bill;
    const newTx = { amount: finalPaidAmount, type: bill.type, date: payFormData.paymentDate, category: `${bill.category} (${bill.title})`, paymentMethod: payFormData.paymentMethod, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions', Date.now().toString()), newTx);
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills', bill.id), { status: 'paid', paymentDate: payFormData.paymentDate, paidAmount: finalPaidAmount }, { merge: true });
    setPayBillModal({ isOpen: false, bill: null });
  };

  const handleOpenCategoryModal = (type, categoryName = null) => setCategoryModal({ isOpen: true, type: type, originalName: categoryName || '', currentName: categoryName || '' });

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
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'settings', 'categories'), { income: updatedIncomes, expense: updatedExpenses }, { merge: true });
    setCategoryModal({ isOpen: false, type: 'income', originalName: '', currentName: '' });
  };

  const requestDeleteCategory = (categoryName, type) => {
    openConfirm('Excluir Categoria', `Tem certeza que deseja excluir "${categoryName}"?`, async () => {
        let updatedIncomes = [...incomeCategories];
        let updatedExpenses = [...expenseCategories];
        if (type === 'income') updatedIncomes = updatedIncomes.filter(c => c !== categoryName);
        else updatedExpenses = updatedExpenses.filter(c => c !== categoryName);
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'settings', 'categories'), { income: updatedIncomes, expense: updatedExpenses }, { merge: true });
        closeConfirm();
    });
  };

  const handleToggleUserStatus = (user) => {
    const isCurrentlyActive = user.status === 'Ativo';
    setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid), { status: isCurrentlyActive ? 'Bloqueado' : 'Ativo' }, { merge: true });
  };

  const handleDeleteAdminUser = (user) => openConfirm('Excluir Cliente', `Tem certeza absoluta que deseja excluir a conta de ${user.name}? Todos os dados financeiros dele serão perdidos.`, async () => { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid)); closeConfirm(); });

  const handleOpenAdminEdit = (user) => setAdminEditModal({ isOpen: true, user: user, plan: user.plan || 'Free', daysRemaining: user.daysRemaining || 0 });

  const handleSaveAdminEdit = async (e) => {
    e.preventDefault();
    let parsedDays = parseInt(adminEditModal.daysRemaining);
    if (isNaN(parsedDays)) parsedDays = 0;
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', adminEditModal.user.uid), { plan: adminEditModal.plan, daysRemaining: parsedDays }, { merge: true });
    setAdminEditModal({ isOpen: false, user: null, plan: 'Free', daysRemaining: 30 });
  };

  const dateFilterLogic = (itemDateString, periodStr, customStart, customEnd, fMonth, fYear) => {
    const today = new Date(); today.setHours(0,0,0,0);
    if (periodStr === 'all') return true;
    
    const itemDateObj = new Date(itemDateString + 'T12:00:00');
    const itemTime = itemDateObj.getTime();
    
    if (periodStr === 'today') return itemDateString === today.toISOString().split('T')[0];
    if (periodStr === '15days') {
       const past = new Date(today); past.setDate(today.getDate() - 15);
       return itemTime >= past.getTime() && itemTime <= today.getTime();
    }
    if (periodStr === 'month') {
       const start = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).getTime();
       return itemTime >= start && itemTime <= end;
    }
    if (periodStr === 'specific_month') {
       return itemDateObj.getMonth().toString() === fMonth && itemDateObj.getFullYear().toString() === fYear;
    }
    if (periodStr === 'custom') {
       if (!customStart || !customEnd) return true; 
       const start = new Date(customStart + 'T00:00:00').getTime();
       const end = new Date(customEnd + 'T23:59:59').getTime();
       return itemTime >= start && itemTime <= end;
    }
    return true;
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(tx => dateFilterLogic(tx.date, filterPeriod, customDateStart, customDateEnd, filterMonth, filterYear));
    if (filterCategory !== 'all') filtered = filtered.filter(tx => tx.category === filterCategory);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
  }, [transactions, filterPeriod, customDateStart, customDateEnd, filterMonth, filterYear, filterCategory]);

  const usedCategoriesInPeriod = useMemo(() => sortCategories(Array.from(new Set(filteredTransactions.map(tx => tx.category))).filter(Boolean)), [filteredTransactions]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return; 
    const headers = ['Data', 'Tipo', 'Descrição (Categoria)', 'Forma de Pagamento', 'Valor'];
    const rows = filteredTransactions.map(tx => [formatDate(tx.date), tx.type === 'income' ? 'Entrada' : 'Saída', tx.category || '-', tx.paymentMethod || '-', formatCurrency(tx.amount)]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Extrato_${filterCategory !== 'all' ? filterCategory : 'Completo'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const renderFilterButtons = () => (
    <div className="bg-white p-2 rounded-xl border border-slate-200 flex gap-2 overflow-x-auto scrollbar-hide shadow-sm flex-1">
      {['all', 'today', '15days', 'month', 'specific_month', 'custom'].map(period => (
        <button key={period} onClick={() => setFilterPeriod(period)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterPeriod === period ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          {period === 'all' && 'Todos'} {period === 'today' && 'Hoje'} {period === '15days' && '15 dias'} {period === 'month' && 'Este Mês'} {period === 'specific_month' && 'Mês Específico'} {period === 'custom' && 'Personalizado'}
        </button>
      ))}
    </div>
  );

  const renderMonthSelectors = () => (
    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-slate-700">Mês</label>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-slate-800">
          {MONTHS_OPTIONS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-slate-700">Ano</label>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-slate-800">
          {YEARS_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );

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
    const incomePaymentData = incomeTransactions.reduce((acc, tx) => { acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + parseFloat(tx.amount); return acc; }, {});
    const sortedIncomePayments = Object.entries(incomePaymentData).sort((a, b) => b[1] - a[1]);

    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const expensePaymentData = expenseTransactions.reduce((acc, tx) => { acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + parseFloat(tx.amount); return acc; }, {});
    const sortedExpensePayments = Object.entries(expensePaymentData).sort((a, b) => b[1] - a[1]);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Painel Principal</h2></header>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {renderFilterButtons()}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0 min-w-[200px]">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none p-2">
              <option value="all">Todas as Categorias</option>
              {usedCategoriesInPeriod.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {filterPeriod === 'specific_month' && renderMonthSelectors()}

        {filterPeriod === 'custom' && (
           <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
             <Input label="Data Inicial" type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} />
             <Input label="Data Final" type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} />
           </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl shadow-md text-white bg-[#000066]">
            <p className="font-bold mb-1 text-slate-300 uppercase text-xs tracking-wider">Saldo do Período</p>
            <h3 className={`text-3xl font-black ${balance < 0 ? 'text-red-400' : 'text-white'}`}>{balance < 0 ? `-R$ ${formatNumber(Math.abs(balance))}` : `R$ ${formatNumber(balance)}`}</h3>
          </div>
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
                      const percent = totals.income > 0 ? ((val / totals.income) * 100).toFixed(1) : 0;
                      return (
                        <div key={method}>
                          <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-slate-700">{method}</span><span className="font-bold text-slate-800 text-emerald-600">+R$ {formatNumber(val)} <span className="text-slate-400 font-normal text-xs ml-1">({percent}%)</span></span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div></div>
                        </div>
                      )
                    })}
                  </div>
                ) : (<p className="text-sm text-slate-500 text-center py-4">Nenhuma entrada registada.</p>)}
             </Card>
             <Card className="p-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6"><CreditCard className="text-red-500" size={20}/> Formas de Pagamento (Saídas)</h3>
                {sortedExpensePayments.length > 0 ? (
                  <div className="space-y-5">
                    {sortedExpensePayments.map(([method, val]) => {
                      const percent = totals.expense > 0 ? ((val / totals.expense) * 100).toFixed(1) : 0;
                      return (
                        <div key={method}>
                          <div className="flex justify-between text-sm mb-1.5"><span className="font-bold text-slate-700">{method}</span><span className="font-bold text-slate-800 text-red-600">-R$ {formatNumber(val)} <span className="text-slate-400 font-normal text-xs ml-1">({percent}%)</span></span></div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div></div>
                        </div>
                      )
                    })}
                  </div>
                ) : (<p className="text-sm text-slate-500 text-center py-4">Nenhuma saída registada.</p>)}
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

  const renderBills = () => {
    const filteredBills = bills.filter(b => dateFilterLogic(b.dueDate, filterPeriod, customDateStart, customDateEnd, filterMonth, filterYear)).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    const pendingBills = filteredBills.filter(b => b.status === 'pending');
    const toReceive = pendingBills.filter(b => b.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const toPay = pendingBills.filter(b => b.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const predictedBalance = toReceive - toPay;

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Contas a Pagar e Receber</h2><p className="text-slate-500 text-sm mt-1">Previsões e agendamentos futuros. Ao dar baixa, o valor entra no caixa principal.</p></div>
          <div className="flex gap-2 w-full sm:w-auto"><Button onClick={() => handleOpenBillModal()} icon={Plus} className="flex-1 sm:flex-none">Novo Agendamento</Button></div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {renderFilterButtons()}
        </div>

        {filterPeriod === 'specific_month' && renderMonthSelectors()}

        {filterPeriod === 'custom' && (
           <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
             <Input label="Vencimento Inicial" type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} />
             <Input label="Vencimento Final" type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} />
           </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 border-none shadow-md text-white bg-[#000066]">
            <p className="font-bold mb-1 text-slate-300 uppercase text-xs tracking-wider flex items-center gap-2"><Wallet size={14}/> Saldo Previsto</p>
            <h3 className={`text-3xl font-black ${predictedBalance < 0 ? 'text-red-400' : 'text-white'}`}>{predictedBalance < 0 ? `-R$ ${formatNumber(Math.abs(predictedBalance))}` : `R$ ${formatNumber(predictedBalance)}`}</h3>
          </Card>
          <Card className="p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <p className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider flex items-center gap-2"><ArrowUpCircle size={14}/> Previsão de Recebimentos</p>
            <h3 className="text-2xl font-bold text-emerald-600">R$ {formatNumber(toReceive)}</h3>
          </Card>
          <Card className="p-6 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <p className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider flex items-center gap-2"><ArrowDownCircle size={14}/> Previsão de Pagamentos</p>
            <h3 className="text-2xl font-bold text-red-600">R$ {formatNumber(toPay)}</h3>
          </Card>
        </div>

        <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-2 mt-8">Agendamentos Pendentes</h3>
            {pendingBills.map(bill => (
              <Card key={bill.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors group border-l-4 ${bill.type === 'income' ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
                <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-slate-100 text-slate-500"><PendingIcon size={20}/></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-base truncate">{bill.title}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <p className="text-sm text-slate-500 flex items-center gap-1 shrink-0"><Calendar size={14}/> Vence: {formatDate(bill.dueDate)}</p>
                      <span className="hidden sm:flex text-xs items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"><Tag size={12}/> {bill.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0">
                  <div className={`font-bold text-lg ${bill.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{bill.type === 'income' ? `+R$ ${formatNumber(bill.amount)}` : `-R$ ${formatNumber(bill.amount)}`}</div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleOpenPayBillModal(bill)} className="px-4 py-2 font-bold text-white bg-slate-800 hover:bg-black rounded-lg transition-colors shadow-sm">{bill.type === 'income' ? 'Receber' : 'Pagar'}</button>
                    <button onClick={() => handleOpenBillModal(bill)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Edit2 size={18}/></button>
                    <button onClick={() => requestDeleteBill(bill.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              </Card>
            ))}
            {pendingBills.length === 0 && <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200"><p className="text-slate-500 font-medium">Nenhuma conta pendente para este período.</p></div>}

            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-2 mt-8 pt-6 border-t border-slate-200">Histórico de Contas Baixadas (Pagas/Recebidas)</h3>
            {filteredBills.filter(b => b.status === 'paid').map(bill => (
               <div key={bill.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden opacity-70">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600"><CheckCircle size={20}/></div>
                   <div className="min-w-0 flex-1">
                     <p className="font-bold text-slate-800 text-base truncate line-through">{bill.title}</p>
                     <p className="text-sm text-slate-500 flex items-center gap-1 shrink-0"><Calendar size={14}/> Pago em: {formatDate(bill.paymentDate)}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 opacity-70">
                    <div className={`font-bold text-lg ${bill.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{bill.type === 'income' ? `+R$ ${formatNumber(bill.paidAmount)}` : `-R$ ${formatNumber(bill.paidAmount)}`}</div>
                 </div>
               </div>
            ))}
        </div>
      </div>
    );
  };

  const renderTransactions = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Lançamentos</h2><p className="text-slate-500 text-sm mt-1">Gerencie todas as suas entradas e saídas do caixa.</p></div>
          <div className="flex gap-2 w-full sm:w-auto"><Button onClick={handleExportCSV} variant="outline" className="flex-1 sm:flex-none bg-white" icon={Download}>Excel</Button><Button onClick={() => handleOpenModal()} icon={Plus} className="flex-1 sm:flex-none">Novo Lançamento</Button></div>
        </header>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {renderFilterButtons()}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0 min-w-[200px] flex items-center">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none px-2 cursor-pointer">
              <option value="all">Todas as Categorias</option>
              {usedCategoriesInPeriod.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {filterPeriod === 'specific_month' && renderMonthSelectors()}

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
            {sortedIncomeCats.map(cat => (
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
            {sortedExpenseCats.map(cat => (
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
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-blue-400"><div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">2</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Registe as Movimentações</h3><p className="text-slate-600">Vá a "Lançamentos" ou "Contas Pagar/Receber" e comece a registar as suas finanças.</p></div></Card>
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-purple-400"><div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">3</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Acompanhe e Exporte</h3><p className="text-slate-600">Use os botões de Filtro no topo para ver relatórios de "Mês Específico" e Excel.</p></div></Card>
      </div>
    </div>
  );

  const renderPlans = () => {
    const isAdmin = userProfile.email === ADMIN_EMAIL;

    if (isAdmin) {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Meu Plano</h2><p className="text-slate-500 mt-1">Gerencie a sua assinatura do LD Finanças.</p></header>
          <Card className="p-6 sm:p-8 max-w-3xl border-t-4 border-t-amber-400 bg-amber-50/30">
            <div className="flex items-center justify-between border-b border-amber-200 pb-6 mb-6">
                <div>
                  <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1"><span className="material-symbols-outlined text-base">workspace_premium</span> Plano Atual</p>
                  <h3 className="text-3xl font-black text-slate-800">Admin</h3>
                </div>
                <div className="text-right">
                  <span className="inline-block font-bold px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">Ativo</span>
                  <p className="text-sm text-slate-500 mt-2 font-medium uppercase tracking-widest font-bold">Vitalício</p>
                </div>
            </div>
            <div className="text-center py-8">
               <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-3xl">workspace_premium</span></div>
               <h4 className="font-bold text-slate-800 text-xl mb-2">Conta de Administrador</h4>
               <p className="text-slate-600">Você tem acesso ilimitado e vitalício ao sistema, incluindo o painel de gestão de todos os clientes.</p>
            </div>
          </Card>
        </div>
      );
    }

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
                    <button onClick={() => handleOpenAdminEdit(user)} className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors" title="Editar Plano">
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
          <NavItem id="bills" icon={Receipt} label="Contas Pagar/Receber" />
          <NavItem id="categories" icon={Tag} label="Categorias" />
          <NavItem id="plans" icon={CreditCard} label="Meu Plano" />
          <NavItem id="tutorial" icon={PlayCircle} label="Como Funciona" />
          <NavItem id="support" icon={HelpCircle} label="Suporte" />
          {userProfile.email === ADMIN_EMAIL && (<div className="pt-4 mt-4 border-t border-slate-100"><button onClick={() => { setCurrentView('admin'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${currentView === 'admin' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><ShieldAlert size={20} className={currentView === 'admin' ? 'text-white' : 'text-slate-400'} />Administração</button></div>)}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><p className="font-bold text-slate-800 text-sm truncate">{userProfile.name}</p><p className="text-xs text-slate-500 truncate mt-0.5">{userProfile.email}</p><div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100"><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${userProfile.email === ADMIN_EMAIL || userProfile.plan === 'Admin' ? 'bg-slate-800 text-amber-400' : 'text-emerald-600 bg-emerald-50'}`}>{userProfile.email === ADMIN_EMAIL || userProfile.plan === 'Admin' ? 'Admin' : userProfile.plan}</span><span className="text-xs font-medium text-slate-500">{userProfile.email === ADMIN_EMAIL || userProfile.daysRemaining > 900 ? 'Vitalício' : `${userProfile.daysRemaining} dias`}</span></div></div>
          <button type="button" onClick={handleLogout} className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 text-red-600 rounded-xl text-sm hover:bg-red-50 hover:border-red-100 font-bold transition-colors"><LogOut size={16} /> Sair do Sistema</button>
        </div>
      </aside>
      {isMobileMenuOpen && (<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />)}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-10 pb-24 overflow-x-hidden">
        {userProfile.status === 'Bloqueado' ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-red-100 shadow-sm mt-10">
             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <Lock size={40} />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Bloqueado</h2>
             <p className="text-slate-600 mb-8 max-w-md mx-auto">A sua conta encontra-se temporariamente suspensa ou o seu plano expirou. Por favor, entre em contato com o suporte para reativar o seu acesso e continuar a gerenciar as suas finanças.</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => window.open('https://wa.me/5564981005505?text=Olá, minha conta está bloqueada no LD Finanças e preciso de ajuda.', '_blank')} icon={HelpCircle}>Falar com Suporte</Button>
                <Button onClick={handleLogout} variant="outline" icon={LogOut}>Sair da Conta</Button>
             </div>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'transactions' && renderTransactions()}
            {currentView === 'bills' && renderBills()}
            {currentView === 'categories' && renderCategories()}
            {currentView === 'support' && renderSupport()}
            {currentView === 'plans' && renderPlans()}
            {currentView === 'tutorial' && renderTutorial()}
            {currentView === 'admin' && renderAdmin()}
          </>
        )}
      </main>

      {/* Modal de Transação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex items-center justify-between z-20"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">{formData.type === 'income' ? <ArrowUpCircle className="text-emerald-500"/> : <ArrowDownCircle className="text-red-500"/>}{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3><button onClick={handleCloseModal} className="p-2 text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button></div>
             <div className="p-6">
                <form onSubmit={handleSaveTransaction}>
                  <div className="flex bg-slate-100 p-1 rounded-xl mb-6"><button type="button" onClick={() => handleTypeToggle('income')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>Entrada (+)</button><button type="button" onClick={() => handleTypeToggle('expense')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}>Saída (-)</button></div>
                  <Select label="Categoria" name="category" value={formData.category} onChange={handleFormChange} required options={formData.type === 'income' ? sortedIncomeCats : sortedExpenseCats} />
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

      {/* Modal de Agendamento (NOVO) */}
      {billModal.isOpen && (
        <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setBillModal({ isOpen: false, id: null })}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex items-center justify-between z-20"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PendingIcon className="text-blue-500"/>{billModal.id ? 'Editar Previsão' : 'Nova Previsão'}</h3><button onClick={() => setBillModal({ isOpen: false, id: null })} className="p-2 text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button></div>
             <div className="p-6">
                <form onSubmit={handleSaveBill}>
                  <div className="flex bg-slate-100 p-1 rounded-xl mb-6"><button type="button" onClick={() => handleBillTypeToggle('income')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${billFormData.type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>A Receber (+)</button><button type="button" onClick={() => handleBillTypeToggle('expense')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${billFormData.type === 'expense' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}>A Pagar (-)</button></div>
                  <Input label="Descrição da Conta" name="title" value={billFormData.title} onChange={e => setBillFormData(prev => ({...prev, title: e.target.value}))} placeholder="Ex: Aluguel da Loja" required />
                  <Select label="Categoria de Destino" name="category" value={billFormData.category} onChange={e => setBillFormData(prev => ({...prev, category: e.target.value}))} required options={billFormData.type === 'income' ? sortedIncomeCats : sortedExpenseCats} />
                  <Input label="Valor (R$)" name="amount" type="text" inputMode="decimal" value={billFormData.amount} onChange={e => setBillFormData(prev => ({...prev, amount: e.target.value}))} placeholder="0,00" required />
                  <Input label="Data de Vencimento" name="dueDate" type="date" value={billFormData.dueDate} onChange={e => setBillFormData(prev => ({...prev, dueDate: e.target.value}))} required />
                  
                  {!billModal.id && (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                      <Input label="Repetir por quantos meses?" name="recurrenceMonths" type="number" min="1" max="60" value={billFormData.recurrenceMonths} onChange={e => setBillFormData(prev => ({...prev, recurrenceMonths: e.target.value}))} placeholder="1" required />
                      <p className="text-xs text-blue-600 font-medium mt-[-10px]">O sistema criará faturas individuais para cada mês.</p>
                    </div>
                  )}

                  <div className="mt-8 flex gap-3"><button type="button" onClick={() => setBillModal({ isOpen: false, id: null })} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className={`flex-1 py-3 px-4 font-bold rounded-xl text-white transition-colors shadow-sm ${billFormData.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>{billModal.id ? 'Atualizar' : 'Agendar'}</button></div>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Modal para DAR BAIXA (NOVO) */}
      {payBillModal.isOpen && (
        <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPayBillModal({ isOpen: false, bill: null })}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CheckCircle className="text-emerald-500" size={24}/>Dar Baixa na Conta</h3><button onClick={() => setPayBillModal({ isOpen: false, bill: null })} className="p-2 text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button></div>
             <form onSubmit={handleSettleBill} className="p-6">
                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <p className="text-sm font-bold text-slate-700 mb-1">Conta: <span className="font-medium text-slate-600">{payBillModal.bill?.title}</span></p>
                   <p className="text-sm font-bold text-slate-700 mb-1">Vencimento: <span className="font-medium text-slate-600">{formatDate(payBillModal.bill?.dueDate)}</span></p>
                   <p className="text-sm font-bold text-slate-700">Valor Original: <span className={`font-medium ${payBillModal.bill?.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>R$ {formatNumber(payBillModal.bill?.amount)}</span></p>
                </div>
                
                <p className="text-sm text-slate-500 mb-4">* Se houver juros, multa ou desconto, altere o valor abaixo antes de salvar.</p>
                
                <Input label="Valor Final (R$)" name="finalAmount" type="text" inputMode="decimal" value={payFormData.finalAmount} onChange={e => setPayFormData(prev => ({...prev, finalAmount: e.target.value}))} required />
                <Select label="Forma de Pagamento" name="paymentMethod" value={payFormData.paymentMethod} onChange={e => setPayFormData(prev => ({...prev, paymentMethod: e.target.value}))} options={PAYMENT_METHODS} required />
                <Input label="Data do Pagamento" name="paymentDate" type="date" value={payFormData.paymentDate} onChange={e => setPayFormData(prev => ({...prev, paymentDate: e.target.value}))} required />

                <div className="mt-6 flex gap-3"><button type="button" onClick={() => setPayBillModal({ isOpen: false, bill: null })} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className="flex-1 py-3 px-4 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm">Confirmar Pagamento</button></div>
             </form>
          </div>
        </div>
      )}

      {/* Modal de Editar/Criar Categoria */}
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

      {/* Modal de Edição do Admin (Planos e Dias) */}
      {adminEditModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setAdminEditModal({ ...adminEditModal, isOpen: false })}></div>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center"><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Settings className="text-slate-400" size={24}/>Editar Plano do Cliente</h3><button onClick={() => setAdminEditModal({ ...adminEditModal, isOpen: false })} className="p-2 text-slate-400 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button></div>
             <form onSubmit={handleSaveAdminEdit} className="p-6">
                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <p className="text-sm font-bold text-slate-700 mb-1">Cliente: <span className="font-medium text-slate-600">{adminEditModal.user?.name}</span></p>
                   <p className="text-sm font-bold text-slate-700">E-mail: <span className="font-medium text-slate-600">{adminEditModal.user?.email}</span></p>
                </div>
                <Select label="Novo Plano" name="plan" value={adminEditModal.plan} onChange={(e) => setAdminEditModal({...adminEditModal, plan: e.target.value})} options={['Free', 'Pro', 'Admin']} required />
                <Input label="Dias Restantes" name="daysRemaining" type="number" inputMode="numeric" value={adminEditModal.daysRemaining} onChange={(e) => setAdminEditModal({...adminEditModal, daysRemaining: e.target.value})} placeholder="Ex: 30" required />
                <p className="text-xs text-slate-500 mt-[-10px] mb-4">* Digite um número muito alto (ex: 999) para tornar o acesso vitalício.</p>
                <div className="mt-6 flex gap-3"><button type="button" onClick={() => setAdminEditModal({ ...adminEditModal, isOpen: false })} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className="flex-1 py-3 px-4 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm">Salvar Alterações</button></div>
             </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Genérica */}
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
        const docRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
        const unsubProfile = onSnapshot(docRef, (docSnap) => {
           if(docSnap.exists()) {
              setUserProfile({ uid: user.uid, ...docSnap.data() });
           } else {
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
