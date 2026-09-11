import time
import logging
import traceback
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

logger = logging.getLogger("smartdesk.production")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Process-Time-Ms"] = str(process_time_ms)
        
        logger.info(
            f"{request.method} {request.url.path} - Status: {response.status_code} - Latency: {process_time_ms}ms"
        )
        
        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Global exception catching middleware to ensure clean JSON error responses in production.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}")
            logger.error(traceback.format_exc())
            return JSONResponse(
                status_code=500,
                content={
                    "status": "error",
                    "detail": "Internal Server Error",
                    "path": request.url.path,
                    "error_message": str(exc)
                }
            )
