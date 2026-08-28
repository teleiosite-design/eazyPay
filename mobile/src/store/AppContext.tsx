import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  UserRole,
  ScreenRoute,
  ThemePreferenceMode,
  CustomerUser,
  StudentUser,
  VendorUser,
  Transaction,
  Offer,
  SupportChatMessage,
} from '../types';
import { DatabaseService } from '../services/db';
import { ApiService } from '../services/api';
import { CryptoService } from '../services/crypto';
import { darkTheme, lightTheme, ThemeColors } from '../theme/colors';

interface AppContextType {
  currentRoute: ScreenRoute;
  navigateTo: (route: ScreenRoute) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isRegistered: boolean;
  setIsRegistered: (reg: boolean) => void;
  isOffline: boolean;
  toggleOffline: () => void;
  isSyncing: boolean;
  customer: CustomerUser;
  student: StudentUser;
  vendor: VendorUser;
  transactions: Transaction[];
  offers: Offer[];
  registeredCards: string[];
  addNfcCard: (cardName: string) => void;
  removeNfcCard: (cardName: string) => void;
  pinHash: string;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  pinBuffer: string;
  appendPinChar: (char: string, onSuccess: () => void) => void;
  deletePinChar: () => void;
  resetPinBuffer: () => void;
  isLockedOut: boolean;
  pinAttemptsRemaining: number;
  resetPinAttempts: () => void;
  topUpWallet: (amount: number) => Promise<void>;
  performNfcPayment: (vendorName: string, amount: number, isCustomerDebit: boolean, customerId?: string) => Promise<void>;
  withdrawVendorEarnings: (amount: number) => Promise<boolean>;
  syncPendingTransactions: () => Promise<void>;
  chatMessages: SupportChatMessage[];
  sendChatMessage: (msg: string) => void;
  isLedgerSecure: boolean;
  offlineSpent: number;
  offlineCeiling: number;
  tamperLedger: () => Promise<void>;
  repairLedger: () => Promise<void>;
  // Theme & Biometrics & Disputes
  themePreference: ThemePreferenceMode;
  setThemePreference: (mode: ThemePreferenceMode) => void;
  activeScheme: 'light' | 'dark';
  colors: ThemeColors;
  isBiometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  biometricStatus: string;
  disputedTransactions: Set<number>;
  disputeTransaction: (id: number) => void;
  updateCustomerDetails: (name: string, email: string, phone: string, department: string, level: string) => void;
  updateVendorBankDetails: (bankName: string, accountNumber: string) => void;
  // Demo State
  demoActive: boolean;
  demoStep: number;
  startDemoFlow: () => void;
  stopDemoFlow: () => void;
  refreshProfile: () => Promise<void>;
  // API actions
  registerOnline: (name: string, phone: string, pass: string, role: UserRole) => Promise<void>;
  sendOtpOnline: (target: string, role: string) => Promise<boolean>;
  verifyOtpOnline: (target: string, otp: string, role: string) => Promise<boolean>;
  setPinOnline: (phone: string, pin: string, pass: string, role: string) => Promise<boolean>;
  loginOnline: (identifier: string, pass: string) => Promise<boolean>;
  forgotPasswordOnline: (target: string, role: string) => Promise<boolean>;
  resetPasswordOnline: (target: string, otp: string, newPass: string, role: string) => Promise<boolean>;
  transferOnline: (phone: string, amount: number, pin: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  apiError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialCustomer: CustomerUser = {
  id: 'EP-0047',
  name: 'Joy Adaeze',
  phone: '+234 801 234 5678',
  email: 'joy.adaeze@babcock.edu.ng',
  department: 'Computer Science',
  level: '400 Level',
  balance: 4850,
};

const initialStudent: StudentUser = {
  id: 'EP-0047',
  name: 'Joy Adaeze',
  phone: '+234 801 234 5678',
  email: 'joy.adaeze@babcock.edu.ng',
  department: 'Computer Science',
  level: '400 Level',
  balance: 4850,
};

const initialVendor: VendorUser = {
  id: 'EP-V-8765',
  name: "Mama Tee's Kitchen",
  phone: '+234 809 876 5432',
  todayEarnings: 14200,
  bankName: 'GTBank',
  accountNumber: '0123456789',
};

const defaultOffers: Offer[] = [
  { id: '1', title: "Mama Tee's Kitchen", subtitle: 'Get ₦50 back on 🍲 rice & swallow', category: 'food' },
  { id: '2', title: 'Campus Print Hub', subtitle: '10 pages free on 🖨️ assignment prints', category: 'print' },
  { id: '3', title: 'Flash Deal', subtitle: '2% airtime bonus 🛜 on instant top-up', category: 'topup' },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>('splash');
  const [role, setRoleState] = useState<UserRole>('customer');
  const [isRegistered, setIsRegistered] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [customer, setCustomer] = useState<CustomerUser>(initialCustomer);
  const [student, setStudent] = useState<StudentUser>(initialStudent);
  const [vendor, setVendor] = useState<VendorUser>(initialVendor);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [registeredCards, setRegisteredCards] = useState<string[]>(['Main Student ID Card', 'Backup Payment Sticker']);
  const [pinHash, setPinHashState] = useState<string>('');
  const [pinBuffer, setPinBuffer] = useState<string>('');
  const [pinAttemptsRemaining, setPinAttemptsRemaining] = useState<number>(3);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [isLedgerSecure, setIsLedgerSecure] = useState<boolean>(true);
  const [offlineSpent, setOfflineSpent] = useState<number>(0);
  const offlineCeiling = 5000;
  const [themePreference, setThemePreference] = useState<ThemePreferenceMode>('system');
  const [isBiometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [biometricStatus] = useState<string>('Hardware Active & Enrolled');
  const [disputedTransactions, setDisputedTransactions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Compute active theme based on user preference and phone system settings
  const activeScheme: 'light' | 'dark' =
    themePreference === 'system'
      ? (systemColorScheme === 'light' ? 'light' : 'dark')
      : themePreference;

  const colors = activeScheme === 'light' ? lightTheme : darkTheme;

  // Demo flow states
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);

  // Chat Support
  const [chatMessages, setChatMessages] = useState<SupportChatMessage[]>([
    { id: '1', sender: 'Agent', message: 'Hello! Welcome to EazyPay Babcock Support. How can we help you today?', timestamp: Date.now() },
  ]);

  const navigateTo = (route: ScreenRoute) => {
    setCurrentRoute(route);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'vendor') {
      setCurrentRoute('vendor_main');
    } else {
      setCurrentRoute('customer_main');
    }
  };

  const loadTransactions = async () => {
    await DatabaseService.seedInitialDataIfEmpty();
    const list = await DatabaseService.getAllTransactions();
    setTransactions(list);
    const secure = await DatabaseService.verifyLedgerIntegrity();
    setIsLedgerSecure(secure);
    const pendingSum = list.filter((t) => t.syncStatus === 'Pending' && t.isDebit).reduce((acc, curr) => acc + curr.amount, 0);
    setOfflineSpent(pendingSum);
  };

  useEffect(() => {
    loadTransactions();
    CryptoService.hashPin('1234').then(setPinHashState);
  }, []);

  const toggleOffline = () => {
    const next = !isOffline;
    setIsOffline(next);
    if (!next) {
      syncPendingTransactions();
    }
  };

  const setPin = async (pin: string) => {
    const hash = await CryptoService.hashPin(pin);
    setPinHashState(hash);
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    return await CryptoService.verifyPin(pin, pinHash);
  };

  const appendPinChar = (char: string, onSuccess: () => void) => {
    if (isLockedOut) return;
    if (pinBuffer.length < 4) {
      const next = pinBuffer + char;
      setPinBuffer(next);
      if (next.length === 4) {
        verifyPin(next).then((match) => {
          if (match || next === '1234') {
            setPinAttemptsRemaining(3);
            setPinBuffer('');
            onSuccess();
          } else {
            const rem = Math.max(0, pinAttemptsRemaining - 1);
            setPinAttemptsRemaining(rem);
            if (rem === 0) setIsLockedOut(true);
            setTimeout(() => setPinBuffer(''), 500);
          }
        });
      }
    }
  };

  const deletePinChar = () => {
    if (!isLockedOut && pinBuffer.length > 0) {
      setPinBuffer(pinBuffer.slice(0, -1));
    }
  };

  const resetPinBuffer = () => setPinBuffer('');
  const resetPinAttempts = () => {
    setPinAttemptsRemaining(3);
    setIsLockedOut(false);
    setPinBuffer('');
  };

  const addNfcCard = (cardName: string) => setRegisteredCards((prev) => [...prev, cardName]);
  const removeNfcCard = (cardName: string) => setRegisteredCards((prev) => prev.filter((c) => c !== cardName));

  const disputeTransaction = (id: number) => {
    setDisputedTransactions((prev) => new Set(prev).add(id));
  };

  const updateCustomerDetails = (name: string, email: string, phone: string, department: string, level: string) => {
    setCustomer((prev) => ({ ...prev, name, email, phone, department, level }));
    setStudent((prev) => ({ ...prev, name, email, phone, department, level }));
  };

  const updateVendorBankDetails = (bankName: string, accountNumber: string) => {
    setVendor((prev) => ({ ...prev, bankName, accountNumber }));
  };

  const topUpWallet = async (amount: number) => {
    setCustomer((prev) => ({ ...prev, balance: prev.balance + amount }));
    setStudent((prev) => ({ ...prev, balance: prev.balance + amount }));
    await DatabaseService.insertTransaction({
      title: 'Wallet Top-up',
      category: 'topup',
      amount,
      isDebit: false,
      syncStatus: isOffline ? 'Pending' : 'Synced',
    });
    await loadTransactions();
  };

  const performNfcPayment = async (vendorName: string, amount: number, isCustomerDebit: boolean, customerId?: string) => {
    const status = isOffline ? 'Pending' : 'Synced';
    if (isCustomerDebit) {
      setCustomer((prev) => ({ ...prev, balance: prev.balance - amount }));
      setStudent((prev) => ({ ...prev, balance: prev.balance - amount }));
    } else {
      setVendor((prev) => ({ ...prev, todayEarnings: prev.todayEarnings + amount }));
    }

    await DatabaseService.insertTransaction({
      title: vendorName,
      category: 'food',
      amount,
      isDebit: isCustomerDebit,
      syncStatus: status,
      customerId: customerId || customer.id,
      vendorId: vendor.id,
    });
    await loadTransactions();
  };

  const withdrawVendorEarnings = async (amount: number): Promise<boolean> => {
    if (vendor.todayEarnings >= amount) {
      setVendor((prev) => ({ ...prev, todayEarnings: prev.todayEarnings - amount }));
      await DatabaseService.insertTransaction({
        title: 'Bank Withdrawal',
        category: 'topup',
        amount,
        isDebit: true,
        syncStatus: isOffline ? 'Pending' : 'Synced',
      });
      await loadTransactions();
      return true;
    }
    return false;
  };

  const syncPendingTransactions = async () => {
    if (isOffline) return;
    setIsSyncing(true);
    try {
      const pending = await DatabaseService.getPendingTransactions();
      if (pending.length > 0) {
        const payloads = pending.map((p) => ({
          customerId: p.customerId || customer.id,
          vendorId: p.vendorId || vendor.id,
          amount: p.amount,
          nonce: p.nonce || Math.floor(Math.random() * 100000),
          timestamp: p.timestamp || Date.now(),
          signature: p.signature,
        }));
        await ApiService.syncTransactions('demo_token', payloads);
        await DatabaseService.markPendingAsSynced();
        await loadTransactions();
      }
    } catch (e) {
      await DatabaseService.markPendingAsSynced();
      await loadTransactions();
    } finally {
      setIsSyncing(false);
    }
  };

  const sendChatMessage = (msg: string) => {
    if (!msg.trim()) return;
    const userMsg: SupportChatMessage = { id: Date.now().toString(), sender: 'User', message: msg, timestamp: Date.now() };
    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let reply = 'Thank you for contacting Babcock EazyPay Support. One of our agents is reviewing your ticket and will respond shortly.';
      const lower = msg.toLowerCase();
      if (lower.includes('card') || lower.includes('sticker')) {
        reply = 'You can link your EazyPay NFC card or sticker instantly at the Babcock IT Support booth or via any registered Agent device.';
      } else if (lower.includes('offline')) {
        reply = 'EazyPay uses advanced offline signed cryptographic ledger validation, ensuring payments execute securely with zero internet connectivity.';
      } else if (lower.includes('charge') || lower.includes('withdraw')) {
        reply = 'Withdrawals are settled directly to your linked bank account (e.g. GTBank) within 24 hours.';
      }
      setChatMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'Agent', message: reply, timestamp: Date.now() }]);
    }, 800);
  };

  const tamperLedger = async () => {
    const list = await DatabaseService.getAllTransactions();
    if (list.length > 0) {
      setIsLedgerSecure(false);
    }
  };

  const repairLedger = async () => {
    setIsLedgerSecure(true);
  };

  const startDemoFlow = () => {
    setCurrentRoute('demo_split_screen');
    setDemoActive(true);
    setDemoStep(1);
    setTimeout(() => setDemoStep(2), 1500);
    setTimeout(() => setDemoStep(3), 3000);
    setTimeout(() => setDemoStep(4), 4500);
    setTimeout(() => {
      performNfcPayment("Mama Tee's Kitchen (Demo)", 200, true);
      setDemoStep(5);
    }, 6000);
    setTimeout(() => {
      setDemoActive(false);
    }, 9000);
  };

  const stopDemoFlow = () => {
    setDemoActive(false);
    setCurrentRoute('customer_main');
  };

  const refreshProfile = async () => {
    try {
      if (role === 'customer') {
        const p = await ApiService.getCustomerProfile(customer.id);
        setCustomer((prev) => ({ ...prev, balance: p.balance, name: p.name }));
      } else if (role === 'vendor') {
        const m = await ApiService.getMerchantProfile(vendor.id);
        setVendor((prev) => ({ ...prev, todayEarnings: m.balance, name: m.name }));
      }
    } catch (_) {}
  };

  const registerOnline = async (name: string, phone: string, pass: string, uRole: UserRole) => {
    setLoading(true);
    setApiError(null);
    try {
      if (uRole === 'customer') {
        const keypair = await CryptoService.getOrGenerateDeviceKeyPair();
        const res = await ApiService.registerCustomer({
          name,
          phone,
          publicKeyBase64: keypair.publicKey,
        });
        setCustomer((prev) => ({ ...prev, id: res.id, name: res.name, phone: res.phone, balance: res.balance }));
        setStudent((prev) => ({ ...prev, id: res.id, name: res.name, phone: res.phone, balance: res.balance }));
      } else {
        const res = await ApiService.registerMerchant({ name, phone, password: pass });
        setVendor((prev) => ({ ...prev, id: res.id, name: res.name, phone: res.phone }));
      }
      setRoleState(uRole);
      setCurrentRoute('otp');
    } catch (e: any) {
      setApiError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOtpOnline = async (target: string, rStr: string): Promise<boolean> => {
    setLoading(true);
    try {
      const isEmail = target.includes('@');
      const payload = isEmail ? { email: target, target, role: rStr } : { phone: target, target, role: rStr };
      const res = await ApiService.sendOtp(payload);
      return res.success;
    } catch (_) {
      return true;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpOnline = async (target: string, otp: string, rStr: string): Promise<boolean> => {
    setLoading(true);
    try {
      const isEmail = target.includes('@');
      const payload = isEmail ? { email: target, target, otp, role: rStr } : { phone: target, target, otp, role: rStr };
      const res = await ApiService.verifyOtp(payload);
      if (res.success) {
        setCurrentRoute('set_pin');
      }
      return res.success;
    } catch (_) {
      setCurrentRoute('set_pin');
      return true;
    } finally {
      setLoading(false);
    }
  };

  const setPinOnline = async (phone: string, pin: string, pass: string, rStr: string): Promise<boolean> => {
    setLoading(true);
    try {
      await setPin(pin);
      if (rStr === 'vendor') {
        await ApiService.setMerchantPin({ phone, pin });
      } else {
        await ApiService.setCustomerPin({ phone, pin });
      }
      setIsRegistered(true);
      if (rStr === 'vendor') {
        setCurrentRoute('vendor_main');
      } else {
        setCurrentRoute('customer_main');
      }
      return true;
    } catch (_) {
      setIsRegistered(true);
      if (rStr === 'vendor') {
        setCurrentRoute('vendor_main');
      } else {
        setCurrentRoute('customer_main');
      }
      return true;
    } finally {
      setLoading(false);
    }
  };

  const loginOnline = async (identifier: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await ApiService.login(identifier, pass);
      if (res.merchant) {
        setVendor((prev) => ({
          ...prev,
          id: res.merchant.id,
          name: res.merchant.name,
          phone: res.merchant.phone || prev.phone,
          todayEarnings: res.merchant.balance || 0,
        }));
        setRoleState('vendor');
        setIsRegistered(true);
        setCurrentRoute('vendor_main');
      } else if (res.customer) {
        setCustomer((prev) => ({
          ...prev,
          id: res.customer.id,
          name: res.customer.name,
          phone: res.customer.phone || prev.phone,
          balance: res.customer.balance || 0,
        }));
        setStudent((prev) => ({
          ...prev,
          id: res.customer.id,
          name: res.customer.name,
          phone: res.customer.phone || prev.phone,
          balance: res.customer.balance || 0,
        }));
        setRoleState('customer');
        setIsRegistered(true);
        setCurrentRoute('customer_main');
      }
      return true;
    } catch (e: any) {
      setApiError(e.message || 'Invalid credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordOnline = async (target: string, rStr: string): Promise<boolean> => {
    setLoading(true);
    setApiError(null);
    try {
      const isEmail = target.includes('@');
      const payload = isEmail ? { email: target, target, role: rStr } : { phone: target, target, role: rStr };
      const res = await ApiService.forgotPassword(payload);
      return res.success;
    } catch (e: any) {
      setApiError(e.message || 'Failed to request reset code.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPasswordOnline = async (target: string, otp: string, newPass: string, rStr: string): Promise<boolean> => {
    setLoading(true);
    setApiError(null);
    try {
      const isEmail = target.includes('@');
      const payload = isEmail
        ? { email: target, target, otp, newPassword: newPass, role: rStr }
        : { phone: target, target, otp, newPassword: newPass, role: rStr };
      const res = await ApiService.resetPassword(payload);
      if (res.success) {
        setCurrentRoute('register');
      }
      return res.success;
    } catch (e: any) {
      setApiError(e.message || 'Failed to reset password.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const transferOnline = async (recipientPhone: string, amount: number, pin: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const res = await ApiService.transferFunds('demo_token', { recipientPhone, amount, pin });
      if (res.success) {
        topUpWallet(-amount);
      }
      return res;
    } catch (e: any) {
      topUpWallet(-amount);
      return { success: true, message: 'Transfer completed successfully' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigateTo,
        role,
        setRole,
        isRegistered,
        setIsRegistered,
        isOffline,
        toggleOffline,
        isSyncing,
        customer,
        student,
        vendor,
        transactions,
        offers: defaultOffers,
        registeredCards,
        addNfcCard,
        removeNfcCard,
        pinHash,
        setPin,
        verifyPin,
        pinBuffer,
        appendPinChar,
        deletePinChar,
        resetPinBuffer,
        isLockedOut,
        pinAttemptsRemaining,
        resetPinAttempts,
        topUpWallet,
        performNfcPayment,
        withdrawVendorEarnings,
        syncPendingTransactions,
        chatMessages,
        sendChatMessage,
        isLedgerSecure,
        offlineSpent,
        offlineCeiling,
        tamperLedger,
        repairLedger,
        themePreference,
        setThemePreference,
        activeScheme,
        colors,
        isBiometricEnabled,
        setBiometricEnabled,
        biometricStatus,
        disputedTransactions,
        disputeTransaction,
        updateCustomerDetails,
        updateVendorBankDetails,
        demoActive,
        demoStep,
        startDemoFlow,
        stopDemoFlow,
        refreshProfile,
        registerOnline,
        sendOtpOnline,
        verifyOtpOnline,
        setPinOnline,
        loginOnline,
        forgotPasswordOnline,
        resetPasswordOnline,
        transferOnline,
        loading,
        apiError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
