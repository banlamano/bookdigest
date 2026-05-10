import axios from 'axios';

const key = 'AIzaSyDv1i1B9WnOBsvkd1NZsOo_2ZrjpSFWnVo';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

async function test() {
  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: "Explain Grit in one sentence." }] }]
    });
    console.log("SUCCESS!", JSON.stringify(response.data).substring(0, 100));
  } catch (e: any) {
    if (e.response) {
      console.log("FAILURE!", e.response.status, JSON.stringify(e.response.data));
    } else {
      console.log("FAILURE!", e.message);
    }
  }
}

test();
