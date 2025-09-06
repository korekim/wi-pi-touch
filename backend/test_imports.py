#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    print("Testing imports...")
    
    # Test basic FastAPI import
    from fastapi import FastAPI
    print("✅ FastAPI import successful")
    
    # Test utils import
    from utils.system import USE_REAL_TOOLS
    print("✅ Utils import successful")
    
    # Test models import
    from models.requests import NetworkScanRequest
    print("✅ Models import successful")
    
    # Test API modules
    from api import hello, interfaces, adapter, scan, deauth, handshake, eviltwin
    print("✅ All API modules import successful")
    
    # Test creating the app
    app = FastAPI()
    print("✅ FastAPI app creation successful")
    
    # Test including routers
    app.include_router(hello.router, prefix="/api", tags=["general"])
    app.include_router(interfaces.router, prefix="/api", tags=["interfaces"])
    app.include_router(adapter.router, prefix="/api", tags=["adapter"])
    app.include_router(scan.router, prefix="/api", tags=["scan"])
    app.include_router(deauth.router, prefix="/api", tags=["attacks"])
    app.include_router(handshake.router, prefix="/api", tags=["attacks"])
    app.include_router(eviltwin.router, prefix="/api", tags=["attacks"])
    print("✅ All routers included successfully")
    
    print("\n🎉 All imports and setup working correctly!")
    print("You can now run: python main.py")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Check that all required files exist and Python path is correct")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    print("Check your code for syntax errors")
