import { ethers } from "ethers";

export function buildInterfaceFromSignature(signature) {
  // Accept either "deposit()" or "deposit(uint256,address)" etc.
  // We mark as payable; if not payable, node will reject value.
  return new ethers.Interface([`function ${signature} payable`]);
}
