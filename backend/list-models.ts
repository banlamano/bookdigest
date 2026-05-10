const key = 'AIzaSyAs5P5GSX8ykF5eI4PYF53lVoK1oxAlFv8';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            console.log("MODELS:", JSON.stringify(data.models.map((m: any) => m.name)));
        } else {
            console.log("FAILURE!", response.status, JSON.stringify(data));
        }
    } catch (e: any) {
        console.log("FAILURE!", e.message);
    }
}

listModels();
