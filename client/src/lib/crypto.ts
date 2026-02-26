/**
 * Generates a SHA-256 hash of the given string using the Web Crypto API.
 */
export async function generateSHA256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Uploads a file to IPFS via nft.storage
 */
export async function uploadToIPFS(file: File, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error("API Key required for IPFS upload");
  
  const response = await fetch('https://api.nft.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: file
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`IPFS Upload failed: ${errorText}`);
  }

  const data = await response.json();
  return data.value.cid;
}
