fetch('https://server-seven-ecru.vercel.app/api/payment/create-payment-intent', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({amount: 1000, currency: 'lkr'})
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
