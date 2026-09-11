# Legacy entrypoint kept for backward compatibility; points directly to app.py
from app import app, lifespan

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
