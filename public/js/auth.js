document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    if (response.ok) {
      const token = result.data?.token || result.token;
      if (!token) {
        console.error('No token in response:', result);
        alert('Login failed: No token received');
        return;
      }
      console.log('Token received:', token);
      localStorage.setItem('adminToken', token);
      window.location.href = '/manage.html';
    } else {
      console.error('Login failed:', result);
      alert(`Login failed: ${result.message || 'Unknown error'}`);
    }
  } catch (e) {
    console.error('Login error:', e);
    alert(`Login error: ${e.message}`);
  }
});