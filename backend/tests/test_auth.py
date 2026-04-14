import pytest
from httpx import AsyncClient
from app.models.user import User

@pytest.mark.asyncio
async def test_user_signup(client: AsyncClient, db_session):
    # signup returns user record
    response = await client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "TestPass123",
        "first_name": "Test",
        "last_name": "User"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["is_verified"] is False
    # mark as verified for later use
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    user.is_verified = True
    db_session.commit()

@pytest.mark.asyncio
async def test_user_login(client: AsyncClient, db_session):
    # create and verify user
    await client.post("/api/auth/signup", json={
        "email": "login@example.com",
        "password": "TestPass123",
        "first_name": "Login",
        "last_name": "Test"
    })
    user = db_session.query(User).filter(User.email == "login@example.com").first()
    user.is_verified = True
    db_session.commit()

    response = await client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "TestPass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"