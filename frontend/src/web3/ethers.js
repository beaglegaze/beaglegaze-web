import { ethers } from "ethers";

export function getBrowserProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}

export async function getSigner() {
  const provider = getBrowserProvider();
  if (!provider) return null;
  try {
    return await provider.getSigner();
  } catch (e) {
    return null;
  }
}

export function shortenAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
