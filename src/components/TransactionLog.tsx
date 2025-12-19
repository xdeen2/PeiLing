import { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Transaction, Metal, TransactionType } from '../types';
import { generateId, getCurrentDate, formatDate, getMetalName } from '../utils/helpers';
import { formatCurrency, formatGrams, calculateGSR } from '../utils/calculations';
import { Receipt, Plus, Edit2, Trash2, Filter } from 'lucide-react';

interface TransactionLogProps extends ReturnType<typeof useAppData> {}

export default function TransactionLog({
  data,
  addTransaction,
  updateTransaction,
  deleteTransaction,
}: TransactionLogProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterMetal, setFilterMetal] = useState<Metal | 'all'>('all');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');

  const [formData, setFormData] = useState({
    date: getCurrentDate(),
    metal: 'gold' as Metal,
    type: 'buy' as TransactionType,
    quantity: '',
    price: '',
    platform: 'Huaan ETF',
    notes: '',
  });

  const latestPrice = data.priceData[data.priceData.length - 1];

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(t => {
      if (filterMetal !== 'all' && t.metal !== filterMetal) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      return true;
    });
  }, [data.transactions, filterMetal, filterType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseFloat(formData.quantity);
    const price = parseFloat(formData.price);
    const amount = quantity * price;

    // Get RSI and GSR from latest price data
    const rsi = latestPrice
      ? formData.metal === 'gold'
        ? latestPrice.goldRSI
        : formData.metal === 'silver'
        ? latestPrice.silverRSI
        : latestPrice.platinumRSI
      : 50;

    const gsr = latestPrice ? calculateGSR(latestPrice.goldPrice, latestPrice.silverPrice) : 70;

    const transaction: Transaction = {
      id: editingId || generateId(),
      date: formData.date,
      metal: formData.metal,
      type: formData.type,
      quantity,
      price,
      amount,
      platform: formData.platform,
      rsi,
      gsr,
      notes: formData.notes,
    };

    if (editingId) {
      updateTransaction(editingId, transaction);
      setEditingId(null);
    } else {
      addTransaction(transaction);
    }

    // Reset form
    setFormData({
      date: getCurrentDate(),
      metal: 'gold',
      type: 'buy',
      quantity: '',
      price: '',
      platform: 'Huaan ETF',
      notes: '',
    });
    setShowForm(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      date: transaction.date,
      metal: transaction.metal,
      type: transaction.type,
      quantity: transaction.quantity.toString(),
      price: transaction.price.toString(),
      platform: transaction.platform,
      notes: transaction.notes,
    });
    setEditingId(transaction.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Transaction Log</h2>
          <p className="text-gray-600">Record all buy and sell transactions.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <Plus className="w-4 h-4 inline mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Transaction Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label">Metal</label>
                <select
                  value={formData.metal}
                  onChange={e => setFormData({ ...formData, metal: e.target.value as Metal })}
                  className="input"
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="platinum">Platinum</option>
                </select>
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}
                  className="input"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="label">Quantity (grams)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  placeholder="10.00"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Price (¥/gram)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="500.00"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Platform</label>
                <select
                  value={formData.platform}
                  onChange={e => setFormData({ ...formData, platform: e.target.value })}
                  className="input"
                >
                  <option value="Huaan ETF">Huaan ETF</option>
                  <option value="E Fund ETF">E Fund ETF</option>
                  <option value="ICBC Paper Gold">ICBC Paper Gold</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                className="input"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Add'} Transaction
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <Filter className="w-5 h-5 text-gray-600" />
          <div>
            <label className="label mb-0">Metal</label>
            <select
              value={filterMetal}
              onChange={e => setFilterMetal(e.target.value as Metal | 'all')}
              className="input w-40"
            >
              <option value="all">All</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
          <div>
            <label className="label mb-0">Type</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as TransactionType | 'all')}
              className="input w-40"
            >
              <option value="all">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Transactions ({filteredTransactions.length})
        </h3>
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Metal</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Platform</th>
                  <th>RSI</th>
                  <th>GSR</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.date)}</td>
                    <td>
                      <span className="badge badge-info">{getMetalName(tx.metal)}</span>
                    </td>
                    <td>
                      <span className={`badge ${tx.type === 'buy' ? 'badge-success' : 'badge-warning'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td>{formatGrams(tx.quantity)}</td>
                    <td>{formatCurrency(tx.price)}/g</td>
                    <td className={tx.type === 'buy' ? 'text-danger-600' : 'text-success-600'}>
                      {tx.type === 'buy' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </td>
                    <td>{tx.platform}</td>
                    <td>{tx.rsi.toFixed(1)}</td>
                    <td>{tx.gsr.toFixed(2)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this transaction?')) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="text-danger-600 hover:text-danger-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No transactions yet. Add your first transaction to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
