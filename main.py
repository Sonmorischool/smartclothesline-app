
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

@app.get("/")
def home():
    return {"message": "Smart Clothesline App is running!"}

@app.post("/command")
def send_command(data: ClotheslineCommand):
    global latest_command

    if data.command not in ["EXTEND", "RETRACT", "STOP"]:
        return {"success": False, "message": "Invalid command"}

    latest_command = {"command": data.command}

    return {
        "success": True,
        "message": f"Command received: {data.command}",
        "command": data.command
    }

@app.get("/command")
def get_command():
    return latest_command
