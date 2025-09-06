import platform

def is_wsl_or_linux():
    """Check if running in WSL or native Linux"""
    try:
        with open('/proc/version', 'r') as f:
            return 'microsoft' in f.read().lower() or 'WSL' in f.read()
    except:
        return platform.system().lower() == 'linux'

# Determine if we should use real commands or mock data
USE_REAL_TOOLS = 1
