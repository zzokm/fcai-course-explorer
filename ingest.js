fetch('https://majors.yehia.dev/api/ingest', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer fcai-admin'
  }
}).then(async res => {
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text.substring(0, 500));
}).catch(err => console.error(err));
