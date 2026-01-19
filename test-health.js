fetch('https://server-seven-ecru.vercel.app/api/health')
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
