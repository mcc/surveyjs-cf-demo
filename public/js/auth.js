document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (response.ok) {
    const { token } = await response.json();
    localStorage.setItem('adminToken', token);
    window.location.href = '/admin.html';
  } else {
    alert('Invalid credentials');
  }
});