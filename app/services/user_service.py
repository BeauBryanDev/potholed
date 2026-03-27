from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import get_password_hash


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    Retrieve a user by their ID.

    Args:
        db (AsyncSession): Database session
        user_id (int): User ID to search for

    Returns:
        Optional[User]: The user object if found, None otherwise
    """
    result = db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    Retrieve a user by their username (case-insensitive).

    Args:
        db (AsyncSession): Database session
        username (str): Username to search for

    Returns:
        Optional[User]: The user object if found, None otherwise
    """
    result = db.execute(
        select(User).where(User.username.ilike(username))
    )
    return result.scalars().first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Retrieve a user by their email (case-insensitive).

    Args:
        db (AsyncSession): Database session
        email (str): Email address to search for

    Returns:
        Optional[User]: The user object if found, None otherwise
    """
    result = db.execute(
        select(User).where(User.email.ilike(email))
    )
    return result.scalars().first()


def create_user(
    db: Session,
    username: str,
    email: str,
    hashed_password: str,
    name: Optional[str] = None,
    gender: Optional[str] = None,
    phone_number: Optional[str] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    address: Optional[str] = None,
    is_active: bool = True,
    is_admin: bool = False,
) -> User:
    """
    Create a new user in the database.

    Note: The password MUST be hashed before calling this function.
      Use get_password_hash() in the calling router.

    Args:
        db (AsyncSession): Database session
        username (str): Unique username
        email (str): Unique email address
        hashed_password (str): Already hashed password
        name (Optional[str]): Full name
        gender (Optional[str]): Gender
        phone_number (Optional[str]): Phone number
        city (Optional[str]): City
        country (Optional[str]): Country
        address (Optional[str]): Address
        is_active (bool): Whether the user is active (default: True)
        is_admin (bool): Whether the user has admin privileges (default: False)

    Returns:
        User: The newly created user object
    """
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        name=name,
        gender=gender,
        phone_number=phone_number,
        city=city,
        country=country,
        address=address,
        is_active=is_active,
        is_admin=is_admin,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(
    db: Session,
    user_id: int,
    update_data: Dict[str, Any],
) -> Optional[User]:
    """
    Update an existing user by ID.

    Args:
        db (AsyncSession): Database session
        user_id (int): ID of the user to update
        update_data (Dict[str, Any]): Dictionary with fields to update
                                     (e.g. {"name": "New Name", "is_active": False})

    Returns:
        Optional[User]: Updated user if found and updated, None otherwise
    """
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    # Special handling for password updates
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    # Update only the provided fields
    for key, value in update_data.items():
        if hasattr(user, key):
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """
    Delete a user by ID.

    Args:
        db (AsyncSession): Database session
        user_id (int): ID of the user to delete

    Returns:
        bool: True if the user was deleted, False if not found
    """
    user = get_user_by_id(db, user_id)
    if not user:
        return False

    db.delete(user)
    db.commit()
    
    return True


def get_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """
    Retrieve a list of users.

    Args:
        db (Session): Database session
        skip (int): Number of records to skip
        limit (int): Maximum number of records to return

    Returns:
        list[User]: List of user objects
    """
    result = db.execute(select(User).offset(skip).limit(limit))
    return list(result.scalars().all())

