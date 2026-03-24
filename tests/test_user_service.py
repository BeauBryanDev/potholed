"""
Pytest tests for user endpoints (/users router).

Tests cover:
- GET /users/me - Get current user profile
- GET /users/{user_id} - Get user by ID (admin only)
- GET /users/{username} - Get user by username (admin only)
- GET /users/{email} - Get user by email (admin only)
- POST /users/ - Create new user (admin only)
- PUT /users/me - Update current user profile
- PATCH /users/me - Partially update current user profile
- DELETE /users/me - Deactivate current user account
- PUT /users/{user_id} - Update user as admin
- DELETE /users/{user_id} - Delete user (admin only)
"""

import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserPatch


# ============================================================================
# GET /users/me - Get current user profile
# ============================================================================

@pytest.mark.auth
def test_get_current_user_success(client: TestClient, test_user: User, auth_headers: dict):
    """
    Test successfully retrieving the current authenticated user's profile.
    """
    response = client.get("/users/me", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_user.id
    assert data["username"] == test_user.username
    assert data["email"] == test_user.email
    assert data["is_active"] is True


@pytest.mark.auth
def test_get_current_user_no_token(client: TestClient):
    """
    Test retrieving current user without authentication token.
    Should return 403 Forbidden.
    """
    response = client.get("/users/me")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.auth
def test_get_current_user_invalid_token(client: TestClient):
    """
    Test retrieving current user with invalid token.
    Should return 401 Unauthorized.
    """
    headers = {"Authorization": "Bearer invalid_token_here"}
    response = client.get("/users/me", headers=headers)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.auth
def test_get_current_inactive_user(client: TestClient, db_session: Session, inactive_user: User):
    """
    Test retrieving profile with an inactive user's token.
    Should return 401 Unauthorized because get_current_active_user checks is_active.
    """
    # Create token for inactive user (manually, since they can't login)
    from app.core.security import create_access_token
    token = create_access_token(data={"sub": str(inactive_user.id)})
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/users/me", headers=headers)
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ============================================================================
# PUT /users/me - Update current user profile
# ============================================================================

@pytest.mark.auth
def test_update_current_user_success(client: TestClient, test_user: User, auth_headers: dict):
    """
    Test successfully updating the current user's full profile.
    """
    update_data = {
        "name": "Updated Name",
        "city": "New City",
        "phone_number": "+9999999999",
    }
    
    response = client.put("/users/me", json=update_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["city"] == "New City"
    assert data["phone_number"] == "+9999999999"


@pytest.mark.auth
def test_update_current_user_username_taken(
    client: TestClient,
    test_user: User,
    auth_headers: dict,
    db_session: Session,
):
    """
    Test updating current user with a username that's already taken.
    Should return 400 Bad Request.
    """
    # Create another user
    from app.core.security import get_password_hash
    other_user = User(
        username="otheruser",
        email="other@example.com",
        hashed_password=get_password_hash("password123"),
        name="Other User",
    )
    db_session.add(other_user)
    db_session.commit()
    
    # Try to update current user with other user's username
    update_data = {"username": "otheruser"}
    response = client.put("/users/me", json=update_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already taken" in response.json()["detail"]


@pytest.mark.auth
def test_update_current_user_email_taken(
    client: TestClient,
    test_user: User,
    auth_headers: dict,
    db_session: Session,
):
    """
    Test updating current user with an email that's already taken.
    Should return 400 Bad Request.
    """
    from app.core.security import get_password_hash
    other_user = User(
        username="anotheruser",
        email="another@example.com",
        hashed_password=get_password_hash("password123"),
        name="Another User",
    )
    db_session.add(other_user)
    db_session.commit()
    
    update_data = {"email": "another@example.com"}
    response = client.put("/users/me", json=update_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already taken" in response.json()["detail"]


@pytest.mark.auth
def test_update_current_user_no_auth(client: TestClient):
    """
    Test updating current user without authentication.
    Should return 403 Forbidden.
    """
    update_data = {"name": "Hacker"}
    response = client.put("/users/me", json=update_data)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ============================================================================
# PATCH /users/me - Partially update current user profile
# ============================================================================

@pytest.mark.auth
def test_patch_current_user_success(client: TestClient, test_user: User, auth_headers: dict):
    """
    Test successfully patching (partially updating) the current user's profile.
    """
    patch_data = {
        "city": "Patched City",
    }
    
    response = client.patch("/users/me", json=patch_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["city"] == "Patched City"
    # Other fields should remain unchanged
    assert data["username"] == test_user.username


@pytest.mark.auth
def test_patch_current_user_multiple_fields(client: TestClient, test_user: User, auth_headers: dict):
    """
    Test patching multiple fields at once.
    """
    patch_data = {
        "name": "Patched Name",
        "country": "Patched Country",
        "address": "Patched Address",
    }
    
    response = client.patch("/users/me", json=patch_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Patched Name"
    assert data["country"] == "Patched Country"
    assert data["address"] == "Patched Address"


@pytest.mark.auth
def test_patch_current_user_no_auth(client: TestClient):
    """
    Test patching current user without authentication.
    Should return 403 Forbidden.
    """
    patch_data = {"name": "Hacker"}
    response = client.patch("/users/me", json=patch_data)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ============================================================================
# DELETE /users/me - Deactivate current user account
# ============================================================================

@pytest.mark.auth
def test_deactivate_current_user_success(client: TestClient, test_user: User, auth_headers: dict, db_session: Session):
    """
    Test successfully deactivating the current user's account.
    """
    response = client.delete("/users/me", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "successfully" in data["message"].lower()
    
    # Verify user is now inactive in database
    db_session.refresh(test_user)
    assert test_user.is_active is False


@pytest.mark.auth
def test_deactivate_current_user_no_auth(client: TestClient):
    """
    Test deactivating current user without authentication.
    Should return 403 Forbidden.
    """
    response = client.delete("/users/me")
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ============================================================================
# GET /users/{user_id} - Get user by ID (admin only)
# ============================================================================

@pytest.mark.auth
def test_get_user_by_id_admin_success(
    client: TestClient,
    test_user: User,
    test_admin: User,
    admin_auth_headers: dict,
):
    """
    Test admin successfully retrieving a user by ID.
    """
    response = client.get(
        f"/users/{test_user.id}",
        headers=admin_auth_headers,
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_user.id
    assert data["username"] == test_user.username


@pytest.mark.auth
def test_get_user_by_id_not_found(client: TestClient, test_admin: User, admin_auth_headers: dict):
    """
    Test getting a non-existent user by ID.
    Should return 404 Not Found.
    """
    response = client.get("/users/9999", headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.auth
def test_get_user_by_id_non_admin(client: TestClient, test_user: User, auth_headers: dict):
    """
    Test non-admin user trying to get another user by ID.
    Should return 403 Forbidden.
    """
    response = client.get(
        f"/users/{test_user.id}",
        headers=auth_headers,
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ============================================================================
# POST /users/ - Create new user (admin only)
# ============================================================================

@pytest.mark.auth
def test_create_user_admin_success(client: TestClient, test_admin: User, admin_auth_headers: dict):
    """
    Test admin successfully creating a new user.
    """
    new_user_data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "securepassword123",
        "name": "New User",
        "city": "New City",
    }
    
    response = client.post("/users/", json=new_user_data, headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_201_CREATED or response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert data["name"] == "New User"


@pytest.mark.auth
def test_create_user_duplicate_username(
    client: TestClient,
    test_user: User,
    test_admin: User,
    admin_auth_headers: dict,
):
    """
    Test creating a user with a duplicate username.
    Should return 400 Bad Request.
    """
    duplicate_user_data = {
        "username": test_user.username,
        "email": "different@example.com",
        "password": "securepassword123",
        "name": "Different Name",
    }
    
    response = client.post("/users/", json=duplicate_user_data, headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.auth
def test_create_user_duplicate_email(
    client: TestClient,
    test_user: User,
    test_admin: User,
    admin_auth_headers: dict,
):
    """
    Test creating a user with a duplicate email.
    Should return 400 Bad Request.
    """
    duplicate_user_data = {
        "username": "uniqueuser",
        "email": test_user.email,
        "password": "securepassword123",
        "name": "Unique Name",
    }
    
    response = client.post("/users/", json=duplicate_user_data, headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.auth
def test_create_user_non_admin(client: TestClient, test_user: User, auth_headers: dict):
    """
    Test non-admin user trying to create a new user.
    Should return 403 Forbidden.
    """
    new_user_data = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "securepassword123",
    }
    
    response = client.post("/users/", json=new_user_data, headers=auth_headers)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ============================================================================
# PUT /users/{user_id} - Update user (admin only)
# ============================================================================

@pytest.mark.auth
def test_update_user_admin_success(
    client: TestClient,
    test_user: User,
    test_admin: User,
    admin_auth_headers: dict,
):
    """
    Test admin successfully updating another user's profile.
    """
    update_data = {
        "name": "Admin Updated Name",
        "city": "Admin Updated City",
    }
    
    response = client.put(
        f"/users/{test_user.id}",
        json=update_data,
        headers=admin_auth_headers,
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Admin Updated Name"
    assert data["city"] == "Admin Updated City"


@pytest.mark.auth
def test_update_user_admin_not_found(client: TestClient, test_admin: User, admin_auth_headers: dict):
    """
    Test admin updating a non-existent user.
    Should return 404 Not Found.
    """
    update_data = {"name": "Nobody"}
    response = client.put("/users/9999", json=update_data, headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.auth
def test_update_user_admin_non_admin(
    client: TestClient,
    test_user: User,
    auth_headers: dict,
):
    """
    Test non-admin user trying to update another user.
    Should return 403 Forbidden.
    """
    update_data = {"name": "Hacker Name"}
    response = client.put(
        f"/users/{test_user.id}",
        json=update_data,
        headers=auth_headers,
    )
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ============================================================================
# DELETE /users/{user_id} - Delete user (admin only)
# ============================================================================

@pytest.mark.auth
def test_delete_user_admin_success(
    client: TestClient,
    test_user: User,
    test_admin: User,
    admin_auth_headers: dict,
    db_session: Session,
):
    """
    Test admin successfully deleting another user.
    """
    user_id = test_user.id
    response = client.delete(f"/users/{user_id}", headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    assert f"permanently deleted" in response.json()["message"].lower() or "deleted" in response.json()["message"].lower()


@pytest.mark.auth
def test_delete_user_admin_not_found(client: TestClient, test_admin: User, admin_auth_headers: dict):
    """
    Test admin deleting a non-existent user.
    Should return 404 Not Found.
    """
    response = client.delete("/users/9999", headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.auth
def test_delete_user_admin_self_deletion(
    client: TestClient,
    test_admin: User,
    admin_auth_headers: dict,
):
    """
    Test admin trying to delete themselves.
    Should return 400 Bad Request.
    """
    response = client.delete(f"/users/{test_admin.id}", headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "cannot delete themselves" in response.json()["detail"].lower()


@pytest.mark.auth
def test_delete_admin_user_by_admin(
    client: TestClient,
    test_admin: User,
    db_session: Session,
    admin_auth_headers: dict,
):
    """
    Test admin trying to delete another admin user.
    Should return 403 Forbidden (only non-admin users can be deleted).
    """
    # Create another admin
    from app.core.security import get_password_hash
    another_admin = User(
        username="anotheradmin",
        email="anotheradmin@example.com",
        hashed_password=get_password_hash("password123"),
        is_admin=True,
        is_active=True,
    )
    db_session.add(another_admin)
    db_session.commit()
    
    response = client.delete(f"/users/{another_admin.id}", headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.auth
def test_delete_user_non_admin(client: TestClient, test_user: User, auth_headers: dict):
    """
    Test non-admin user trying to delete another user.
    Should return 403 Forbidden.
    """
    response = client.delete(f"/users/{test_user.id}", headers=auth_headers)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN


# ============================================================================
# Response Schema Tests
# ============================================================================

@pytest.mark.auth
def test_user_response_schema(client: TestClient, test_user: User, auth_headers: dict):
    """
    Test that user response matches UserResponse schema (no sensitive fields).
    """
    response = client.get("/users/me", headers=auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Should have these fields
    assert "id" in data
    assert "username" in data
    assert "email" in data
    assert "is_active" in data
    
    # Should NOT have these fields
    assert "hashed_password" not in data
    assert "password" not in data


@pytest.mark.auth
def test_admin_response_schema(
    client: TestClient,
    test_user: User,
    test_admin: User,
    admin_auth_headers: dict,
):
    """
    Test that admin response includes additional admin fields.
    """
    response = client.get(f"/users/{test_user.id}", headers=admin_auth_headers)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    
    # Should have admin-specific fields
    assert "is_admin" in data
    assert "created_at" in data
    assert "updated_at" in data
