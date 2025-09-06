from fastapi import APIRouter
import subprocess

router = APIRouter()

@router.get("/hello")
def hello_world():
    r = subprocess.run("echo hello world!", capture_output=True, text=True, shell=True)
    return {"output": r.stdout.strip()}
