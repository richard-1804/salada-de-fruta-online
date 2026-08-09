// =====================================================
// CONFIGURAÇÃO DO FIREBASE
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

// =====================================================
// CONFIGURAÇÃO DO PROJETO
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyDvs1iFiT9N76Fdpa4Csd3Y5-QbEVcTeVQ",
  authDomain: "salada-de-fruta-online.firebaseapp.com",
  projectId: "salada-de-fruta-online",
  storageBucket: "salada-de-fruta-online.firebasestorage.app",
  messagingSenderId: "216890217560",
  appId: "1:216890217560:web:118674afe4755a1ef8e62d",
};

// =====================================================
// INICIALIZAR FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

// =====================================================
// EXPORTAR
// =====================================================

export { app };
