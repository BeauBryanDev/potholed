from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional , Dict , List


from app.api.dependencies import get_current_active_user, get_current_admin_user, get_db
from app.models.user import User
from app.schemas.user import  UserCreate, UserResponse, UserUpdate, UserPatch, UserAdminResponse
from app.services.user_service import (
    get_user_by_id,
    get_user_by_email,
    get_user_by_username,
    create_user,
    update_user,
    delete_user,
    get_users,
)



router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[UserAdminResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    username: Optional[str] = None,
    email: Optional[str] = None,
    current_admin: User = Depends(get_current_admin_user),
    db = Depends(get_db),
):
    """
    List all users with optional filtering by username or email.
    Only accessible by administrators.
    """
    if username:
        user = get_user_by_username(db, username)
        return [user] if user else []
    if email:
        user = get_user_by_email(db, email)
        return [user] if user else []
        
    return get_users(db, skip=skip, limit=limit)



@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Get current authenticated user's information.

    This is a protected endpoint that returns the profile
    of the currently logged-in user.

    Requires a valid JWT token in the Authorization header.
    """
    return current_user


@router.get("/{user_id}", response_model=UserAdminResponse)
def get_user_by_id_admin(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db = Depends(get_db),
) -> User:
    """
    Get detailed information about a specific user.
    
    Only accessible by administrators.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_db),
) -> User:
    """
    Update the current user's profile (full replacement).
    
    All fields are optional; only provided fields are updated.
    """
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Prevent updating username/email to existing ones (basic check)
    if "username" in update_data:
        existing = get_user_by_username(db, update_data["username"])
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    if "email" in update_data:
        existing = get_user_by_email(db, update_data["email"])
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
    
    updated_user = update_user(db, current_user.id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.patch("/me", response_model=UserResponse)
def patch_current_user_profile(
    user_patch: UserPatch,
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_db),
) -> User:
    """
    Partially update the current user's profile (PATCH).
    
    Only provided fields are updated.
    """
    update_data = user_patch.model_dump(exclude_unset=True)
    
    # Same uniqueness checks as PUT
    if "username" in update_data:
        existing = get_user_by_username(db, update_data["username"])
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    if "email" in update_data:
        existing = get_user_by_email(db, update_data["email"])
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
    
    updated_user = update_user(db, current_user.id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.delete("/me")
def deactivate_current_user(
    current_user: User = Depends(get_current_active_user),
    db = Depends(get_db),
) -> Dict[str, str]:
    """
    Deactivate (soft delete) the current user's account.
    
    Sets is_active = False. User can no longer log in.
    """
    update_data = {"is_active": False}
    updated_user = update_user(db, current_user.id, update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Account deactivated successfully. You can contact support to reactivate."}


@router.get("/username/{username}", response_model=UserAdminResponse)
def get_user_by_username_admin(
    username: str,
    current_admin: User = Depends(get_current_admin_user),
    db = Depends(get_db),
) -> User:
    """
    Get detailed information about a specific user by username.
    
    Only accessible by administrators.
    """
    user = get_user_by_username(db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with username '{username}' not found"
        )
    return user

@router.delete("/{user_id}")
def delete_user_admin(
    user_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db = Depends(get_db),
) -> Dict[str, str]:
    """
    Permanently delete a user account (hard delete).
    
    Only accessible by administrators.
    """
    # Prevent self-deletion via this endpoint
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot delete themselves via this endpoint. Use /users/me instead."
        )

    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins can only delete non-admin users"
        )

    success = delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": f"User {user_id} permanently deleted"}


@router.get("/email/{email}", response_model=UserAdminResponse)
def get_user_by_email_admin(
    email: str,
    current_admin: User = Depends(get_current_admin_user),
    db = Depends(get_db),
) -> User:
    """
    Get detailed information about a specific user by email.
    
    Only accessible by administrators.
    """
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{email}' not found"
        )
    return user


@router.post("/", response_model=UserResponse)
def create_user_admin(
    user_in: UserCreate,
    current_admin: User = Depends(get_current_admin_user),
    db = Depends(get_db),
)   -> User:
    """
    Create a new user.
    
    Only accessible by administrators.
    """
    user = create_user(
        db=db,
        username=user_in.username,
        email=user_in.email,
        hashed_password=user_in.password,
        name=user_in.name,
        gender=user_in.gender,
        phone_number=user_in.phone_number,
        city=user_in.city,
        country=user_in.country,
        address=user_in.address,
    )
    
    return user


@router.put("/{user_id}", response_model=UserAdminResponse)
def update_user_admin(
    user_id: int,
    user_update: UserUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db = Depends(get_db),
) -> User:
    """
    Update a user's profile.
    
    Only accessible by administrators.
    """
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Prevent updating username/email to existing ones (basic check)
    if "username" in update_data:
        existing = get_user_by_username(db, update_data["username"])
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    if "email" in update_data:
        existing = get_user_by_email(db, update_data["email"])
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
    
    updated_user = update_user(db, user.id, update_data)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user
