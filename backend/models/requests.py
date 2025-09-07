from pydantic import BaseModel
from typing import Optional

class AdapterModeRequest(BaseModel):
    adapter: str
    mode: str

class NetworkScanRequest(BaseModel):
    adapter: str
    duration: int = 30

class ScanControlRequest(BaseModel):
    adapter: str

class DeauthRequest(BaseModel):
    adapter: str
    target_bssid: str
    target_mac: Optional[str] = None
    channel: Optional[str] = None

class HandshakeRequest(BaseModel):
    adapter: str
    target_bssid: str
    duration: int = 60

class EvilTwinRequest(BaseModel):
    adapter: str
    target_ssid: str
    channel: str = "auto"
