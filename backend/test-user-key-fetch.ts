const key = 'AIzaSyAs5P5GSX8ykF5eI4PYF53lVoK1oxAlFv8';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

async function test() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Explain Grit in one sentence." }] }]
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log("SUCCESS!", JSON.stringify(data).substring(0, 50));
    } else {
      console.log("FAILURE!", response.status, JSON.stringify(data));
    }
  } catch (e: any) {
    console.log("FAILURE!", e.message);
  }
}

test();
