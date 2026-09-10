import { useState } from 'react';
import { useApp } from '../context';
import { LedgerEntry } from '../types';
import { Badge, Button, Card, CameraIcon, EditIcon, Modal, PlusIcon, ProgressBar, TrashIcon } from '../components/ui';
import { ScreenHeader } from '../components/Layout';

const INCOME_CATEGORIES = ['Crop Sale', 'Subsidy', 'Rental Income', 'Other Income'];
const EXPENSE_CATEGORIES = ['Seeds', 'Fertilizer', 'Pesticide', 'Labour', 'Machinery', 'Irrigation', 'Transport', 'Other'];

export default function LedgerScreen() {
  const { t, ledgerEntries, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry, showToast, back } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'reports'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<LedgerEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = activeTab === 'all' ? ledgerEntries
    : activeTab === 'reports' ? ledgerEntries
    : ledgerEntries.filter(e => e.type === activeTab);

  const income = ledgerEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expense = ledgerEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const profit = income - expense;

  const handleSave = (entry: LedgerEntry) => {
    if (editEntry) { updateLedgerEntry(entry); }
    else { addLedgerEntry(entry); }
    setFormOpen(false);
    setEditEntry(null);
    showToast(t('ledger.saved'), 'success');
  };

  const handleDelete = (id: string) => {
    deleteLedgerEntry(id);
    setDeleteConfirmId(null);
    showToast('Entry deleted', 'info');
  };

  return (
    <div className="flex flex-col min-h-full bg-background">
      <ScreenHeader
        title={t('ledger.title')}
        back={back}
        action={
          <button
            onClick={() => { setEditEntry(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-[10px] min-h-[36px]"
          >
            <PlusIcon size={14} /> {t('ledger.addEntry')}
          </button>
        }
      />

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-[14px] p-3 text-center">
            <p className="text-xs text-green-700 font-medium mb-1">{t('ledger.totalIncome')}</p>
            <p className="text-lg font-black text-green-700">₹{(income / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-[14px] p-3 text-center">
            <p className="text-xs text-red-600 font-medium mb-1">{t('ledger.totalExpense')}</p>
            <p className="text-lg font-black text-red-600">₹{(expense / 1000).toFixed(1)}K</p>
          </div>
          <div className={`${profit >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-red-50 border-red-200'} border rounded-[14px] p-3 text-center`}>
            <p className={`text-xs font-medium mb-1 ${profit >= 0 ? 'text-primary' : 'text-red-600'}`}>{t('ledger.profit')}</p>
            <p className={`text-lg font-black ${profit >= 0 ? 'text-primary' : 'text-red-600'}`}>{profit >= 0 ? '+' : ''}₹{Math.abs(profit / 1000).toFixed(1)}K</p>
          </div>
        </div>
        <ProgressBar value={income} max={income + expense} className="mt-2" />
        <div className="flex justify-between text-[10px] text-muted mt-1">
          <span>Income {Math.round(income / (income + expense) * 100)}%</span>
          <span>Expense {Math.round(expense / (income + expense) * 100)}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-3">
        <div className="flex bg-surface-2 rounded-[14px] p-1 gap-0.5">
          {(['all', 'income', 'expense', 'reports'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-[11px] text-xs font-bold transition-all capitalize ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}>
              {tab === 'income' ? t('ledger.income') : tab === 'expense' ? t('ledger.expense') : tab === 'reports' ? t('ledger.reports') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'reports' ? (
          <ReportsView entries={ledgerEntries} income={income} expense={expense} t={t} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <div className="text-4xl mb-2">📒</div>
            <p className="font-semibold">No entries</p>
            <button onClick={() => setFormOpen(true)} className="mt-3 text-sm text-primary font-semibold">{t('ledger.addEntry')}</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(entry => (
              <LedgerCard
                key={entry.id}
                entry={entry}
                onEdit={() => { setEditEntry(entry); setFormOpen(true); }}
                onDelete={() => setDeleteConfirmId(entry.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditEntry(null); }}
        title={editEntry ? t('ledger.editEntry') : t('ledger.addEntry')}
      >
        <EntryForm initial={editEntry} onSave={handleSave} onCancel={() => { setFormOpen(false); setEditEntry(null); }} t={t} />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title={t('ledger.deleteConfirm')}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmId(null)}>{t('common.cancel')}</Button>
            <Button variant="danger" className="flex-1" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>{t('common.delete')}</Button>
          </div>
        }
      >
        <p className="text-sm text-muted">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

function LedgerCard({ entry, onEdit, onDelete }: {
  entry: LedgerEntry; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <Card padding="sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-lg ${entry.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
          {entry.type === 'income' ? '💰' : '🧾'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text truncate">{entry.description}</span>
            <Badge variant={entry.type === 'income' ? 'green' : 'red'} className="flex-shrink-0">{entry.category}</Badge>
          </div>
          <p className="text-xs text-muted">{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className={`text-base font-black ${entry.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
            {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString()}
          </p>
          <div className="flex gap-1 mt-1 justify-end">
            <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center text-muted hover:text-primary rounded-[8px] hover:bg-green-50 transition-colors">
              <EditIcon size={14} />
            </button>
            <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center text-muted hover:text-red-500 rounded-[8px] hover:bg-red-50 transition-colors">
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      </div>
      {entry.photoUrl && (
        <div className="mt-2 h-24 bg-surface-2 rounded-[10px] flex items-center justify-center text-muted text-xs">
          📷 Receipt attached
        </div>
      )}
    </Card>
  );
}

function EntryForm({ initial, onSave, onCancel, t }: {
  initial: LedgerEntry | null;
  onSave: (entry: LedgerEntry) => void;
  onCancel: () => void;
  t: (k: string) => string;
}) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().split('T')[0]);
  const [hasPhoto, setHasPhoto] = useState(!!initial?.photoUrl);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    if (!amount || !category || !description) return;
    onSave({
      id: initial?.id ?? `l${Date.now()}`,
      type,
      amount: Number(amount),
      category,
      description,
      date,
      photoUrl: hasPhoto ? 'mock-photo' : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Type toggle */}
      <div className="flex bg-surface-2 rounded-[14px] p-1">
        <button onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${type === 'income' ? 'bg-white text-green-600 shadow-sm' : 'text-muted'}`}>
          {t('ledger.income')}
        </button>
        <button onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex-1 py-2 rounded-[11px] text-sm font-bold transition-all ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-muted'}`}>
          {t('ledger.expense')}
        </button>
      </div>

      {/* Amount */}
      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('ledger.amount')}</label>
        <div className="flex gap-2">
          <div className="flex items-center px-4 bg-surface-2 rounded-[14px] text-sm text-muted font-medium">₹</div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {['500', '1000', '2500', '5000', '10000'].map(v => (
            <button key={v} onClick={() => setAmount(v)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-all ${amount === v ? 'bg-primary text-white border-primary' : 'bg-white border-border'}`}>
              ₹{(Number(v) / 1000) >= 1 ? `${Number(v) / 1000}K` : v}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('ledger.category')}</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`py-2 px-2 rounded-[12px] text-xs font-semibold border-2 transition-all ${category === c ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-white text-text'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('ledger.description')}</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Brief description..."
          className="w-full min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      </div>

      {/* Date */}
      <div>
        <label className="text-sm font-semibold text-text block mb-1.5">{t('ledger.date')}</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-[14px] border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
      </div>

      {/* Photo */}
      <button
        onClick={() => setHasPhoto(p => !p)}
        className={`flex items-center gap-2 p-3 rounded-[14px] border-2 transition-all ${hasPhoto ? 'border-primary bg-primary/5' : 'border-dashed border-border'}`}
      >
        <CameraIcon size={18} className={hasPhoto ? 'text-primary' : 'text-muted'} />
        <span className={`text-sm font-medium ${hasPhoto ? 'text-primary' : 'text-muted'}`}>
          {hasPhoto ? '✓ Receipt photo attached' : t('ledger.photo')}
        </span>
      </button>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button className="flex-1" onClick={handleSave} disabled={!amount || !category || !description}>{t('common.save')}</Button>
      </div>
    </div>
  );
}

function ReportsView({ entries, income, expense, t }: {
  entries: LedgerEntry[]; income: number; expense: number; t: (k: string) => string;
}) {
  const byCategory = entries.reduce<Record<string, { income: number; expense: number }>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = { income: 0, expense: 0 };
    acc[e.category][e.type] += e.amount;
    return acc;
  }, {});

  const topExpenses = Object.entries(byCategory)
    .filter(([, v]) => v.expense > 0)
    .sort((a, b) => b[1].expense - a[1].expense)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="font-bold text-text mb-4">{t('ledger.thisMonth')}</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: t('ledger.totalIncome'), value: income, color: '#2E7D32' },
            { label: t('ledger.totalExpense'), value: expense, color: '#DC2626' },
            { label: t('ledger.profit'), value: income - expense, color: income - expense >= 0 ? '#2E7D32' : '#DC2626' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-sm text-muted">{r.label}</span>
              <span className="text-base font-black" style={{ color: r.color }}>
                {r.value >= 0 ? '' : '-'}₹{Math.abs(r.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-text mb-3">Top Expenses by Category</h3>
        {topExpenses.map(([cat, vals]) => (
          <div key={cat} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-text">{cat}</span>
              <span className="text-sm font-bold text-red-500">₹{vals.expense.toLocaleString()}</span>
            </div>
            <ProgressBar value={vals.expense} max={expense} color="#DC2626" />
          </div>
        ))}
      </Card>
    </div>
  );
}
