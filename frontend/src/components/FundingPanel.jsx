import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Web3Context } from "../context/Web3Context";
import { CONTRACT_ADDRESS as ENV_CONTRACT_ADDRESS, POLL_INTERVAL_MS } from "../web3/config";
import abi from "../abi/UsageContract.json";
import { ethers } from "ethers";
import { useContext as useReactContext } from "react";
import { ContractsContext } from "../context/ContractsContext";
import { useToast } from "../context/ToastContext";
import { shortenAddress } from "../web3/ethers";

export default function FundingPanel() {
  const { signer, address, isCorrectNetwork } = useContext(Web3Context);
  const { current } = useReactContext(ContractsContext);
  const [wei, setWei] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionValid, setSubscriptionValid] = useState(null);
  const [payoutPending, setPayoutPending] = useState(false);
  const [nextPollCountdown, setNextPollCountdown] = useState(0);
  const [useGwei, setUseGwei] = useState(true);
  const { addToast } = useToast();

  const activeAddress = current?.address || ENV_CONTRACT_ADDRESS;
  const contract = useMemo(() => {
    if (!signer || !isCorrectNetwork) return null;
    try {
      return new ethers.Contract(activeAddress, abi, signer);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [signer, isCorrectNetwork, activeAddress]);

  const fetchFundingCallback = useCallback(async () => {
    if (!contract || !address) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching funding for address:', address);
      const signerAddress = await contract.runner.getAddress();
      console.log('Signer address:', signerAddress);
      
      const value = await contract.getClientFunding();
      console.log('Client funding raw value:', value.toString());
      setWei(value);
      
      // Fetch subscription status
      const valid = await contract.hasValidSubscription();
      setSubscriptionValid(Boolean(valid));
    } catch (e) {
      console.error('Error fetching funding:', e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [contract, address]);

  useEffect(() => {
    console.log('FundingPanel useEffect triggered - contract:', !!contract, 'address:', address);
    setWei(null);
    setNextPollCountdown(0);
    if (!contract || !address) return;
    
    // Initial fetch
    fetchFundingCallback();
    
    // Set up event listener for Consumed events
    const handleConsumed = async (clientAddress, newFunding) => {
      console.log('Consumed event received:', { clientAddress, newFunding: newFunding.toString() });
      
      // Get the current signer address to ensure we only update for the current signer
      const signerAddress = await contract.runner.getAddress();
      console.log('Current signer address:', signerAddress);
      
      // Only update if the event is for the current signer AND connected address
      if (clientAddress.toLowerCase() === signerAddress.toLowerCase() && 
          clientAddress.toLowerCase() === address.toLowerCase()) {
        console.log('Updating funding from Consumed event for current signer:', newFunding.toString());
        setWei(newFunding);
        // Reset countdown when we get a real-time update
        setNextPollCountdown(Number(POLL_INTERVAL_MS) * 5);
      } else {
        console.log('Ignoring Consumed event - not for current signer/address');
      }
    };
    
    // Listen for the Consumed event
    contract.on('Consumed', handleConsumed);
    
    // Set up countdown timer (updates every second)
    const pollIntervalMs = Number(POLL_INTERVAL_MS) * 5;
    setNextPollCountdown(pollIntervalMs);
    
    const countdownId = setInterval(() => {
      setNextPollCountdown(prev => {
        const next = prev - 1000;
        return next <= 0 ? pollIntervalMs : next;
      });
    }, 1000);
    
    // Keep a longer interval polling as backup in case events are missed
    const id = setInterval(() => {
      fetchFundingCallback();
      setNextPollCountdown(pollIntervalMs);
    }, pollIntervalMs);
    
    return () => {
      clearInterval(id);
      clearInterval(countdownId);
      contract.off('Consumed', handleConsumed);
    };
  }, [contract, address, fetchFundingCallback]);

  const gwei = useMemo(() => (wei ? ethers.formatUnits(wei, 'gwei') : null), [wei]);
  const eth = useMemo(() => (wei ? ethers.formatEther(wei) : null), [wei]);
  const displayValue = useGwei ? gwei : eth;
  const displayUnit = useGwei ? 'Gwei' : 'ETH';

  const onRequestPayout = async () => {
    if (!address || !isCorrectNetwork || !contract) return;
    setPayoutPending(true);
    try {
      const tx = await contract.requestPayout();
      addToast("Payout requested — awaiting confirmation", { type: "info" });
      await tx.wait();
      addToast("Payout confirmed", { type: "success" });
      // Refresh funding after payout
      fetchFundingCallback();
    } catch (e) {
      addToast(`Payout failed: ${e.message || e}`, { type: "error", timeout: 6000 });
    } finally {
      setPayoutPending(false);
    }
  };

  const onRefreshFunding = async () => {
    if (!contract || !address) return;
    await fetchFundingCallback();
    // Reset countdown timer
    setNextPollCountdown(Number(POLL_INTERVAL_MS) * 5);
  };

  return (
  <div>
      <h3>Client Funding</h3>
      {!address ? (
        <div>Connect a wallet to view funding.</div>
      ) : !isCorrectNetwork ? (
        <div>Please switch to the expected network.</div>
      ) : loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>Error: {error}</div>
    ) : (
        <>
          <div className="row"><div><span className="label">Contract</span> <span title={activeAddress}>{shortenAddress(activeAddress)}</span></div></div>
          <div className="row">
            <div>
              <span className="label">Funding</span> for <span title={address}>{shortenAddress(address)}</span>: {displayValue !== null ? `${displayValue} ${displayUnit}` : "-"}
              <button 
                onClick={() => setUseGwei(!useGwei)} 
                style={{ marginLeft: '8px', fontSize: '0.8em', padding: '2px 6px' }}
                disabled={!displayValue}
              >
                {useGwei ? 'Show ETH' : 'Show Gwei'}
              </button>
            </div>
            <button className="danger" onClick={onRequestPayout} disabled={!contract || payoutPending}>{payoutPending ? "Requesting..." : "Request Payout"}</button>
          </div>
          <div className="row"><div><span className="label">Subscription</span> {subscriptionValid === null ? '-' : (subscriptionValid ? <span style={{ color: '#22c55e' }}>Active</span> : <span style={{ color: '#ef4444' }}>Inactive</span>)}</div></div>
          <div className="row">
            <div style={{ fontSize: '0.85em', color: '#666' }}>
              Next poll in: {nextPollCountdown > 0 ? `${Math.ceil(nextPollCountdown / 1000)}s` : 'soon...'}
            </div>
            <button onClick={onRefreshFunding} disabled={!contract || loading}>
              {loading ? "Refreshing..." : "Refresh Now"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
