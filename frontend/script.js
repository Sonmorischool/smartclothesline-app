
const API_URL = "https://smartclothesline-app.vercel.app/";

async function checkBackend() {
    const statusElement = document.getElementById("api-status");

    if (!statusElement) {
        console.error("Could not find the API status element.");
        return;
    }

    statusElement.textContent = "Connecting to API...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        statusElement.textContent = "✓ API Connected";
        statusElement.title = data.message || "Backend is responding";

        console.log("Backend response:", data);
    } catch (error) {
        statusElement.textContent = "✕ API Connection Failed";

        console.error("Backend connection error:", error);
    }
}

document.addEventListener("DOMContentLoaded", checkBackend);
