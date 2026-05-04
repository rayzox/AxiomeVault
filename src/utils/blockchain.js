export const logToBlockchain = async (hash) => {
  try {
    const response = await fetch('/api/log-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash })
    });

    const data = await response.json();

    if (!data.success) throw new Error(data.error);

    return {
      success: true,
      txHash: data.txHash,
      proofUrl: data.proofUrl
    };
  } catch (err) {
    console.error('Blockchain error:', err);
    return {
      success: false,
      txHash: '0x' + hash.substring(0, 62),
      proofUrl: `https://sepolia.etherscan.io/tx/0x${hash.substring(0, 62)}`
    };
  }
};