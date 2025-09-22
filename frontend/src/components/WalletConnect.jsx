import React, { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { chainName } from "../web3/config";
import { shortenAddress } from "../web3/ethers";

export default function WalletConnect() {
  const { address, connect, disconnect, connecting, chainId, isCorrectNetwork, switchNetwork, provider } = useContext(Web3Context);

  if (!provider) {
    return (
      <div>
        <p>No wallet detected. Install MetaMask.</p>
        <a className="App-link" href="https://metamask.io" target="_blank" rel="noreferrer">Get MetaMask</a>
      </div>
    );
  }

  return (
    <div className="row">
      {address ? (
        <div className="row">
          <div><span className="label">Connected</span>: {shortenAddress(address)}</div>
          <div><span className="label">Network</span>: {chainName(chainId)} {isCorrectNetwork ? "" : "(wrong network)"} {chainId != null ? `(id ${chainId})` : ""}</div>
          {!isCorrectNetwork && <button onClick={switchNetwork}>Switch Network</button>}
          <button className="danger" onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect} disabled={connecting}>{connecting ? "Connecting..." : "Connect Wallet"}</button>
      )}
    </div>
  );
}
