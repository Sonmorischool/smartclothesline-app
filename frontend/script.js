const API_URL = "https://smartclothesline-app.vercel.app";

// Check backend connection
async function checkBackend() {
    const statusElement = document.getElementById("api-status");

    if (!statusElement) return;

    try {
        const response = await fetch(`${API_URL}/`);

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const data = await response.json();

        statusElement.textContent = "✓ API Connected";
        statusElement.title = data.message || "Backend is responding";

    } catch (error) {
        statusElement.textContent = "✕ API Connection Failed";
        statusElement.title = error.message;

        console.error("Backend connection error:", error);
    }
}

// Send command to backend
async function sendCommand(command) {
    try {
        const response = await fetch(`${API_URL}/command`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ command })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Command failed");
        }

        alert(data.message || `Command sent: ${command}`);
        console.log("Command response:", data);

    } catch (error) {
        console.error("Command error:", error);
        alert(`Command failed: ${error.message}`);
    }
}

// Connect dashboard buttons
document.addEventListener("DOMContentLoaded", () => {
    checkBackend();

    document.getElementById("extend-btn")?.addEventListener("click", () => {
        sendCommand("EXTEND");
    });

    document.getElementById("retract-btn")?.addEventListener("click", () => {
        sendCommand("RETRACT");
    });

    document.getElementById("store-btn")?.addEventListener("click", () => {
        sendCommand("STORE");
    });
});

// Register the service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {
                console.log("SmartLine service worker registered.");
            })
            .catch(error => {
                console.error(
                    "Service worker registration failed:",
                    error
                );
            });
    });
}