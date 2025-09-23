import React, { useContext, useEffect, useMemo, useState } from "react";
import { Web3Context } from "../context/Web3Context";
import { CONTRACT_ADDRESS as ENV_CONTRACT_ADDRESS, POLL_INTERVAL_MS } from "../web3/config";
import abi from "../abi/UsageContract.json";
import { ethers } from "ethers";
import { useContext as useReactContext } from "react";
import { ContractsContext } from "../context/ContractsContext";
import { useToast } from "../context/ToastContext";
import { shortenAddress } from "../web3/ethers";

export default function DeveloperPanel() {
  const { signer, address, isCorrectNetwork } = useContext(Web3Context);
  const { current } = useReactContext(ContractsContext);
  const { addToast } = useToast();

  const [isDeveloper, setIsDeveloper] = useState(null);
  const [hasPendingRequest, setHasPendingRequest] = useState(null);
  const [developerBalance, setDeveloperBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestPending, setRequestPending] = useState(false);
  const [payoutPending, setPayoutPending] = useState(false);
  // Developer approvals UI state
  const [candidate, setCandidate] = useState("");
  const [checkPending, setCheckPending] = useState(false);
  const [votePending, setVotePending] = useState(false);
  const [candidateStatus, setCandidateStatus] = useState(null); // null=unknown, true=pending, false=not pending
  const [pendingCandidates, setPendingCandidates] = useState([]);

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

  const fetchDeveloperInfo = async () => {
    if (!contract || !address) return;
    const snapshotAddress = address;
    const snapshotContract = contract;
    setLoading(true);
    setError(null);
    try {
      // Fetch role + pending request first
      const [devStatus, pendingRequest] = await Promise.all([
        snapshotContract.isDeveloper(),
        snapshotContract.hasPendingRegistrationRequest(snapshotAddress)
      ]);

      // Abort if address or contract changed mid-flight
      if (address !== snapshotAddress || contract !== snapshotContract) return;

      const isDev = Boolean(devStatus);
      setIsDeveloper(isDev);
      setHasPendingRequest(Boolean(pendingRequest));
      console.log("Developer status:", isDev, "Pending request:", pendingRequest);

      // Only developers are allowed to query their balance; avoid revert when not a developer
      if (isDev) {
        try {
          const balance = await snapshotContract.getDeveloperBalance();
          setDeveloperBalance(balance);
        } catch (balanceErr) {
          console.warn("Failed to fetch developer balance:", balanceErr);
          // Soft-fail: keep the UI usable and show no balance
          setDeveloperBalance(0n);
        }
        // If contract supports listing, fetch pending registration candidates
        try {
          if (snapshotContract && typeof snapshotContract.getPendingRegistrations === "function") {
            const pc = await snapshotContract.getPendingRegistrations();
            if (Array.isArray(pc)) setPendingCandidates(pc);
          } else {
            setPendingCandidates([]);
          }
        } catch (e) {
          console.warn("Failed to fetch pending registrations:", e);
          setPendingCandidates([]);
        }
      } else {
        setDeveloperBalance(0n);
        setPendingCandidates([]);
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      if (address === snapshotAddress && contract === snapshotContract) setLoading(false);
    }
  };

  useEffect(() => {
    setIsDeveloper(null);
    setHasPendingRequest(null);
    setDeveloperBalance(null);
    if (!contract || !address) return;
    let cancelled = false;
    // Immediate fetch (microtask) then a slight debounce to capture freshly switched signer
    Promise.resolve().then(() => { if (!cancelled) fetchDeveloperInfo(); });
    const debounceId = setTimeout(() => { if (!cancelled) fetchDeveloperInfo(); }, 300);
    const intervalId = setInterval(() => { if (!cancelled) fetchDeveloperInfo(); }, Number(POLL_INTERVAL_MS));
    return () => { cancelled = true; clearTimeout(debounceId); clearInterval(intervalId); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, address]);

  const onRequestRegistration = async () => {
    if (!contract || !address) return;
    setRequestPending(true);
    try {
      const tx = await contract.requestDeveloperRegistration();
      addToast("Registration requested — awaiting confirmation", { type: "info" });
      await tx.wait();
      addToast("Registration request confirmed", { type: "success" });
      fetchDeveloperInfo();
    } catch (e) {
      addToast(`Registration request failed: ${e.message || e}`, { type: "error", timeout: 6000 });
    } finally {
      setRequestPending(false);
    }
  };

  const onRequestPayout = async () => {
    if (!contract || !address) return;
    setPayoutPending(true);
    try {
      const tx = await contract.withdrawBalance();
      addToast("Withdraw submitted — awaiting confirmation", { type: "info" });
      await tx.wait();
      addToast("Withdrawal confirmed", { type: "success" });
      fetchDeveloperInfo();
    } catch (e) {
      addToast(`Withdraw failed: ${e.message || e}`, { type: "error", timeout: 6000 });
    } finally {
      setPayoutPending(false);
    }
  };

  const onCheckCandidate = async () => {
    if (!contract) return;
    const addr = (candidate || "").trim();
    if (!ethers.isAddress(addr)) {
      addToast("Enter a valid candidate address", { type: "error" });
      return;
    }
    setCheckPending(true);
    try {
      const pending = await contract.hasPendingRegistrationRequest(addr);
      setCandidateStatus(Boolean(pending));
    } catch (e) {
      setCandidateStatus(null);
      addToast(`Check failed: ${e.message || e}`, { type: "error" });
    } finally {
      setCheckPending(false);
    }
  };

  const onVoteForCandidate = async (approve) => {
    if (!contract) return;
    const addr = (candidate || "").trim();
    if (!ethers.isAddress(addr)) {
      addToast("Enter a valid candidate address", { type: "error" });
      return;
    }
    setVotePending(true);
    try {
      const tx = await contract.voteForDeveloper(addr, Boolean(approve));
      addToast(`Voting ${approve ? "approve" : "reject"} submitted — awaiting confirmation`, { type: "info" });
      await tx.wait();
      addToast("Vote confirmed", { type: "success" });
      // refresh candidate status and overall state
      onCheckCandidate();
      fetchDeveloperInfo();
    } catch (e) {
      addToast(`Vote failed: ${e.message || e}`, { type: "error", timeout: 6000 });
    } finally {
      setVotePending(false);
    }
  };

  const balanceEth = useMemo(() => (developerBalance ? ethers.formatEther(developerBalance) : null), [developerBalance]);

  const getStatusDisplay = () => {
    if (isDeveloper) return <span style={{ color: '#22c55e' }}>Registered Developer</span>;
    if (hasPendingRequest) return <span style={{ color: '#f59e0b' }}>Registration Pending</span>;
    return <span style={{ color: '#ef4444' }}>Not Registered</span>;
  };

  return (
    <div>
      <h3>Developer Status</h3>
      {!address ? (
        <div>Connect a wallet to view developer status.</div>
      ) : !isCorrectNetwork ? (
        <div>Please switch to the expected network.</div>
      ) : loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>Error: {error}</div>
      ) : (
        <>
          <div className="row">
            <div><span className="label">Contract</span> <span title={activeAddress}>{shortenAddress(activeAddress)}</span></div>
          </div>
          <div className="row">
            <div><span className="label">Developer</span> <span title={address}>{shortenAddress(address)}</span></div>
          </div>
          <div className="row">
            <div><span className="label">Status</span> {getStatusDisplay()}</div>
          </div>
          {isDeveloper && (
            <div className="row">
              <div><span className="label">Balance</span> {balanceEth !== null ? `${balanceEth} ETH` : "-"}</div>
              <button
                className="danger"
                onClick={onRequestPayout}
                disabled={!contract || payoutPending || !developerBalance || developerBalance === 0n}
              >
                {payoutPending ? "Withdrawing..." : "Withdraw Balance"}
              </button>
            </div>
          )}
          {isDeveloper && (
            <div className="row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
              <h4 style={{ margin: "12px 0 4px" }}>Developer Approvals</h4>
              {pendingCandidates.length > 0 ? (
                <div style={{ width: "100%" }}>
                  <div style={{ marginBottom: 6, color: '#555' }}>Pending registration requests:</div>
                  <ul style={{ marginTop: 0 }}>
                    {pendingCandidates.map((addr) => (
                      <li key={addr} className="row" style={{ alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span title={addr}>{shortenAddress(addr)}</span>
                        <button onClick={() => { setCandidate(addr); setCandidateStatus(true); }}>
                          Select
                        </button>
                        <button onClick={() => onVoteForCandidate(true)} disabled={!contract || votePending}>
                          {votePending ? "Submitting..." : "Approve"}
                        </button>
                        <button className="danger" onClick={() => onVoteForCandidate(false)} disabled={!contract || votePending}>
                          {votePending ? "Submitting..." : "Reject"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{ color: '#555', fontSize: 12 }}>
                  Contract does not expose a list of pending requests or none found. Enter a candidate address to act.
                </div>
              )}
              <div className="row">
                <input
                  className="input"
                  placeholder="Candidate 0x..."
                  value={candidate}
                  onChange={(e) => setCandidate(e.target.value)}
                  style={{ minWidth: 360 }}
                />
                <button onClick={onCheckCandidate} disabled={!contract || checkPending}>
                  {checkPending ? "Checking..." : "Check"}
                </button>
              </div>
              {candidateStatus !== null && (
                <div style={{ color: candidateStatus ? '#f59e0b' : '#22c55e' }}>
                  {candidateStatus ? 'Registration Pending for candidate' : 'No pending request for candidate'}
                </div>
              )}
              <div className="row" style={{ gap: 8 }}>
                <button onClick={() => onVoteForCandidate(true)} disabled={!contract || votePending || !ethers.isAddress((candidate || "").trim()) || candidateStatus !== true}>
                  {votePending ? "Submitting..." : "Approve"}
                </button>
                <button className="danger" onClick={() => onVoteForCandidate(false)} disabled={!contract || votePending || !ethers.isAddress((candidate || "").trim()) || candidateStatus !== true}>
                  {votePending ? "Submitting..." : "Reject"}
                </button>
              </div>
              <div style={{ color: '#555', fontSize: 12 }}>Only registered developers can vote. Enter a candidate address with a pending registration request.</div>
            </div>
          )}
          {!isDeveloper && !hasPendingRequest && (
            <div className="row">
              <button onClick={onRequestRegistration} disabled={!contract || requestPending}>
                {requestPending ? "Requesting..." : "Request Developer Registration"}
              </button>
            </div>
          )}
          {hasPendingRequest && (
            <div className="row">
              <div style={{ color: '#f59e0b' }}>Your registration request is pending approval by existing developers.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
