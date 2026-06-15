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

const Input = ({ label, name, type = 'text', value, onChange, placeholder, required = false, step, rightElement, inputMode, min }) => {
  const handleChange = (e) => {
    let newValue = e.target.value;
    if (onChange) onChange({ target: { name, value: newValue } });
  };
  return (
    <div className="flex flex-col gap-1.5 mb-4 w-full">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative w-full">
        <input
          type={type} name={name} value={value} onChange={handleChange} placeholder={placeholder} required={required} step={step} inputMode={inputMode} min={min}
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
      {options.map((opt, idx) => <option key={idx} value={opt?.value || opt}>{opt?.label || opt}</option>)}
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
        const today = new Date().toISOString().split('T')[0];
        const createdAt = new Date().toISOString();
        
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid), {
          name: formData.name || 'Novo Usuário',
          whatsapp: formData.whatsapp,
          email: formData.email,
          plan: formData.email === ADMIN_EMAIL ? 'Admin' : 'Free',
          daysRemaining: formData.email === ADMIN_EMAIL ? 999 : 30,
          status: 'Ativo',
          createdAt: createdAt,
          lastDecrementDate: today // Registra o dia em que ganhou os dias para o robô saber
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
  const [bills, setBills] = useState([]); // Contas a Pagar/Receber
  const [incomeCategories, setIncomeCategories] = useState(['Outros']);
  const [expenseCategories, setExpenseCategories] = useState(['Outros']);
  const [adminUsers, setAdminUsers] = useState([]);

  // Filtros Globais
  const [filterPeriod, setFilterPeriod] = useState('month'); 
  const [filterCategory, setFilterCategory] = useState('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  
  // Filtro Extra: Mês Específico
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Modais e Formulários
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ amount: '', type: 'expense', date: new Date().toISOString().split('T')[0], category: '', customDescription: '', paymentMethod: PAYMENT_METHODS[0] });
  
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, type: 'income', originalName: '', currentName: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isAlert: false });
  const [adminEditModal, setAdminEditModal] = useState({ isOpen: false, user: null, plan: 'Free', daysRemaining: 30 });

  // Modal para Contas a Pagar (Agendamentos)
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billFormData, setBillFormData] = useState({ amount: '', type: 'expense', dueDate: new Date().toISOString().split('T')[0], category: '', customDescription: '', isRecurring: false, recurrenceMonths: 1 });
  
  // Modal para dar Baixa na Conta
  const [settleModal, setSettleModal] = useState({ isOpen: false, bill: null, paymentDate: new Date().toISOString().split('T')[0], paidAmount: '', paymentMethod: PAYMENT_METHODS[0] });

  const openConfirm = (title, message, onConfirm, isAlert = false) => setConfirmDialog({ isOpen: true, title, message, onConfirm, isAlert });
  const closeConfirm = () => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, isAlert: false });

  // ORDENAÇÃO DAS CATEGORIAS ("Outros" sempre no topo, restante alfabético)
  const sortCategories = (cats) => {
    return [...cats].sort((a, b) => {
      if (a.toLowerCase() === 'outros') return -1;
      if (b.toLowerCase() === 'outros') return 1;
      return a.localeCompare(b);
    });
  };
  const sortedIncomeCats = sortCategories(incomeCategories);
  const sortedExpenseCats = sortCategories(expenseCategories);

  // BUSCA DADOS DO FIREBASE EM TEMPO REAL
  useEffect(() => {
    if (!userProfile?.uid) return;

    // Puxa Lançamentos
    const txRef = collection(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions');
    const unsubTx = onSnapshot(txRef, (snapshot) => { setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); });

    // Puxa Contas a Pagar/Receber
    const billsRef = collection(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills');
    const unsubBills = onSnapshot(billsRef, (snapshot) => { setBills(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); });

    // Puxa Categorias
    const catRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'settings', 'categories');
    const unsubCat = onSnapshot(catRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setIncomeCategories(data.income || ['Outros']);
            setExpenseCategories(data.expense || ['Outros']);
        } else {
            setDoc(catRef, { income: ['Serviço', 'Venda', 'Outros'], expense: ['Alimentação', 'Moradia', 'Transporte', 'Outros'] });
        }
    });

    // Se for ADMIN, puxa todos os clientes
    let unsubUsers = () => {};
    if (userProfile.email === ADMIN_EMAIL) {
        const usersRef = collection(db, 'artifacts', APP_ID, 'users');
        unsubUsers = onSnapshot(usersRef, (snapshot) => { setAdminUsers(snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))); });
    }

    return () => { unsubTx(); unsubBills(); unsubCat(); unsubUsers(); }
  }, [userProfile?.uid]);

  const handleLogout = () => openConfirm('Sair do Sistema', 'Tem certeza que deseja sair?', () => { signOut(auth); closeConfirm(); });

  // ===================== LANÇAMENTOS DIÁRIOS =====================
  const handleOpenModal = (transaction = null) => {
    if (transaction) {
      let cat = transaction.category; let customDesc = '';
      const match = cat.match(/^(.*) \((.*)\)$/);
      if (match && match[1].toLowerCase().includes('outros')) { cat = match[1]; customDesc = match[2]; }
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

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) return;
    let finalCategory = formData.category;
    if (formData.category.toLowerCase().includes('outros') && formData.customDescription.trim()) finalCategory = `${formData.category} (${formData.customDescription.trim()})`;
    
    let amountStr = formData.amount.toString().trim().replace(/[^\d.,]/g, '');
    if (amountStr.includes(',')) amountStr = amountStr.replace(/\./g, '').replace(',', '.'); 
    let finalAmount = Math.round((parseFloat(amountStr) || 0) * 100) / 100;

    const newTx = { amount: finalAmount, type: formData.type, date: formData.date, category: finalCategory, paymentMethod: formData.paymentMethod, updatedAt: new Date().toISOString() };
    await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions', editingId || Date.now().toString()), newTx);
    handleCloseModal();
  };

  const requestDeleteTransaction = (id) => {
    openConfirm('Excluir Lançamento', 'Tem certeza que deseja excluir? Isso afetará o seu saldo.', async () => {
        // Encontra o Lançamento para ver se ele veio de uma Conta
        const txToDelete = transactions.find(t => t.id === id);
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions', id));
        
        // REVERTE CONTA SE EXISTIR CORDÃO UMBILICAL
        if (txToDelete && txToDelete.originBillId) {
            const billRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills', txToDelete.originBillId);
            await setDoc(billRef, { status: 'pending', paymentDate: null, paidAmount: null }, { merge: true });
        }
        closeConfirm();
    });
  };

  // ===================== CONTAS A PAGAR E RECEBER =====================
  const handleOpenBillModal = () => {
    setBillFormData({ amount: '', type: 'expense', dueDate: new Date().toISOString().split('T')[0], category: sortedExpenseCats[0] || '', customDescription: '', isRecurring: false, recurrenceMonths: 1 });
    setIsBillModalOpen(true);
  };
  const handleBillFormChange = (e) => setBillFormData(prev => ({ ...prev, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  
  const handleSaveBill = async (e) => {
    e.preventDefault();
    let finalCategory = billFormData.category;
    if (billFormData.category.toLowerCase().includes('outros') && billFormData.customDescription.trim()) finalCategory = `${billFormData.category} (${billFormData.customDescription.trim()})`;
    
    let amountStr = billFormData.amount.toString().trim().replace(/[^\d.,]/g, '');
    if (amountStr.includes(',')) amountStr = amountStr.replace(/\./g, '').replace(',', '.'); 
    let finalAmount = Math.round((parseFloat(amountStr) || 0) * 100) / 100;

    const baseDate = new Date(billFormData.dueDate + 'T12:00:00');
    const monthsToCreate = billFormData.isRecurring ? parseInt(billFormData.recurrenceMonths) : 1;

    // Cria as parcelas usando apenas Categoria
    for (let i = 0; i < monthsToCreate; i++) {
        const currentDate = new Date(baseDate);
        currentDate.setMonth(currentDate.getMonth() + i);
        const formattedDate = currentDate.toISOString().split('T')[0];
        
        const newBill = {
           amount: finalAmount, type: billFormData.type, dueDate: formattedDate,
           category: finalCategory + (monthsToCreate > 1 ? ` (${i+1}/${monthsToCreate})` : ''), 
           status: 'pending',
           createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills', Date.now().toString() + i), newBill);
    }
    setIsBillModalOpen(false);
  };

  const requestDeleteBill = (id) => {
    openConfirm('Excluir Histórico', 'Apagar esta conta do seu histórico/agenda?', async () => {
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills', id));
        closeConfirm();
    });
  };

  const openSettleModal = (bill) => {
     setSettleModal({ isOpen: true, bill: bill, paymentDate: new Date().toISOString().split('T')[0], paidAmount: bill.amount, paymentMethod: PAYMENT_METHODS[0] });
  };

  const handleSettleBillSubmit = async (e) => {
     e.preventDefault();
     const bill = settleModal.bill;
     let amountStr = settleModal.paidAmount.toString().trim().replace(/[^\d.,]/g, '');
     if (amountStr.includes(',')) amountStr = amountStr.replace(/\./g, '').replace(',', '.'); 
     let finalPaidAmount = Math.round((parseFloat(amountStr) || 0) * 100) / 100;

     // 1. Atualiza a Conta para 'PAGA'
     const billRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'bills', bill.id);
     await setDoc(billRef, { status: 'paid', paymentDate: settleModal.paymentDate, paidAmount: finalPaidAmount, updatedAt: new Date().toISOString() }, { merge: true });

     // 2. CRIA O LANÇAMENTO DIÁRIO COM A FORMA DE PAGAMENTO ESCOLHIDA NA BAIXA
     const txRef = doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'transactions', Date.now().toString());
     await setDoc(txRef, {
        amount: finalPaidAmount, type: bill.type, date: settleModal.paymentDate,
        category: bill.category, paymentMethod: settleModal.paymentMethod, // AGORA USA O QUE O CLIENTE ESCOLHEU
        originBillId: bill.id, 
        updatedAt: new Date().toISOString()
     });

     setSettleModal({ isOpen: false, bill: null, paymentDate: '', paidAmount: '', paymentMethod: PAYMENT_METHODS[0] });
  };

  // ===================== CATEGORIAS =====================
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const { originalName, currentName, type } = categoryModal;
    const trimmedName = currentName.trim();
    if (!trimmedName) return;
    
    let updatedIncomes = [...incomeCategories]; let updatedExpenses = [...expenseCategories];
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

  const requestDeleteCategory = (catName, type) => {
    openConfirm('Excluir Categoria', `Tem certeza que deseja excluir "${catName}"?`, async () => {
        let updatedIncomes = [...incomeCategories]; let updatedExpenses = [...expenseCategories];
        if (type === 'income') updatedIncomes = updatedIncomes.filter(c => c !== catName);
        else updatedExpenses = updatedExpenses.filter(c => c !== catName);
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', userProfile.uid, 'settings', 'categories'), { income: updatedIncomes, expense: updatedExpenses }, { merge: true });
        closeConfirm();
    });
  };

  // ===================== ADMINISTRAÇÃO =====================
  const handleToggleUserStatus = (user) => {
    const isCurrentlyActive = user.status === 'Ativo';
    const userRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
    setDoc(userRef, { status: isCurrentlyActive ? 'Bloqueado' : 'Ativo' }, { merge: true });
  };

  const handleDeleteAdminUser = (user) => {
    openConfirm('Excluir Cliente', `Excluir a conta de ${user.name}? Os dados serão perdidos.`, async () => {
        await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid));
        closeConfirm();
    });
  };

  const handleOpenAdminEdit = (user) => {
    setAdminEditModal({ isOpen: true, user: user, plan: user.plan || 'Free', daysRemaining: user.daysRemaining || 0 });
  };

  const handleSaveAdminEdit = async (e) => {
    e.preventDefault();
    let parsedDays = parseInt(adminEditModal.daysRemaining);
    if (isNaN(parsedDays)) parsedDays = 0;

    const userRef = doc(db, 'artifacts', APP_ID, 'users', adminEditModal.user.uid);
    const today = new Date().toISOString().split('T')[0];
    
    // Atualiza os dias, o plano, e reseta o marcador para começar a descontar de hoje
    await setDoc(userRef, { 
      plan: adminEditModal.plan, 
      daysRemaining: parsedDays,
      status: parsedDays > 0 ? 'Ativo' : 'Bloqueado',
      lastDecrementDate: today
    }, { merge: true });
    
    setAdminEditModal({ isOpen: false, user: null, plan: 'Free', daysRemaining: 30 });
  };

  // ===================== FILTROS E LÓGICA =====================
  const filterDataByPeriod = (dataArray, dateField) => {
    const today = new Date(); today.setHours(0,0,0,0);
    return dataArray.filter(item => {
      if (filterPeriod === 'all') return true;
      
      const itemTime = new Date(item[dateField] + 'T00:00:00').getTime();
      
      if (filterPeriod === 'today') return item[dateField] === today.toISOString().split('T')[0];
      if (filterPeriod === '15days') {
         const past = new Date(today); past.setDate(today.getDate() - 15);
         return itemTime >= past.getTime() && itemTime <= today.getTime();
      }
      if (filterPeriod === 'month') {
         const start = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
         const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).getTime();
         return itemTime >= start && itemTime <= end;
      }
      if (filterPeriod === 'specific_month') {
         if (!selectedMonth || !selectedYear) return true;
         const start = new Date(`${selectedYear}-${selectedMonth}-01T00:00:00`).getTime();
         const end = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0, 23, 59, 59).getTime(); // Último dia do mês
         return itemTime >= start && itemTime <= end;
      }
      if (filterPeriod === 'custom') {
         if (!customDateStart || !customDateEnd) return true; 
         const start = new Date(customDateStart + 'T00:00:00').getTime();
         const end = new Date(customDateEnd + 'T23:59:59').getTime();
         return itemTime >= start && itemTime <= end;
      }
      return true;
    });
  };

  const filteredTransactions = useMemo(() => {
    let filtered = filterDataByPeriod(transactions, 'date');
    if (filterCategory !== 'all') filtered = filtered.filter(tx => tx.category === filterCategory);
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
  }, [transactions, filterPeriod, customDateStart, customDateEnd, selectedMonth, selectedYear, filterCategory]);

  const filteredBills = useMemo(() => {
    let filtered = filterDataByPeriod(bills, 'dueDate');
    return filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); 
  }, [bills, filterPeriod, customDateStart, customDateEnd, selectedMonth, selectedYear]);

  const usedCategoriesInPeriod = useMemo(() => sortCategories(Array.from(new Set(filteredTransactions.map(tx => tx.category))).filter(Boolean)), [filteredTransactions]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return; 
    const headers = ['Data', 'Tipo', 'Descrição (Categoria)', 'Forma de Pagamento', 'Valor'];
    const rows = filteredTransactions.map(tx => [formatDate(tx.date), tx.type === 'income' ? 'Entrada' : 'Saída', tx.category || '-', tx.paymentMethod || '-', formatCurrency(tx.amount)]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Extrato_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const renderFilterBar = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="bg-white p-2 rounded-xl border border-slate-200 flex gap-2 overflow-x-auto scrollbar-hide shadow-sm flex-1">
        {['all', 'today', '15days', 'month', 'specific_month', 'custom'].map(period => (
          <button key={period} onClick={() => setFilterPeriod(period)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterPeriod === period ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            {period === 'all' && 'Todos'} {period === 'today' && 'Hoje'} {period === '15days' && '15 dias'} {period === 'month' && 'Este Mês'} {period === 'specific_month' && 'Mês Específico'} {period === 'custom' && 'Personalizado'}
          </button>
        ))}
      </div>
      {(currentView === 'dashboard' || currentView === 'transactions') && (
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0 min-w-[200px]">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none p-2">
            <option value="all">Todas as Categorias</option>
            {usedCategoriesInPeriod.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      )}
    </div>
  );

  const renderFilterExtras = () => (
    <>
      {filterPeriod === 'custom' && (
         <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
           <Input label="Data Inicial" type="date" value={customDateStart} onChange={e => setCustomDateStart(e.target.value)} />
           <Input label="Data Final" type="date" value={customDateEnd} onChange={e => setCustomDateEnd(e.target.value)} />
         </div>
      )}
      {filterPeriod === 'specific_month' && (
         <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
           <Select label="Mês" name="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} options={[{value:'01',label:'Janeiro'},{value:'02',label:'Fevereiro'},{value:'03',label:'Março'},{value:'04',label:'Abril'},{value:'05',label:'Maio'},{value:'06',label:'Junho'},{value:'07',label:'Julho'},{value:'08',label:'Agosto'},{value:'09',label:'Setembro'},{value:'10',label:'Outubro'},{value:'11',label:'Novembro'},{value:'12',label:'Dezembro'}]} />
           <Input label="Ano" name="year" type="number" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} placeholder="Ex: 2026" />
         </div>
      )}
    </>
  );

  // ===================== RENDERIZADORES DE TELAS =====================
  const renderDashboard = () => {
    const totals = filteredTransactions.reduce((acc, curr) => {
      const val = parseFloat(curr.amount) || 0;
      if (curr.type === 'income') acc.income += val; else acc.expense += val;
      return acc;
    }, { income: 0, expense: 0 });
    const balance = totals.income - totals.expense;
    
    // Calcula Formas de Pagamento (Entradas)
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const incomePaymentData = incomeTransactions.reduce((acc, tx) => { 
        acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + parseFloat(tx.amount); return acc; 
    }, {});
    const sortedIncomePayments = Object.entries(incomePaymentData).sort((a, b) => b[1] - a[1]);

    // Calcula Formas de Pagamento (Saídas)
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
    const expensePaymentData = expenseTransactions.reduce((acc, tx) => { 
        acc[tx.paymentMethod] = (acc[tx.paymentMethod] || 0) + parseFloat(tx.amount); return acc; 
    }, {});
    const sortedExpensePayments = Object.entries(expensePaymentData).sort((a, b) => b[1] - a[1]);

    const recentTx = [...filteredTransactions].slice(0, 5);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
           <header><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Painel Principal</h2><p className="text-slate-500 mt-1">Resumo das suas finanças diárias.</p></header>
           <Button onClick={() => handleOpenModal()} icon={Plus} className="w-full sm:w-auto shadow-md hover:shadow-lg">Novo Lançamento</Button>
        </div>

        {renderFilterBar()}
        {renderFilterExtras()}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-[#000066] text-white border-none shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm"><Wallet size={24} className="text-blue-200" /></div><span className="text-blue-100 text-sm font-medium">Saldo Atual</span></div>
            <h3 className="text-3xl font-black tracking-tight">{formatCurrency(balance)}</h3>
          </Card>
          <Card className="p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-emerald-100 rounded-xl"><ArrowUpCircle size={24} className="text-emerald-600" /></div><span className="text-slate-500 text-sm font-medium">Receitas</span></div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(totals.income)}</h3>
          </Card>
          <Card className="p-6 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4"><div className="p-2 bg-red-100 rounded-xl"><ArrowDownCircle size={24} className="text-red-600" /></div><span className="text-slate-500 text-sm font-medium">Despesas</span></div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(totals.expense)}</h3>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="p-6">
               <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><CreditCard size={20} className="text-slate-400"/> Formas de Pagamento</h3>
               <div className="space-y-6">
                  <div>
                     <p className="text-sm font-bold text-emerald-600 mb-3 border-b border-slate-100 pb-2">Entradas (Receitas)</p>
                     {sortedIncomePayments.length > 0 ? (
                        <div className="space-y-3">
                           {sortedIncomePayments.map(([method, total]) => (
                              <div key={method} className="flex justify-between items-center"><span className="text-slate-600 text-sm font-medium">{method}</span><span className="font-bold text-slate-800">{formatCurrency(total)}</span></div>
                           ))}
                        </div>
                     ) : <p className="text-sm text-slate-400 italic">Sem entradas no período.</p>}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-red-600 mb-3 border-b border-slate-100 pb-2">Saídas (Despesas)</p>
                     {sortedExpensePayments.length > 0 ? (
                        <div className="space-y-3">
                           {sortedExpensePayments.map(([method, total]) => (
                              <div key={method} className="flex justify-between items-center"><span className="text-slate-600 text-sm font-medium">{method}</span><span className="font-bold text-slate-800">{formatCurrency(total)}</span></div>
                           ))}
                        </div>
                     ) : <p className="text-sm text-slate-400 italic">Sem saídas no período.</p>}
                  </div>
               </div>
            </Card>

            <Card className="p-6">
               <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-slate-800">Últimos Lançamentos</h3><button onClick={() => setCurrentView('transactions')} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Ver todos</button></div>
               <div className="space-y-4">
                  {recentTx.length === 0 ? (
                     <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200"><p className="text-slate-500">Nenhum lançamento recente.</p></div>
                  ) : (
                     recentTx.map(tx => (
                        <div key={tx.id} onClick={() => handleOpenModal(tx)} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 group">
                           <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{tx.type === 'income' ? <ArrowUpCircle size={20}/> : <ArrowDownCircle size={20}/>}</div><div><p className="font-bold text-slate-800 text-sm">{tx.category}</p><p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Calendar size={12}/> {formatDate(tx.date)} • {tx.paymentMethod}</p></div></div>
                           <div className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{tx.type === 'income' ? '+' : '-'} R$ {formatNumber(tx.amount)}</div>
                        </div>
                     ))
                  )}
               </div>
            </Card>
        </div>
      </div>
    );
  };

  const renderTransactions = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
         <header><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Extrato Diário</h2><p className="text-slate-500 mt-1">Histórico completo de entradas e saídas.</p></header>
         <div className="flex gap-3 w-full sm:w-auto"><Button onClick={handleExportCSV} variant="outline" icon={Download} className="flex-1 sm:flex-none">Excel</Button><Button onClick={() => handleOpenModal()} icon={Plus} className="flex-1 sm:flex-none">Novo</Button></div>
      </div>
      
      {renderFilterBar()}
      {renderFilterExtras()}

      <Card className="overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider"><th className="p-4 font-bold">Data</th><th className="p-4 font-bold">Categoria (Descrição)</th><th className="p-4 font-bold">Pagamento</th><th className="p-4 font-bold text-right">Valor</th><th className="p-4 font-bold text-center">Ações</th></tr></thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredTransactions.length === 0 ? (<tr><td colSpan="5" className="p-8 text-center text-slate-500">Nenhum lançamento encontrado para este período/filtro.</td></tr>) : (
                     filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="p-4 text-slate-600 whitespace-nowrap">{formatDate(tx.date)}</td>
                           <td className="p-4 font-medium text-slate-800">{tx.category}</td>
                           <td className="p-4 text-slate-600"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">{tx.paymentMethod}</span></td>
                           <td className={`p-4 text-right font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{tx.type === 'income' ? '+' : '-'} R$ {formatNumber(tx.amount)}</td>
                           <td className="p-4">
                              <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => handleOpenModal(tx)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                                 <button onClick={() => requestDeleteTransaction(tx.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                              </div>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </Card>
    </div>
  );

  const renderBills = () => {
    const pendingBills = filteredBills.filter(b => b.status === 'pending');
    
    const totals = pendingBills.reduce((acc, curr) => {
      const val = parseFloat(curr.amount) || 0;
      if (curr.type === 'income') acc.income += val; else acc.expense += val;
      return acc;
    }, { income: 0, expense: 0 });
    
    // Calcula o saldo previsto: Entradas a Receber - Contas a Pagar
    const balance = totals.income - totals.expense;

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
           <header><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Contas a Pagar e Receber</h2><p className="text-slate-500 mt-1">Previsões e agendamentos futuros. Ao dar baixa, o valor entra no caixa principal.</p></header>
           <Button onClick={handleOpenBillModal} icon={Plus} className="w-full sm:w-auto shadow-md hover:shadow-lg">Novo Agendamento</Button>
        </div>

        {renderFilterBar()}
        {renderFilterExtras()}

        {/* CARTÕES DE PREVISÃO COM O SALDO PREVISTO EM DESTAQUE (bg-slate-800) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-2xl p-6 shadow-xl transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center gap-2 mb-2 opacity-80 text-slate-300"><Receipt size={18} /><span className="text-xs font-bold uppercase tracking-wider">Saldo Previsto</span></div>
            <h3 className="text-3xl font-black text-white">{formatCurrency(balance)}</h3>
          </div>
          <Card className="p-6 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 text-slate-500"><ArrowDownCircle size={18} /><span className="text-xs font-bold uppercase tracking-wider">Previsão de Recebimentos</span></div>
            <h3 className="text-3xl font-black text-emerald-600">{formatCurrency(totals.income)}</h3>
          </Card>
          <Card className="p-6 border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 text-slate-500"><ArrowUpCircle size={18} /><span className="text-xs font-bold uppercase tracking-wider">Previsão de Pagamentos</span></div>
            <h3 className="text-3xl font-black text-red-600">{formatCurrency(totals.expense)}</h3>
          </Card>
        </div>

        <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Agendamentos Pendentes</h3>
            {pendingBills.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm"><p className="text-slate-500">Nenhuma conta pendente para este período.</p></div>
            ) : (
               pendingBills.map(bill => {
                 const isOverdue = new Date(bill.dueDate) < new Date(new Date().toISOString().split('T')[0]);
                 return (
                   <Card key={bill.id} className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 hover:shadow-md transition-all group ${bill.type === 'income' ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                     <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bill.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{bill.type === 'income' ? <ArrowDownCircle size={24}/> : <ArrowUpCircle size={24}/>}</div>
                       <div className="min-w-0 flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <p className="font-bold text-slate-800 text-lg truncate">{bill.category}</p>
                           {isOverdue && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">Atrasado</span>}
                         </div>
                         <p className="text-sm text-slate-500 flex items-center gap-1 shrink-0"><Calendar size={14}/> Vence em: {formatDate(bill.dueDate)}</p>
                       </div>
                     </div>
                     <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-4 sm:pt-0 border-t sm:border-0 border-slate-100 mt-2 sm:mt-0">
                        <div className={`font-black text-xl whitespace-nowrap ${bill.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>R$ {formatNumber(bill.amount)}</div>
                        <div className="flex gap-2">
                          <button onClick={() => requestDeleteBill(bill.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors sm:opacity-0 sm:group-hover:opacity-100" title="Excluir"><Trash2 size={20}/></button>
                          <button onClick={() => openSettleModal(bill)} className={`px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm transition-transform active:scale-95 ${bill.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>Dar Baixa</button>
                        </div>
                     </div>
                   </Card>
                 );
               })
            )}

            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-2 mt-8 pt-6 border-t border-slate-200">Histórico de Contas Baixadas (Pagas/Recebidas)</h3>
            {filteredBills.filter(b => b.status === 'paid').map(bill => (
               <div key={bill.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 rounded-2xl border border-slate-100 group">
                 <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden opacity-70 group-hover:opacity-100 transition-opacity">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600"><CheckCircle size={20}/></div>
                   <div className="min-w-0 flex-1">
                     <p className="font-bold text-slate-800 text-base truncate line-through">{bill.category}</p>
                     <p className="text-sm text-slate-500 flex items-center gap-1 shrink-0"><Calendar size={14}/> Pago em: {formatDate(bill.paymentDate)}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className={`font-bold text-lg ${bill.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>{bill.type === 'income' ? `+R$ ${formatNumber(bill.paidAmount)}` : `-R$ ${formatNumber(bill.paidAmount)}`}</div>
                    <button onClick={() => requestDeleteBill(bill.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Excluir Histórico"><Trash2 size={18}/></button>
                 </div>
               </div>
            ))}
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Categorias</h2><p className="text-slate-500 mt-1">Organize as suas finanças por grupos.</p></header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Card className="p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-emerald-600 flex items-center gap-2"><ArrowUpCircle size={20}/> Entradas</h3><button onClick={() => setCategoryModal({ isOpen: true, type: 'income', originalName: '', currentName: '' })} className="text-emerald-600 hover:bg-emerald-50 p-2 rounded-lg transition-colors"><Plus size={20}/></button></div>
            <div className="space-y-2">
               {sortedIncomeCats.map(cat => (
                  <div key={cat} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl group border border-transparent hover:border-slate-100 transition-colors">
                     <span className="font-medium text-slate-700">{cat}</span>
                     {cat !== 'Outros' && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setCategoryModal({ isOpen: true, type: 'income', originalName: cat, currentName: cat })} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 size={16}/></button>
                           <button onClick={() => requestDeleteCategory(cat, 'income')} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16}/></button>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </Card>
         <Card className="p-6">
            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-red-600 flex items-center gap-2"><ArrowDownCircle size={20}/> Saídas</h3><button onClick={() => setCategoryModal({ isOpen: true, type: 'expense', originalName: '', currentName: '' })} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Plus size={20}/></button></div>
            <div className="space-y-2">
               {sortedExpenseCats.map(cat => (
                  <div key={cat} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl group border border-transparent hover:border-slate-100 transition-colors">
                     <span className="font-medium text-slate-700">{cat}</span>
                     {cat !== 'Outros' && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => setCategoryModal({ isOpen: true, type: 'expense', originalName: cat, currentName: cat })} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 size={16}/></button>
                           <button onClick={() => requestDeleteCategory(cat, 'expense')} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16}/></button>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );

  const renderPlans = () => (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Meu Plano</h2><p className="text-slate-500 mt-1">Gerencie a sua assinatura do LD Finanças.</p></header>
      
      <Card className="p-6 sm:p-8 border-t-4 border-t-emerald-500">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div><p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">PLANO ATUAL</p><h3 className="text-3xl font-black text-slate-800">{userProfile.plan || 'Free'}</h3></div>
            <div className="text-left sm:text-right"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${userProfile.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{userProfile.status}</span><p className="text-sm text-slate-500 font-medium">{userProfile.plan === 'Admin' ? 'Acesso Vitalício' : `${userProfile.daysRemaining || 0} dias restantes`}</p></div>
         </div>

         <h4 className="font-bold text-slate-800 text-lg mb-4">Atualizar Assinatura</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PLANO BÁSICO - COMO EDITAR: Altere o "Plano Básico", os "19,90" e as descrições abaixo conforme desejar. */}
            <div className={`p-6 rounded-2xl border-2 transition-all relative ${userProfile.plan === 'Básico' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
               {userProfile.plan === 'Básico' && <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Atual</div>}
               <h5 className="font-bold text-xl text-slate-800 mb-2">Plano Básico</h5>
               <p className="text-slate-500 text-sm mb-6 min-h-[40px]">Lançamentos ilimitados diários e categorias personalizadas.</p>
               <div className="mb-6"><span className="text-3xl font-black text-slate-800">R$ 9,90</span><span className="text-slate-500 font-medium">/mês</span></div>
               <a href={`https://wa.me/5564993181827?text=Olá! Quero assinar o Plano Básico (R$ 9,90) do LD Finanças. Meu email é: ${userProfile.email}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3 px-4 rounded-xl font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">Assinar via WhatsApp</a>
            </div>

            {/* PLANO PRO - COMO EDITAR: Altere o "Plano Pro", os "29,90" e as descrições abaixo conforme desejar. */}
            <div className={`p-6 rounded-2xl border-2 transition-all relative ${userProfile.plan === 'Pro' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-emerald-200'}`}>
               {userProfile.plan === 'Pro' ? <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Atual</div> : <div className="absolute -top-3 left-4 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">MAIS VENDIDO</div>}
               <h5 className="font-bold text-xl text-slate-800 mb-2 mt-2">Plano Pro</h5>
               <p className="text-slate-500 text-sm mb-6 min-h-[40px]">Tudo do Básico + <strong className="text-slate-700">Gestão de Contas a Pagar e Receber</strong>.</p>
               <div className="mb-6"><span className="text-3xl font-black text-emerald-600">R$ 19,90</span><span className="text-slate-500 font-medium">/mês</span></div>
               <a href={`https://wa.me/5564993181827?text=Olá! Quero assinar o Plano Pro (R$ 19,90) do LD Finanças. Meu email é: ${userProfile.email}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3 px-4 rounded-xl font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors">Assinar via WhatsApp</a>
            </div>

         </div>
      </Card>
    </div>
  );

  const renderTutorial = () => (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Como Funciona</h2><p className="text-slate-500 mt-1">Um passo a passo simples para dominar o sistema.</p></header>
      <div className="space-y-4">
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-emerald-400"><div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">1</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Cadastre as suas Categorias</h3><p className="text-slate-600">Acesse a aba "Categorias" e crie os nomes dos seus tipos de despesas (Luz, Aluguel) e receitas (Serviço, Venda).</p></div></Card>
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-blue-400"><div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">2</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Registre as Movimentações do Caixa</h3><p className="text-slate-600">Vá em "Lançamentos" &gt; "Novo Lançamento". Adicione os valores que você já pagou ou já recebeu no dia a dia para compor o seu saldo real.</p></div></Card>
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-amber-400"><div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">3</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Contas a Pagar e Receber (Agendamentos)</h3><p className="text-slate-600">Nesta aba, você agenda as contas do futuro. Quando o dia chegar e você pagar o boleto, clique em <b>"Dar Baixa"</b>. O sistema automaticamente vai retirar a conta da agenda e enviar o valor direto para o seu Caixa Diário!</p></div></Card>
         <Card className="p-6 flex gap-4 items-start border-l-4 border-l-purple-400"><div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">4</div><div><h3 className="font-bold text-lg text-slate-800 mb-1">Acompanhe e Exporte</h3><p className="text-slate-600">Use os botões de Filtro no topo das telas para ver o resultado do Mês Específico. Na aba Lançamentos, clique em "Excel" para enviar ao seu contador.</p></div></Card>
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (userProfile.email !== ADMIN_EMAIL) return <div className="p-8 text-center text-slate-500">Acesso Negado</div>;
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <header className="mb-6"><h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Painel Administrativo</h2><p className="text-slate-500 mt-1">Visão geral dos clientes do SaaS.</p></header>
         <Card className="overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead><tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider"><th className="p-4 font-bold">Usuário / Cadastro</th><th className="p-4 font-bold">Plano</th><th className="p-4 font-bold text-center">Dias Restantes</th><th className="p-4 font-bold text-center">Status</th><th className="p-4 font-bold text-center">Ações</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                     {adminUsers.map(user => (
                        <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                           <td className="p-4"><p className="font-bold text-slate-800">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p><p className="text-xs text-slate-400 mt-1">Cad: {formatDate(user.createdAt?.split('T')[0])}</p></td>
                           <td className="p-4"><span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase ${user.plan === 'Admin' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>{user.plan}</span></td>
                           <td className="p-4 text-center font-medium text-slate-700">{user.plan === 'Admin' ? 'Vitalício' : `${user.daysRemaining || 0} d`}</td>
                           <td className="p-4 text-center"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span></td>
                           <td className="p-4">
                              <div className="flex justify-center gap-2">
                                 <button onClick={() => handleToggleUserStatus(user)} className={`p-2 rounded-lg transition-colors ${user.status === 'Ativo' ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`} title={user.status === 'Ativo' ? 'Bloquear' : 'Desbloquear'}>{user.status === 'Ativo' ? <Lock size={16}/> : <LockOpen size={16}/>}</button>
                                 <button onClick={() => handleOpenAdminEdit(user)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Editar Plano"><Edit2 size={16}/></button>
                                 {user.email !== ADMIN_EMAIL && <button onClick={() => handleDeleteAdminUser(user)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Excluir Conta"><Trash2 size={16}/></button>}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* MENU LATERAL */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-50">
           <div className="flex items-center gap-2 font-black text-xl text-slate-800 tracking-tight">
             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-sm">LD</div>FINANÇAS
           </div>
           <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600"><X size={24}/></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          <button onClick={() => {setCurrentView('dashboard'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentView === 'dashboard' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}><Home size={20}/> Início</button>
          <button onClick={() => {setCurrentView('transactions'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentView === 'transactions' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}><CardIcon size={20}/> Lançamentos</button>
          
          {/* TRAVA DO PLANO: Só exibe Contas a Pagar/Receber para PRO, ADMIN ou FREE (Test-Drive) */}
          {(userProfile.plan === 'Pro' || userProfile.plan === 'Admin' || userProfile.plan === 'Free') && (
            <button onClick={() => {setCurrentView('bills'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentView === 'bills' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}><Receipt size={20}/> Contas Pagar/Receber</button>
          )}

          <button onClick={() => {setCurrentView('categories'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentView === 'categories' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}><Tag size={20}/> Categorias</button>
          <button onClick={() => {setCurrentView('plans'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentView === 'plans' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}><CardIcon size={20}/> Meu Plano</button>
          <button onClick={() => {setCurrentView('tutorial'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${currentView === 'tutorial' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}><PlayCircle size={20}/> Como Funciona</button>
          {userProfile.email === ADMIN_EMAIL && <button onClick={() => {setCurrentView('admin'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium mt-4 border border-slate-200 ${currentView === 'admin' ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}><ShieldAlert size={20}/> Painel Admin</button>}
        </nav>

        <div className="p-4 mt-auto">
           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
             <p className="font-bold text-slate-800 text-sm truncate">{userProfile.name}</p>
             <p className="text-xs text-slate-500 truncate mb-3">{userProfile.email}</p>
             <div className="flex items-center justify-between"><span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${userProfile.plan === 'Admin' ? 'bg-slate-800 text-amber-400' : 'bg-emerald-100 text-emerald-700'}`}>{userProfile.plan}</span>{userProfile.plan !== 'Admin' && <span className="text-[10px] font-medium text-slate-500">{userProfile.daysRemaining}d</span>}</div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={16}/> Sair do Sistema</button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* BLOQUEIO DE TELA POR STATUS (Para devedores) */}
        {userProfile.status !== 'Ativo' && userProfile.plan !== 'Admin' && (
            <div className="absolute inset-0 z-40 bg-slate-50 flex items-center justify-center p-4">
               <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
                   <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32}/></div>
                   <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Suspenso</h2>
                   <p className="text-slate-600 mb-8">
                     {userProfile.daysRemaining <= 0 
                        ? "Sua assinatura expirou. Para continuar aproveitando todas as funcionalidades e não perder seus dados, renove agora mesmo!" 
                        : "Sua conta foi suspensa temporariamente. Entre em contato com o suporte para reativar seu acesso."}
                   </p>
                   <a href={`https://wa.me/5564993181827?text=Olá! Minha conta está bloqueada e quero regularizar meu acesso. Meu email é: ${userProfile.email}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3.5 px-4 rounded-xl font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors">Falar com o Suporte (WhatsApp)</a>
                   <button onClick={handleLogout} className="mt-4 text-sm font-medium text-slate-500 hover:text-slate-700">Sair da Conta</button>
               </div>
            </div>
        )}

        <header className="lg:hidden bg-white border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-30">
           <div className="flex items-center gap-2 font-black text-lg text-slate-800"><div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center text-white text-[10px]">LD</div>FINANÇAS</div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 bg-slate-50 rounded-xl"><Menu size={20}/></button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
             {currentView === 'dashboard' && renderDashboard()}
             {currentView === 'transactions' && renderTransactions()}
             {currentView === 'bills' && renderBills()}
             {currentView === 'categories' && renderCategories()}
             {currentView === 'plans' && renderPlans()}
             {currentView === 'tutorial' && renderTutorial()}
             {currentView === 'admin' && renderAdmin()}
          </div>
        </div>
      </main>

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* MODAL NOVO LANÇAMENTO (CAIXA DIÁRIO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CardIcon size={24} className="text-emerald-600"/> {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
               <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button onClick={() => handleTypeToggle('expense')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Saída</button>
              <button onClick={() => handleTypeToggle('income')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Entrada</button>
            </div>

            <form onSubmit={handleSaveTransaction}>
              <div className="mb-6"><label className="text-sm font-bold text-slate-700 mb-2 block">Valor (R$)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span><input type="text" name="amount" value={formData.amount} onChange={handleFormChange} required placeholder="0,00" className={`w-full border-2 rounded-xl pl-12 pr-4 py-4 text-2xl font-black focus:outline-none focus:ring-0 transition-all ${formData.type === 'expense' ? 'text-red-600 border-red-100 focus:border-red-500 bg-red-50/30' : 'text-emerald-600 border-emerald-100 focus:border-emerald-500 bg-emerald-50/30'}`} /></div></div>
              <Input label="Data" name="date" type="date" value={formData.date} onChange={handleFormChange} required />
              <Select label="Categoria" name="category" value={formData.category} onChange={handleFormChange} options={formData.type === 'income' ? sortedIncomeCats : sortedExpenseCats} required />
              {formData.category.toLowerCase() === 'outros' && <Input label="Descrição da Categoria (Ex: Combustível)" name="customDescription" value={formData.customDescription} onChange={handleFormChange} required placeholder="Digite a descrição..." />}
              <Select label="Forma de Pagamento" name="paymentMethod" value={formData.paymentMethod} onChange={handleFormChange} options={PAYMENT_METHODS} required />
              
              <div className="mt-8 flex gap-3"><button type="button" onClick={handleCloseModal} className="flex-1 py-3.5 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className={`flex-1 py-3.5 px-4 font-bold rounded-xl text-white transition-colors shadow-sm ${formData.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>Salvar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE AGENDAMENTO (CONTAS A PAGAR E RECEBER) - SEM TITULO, COM CATEGORIAS */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsBillModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-20 pb-2">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Receipt size={24} className="text-slate-500"/> Novo Agendamento</h3>
               <button onClick={() => setIsBillModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button onClick={() => setBillFormData({...billFormData, type: 'income', category: sortedIncomeCats[0] || '', customDescription: ''})} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${billFormData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>A Receber (+)</button>
              <button onClick={() => setBillFormData({...billFormData, type: 'expense', category: sortedExpenseCats[0] || '', customDescription: ''})} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${billFormData.type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>A Pagar (-)</button>
            </div>

            <form onSubmit={handleSaveBill}>
              {/* REMOVIDO TÍTULO - USANDO CATEGORIAS AGORA */}
              <Select label="Categoria" name="category" value={billFormData.category} onChange={handleBillFormChange} options={billFormData.type === 'income' ? sortedIncomeCats : sortedExpenseCats} required />
              {billFormData.category.toLowerCase() === 'outros' && <Input label="Descrição da Categoria (Ex: Aluguel da Loja)" name="customDescription" value={billFormData.customDescription} onChange={handleBillFormChange} required placeholder="Digite a descrição..." />}
              
              <Input label="Valor Previsto (R$)" name="amount" value={billFormData.amount} onChange={handleBillFormChange} required placeholder="0,00" />
              <Input label="Data de Vencimento" name="dueDate" type="date" value={billFormData.dueDate} onChange={handleBillFormChange} required />
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 mt-2">
                 <label className="flex items-center gap-3 cursor-pointer mb-2">
                    <input type="checkbox" name="isRecurring" checked={billFormData.isRecurring} onChange={handleBillFormChange} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="font-medium text-slate-700">Esta conta se repete mensalmente?</span>
                 </label>
                 {billFormData.isRecurring && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                       <Input label="Repetir por quantos meses?" name="recurrenceMonths" type="number" min="2" max="60" value={billFormData.recurrenceMonths} onChange={handleBillFormChange} required placeholder="Ex: 12" />
                       <p className="text-xs text-slate-500 mt-[-10px]">O sistema criará {billFormData.recurrenceMonths} agendamentos, vencendo dia {billFormData.dueDate.split('-')[2]} de cada mês.</p>
                    </div>
                 )}
              </div>

              <div className="mt-6 flex gap-3"><button type="button" onClick={() => setIsBillModalOpen(false)} className="flex-1 py-3.5 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className="flex-1 py-3.5 px-4 font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition-colors shadow-sm">Agendar Conta</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE BAIXA (PAGAR/RECEBER) COM FORMA DE PAGAMENTO */}
      {settleModal.isOpen && settleModal.bill && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSettleModal({ isOpen: false, bill: null, paymentDate: '', paidAmount: '', paymentMethod: PAYMENT_METHODS[0] })}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CheckCircle size={24} className="text-emerald-500"/> Confirmar {settleModal.bill.type === 'income' ? 'Recebimento' : 'Pagamento'}</h3>
                <button onClick={() => setSettleModal({ isOpen: false, bill: null, paymentDate: '', paidAmount: '', paymentMethod: PAYMENT_METHODS[0] })} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full"><X size={18}/></button>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <p className="text-sm text-slate-600 mb-1"><span className="font-bold text-slate-800">Conta:</span> {settleModal.bill.category}</p>
                <p className="text-sm text-slate-600"><span className="font-bold text-slate-800">Valor Original:</span> {formatCurrency(settleModal.bill.amount)}</p>
             </div>

             <form onSubmit={handleSettleBillSubmit}>
                <Input label="Qual foi o valor final (com multas/descontos)?" name="paidAmount" value={settleModal.paidAmount} onChange={(e) => setSettleModal({...settleModal, paidAmount: e.target.value})} required placeholder="Ex: 200,00" />
                <Input label="Data efetiva" name="paymentDate" type="date" value={settleModal.paymentDate} onChange={(e) => setSettleModal({...settleModal, paymentDate: e.target.value})} required />
                <Select label="Forma de Pagamento" name="paymentMethod" value={settleModal.paymentMethod} onChange={(e) => setSettleModal({...settleModal, paymentMethod: e.target.value})} options={PAYMENT_METHODS} required />
                
                <div className="mt-6 flex gap-3"><button type="button" onClick={() => setSettleModal({ isOpen: false, bill: null, paymentDate: '', paidAmount: '', paymentMethod: PAYMENT_METHODS[0] })} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200">Cancelar</button><button type="submit" className={`flex-1 py-3 px-4 font-bold rounded-xl text-white shadow-sm ${settleModal.bill.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>Dar Baixa no Caixa</button></div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIA */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setCategoryModal({ isOpen: false, type: 'income', originalName: '', currentName: '' })}></div>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">{categoryModal.originalName ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <form onSubmit={handleSaveCategory}>
              <Input label="Nome da Categoria" value={categoryModal.currentName} onChange={(e) => setCategoryModal({...categoryModal, currentName: e.target.value})} required placeholder="Ex: Alimentação" />
              <div className="mt-6 flex gap-3"><button type="button" onClick={() => setCategoryModal({ isOpen: false, type: 'income', originalName: '', currentName: '' })} className="flex-1 py-3 px-4 font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancelar</button><button type="submit" className="flex-1 py-3 px-4 font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm">Salvar</button></div>
            </form>
          </div>
        </div>
      )}

      {/* NOVO: Modal de Edição do Admin (Planos e Dias) */}
      {adminEditModal.isOpen && adminEditModal.user && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setAdminEditModal({ isOpen: false, user: null, plan: 'Free', daysRemaining: 30 })}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 p-6 sm:p-8">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Settings size={24} className="text-slate-500"/> Editar Plano do Cliente</h3>
                <button onClick={() => setAdminEditModal({ isOpen: false, user: null, plan: 'Free', daysRemaining: 30 })} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex justify-between items-center">
                 <div>
                    <p className="text-sm text-slate-600"><span className="font-bold text-slate-800">Cliente:</span> {adminEditModal.user.name}</p>
                    <p className="text-sm text-slate-600"><span className="font-bold text-slate-800">E-mail:</span> {adminEditModal.user.email}</p>
                 </div>
                 {/* BOTÃO MÁGICO DE RENOVAÇÃO RÁPIDA */}
                 <button 
                    type="button"
                    onClick={() => {
                        let currentDays = parseInt(adminEditModal.daysRemaining);
                        if(isNaN(currentDays)) currentDays = 0;
                        setAdminEditModal({...adminEditModal, daysRemaining: currentDays + 30});
                    }}
                    className="bg-emerald-100 text-emerald-700 font-bold py-1.5 px-3 rounded-lg text-sm hover:bg-emerald-200 transition-colors"
                    title="Adicionar 30 dias ao saldo atual"
                 >
                    +30 Dias
                 </button>
             </div>

             <form onSubmit={handleSaveAdminEdit}>
                <Select 
                  label="Novo Plano" 
                  name="plan" 
                  value={adminEditModal.plan} 
                  onChange={(e) => setAdminEditModal({...adminEditModal, plan: e.target.value})} 
                  options={[
                    { value: 'Free', label: 'Free' },
                    { value: 'Básico', label: 'Básico (R$ 9,90/mês)' },
                    { value: 'Pro', label: 'Pro (R$ 19,90/mês)' },
                    { value: 'Admin', label: 'Admin (Vitalício)' }
                  ]} 
                  required 
                />
                <Input label="Dias Restantes (Digite manualmente se necessário)" name="daysRemaining" type="number" inputMode="numeric" value={adminEditModal.daysRemaining} onChange={(e) => setAdminEditModal({...adminEditModal, daysRemaining: e.target.value})} placeholder="Ex: 30" required />
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
              const userData = docSnap.data();
              const today = new Date().toISOString().split('T')[0];
              let updates = {};
              let needsUpdate = false;

              // Robô de Desconto Automático de Dias
              if (userData.email !== ADMIN_EMAIL && userData.plan !== 'Admin' && userData.daysRemaining > 0) {
                  const lastCheck = userData.lastDecrementDate || userData.createdAt?.split('T')[0] || today;
                  if (lastCheck !== today) {
                      const daysPassed = Math.floor((new Date(today) - new Date(lastCheck)) / (1000 * 60 * 60 * 24));
                      if (daysPassed > 0) {
                          const newDays = Math.max(0, userData.daysRemaining - daysPassed);
                          updates.daysRemaining = newDays;
                          updates.lastDecrementDate = today;
                          if (newDays === 0) updates.status = 'Bloqueado';
                          needsUpdate = true;
                      }
                  }
              }

              if (needsUpdate) {
                  setDoc(docRef, updates, { merge: true });
                  setUserProfile({ uid: user.uid, ...userData, ...updates });
              } else {
                  setUserProfile({ uid: user.uid, ...userData });
              }
           } else {
              const basicProfile = { name: 'Utilizador', email: user.email, plan: 'Free', daysRemaining: 30, status: 'Ativo', createdAt: new Date().toISOString() };
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
