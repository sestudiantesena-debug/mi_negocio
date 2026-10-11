from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from src.config import settings


class AppException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: dict | None = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, resource: str, identifier: str | int):
        super().__init__(
            message=f"{resource} not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": resource, "identifier": str(identifier)},
        )


class ConflictError(AppException):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_409_CONFLICT,
            details=details,
        )


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class ForbiddenError(AppException):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class BadRequestError(AppException):
    def __init__(self, message: str, details: dict | None = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details,
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.message,
                "details": exc.details,
                "path": str(request.url),
            }
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "message": "Validation error",
                "details": exc.errors(),
                "path": str(request.url),
            }
        },
    )


async def pydantic_validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "message": "Validation error",
                "details": exc.errors(),
                "path": str(request.url),
            }
        },
    )


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": {
                "message": "Resource already exists",
                "details": {"constraint": str(exc.orig)},
                "path": str(request.url),
            }
        },
    )


async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "Database error" if settings.is_production else str(exc),
                "details": {} if settings.is_production else {"error": str(exc)},
                "path": str(request.url),
            }
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "Internal server error" if settings.is_production else str(exc),
                "details": {} if settings.is_production else {"error": str(exc), "type": type(exc).__name__},
                "path": str(request.url),
            }
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(ValidationError, pydantic_validation_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
    app.add_exception_handler(Exception, generic_exception_handler)