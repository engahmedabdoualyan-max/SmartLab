const API_ENDPOINTS = {
  libms: 'https://lims.example.com/api',
  export: '/export'
};

async function callLIMS(endpoint, body = {}) {
  const response = await fetch(API_ENDPOINTS.libms + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.cookie.match(/csrf_token=([^;]+)/)?.pop() || ''
    },
    body: JSON.stringify(body)
  });
  return await response.json();
}

function exportToCSV(data, filename) {
  const csv = data.map(row => row.join(',')).join('
');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
