export async function generateToken(username: string, secret: string): Promise<string> {
  try {
    if (!username || !secret) {
      throw new Error('Missing username or secret');
    }
    const encoder = new TextEncoder();
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
    const payload = btoa(JSON.stringify({
      username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    })).replace(/=/g, '');

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${header}.${payload}`)
    );
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');

    const token = `${header}.${payload}.${signatureBase64}`;
    if (!token) {
      throw new Error('Generated token is empty');
    }
    return token;
  } catch (e) {
    console.error('Generate token error:', e.message);
    throw new Error(`Failed to generate token: ${e.message}`);
  }
}

export async function verifyToken(token: string, secret: string): Promise<void> {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) {
      throw new Error('Invalid token format');
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${header}.${payload}`)
    );
    const expectedSignatureBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSignature))).replace(/=/g, '');

    if (signature !== expectedSignatureBase64) {
      throw new Error('Invalid signature');
    }

    const decodedPayload = JSON.parse(atob(payload));
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
  } catch (e) {
    console.error('Verify token error:', e.message);
    throw new Error(`Token verification failed: ${e.message}`);
  }
}