const response = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'buyer@ticketbazar.com', password: 'Buy@Ticket2024' })
});
const loginData = await response.json();
const token = loginData.data.token;

const tRes = await fetch('http://localhost:5001/api/tickets');
const tData = await tRes.json();
const ticketId = tData.data.tickets[0]._id;

const bRes = await fetch('http://localhost:5001/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ ticketId, quantity: 1 })
});
const bData = await bRes.json();
console.log('Status:', bRes.status);
console.log('Response:', JSON.stringify(bData, null, 2));
