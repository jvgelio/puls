
fetch('http://localhost:3000/dashboard').then(res => res.text()).then(t => require('fs').writeFileSync('out.html', t));

