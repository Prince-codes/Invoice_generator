// auth.js
// Simple in-memory authentication for demonstration

const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // Plaintext for demo only
    display_name: 'Admin'
  },
  // Add more users if needed
];

function authenticate(username, password) {
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return null;
  return { id: user.id, username: user.username, display_name: user.display_name };
}

module.exports = { authenticate };
