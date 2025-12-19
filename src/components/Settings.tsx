import { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings({ data, updateConfig }: ReturnType<typeof useAppData>) {
  const [config, setConfig] = useState(data.config);

  useEffect(() => {
    setConfig(data.config);
  }, [data.config]);

  const handleSave = () => {
    updateConfig(config);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Strategy Configuration & Settings</h2>
        <p className="text-gray-600">Configure your investment strategy parameters.</p>
      </div>

      {/* Investment Parameters */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Investment Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Total Capital (¥)</label>
            <input
              type="number"
              value={config.totalCapital}
              onChange={e => setConfig({ ...config, totalCapital: parseFloat(e.target.value) })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Accumulation Start Date</label>
            <input
              type="date"
              value={config.accumulationStartDate}
              onChange={e => setConfig({ ...config, accumulationStartDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Active Capital %</label>
            <input
              type="number"
              value={config.activeCapitalPercent}
              onChange={e => setConfig({ ...config, activeCapitalPercent: parseFloat(e.target.value) })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Opportunity Capital %</label>
            <input
              type="number"
              value={config.opportunityCapitalPercent}
              onChange={e => setConfig({ ...config, opportunityCapitalPercent: parseFloat(e.target.value) })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Target Allocation */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Target Allocation (%)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Gold %</label>
            <input
              type="number"
              value={config.targetAllocation.gold}
              onChange={e => setConfig({
                ...config,
                targetAllocation: { ...config.targetAllocation, gold: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Silver %</label>
            <input
              type="number"
              value={config.targetAllocation.silver}
              onChange={e => setConfig({
                ...config,
                targetAllocation: { ...config.targetAllocation, silver: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Platinum %</label>
            <input
              type="number"
              value={config.targetAllocation.platinum}
              onChange={e => setConfig({
                ...config,
                targetAllocation: { ...config.targetAllocation, platinum: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* RSI Thresholds */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">RSI Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Pause Buying (Overbought)</label>
            <input
              type="number"
              value={config.rsiThresholds.pause}
              onChange={e => setConfig({
                ...config,
                rsiThresholds: { ...config.rsiThresholds, pause: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Reduce Buying</label>
            <input
              type="number"
              value={config.rsiThresholds.reduce}
              onChange={e => setConfig({
                ...config,
                rsiThresholds: { ...config.rsiThresholds, reduce: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Normal/Aggressive Threshold</label>
            <input
              type="number"
              value={config.rsiThresholds.normal}
              onChange={e => setConfig({
                ...config,
                rsiThresholds: { ...config.rsiThresholds, normal: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* GSR Parameters */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Gold-Silver Ratio Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Normal Range Min</label>
            <input
              type="number"
              value={config.gsrParameters.normalMin}
              onChange={e => setConfig({
                ...config,
                gsrParameters: { ...config.gsrParameters, normalMin: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Normal Range Max</label>
            <input
              type="number"
              value={config.gsrParameters.normalMax}
              onChange={e => setConfig({
                ...config,
                gsrParameters: { ...config.gsrParameters, normalMax: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Silver Cheap Threshold</label>
            <input
              type="number"
              value={config.gsrParameters.silverCheap}
              onChange={e => setConfig({
                ...config,
                gsrParameters: { ...config.gsrParameters, silverCheap: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Gold Cheap Threshold</label>
            <input
              type="number"
              value={config.gsrParameters.goldCheap}
              onChange={e => setConfig({
                ...config,
                gsrParameters: { ...config.gsrParameters, goldCheap: parseFloat(e.target.value) }
              })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn btn-primary">
          <SettingsIcon className="w-4 h-4 inline mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
