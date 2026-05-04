import { ethers } from 'ethers';

const ABI = [
  "function logDocument(string memory _hash, string memory _action) public"
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { hash } = req.body;

  if (!hash) {
    return res.status(400).json({ error: 'Hash required' });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.WALLET_KEY, provider);
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      ABI,
      wallet
    );

    const tx = await contract.logDocument(hash, 'ANALYZED');
    await tx.wait();

    return res.status(200).json({
      success: true,
      txHash: tx.hash,
      proofUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}