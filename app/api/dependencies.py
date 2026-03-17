from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.services.user_service import get_user_by_id

# Esquema OAuth2 estándar (Bearer token)
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login",  # endpoint donde se obtiene el token
    scheme_name="Bearer",
    description="JWT Bearer token obtenido al hacer login"
)


# Constantes para reutilizar mensajes y códigos de error
class AuthErrors:
    INVALID_TOKEN = "Invalid token"
    INVALID_CREDENTIALS = "Invalid credentials"
    USER_NOT_FOUND = "User not found"
    USER_INACTIVE = "User inactive"
    UNAUTHORIZED = "Unauthorized"


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> User:
    """
        Main dependency: get the current user from the JWT in the Authorization header.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=AuthErrors.INVALID_CREDENTIALS,
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)  # asumimos que sub es el ID numérico
    except (JWTError, ValueError):
        raise credentials_exception

    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthErrors.USER_NOT_FOUND,
        )

    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Dependencia secundaria: asegura que el usuario esté activo.
    
    Úsala en endpoints que requieran usuario logueado y activo.
    Ejemplo: current_user: User = Depends(get_current_active_user)
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthErrors.USER_INACTIVE,
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user



def get_current_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Dependency that ensures the current user is an admin.
    
    Raises:
        HTTPException: 403 Forbidden if the user is not admin.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


def require_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Explicit dependency to ensure the current user is active.
    Useful to prevent soft-deleted users from continuing to use existing tokens.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AuthErrors.USER_INACTIVE,
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
