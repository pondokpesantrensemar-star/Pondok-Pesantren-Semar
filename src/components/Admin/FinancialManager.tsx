import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Search, Filter, Wallet, 
  CreditCard, Calendar, CheckCircle2, Clock, 
  MoreVertical, FileText, Download, User,
  Banknote, AlertCircle, X, Save, TrendingUp, ShieldCheck,
  TrendingDown, BarChart as BarChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

interface Student {
  id: string;
  name: string;
  class: string;
}

interface FinancialRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  category: 'Kost' | 'Syahriah' | 'Uang Makan' | 'Lainnya';
  month: string;
  year: string;
  status: 'Lunas' | 'Belum Lunas';
  paymentDate: string | null;
  notes: string;
  createdAt: string;
}

interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  recordedBy: string;
  createdAt: string;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INCOME_CATEGORIES = ['Kost', 'Syahriah', 'Uang Makan', 'Lainnya'];
const EXPENSE_CATEGORIES = ['Operasional', 'Konsumsi', 'Fasilitas', 'Gaji', 'Lainnya'];
const STATUSES = ['Lunas', 'Belum Lunas'];

export default function FinancialManager() {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [incomeRecords, setIncomeRecords] = useState<FinancialRecord[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // UI State
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Form States
  const [incomeForm, setIncomeForm] = useState<Partial<FinancialRecord>>({
    studentId: '',
    category: 'Kost',
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    status: 'Lunas',
    notes: ''
  });

  const [expenseForm, setExpenseForm] = useState<Partial<ExpenseRecord>>({
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Operasional',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, expRes, stdRes] = await Promise.all([
        fetch('/api/financial_records'),
        fetch('/api/expenses'),
        fetch('/api/students')
      ]);
      if (incRes.ok) setIncomeRecords(await incRes.json());
      if (expRes.ok) setExpenseRecords(await expRes.json());
      if (stdRes.ok) setStudents(await stdRes.json());
    } catch (error) {
      toast.error('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeForm.studentId) return toast.error('Pilih santri');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/financial_records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeForm)
      });
      if (res.ok) {
        toast.success('Pemasukan dicatat');
        setIsAdding(false);
        fetchData();
      }
    } catch (e) { toast.error('Gagal menyimpan'); }
    setIsSubmitting(false);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm)
      });
      if (res.ok) {
        toast.success('Pengeluaran dicatat');
        setIsAdding(false);
        fetchData();
      }
    } catch (e) { toast.error('Gagal menyimpan'); }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, type: 'income' | 'expense') => {
    if (!confirm('Hapus data ini?')) return;
    try {
      const endpoint = type === 'income' ? `/api/financial_records/${id}` : `/api/expenses/${id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Dihapus');
        fetchData();
      }
    } catch (e) { toast.error('Gagal menghapus'); }
  };

  const filteredIncome = incomeRecords.filter(r => {
    const matchesSearch = r.studentName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = monthFilter === 'Semua' || r.month === monthFilter;
    const matchesCategory = categoryFilter === 'Semua' || r.category === categoryFilter;
    return matchesSearch && matchesMonth && matchesCategory;
  }).sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const filteredExpense = expenseRecords.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = incomeRecords.filter(r => r.status === 'Lunas').reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalExpense = expenseRecords.reduce((sum, r) => sum + (r.amount || 0), 0);
  const balance = totalIncome - totalExpense;

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 transition-colors">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} 
        className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
      />
      <p className="text-[10px] font-black admin-text-muted uppercase tracking-[0.2em] animate-pulse">Memuat Data Keuangan...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-7xl mx-auto px-4 md:px-0 text-left">
      <div className="admin-card p-4 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
            <h1 className="text-4xl admin-heading admin-text-main tracking-tight transition-colors mb-2">Manajemen Keuangan</h1>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-12 bg-emerald-500 rounded-full" />
              <p className="text-[10px] admin-text-muted font-black uppercase tracking-[0.25em]">Transparansi & Akuntabilitas Operasional</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="flex bg-slate-100/50 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm w-full sm:w-auto transition-colors">
              <button 
                onClick={() => { setActiveTab('income'); setSearchQuery(''); setCategoryFilter('Semua'); }}
                className={`flex-1 sm:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'income' ? 'bg-white dark:bg-slate-800 admin-text-primary shadow-lg shadow-black/5' : 'admin-text-muted hover:admin-text-main'}`}
              >
                Pemasukan
              </button>
              <button 
                onClick={() => { setActiveTab('expense'); setSearchQuery(''); setCategoryFilter('Semua'); }}
                className={`flex-1 sm:px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'expense' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-500 shadow-lg shadow-black/5' : 'admin-text-muted hover:admin-text-main'}`}
              >
                Pengeluaran
              </button>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 ${activeTab === 'income' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
            >
              <Plus size={16} /> {activeTab === 'income' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">Total Pendapatan</p>
            <h3 className="text-3xl font-black tabular-nums">{formatRupiah(totalIncome)}</h3>
          </div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0.1 }}
            whileHover={{ scale: 1.1, opacity: 0.2 }}
            className="absolute right-[-20px] bottom-[-20px] transition-all duration-500"
          >
            <TrendingUp size={140} className="text-white" />
          </motion.div>
        </div>
        <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-600/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">Total Pengeluaran</p>
            <h3 className="text-3xl font-black tabular-nums">{formatRupiah(totalExpense)}</h3>
          </div>
          <motion.div 
             initial={{ scale: 0.8, opacity: 0.1 }}
             whileHover={{ scale: 1.1, opacity: 0.2 }}
             className="absolute right-[-20px] bottom-[-20px] transition-all duration-500"
          >
            <TrendingDown size={140} className="text-white" />
          </motion.div>
        </div>
        <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">Saldo Bersih</p>
            <h3 className="text-3xl font-black tabular-nums">{formatRupiah(balance)}</h3>
          </div>
          <motion.div 
             initial={{ scale: 0.8, opacity: 0.1 }}
             whileHover={{ scale: 1.1, opacity: 0.2 }}
             className="absolute right-[-20px] bottom-[-20px] transition-all duration-500"
          >
            <Wallet size={140} className="text-white" />
          </motion.div>
        </div>
      </div>

      <div className="admin-card rounded-[2rem] border-none shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 admin-text-muted" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === 'income' ? "Cari nama santri..." : "Cari pengeluaran..."}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none text-sm font-bold admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100/30 dark:bg-slate-800/30 text-[10px] font-black admin-text-muted uppercase tracking-widest">
                <th className="px-8 py-5">Keterangan</th>
                <th className="px-8 py-5">Kategori</th>
                <th className="px-8 py-5">Waktu / Periode</th>
                <th className="px-8 py-5 text-right">Nominal</th>
                <th className="px-8 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {activeTab === 'income' ? filteredIncome.map(r => (
                <tr key={r.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all font-bold text-xs admin-text-main">
                  <td className="px-8 py-5">{r.studentName}</td>
                  <td className="px-8 py-5"><span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-[9px] uppercase">{r.category}</span></td>
                  <td className="px-8 py-5 admin-text-muted">{r.month} {r.year}</td>
                  <td className="px-8 py-5 text-right text-emerald-600">{formatRupiah(r.amount)}</td>
                  <td className="px-8 py-5 text-center"><button onClick={() => handleDelete(r.id, 'income')} className="text-gray-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button></td>
                </tr>
              )) : filteredExpense.map(r => (
                <tr key={r.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-all font-bold text-xs admin-text-main">
                  <td className="px-8 py-5">{r.title}</td>
                  <td className="px-8 py-5"><span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-[9px] uppercase">{r.category}</span></td>
                  <td className="px-8 py-5 admin-text-muted">{new Date(r.date).toLocaleDateString('id-ID')}</td>
                  <td className="px-8 py-5 text-right text-rose-600">{formatRupiah(r.amount)}</td>
                  <td className="px-8 py-5 text-center"><button onClick={() => handleDelete(r.id, 'expense')} className="text-gray-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsAdding(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <motion.div initial={{scale:0.9, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} className="relative admin-card w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight admin-text-main">{activeTab === 'income' ? 'Pemasukan' : 'Pengeluaran'}</h3>
                <button onClick={()=>setIsAdding(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 admin-text-muted transition-colors"><X size={20}/></button>
              </div>

              {activeTab === 'income' ? (
                <form onSubmit={handleIncomeSubmit} className="space-y-5">
                   <select required className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={incomeForm.studentId} onChange={e => {
                     const s = students.find(x => x.id === e.target.value);
                     setIncomeForm({...incomeForm, studentId: e.target.value, studentName: s?.name});
                   }}>
                     <option value="" className="admin-text-main">Pilih Santri</option>
                     {students.map(s => <option key={s.id} value={s.id} className="admin-text-main">{s.name} - {s.class}</option>)}
                   </select>
                   <div className="grid grid-cols-3 gap-4">
                      <select className="col-span-2 w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={incomeForm.category} onChange={e => setIncomeForm({...incomeForm, category: e.target.value as any})}>
                        {INCOME_CATEGORIES.map(c => <option key={c} value={c} className="admin-text-main">{c}</option>)}
                      </select>
                      <input required type="number" placeholder="Nominal" className="col-span-1 w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={incomeForm.amount || ''} onChange={e => setIncomeForm({...incomeForm, amount: parseInt(e.target.value)})}/>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <select className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={incomeForm.month} onChange={e => setIncomeForm({...incomeForm, month: e.target.value})}>
                        {MONTHS.map(m => <option key={m} value={m} className="admin-text-main">{m}</option>)}
                      </select>
                      <input type="text" className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={incomeForm.year} onChange={e => setIncomeForm({...incomeForm, year: e.target.value})}/>
                   </div>
                   <button disabled={isSubmitting} className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Simpan Pemasukan</button>
                </form>
              ) : (
                <form onSubmit={handleExpenseSubmit} className="space-y-5">
                  <input required placeholder="Keterangan" className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})}/>
                  <div className="grid grid-cols-3 gap-4">
                     <select className="col-span-2 w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}>
                       {EXPENSE_CATEGORIES.map(c => <option key={c} value={c} className="admin-text-main">{c}</option>)}
                     </select>
                     <input required type="number" placeholder="Nominal" className="col-span-1 w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={expenseForm.amount || ''} onChange={e => setExpenseForm({...expenseForm, amount: parseInt(e.target.value)})}/>
                  </div>
                  <input type="date" className="w-full p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-none font-bold text-sm admin-text-main outline-none focus:ring-2 focus:ring-pesantren-gold/20" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}/>
                  <button disabled={isSubmitting} className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all">Simpan Pengeluaran</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
