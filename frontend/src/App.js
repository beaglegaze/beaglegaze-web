import './App.css';
import { Web3Provider } from './context/Web3Context';
import { ContractsProvider } from './context/ContractsContext';
import { ToastProvider, Toasts } from './context/ToastContext';
import WalletConnect from './components/WalletConnect';
import FundingPanel from './components/FundingPanel';
import DepositForm from './components/DepositForm';
import ContractsPanel from './components/ContractsPanel';
import DeveloperPanel from './components/DeveloperPanel';
import { useState } from 'react';

function App() {
  const [activeView, setActiveView] = useState('client'); // 'client' or 'developer'

  return (
  <Web3Provider>
    <ToastProvider>
    <ContractsProvider>
        <div className="App">
          <header className="App-header">
            <div className="brand">
              <h2>beaglegaze Dashboard</h2>
              <div className="row" style={{ gap: 12, marginTop: 8 }}>
                <button 
                  onClick={() => setActiveView('client')} 
                  style={{ 
                    background: activeView === 'client' ? 'linear-gradient(90deg, #0ea5e9, #22c55e)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  Client View
                </button>
                <button 
                  onClick={() => setActiveView('developer')} 
                  style={{ 
                    background: activeView === 'developer' ? 'linear-gradient(90deg, #0ea5e9, #22c55e)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  Developer View
                </button>
              </div>
            </div>
            <div className="wallet"><WalletConnect /></div>
          </header>
          <main className="container">
            {activeView === 'client' ? (
              <div className="grid">
                <div className="card span-12">
                  <ContractsPanel />
                </div>
                <div className="card span-6">
                  <FundingPanel />
                </div>
                <div className="card span-6">
                  <DepositForm />
                </div>
              </div>
            ) : (
              <div className="grid">
                <div className="card span-12">
                  <ContractsPanel />
                </div>
                <div className="card span-12">
                  <DeveloperPanel />
                </div>
              </div>
            )}
          </main>
      <Toasts />
        </div>
    </ContractsProvider>
    </ToastProvider>
    </Web3Provider>
  );
}

export default App;
