import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { getBrowserProvider } from "../web3/ethers";
import { EXPECTED_CHAIN_IDS, getAddChainParams } from "../web3/config";

export const Web3Context = createContext({});

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Initialize provider from browser
  useEffect(() => {
    const p = getBrowserProvider();
    setProvider(p);

    const eth = typeof window !== "undefined" ? window.ethereum : null;
    if (eth) {
      const onAccountsChanged = (accs) => {
        if (accs?.length) setAddress(ethers.getAddress(accs[0]));
        else {
          setAddress(null);
          setSigner(null);
        }
      };
      const onChainChanged = (hexChainId) => {
        try {
          const id = parseInt(hexChainId, 16);
          if (!Number.isNaN(id)) setChainId(id);
        } catch {}
      };

      eth.on && eth.on("accountsChanged", onAccountsChanged);
      eth.on && eth.on("chainChanged", onChainChanged);

      // Initialize chainId via eth_chainId to avoid network mismatch errors
      if (p) {
        p.send("eth_chainId", [])
          .then((hex) => {
            try {
              const id = parseInt(hex, 16);
              if (!Number.isNaN(id)) setChainId(id);
            } catch {}
          })
          .catch(() => {});
      }

      return () => {
        eth.removeListener && eth.removeListener("accountsChanged", onAccountsChanged);
        eth.removeListener && eth.removeListener("chainChanged", onChainChanged);
      };
    }
  }, []);

  const connect = useCallback(async () => {
    if (!provider) throw new Error("No web3 provider found. Install MetaMask.");
    setConnecting(true);
    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = ethers.getAddress(accounts[0]);
      setAddress(addr);
      const s = await provider.getSigner();
      setSigner(s);
      // Use eth_chainId to avoid network change errors
      try {
        const hex = await provider.send("eth_chainId", []);
        const id = parseInt(hex, 16);
        if (!Number.isNaN(id)) setChainId(id);
      } catch {}
      return addr;
    } finally {
      setConnecting(false);
    }
  }, [provider]);

  const disconnect = useCallback(() => {
    setSigner(null);
    setAddress(null);
  }, []);

  const isCorrectNetwork = useMemo(() => (chainId ? EXPECTED_CHAIN_IDS.includes(Number(chainId)) : null), [chainId]);

  const switchNetwork = useCallback(async () => {
    if (!provider) return;
    const target = EXPECTED_CHAIN_IDS.includes(31337) ? 31337 : EXPECTED_CHAIN_IDS[0];
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.toBeHex(target) }]);
    } catch (switchError) {
      const params = getAddChainParams(target);
      if (params) {
        try {
          await provider.send("wallet_addEthereumChain", [params]);
          // try switching again
          await provider.send("wallet_switchEthereumChain", [{ chainId: ethers.toBeHex(target) }]);
          return;
        } catch (addError) {
          throw addError;
        }
      }
      throw switchError;
    }
  }, [provider]);

  const value = useMemo(() => ({ provider, signer, address, chainId, connecting, connect, disconnect, isCorrectNetwork, switchNetwork }), [provider, signer, address, chainId, connecting, connect, disconnect, isCorrectNetwork, switchNetwork]);

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
