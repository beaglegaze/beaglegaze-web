export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
export const POLL_INTERVAL_MS = Number(process.env.REACT_APP_POLL_INTERVAL_MS || 10000);

// Allow a list of accepted chain IDs (e.g., "31337,1337")
const chainIdList = (process.env.REACT_APP_EXPECTED_CHAIN_ID_LIST || process.env.REACT_APP_EXPECTED_CHAIN_ID || "31337,1337")
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => !Number.isNaN(n));
export const EXPECTED_CHAIN_IDS = chainIdList.length ? chainIdList : [31337, 1337];

// Optional RPC URL(s) used when adding a custom chain to wallet (comma-separated)
export const RPC_URLS = (process.env.REACT_APP_RPC_URLS || "http://127.0.0.1:8545,http://localhost:8545")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const CHAINS = {
  1: { name: "Ethereum Mainnet" },
  5: { name: "Goerli" },
  11155111: { name: "Sepolia" },
  31337: { name: "Hardhat" },
  1337: { name: "Localhost" },
};

// Parameters for wallet_addEthereumChain
export const CHAIN_PARAMS = {
  31337: {
    chainId: "0x7A69", // 31337
    chainName: "Hardhat Local",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["http://localhost:8545"],
    blockExplorerUrls: [],
  },
};

export function getAddChainParams(chainId) {
  return CHAIN_PARAMS[Number(chainId)];
}

export function chainName(chainId) {
  return CHAINS[chainId]?.name || `Chain ${chainId}`;
}
