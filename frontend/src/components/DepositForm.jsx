import React, { useContext, useEffect, useMemo, useState } from "react";
import { Web3Context } from "../context/Web3Context";
import { CONTRACT_ADDRESS as ENV_CONTRACT_ADDRESS } from "../web3/config";
import abi from "../abi/UsageContract.json";
import { ethers } from "ethers";
import { useContext as useReactContext } from "react";
import { ContractsContext } from "../context/ContractsContext";
import { useToast } from "../context/ToastContext";

export default function DepositForm() {
  const { signer, address, isCorrectNetwork } = useContext(Web3Context);
  const { current } = useReactContext(ContractsContext);
  const { addToast } = useToast();
  const targetAddress = current?.address || ENV_CONTRACT_ADDRESS;
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [subPriceWei, setSubPriceWei] = useState(null);

  // Fetch minimum subscription price for tooltip
  useEffect(() => {
    let cancelled = false;
    const fetchPrice = async () => {
      if (!signer || !isCorrectNetwork || !targetAddress) return;
      try {
        const contract = new ethers.Contract(targetAddress, abi, signer);
        const price = await contract.subscriptionPriceInWei();
        if (!cancelled) setSubPriceWei(price);
      } catch (_) {
        if (!cancelled) setSubPriceWei(null);
      }
    };
    fetchPrice();
    return () => {
      cancelled = true;
    };
  }, [signer, isCorrectNetwork, targetAddress]);

  const subPriceEth = useMemo(() => (subPriceWei ? ethers.formatEther(subPriceWei) : null), [subPriceWei]);

  const canSubmit = Boolean(address && signer && isCorrectNetwork && amount && Number(amount) > 0);

  const callPayable = async (methodName) => {
    if (!canSubmit) return;
    setStatus("pending");
    setError(null);
    try {
      const value = ethers.parseEther(String(amount));
      const contract = new ethers.Contract(targetAddress, abi, signer);
      if (typeof contract[methodName] !== "function") {
        throw new Error(`${methodName}() not found on contract`);
      }
      const tx = await contract[methodName]({ value });
      setStatus("waiting");
      await tx.wait();
      setStatus("success");
      setAmount("");
      addToast(`Transaction confirmed`, { type: 'success' });
    } catch (e) {
      setError(e.message || String(e));
      setStatus(null);
      addToast(`Transaction failed: ${e.message || e}`, { type: 'error', timeout: 6000 });
    }
  };

  return (
    <div>
      <h3>Deposit ETH</h3>
      {!address ? (
        <div>Connect a wallet to deposit.</div>
      ) : !isCorrectNetwork ? (
        <div>Please switch to the expected network.</div>
      ) : (
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <label className="row" style={{ gap: 8 }}>
            <span className="label">Amount (ETH)</span>
            <input className="input" type="number" min="0" step="0.0001" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <div className="row" style={{ gap: 8 }}>
            <button onClick={() => callPayable('fund')} disabled={!canSubmit || status === "pending" || status === "waiting"}>
              {status === "pending" ? "Submitting..." : status === "waiting" ? "Confirming..." : "Fund"}
            </button>
            <button
              onClick={() => callPayable('purchaseSubscription')}
              disabled={!canSubmit || status === "pending" || status === "waiting"}
              title={subPriceEth ? `Min price: ${subPriceEth} ETH` : 'Min price: unknown'}
            >
              {status === "pending" ? "Submitting..." : status === "waiting" ? "Confirming..." : "Purchase Subscription"}
            </button>
          </div>
        </div>
      )}
  {error && <div style={{ color: "red" }}>Error: {error}</div>}
      <div className="row"><div><span className="label">Contract</span> {targetAddress}</div></div>
    </div>
  );
}
