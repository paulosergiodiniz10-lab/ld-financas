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
// (Mantenha todos os ícones que já estavam aqui)

// --- CONFIGURAÇÕES DO SISTEMA ---
const ADMIN_EMAIL = "cnviagem@gmail.com";
const PAYMENT_METHODS = ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência Bancária', 'Boleto', 'Outros'];
