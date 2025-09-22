import './App.css';
import { Web3Provider } from './context/Web3Context';
import { ContractsProvider } from './context/ContractsContext';
import { ToastProvider, Toasts } from './context/ToastContext';
import WalletConnect from './components/WalletConnect';
import FundingPanel from './components/FundingPanel';
import DepositForm from './components/DepositForm';
import ContractsPanel from './components/ContractsPanel';

function App() {
  return (
  <Web3Provider>
    <ToastProvider>
    <ContractsProvider>
        <div className="App">
          <header className="App-header">
            <div className="brand">
              <h2>beaglegaze Dashboard</h2>
            </div>
            <div className="wallet"><WalletConnect /></div>
          </header>
          <main className="container">
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
          </main>
      <Toasts />
        </div>
    </ContractsProvider>
    </ToastProvider>
    </Web3Provider>
  );
}

export default App;
