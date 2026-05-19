const key = 'AIzaSyD9WRD6hLQx0rXZCEP0CV5sSOGz1d4Ehyg';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

const body = {
  contents: [{
    parts: [{
      text: 'What is the official German published title of "Atomic Habits" by James Clear? Reply with just the German title, nothing else.'
    }]
  }]
};

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

const data = await res.json();
console.log('Status:', res.status);
console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data));
