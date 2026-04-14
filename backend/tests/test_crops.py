import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_crop_creation(client: AsyncClient, db_session):
    # make sure user exists and is verified
    await client.post("/api/auth/signup", json={
        "email": "crop@example.com",
        "password": "TestPass123",
        "first_name": "Crop",
        "last_name": "Test"
    })
    from app.models.user import User
    user = db_session.query(User).filter(User.email == "crop@example.com").first()
    user.is_verified = True
    db_session.commit()
    # login to get token
    login = await client.post("/api/auth/login", json={
        "email": "crop@example.com",
        "password": "TestPass123"
    })
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post("/api/crops", headers=headers, json={
        "crop_name": "wheat",
        "location": "Test Farm",
        "latitude": 40.0,
        "longitude": -75.0,
        "temperature": 25.0,
        "soil_moisture": "medium"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["crop_name"] == "wheat"
    assert data["location"] == "Test Farm"

@pytest.mark.asyncio
async def test_crop_recommendation(client: AsyncClient):
    response = await client.post("/api/predict/crop", json={
        "temperature": 25.0,
        "humidity": 60.0,
        "ph": 6.5,
        "nitrogen": 50.0,
        "phosphorus": 10.0,
        "potassium": 20.0
    })
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert "confidence" in data