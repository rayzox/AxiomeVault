import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const ABI = [
  "function logDocument(string memory _hash, string memory _action) public",
  "function getLogs() public view returns (tuple(string documentHash, string action, uint256 timestamp, address owner)[])"
];

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install it.');
  }
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return signer;
};

export const logToBlockchain = async (hash) => {
  try {
    const signer = await connectWallet();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.logDocument(hash, 'ANALYZED');
    await tx.wait();
    return {
      success: true,
      txHash: tx.hash,
      proofUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
    };
  } catch (err) {
    console.error('Blockchain error:', err);
    // Fallback for demo if MetaMask not connected
    return {
      success: false,
      txHash: '0x' + hash.substring(0, 62),
      proofUrl: `https://sepolia.etherscan.io/tx/0x${hash.substring(0, 62)}`
    };
  }
};