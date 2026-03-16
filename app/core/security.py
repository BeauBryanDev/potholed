from datetime import datetime, timedelta, timezone
from typing import Any, Union

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


# Configuración de hashing de contraseñas
# Usamos solo bcrypt explícitamente + deprecated=auto para manejar migraciones futuras de algoritmos
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Constantes de JWT (pueden venir de config si quieres centralizar más)
ALGORITHM = "HS256"
# ACCESS_TOKEN_EXPIRE_MINUTES ya está en settings, pero lo dejamos accesible aquí también
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si la contraseña en texto plano coincide con el hash almacenado.

    Args:
        plain_password (str): Contraseña ingresada por el usuario (sin encriptar)
        hashed_password (str): Hash bcrypt guardado en la base de datos

    Returns:
        bool: True si coincide, False en caso contrario
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Genera un hash bcrypt seguro a partir de una contraseña en texto plano.

    Args:
        password (str): Contraseña en texto plano

    Returns:
        str: Hash bcrypt listo para guardar en la base de datos
    """
    return pwd_context.hash(password)


def create_access_token(
    subject: Union[str, Any],
    expires_delta: timedelta | None = None
) -> str:
    """
    Crea un token JWT de acceso con el subject (normalmente el ID del usuario).

    Args:
        subject (Union[str, Any]): Identificador del usuario (str(ID) recomendado)
        expires_delta (timedelta | None): Tiempo de expiración personalizado.
                                          Si es None, usa el valor por defecto de settings.

    Returns:
        str: Token JWT firmado y codificado
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "exp": expire,
        "sub": str(subject),          # subject como string (importante para consistencia)
    }

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# Función auxiliar para decodificar y validar token (muy útil para dependencias)
def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decodifica y valida un token JWT.
    Lanza JWTError si el token es inválido, expirado o mal formado.

    Args:
        token (str): El token JWT recibido (normalmente del header Authorization)

    Returns:
        dict[str, Any]: Payload decodificado (contiene 'sub', 'exp', etc.)

    Raises:
        JWTError: Si el token no es válido
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise JWTError(f"Token inválido o expirado: {str(e)}") from e