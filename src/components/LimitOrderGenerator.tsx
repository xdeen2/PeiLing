import { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Metal, LimitOrder } from '../types';
import { generateLimitOrders, formatCurrency, formatGrams } from '../utils/calculations';
import { generateId, getCurrentDate, getMetalName } from '../utils/helpers';
import { ListOrdered, Plus, Check, X } from 'lucide-react';

interface LimitOrderGeneratorProps extends ReturnType<typeof useAppData> {}

export default function LimitOrderGenerator({
  data,
  addLimitOrder,
  updateLimitOrder,
}: LimitOrderGeneratorProps) {
  const [selectedMetal, setSelectedMetal] = useState<Metal>('gold');
  const [allocationAmount, setAllocationAmount] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');

  const latestPrice = data.priceData[data.priceData.length - 1];

  const pendingOrders = data.limitOrders.filter(o => o.status === 'pending');
  const filledOrders = data.limitOrders.filter(o => o.status === 'filled');

  const handleGenerateOrders = () => {
    if (!allocationAmount || !currentPrice) return;

    const amount = parseFloat(allocationAmount);
    const price = parseFloat(currentPrice);
    const spreads = data.config.limitOrderSpreads[selectedMetal];

    const orders = generateLimitOrders(selectedMetal, amount, price, spreads);

    orders.forEach(order => {
      const limitOrder: LimitOrder = {
        id: generateId(),
        metal: selectedMetal,
        tier: order.tier,
        amount: order.amount,
        targetPrice: order.targetPrice,
        quantity: order.quantity,
        status: 'pending',
        createdDate: getCurrentDate(),
      };
      addLimitOrder(limitOrder);
    });

    setAllocationAmount('');
    setCurrentPrice('');
  };

  const handleMarkFilled = (orderId: string, filledPrice: string) => {
    const price = parseFloat(filledPrice);
    if (!price || price <= 0) return;

    updateLimitOrder(orderId, {
      status: 'filled',
      filledDate: getCurrentDate(),
      filledPrice: price,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Limit Order Generator</h2>
        <p className="text-gray-600">Generate tiered limit orders based on your monthly allocation and market conditions.</p>
      </div>

      {/* Order Generator Form */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Generate New Orders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Metal</label>
            <select
              value={selectedMetal}
              onChange={e => setSelectedMetal(e.target.value as Metal)}
              className="input"
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
          <div>
            <label className="label">Allocation Amount (¥)</label>
            <input
              type="number"
              value={allocationAmount}
              onChange={e => setAllocationAmount(e.target.value)}
              placeholder="10000"
              className="input"
            />
          </div>
          <div>
            <label className="label">Current Price (¥/g)</label>
            <input
              type="number"
              value={currentPrice}
              onChange={e => setCurrentPrice(e.target.value)}
              placeholder={latestPrice?.[`${selectedMetal}Price`]?.toString() || ''}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerateOrders} className="btn btn-primary w-full">
              <Plus className="w-4 h-4 inline mr-2" />
              Generate Orders
            </button>
          </div>
        </div>

        {/* Preview */}
        {allocationAmount && currentPrice && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Order Preview</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Spread</th>
                  <th>Target Price</th>
                  <th>Amount</th>
                  <th>Quantity</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {generateLimitOrders(
                  selectedMetal,
                  parseFloat(allocationAmount),
                  parseFloat(currentPrice),
                  data.config.limitOrderSpreads[selectedMetal]
                ).map(order => (
                  <tr key={order.tier}>
                    <td>Tier {order.tier}</td>
                    <td>{data.config.limitOrderSpreads[selectedMetal][order.tier - 1]}%</td>
                    <td>{formatCurrency(order.targetPrice)}/g</td>
                    <td>{formatCurrency(order.amount)}</td>
                    <td>{formatGrams(order.quantity)}</td>
                    <td>{order.percentage.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Orders */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Pending Orders ({pendingOrders.length})</h3>
        {pendingOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Metal</th>
                  <th>Tier</th>
                  <th>Target Price</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.createdDate}</td>
                    <td>
                      <span className="badge badge-info">{getMetalName(order.metal)}</span>
                    </td>
                    <td>Tier {order.tier}</td>
                    <td>{formatCurrency(order.targetPrice)}/g</td>
                    <td>{formatGrams(order.quantity)}</td>
                    <td>{formatCurrency(order.amount)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const price = prompt('Enter filled price (¥/g):');
                            if (price) handleMarkFilled(order.id, price);
                          }}
                          className="btn btn-sm btn-success"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updateLimitOrder(order.id, { status: 'cancelled' })}
                          className="btn btn-sm btn-secondary"
                        >
                          <X className="w-3 h-3" />
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
            <ListOrdered className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No pending orders. Generate some orders to get started.</p>
          </div>
        )}
      </div>

      {/* Filled Orders */}
      {filledOrders.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recently Filled Orders</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Filled Date</th>
                  <th>Metal</th>
                  <th>Tier</th>
                  <th>Target Price</th>
                  <th>Filled Price</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Savings</th>
                </tr>
              </thead>
              <tbody>
                {filledOrders.slice(0, 10).map(order => {
                  const savings = order.filledPrice
                    ? (order.targetPrice - order.filledPrice) * order.quantity
                    : 0;
                  return (
                    <tr key={order.id}>
                      <td>{order.filledDate}</td>
                      <td>
                        <span className="badge badge-success">{getMetalName(order.metal)}</span>
                      </td>
                      <td>Tier {order.tier}</td>
                      <td>{formatCurrency(order.targetPrice)}/g</td>
                      <td>{order.filledPrice ? formatCurrency(order.filledPrice) : '-'}/g</td>
                      <td>{formatGrams(order.quantity)}</td>
                      <td>{formatCurrency(order.amount)}</td>
                      <td className={savings > 0 ? 'text-success-600' : 'text-gray-600'}>
                        {savings > 0 ? `+${formatCurrency(savings)}` : formatCurrency(savings)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
