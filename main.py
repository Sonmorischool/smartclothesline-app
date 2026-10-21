from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClotheslineCommand(BaseModel):
    command: str


# Store the latest command in memory for now
latest_command = {"command": "STOP"}


# Commands accepted by the system
ALLOWED_COMMANDS = [
    "EXTEND",
    "RETRACT",
    "STORE",
    "STOP",
]


@app.get("/")
def home():
    return {"message": "Smart Clothesline App is running!"}


@app.post("/command")
def send_command(data: ClotheslineCommand):
    global latest_command

    command = data.command.strip().upper()

    if command not in ALLOWED_COMMANDS:
        return {
            "success": False,
            "message": f"Invalid command: {command}",
        }

    latest_command = {"command": command}

    messages = {
        "EXTEND": "Extend command received.",
        "RETRACT": "Retract command received.",
        "STORE": "Store clothes command received.",
        "STOP": "Stop command received.",
    }

    return {
        "success": True,
        "message": messages[command],
        "command": command,
    }


@app.get("/command")
def get_command():
    return latest_command