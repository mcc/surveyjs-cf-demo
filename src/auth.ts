export function generateToken(username: string): string {
  // Simple JWT-like token (for demo; use a proper JWT library in production)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ username, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  const signature = btoa('dummy-signature'); // Replace with proper HMAC signing
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): boolean {
  // Verify token (for demo; implement proper verification)
  return token.split('.').length === 3;
}