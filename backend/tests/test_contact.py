import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_contact_form_submission(client: AsyncClient):
    response = await client.post("/api/contact", json={
        "name": "Test User",
        "email": "test@example.com",
        "message": "This is a test message"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert "message" in data