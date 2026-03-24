
import os
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.town import Town
from app.models.street import Street
from app.models.image import Image
from app.models.detection import Detection

"""
Pytest configuration and fixtures for the Pothole Guard API tests.

This module provides reusable fixtures for:
- Database setup and teardown
- Test client configuration
- Authentication fixtures
- Sample data creation
"""

# DATABASE FIXTURES


@pytest.fixture(scope="session")
def test_db_url() -> str:
    """
    Provides the test database URL.
    Uses SQLite in-memory database for testing.
    """
    return "sqlite:///:memory:"


@pytest.fixture(scope="session")
def engine(test_db_url: str):
    """
    Creates a SQLAlchemy engine for tests using SQLite in-memory database.
    Uses StaticPool to maintain connection across the session.
    """
    engine = create_engine(
        test_db_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,  # Set to True for debugging SQL queries
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # Cleanup after all tests
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="session")
def SessionLocal(engine):
    """
    Creates a session factory for the test database.
    """
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db_session(SessionLocal) -> Generator[Session, None, None]:
    """
    Provides a fresh database session for each test.
    Rolls back after each test to ensure isolation.
    """
    session = SessionLocal()
    
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def override_get_db(db_session: Session):
    """
    Override dependency for FastAPI's get_db.
    Allows FastAPI to use the test database session.
    """
    def _override_get_db():
        yield db_session
    
    return _override_get_db


@pytest.fixture
def client(override_get_db) -> TestClient:
    """
    Provides a FastAPI TestClient with overridden database dependency.
    Ready for making HTTP requests to the app.
    """
    app.dependency_overrides[get_db] = override_get_db
    
    test_client = TestClient(app)
    
    yield test_client
    
    # Cleanup
    app.dependency_overrides.clear()


# USER FIXTURES

@pytest.fixture
def test_user_data() -> dict:
    """
    Provides sample user data for testing.
    """
    return {
        "name": "Test User",
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "securepassword123",
        "phone_number": "+1234567890",
        "city": "Test City",
        "country": "Test Country",
        "address": "123 Test Street",
        "gender": "Male",
    }


@pytest.fixture
def test_admin_data() -> dict:
    """
    Provides sample admin user data for testing.
    """
    return {
        "name": "Admin User",
        "username": "adminuser",
        "email": "admin@example.com",
        "password": "adminpassword123",
        "phone_number": "+9876543210",
        "city": "Admin City",
        "country": "Admin Country",
        "address": "999 Admin Street",
        "gender": "Female",
    }


@pytest.fixture
def test_user(db_session: Session, test_user_data: dict) -> User:
    """
    Creates a test user in the database.
    """
    user = User(
        name=test_user_data["name"],
        username=test_user_data["username"],
        email=test_user_data["email"],
        hashed_password=get_password_hash(test_user_data["password"]),
        phone_number=test_user_data["phone_number"],
        city=test_user_data["city"],
        country=test_user_data["country"],
        address=test_user_data["address"],
        gender=test_user_data["gender"],
        is_active=True,
        is_admin=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    return user


@pytest.fixture
def test_admin(db_session: Session, test_admin_data: dict) -> User:
    """
    Creates a test admin user in the database.
    """
    admin = User(
        name=test_admin_data["name"],
        username=test_admin_data["username"],
        email=test_admin_data["email"],
        hashed_password=get_password_hash(test_admin_data["password"]),
        phone_number=test_admin_data["phone_number"],
        city=test_admin_data["city"],
        country=test_admin_data["country"],
        address=test_admin_data["address"],
        gender=test_admin_data["gender"],
        is_active=True,
        is_admin=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    
    return admin


@pytest.fixture
def inactive_user(db_session: Session) -> User:
    """
    Creates an inactive test user in the database.
    """
    user = User(
        name="Inactive User",
        username="inactiveuser",
        email="inactive@example.com",
        hashed_password=get_password_hash("password123"),
        is_active=False,
        is_admin=False,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    return user



# AUTHENTICATION FIXTURES

@pytest.fixture
def auth_headers(client: TestClient, test_user_data: dict) -> dict:
    """
    Authenticates a test user and returns authorization headers.
    """
    # Create user via API or directly in DB
    login_response = client.post(
        "/auth/login",
        data={
            "username": test_user_data["username"],
            "password": test_user_data["password"],
        },
    )
    
    if login_response.status_code != 200:
        raise Exception(f"Login failed: {login_response.json()}")
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(client: TestClient, test_admin_data: dict) -> dict:
    """
    Authenticates a test admin user and returns authorization headers.
    """
    login_response = client.post(
        "/auth/login",
        data={
            "username": test_admin_data["username"],
            "password": test_admin_data["password"],
        },
    )
    
    if login_response.status_code != 200:
        raise Exception(f"Admin login failed: {login_response.json()}")
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}



# TOWN/STREET FIXTURES

@pytest.fixture
def test_town(db_session: Session) -> Town:
    """
    Creates a test town in the database.
    """
    town = Town(
        name="Test Town",
        description="A test town for unit testing",
        latitude=40.7128,
        longitude=-74.0060,
    )
    db_session.add(town)
    db_session.commit()
    db_session.refresh(town)
    
    return town


@pytest.fixture
def test_street(db_session: Session, test_town: Town) -> Street:
    """
    Creates a test street in the database.
    """
    street = Street(
        name="Test Street",
        segment="Segment A",
        town_id=test_town.id,
        latitude_start=40.7128,
        longitude_start=-74.0060,
        latitude_end=40.7138,
        longitude_end=-74.0070,
    )
    db_session.add(street)
    db_session.commit()
    db_session.refresh(street)
    
    return street



# IMAGE FIXTURES

@pytest.fixture
def test_image(db_session: Session, test_user: User, test_street: Street) -> Image:
    """
    Creates a test image in the database.
    """
    image = Image(
        filename="test_image.jpg",
        filepath="/storage/outputs/test_image.jpg",
        file_size=1024,
        width=1920,
        height=1080,
        user_id=test_user.id,
        street_id=test_street.id,
    )
    db_session.add(image)
    db_session.commit()
    db_session.refresh(image)
    
    return image



# DETECTION FIXTURES

@pytest.fixture
def test_detection(db_session: Session, test_image: Image) -> Detection:
    """
    Creates a test detection in the database.
    """
    detection = Detection(
        image_id=test_image.id,
        class_name="pothole",
        confidence=0.95,
        x_min=100,
        y_min=100,
        x_max=200,
        y_max=200,
        area=10000,
    )
    db_session.add(detection)
    db_session.commit()
    db_session.refresh(detection)
    
    return detection



# UTILITY FIXTURES

@pytest.fixture
def reset_db(db_session: Session):
    """
    Fixture to reset database between tests if needed.
    Clears all tables.
    """
    def _reset():
        # Delete all data in reverse order of dependencies
        db_session.query(Detection).delete()
        db_session.query(Image).delete()
        db_session.query(Street).delete()
        db_session.query(Town).delete()
        db_session.query(User).delete()
        db_session.commit()
    
    yield
    _reset()



# CONFIGURATION & HOOKS

def pytest_configure(config):
    """
    Pytest hook to configure test session.
    """
    # Add markers for test organization
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "auth: mark test as an authentication test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )


@pytest.fixture(scope="session", autouse=True)
def setup_test_env():
    """
    Setup test environment variables if needed.
    Runs once per test session.
    """
    # You can set environment variables for testing here if needed
    os.environ.setdefault("DEBUG", "True")
    yield
    # Cleanup after all tests
