import React, { useState, useEffect } from 'react';

const Dashboard: React.FC = () => {
    const [threshold, setThreshold] = useState<number>(parseFloat(localStorage.getItem('vadThreshold') || '0.02'));

    useEffect(() => {
        console.log(`Current Threshold Value: ${threshold}`);
    }, [threshold]);

    const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setThreshold(Number(e.target.value));
    };

    const saveSettings = () => {
        localStorage.setItem('vadThreshold', threshold.toString());
        alert('Settings saved!');
        console.log(`Threshold Saved: ${threshold}`);
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <div>
                <label htmlFor="threshold">VAD Threshold:</label>
                <input
                    type="number"
                    id="threshold"
                    name="threshold"
                    min="0"
                    max="1"
                    step="0.01"
                    value={threshold}
                    onChange={handleThresholdChange}
                />
                <button onClick={saveSettings}>Save Settings</button>
            </div>
        </div>
    );
};

export default Dashboard;