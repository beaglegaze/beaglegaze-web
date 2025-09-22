# beaglegaze Web Dashboard

This React app lets clients check their current funding on the beaglegaze smart contract and deposit ETH.

## Prerequisites
- Node.js 18+
- A browser wallet (MetaMask)
- Contract deployed and address available

## Configure
Copy `.env.example` to `.env` and set values:

```
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_EXPECTED_CHAIN_ID=31337
REACT_APP_POLL_INTERVAL_MS=10000
```

## Run locally

```
cd frontend
npm install
npm start
```

Visit http://localhost:3000

## Features
- Connect/disconnect wallet (MetaMask)
- Show expected network and help switching
- Read client funding via `getClientFunding()`
- Deposit native ETH directly to the contract

## Notes
- `getClientFunding` ABI is minimal; replace `src/abi/UsageContract.json` with the complete ABI if needed.
- Deposit uses native ETH transfer; ensure the contract accepts `receive()` or `fallback(payable)` or exposes a deposit payable function if required.
