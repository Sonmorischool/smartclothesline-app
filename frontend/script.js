
const API_URL = "https://smartclothesline-app.vercel.app";

// =====================================
// 1. CHECK BACKEND CONNECTION
// =====================================

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

// =====================================
// 2. SEND CLOTHESLINE COMMANDS
// =====================================

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

// =====================================
// 3. PAGE NAVIGATION
// =====================================

function showPage(page) {
    const title = document.querySelector("header h1");
    const description = document.querySelector("header .muted");
    const hero = document.querySelector(".hero");
    const statusSection = document.getElementById("status");
    const controlsSection = document.getElementById("controls");
    const storageSection = document.getElementById("storage");
    const navigationLinks = document.querySelectorAll(".sidebar nav a");

    // Hide the content from the other views.
    if (hero) hero.hidden = true;
    if (statusSection) statusSection.hidden = true;
    if (controlsSection) controlsSection.hidden = true;
    if (storageSection) storageSection.hidden = true;

    // Display only the selected view.
    if (page === "dashboard") {
        if (hero) hero.hidden = false;
        if (statusSection) statusSection.hidden = false;

        if (title) title.textContent = "Dashboard";

        if (description) {
            description.textContent =
                "Welcome to your Smart Clothesline dashboard.";
        }

    } else if (page === "status") {
        if (statusSection) statusSection.hidden = false;

        if (title) title.textContent = "Device Status";

        if (description) {
            description.textContent =
                "Check your clothesline, rain sensor, weather, and Arduino status.";
        }

    } else if (page === "controls") {
        if (controlsSection) controlsSection.hidden = false;
        if (storageSection) storageSection.hidden = false;

        if (title) title.textContent = "Controls";

        if (description) {
            description.textContent =
                "Operate your clothesline and clothes storage controls.";
        }
    }

    // Update the active navigation highlight.
    navigationLinks.forEach(link => {
        link.classList.remove("active");
    });

    const activeLink = document.querySelector(
        `.sidebar nav a[data-page="${page}"]`
    );

    if (activeLink) {
        activeLink.classList.add("active");
    }

    // Keep the address bar in step with the selected view.
    const hash = page === "dashboard" ? "#dashboard" : `#${page}`;

    if (window.location.hash !== hash) {
        history.replaceState(null, "", hash);
    }
}

// =====================================
// 4. WEATHER — STILL DISABLED
// =====================================

const WEATHER_SETTINGS = {
    enabled: false,
    latitude: 6.5244,
    longitude: 3.3792,
    location: "Lagos, Nigeria",
    forecastDays: 5
};

async function getWeatherForecast() {
    if (!WEATHER_SETTINGS.enabled) {
        console.log("Weather forecast is not activated yet.");
        return null;
    }

    const parameters = new URLSearchParams({
        latitude: WEATHER_SETTINGS.latitude,
        longitude: WEATHER_SETTINGS.longitude,
        current:
            "temperature_2m,relative_humidity_2m,precipitation,weather_code",
        hourly:
            "temperature_2m,precipitation_probability,weather_code",
        forecast_days: WEATHER_SETTINGS.forecastDays,
        timezone: "Africa/Lagos"
    });

    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${parameters}`
        );

        if (!response.ok) {
            throw new Error("Weather service unavailable.");
        }

        const data = await response.json();

        return {
            location: WEATHER_SETTINGS.location,
            current: data.current,
            hourly: data.hourly,
            updatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error("Weather forecast error:", error);
        return null;
    }
}

// =====================================
// 5. SCHEDULING — STILL DISABLED
// =====================================

const SCHEDULE_SETTINGS = {
    enabled: false
};

const SCHEDULE_STORAGE_KEY = "smartClotheslineSchedules";

function loadScheduledActions() {
    try {
        const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);

        if (!saved) return [];

        const actions = JSON.parse(saved);

        return Array.isArray(actions) ? actions : [];

    } catch (error) {
        console.error("Could not load schedules:", error);
        return [];
    }
}

function saveScheduledActions(actions) {
    try {
        localStorage.setItem(
            SCHEDULE_STORAGE_KEY,
            JSON.stringify(actions)
        );

        return true;

    } catch (error) {
        console.error("Could not save schedules:", error);
        return false;
    }
}

let scheduledActions = loadScheduledActions();

function prepareSchedule(scheduleDetails) {
    if (!SCHEDULE_SETTINGS.enabled) {
        console.log("Scheduling is not activated yet.");
        return false;
    }

    if (!scheduleDetails || !scheduleDetails.datetime) {
        throw new Error("Please provide a date and time.");
    }

    const allowedCommands = ["EXTEND", "RETRACT", "STORE"];
    const command = String(
        scheduleDetails.command || ""
    ).toUpperCase();

    if (!allowedCommands.includes(command)) {
        throw new Error("Unsupported scheduled command.");
    }

    const scheduledTime = new Date(scheduleDetails.datetime);

    if (
        Number.isNaN(scheduledTime.getTime()) ||
        scheduledTime.getTime() <= Date.now()
    ) {
        throw new Error("Choose a valid future date and time.");
    }

    const action = {
        id: crypto.randomUUID(),
        datetime: scheduledTime.toISOString(),
        command,
        status: "prepared"
    };

    const updatedActions = [...scheduledActions, action];

    if (!saveScheduledActions(updatedActions)) {
        throw new Error("The schedule could not be saved.");
    }

    scheduledActions = updatedActions;

    return action;
}

// =====================================
// 6. INITIALISE THE APP
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    checkBackend();

    // Navigation
    const navigationLinks = document.querySelectorAll(
        ".sidebar nav a"
    );

    navigationLinks.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            const page = link.dataset.page;

            if (page) {
                showPage(page);
            }
        });
    });

    // Existing control buttons
    document.getElementById("extend-btn")?.addEventListener(
        "click",
        () => sendCommand("EXTEND")
    );

    document.getElementById("retract-btn")?.addEventListener(
        "click",
        () => sendCommand("RETRACT")
    );

    document.getElementById("store-btn")?.addEventListener(
        "click",
        () => sendCommand("STORE")
    );

    // Restore the requested view when the app opens.
    const requestedPage = window.location.hash.replace("#", "");

    if (["dashboard", "status", "controls"].includes(requestedPage)) {
        showPage(requestedPage);
    } else {
        showPage("dashboard");
    }
});

// =====================================
// 7. REGISTER SERVICE WORKER
// =====================================

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
