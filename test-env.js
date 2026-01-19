fetch('https://server-seven-ecru.vercel.app/api/debug-env')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
