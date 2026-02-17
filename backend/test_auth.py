#!/usr/bin/env python3
"""
Quick test script for authentication endpoints
Run this after starting the backend server to verify auth is working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_signup():
    """Test user signup"""
    print("\n=== Testing Signup ===")
    data = {
        "email": "testuser@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/signup", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 201

def test_login():
    """Test user login"""
    print("\n=== Testing Login ===")
    data = {
        "email": "testuser@example.com",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        token = response.json().get("access_token")
        print(f"\n✓ JWT Token received: {token[:50]}...")
        return True
    return False

def test_duplicate_signup():
    """Test duplicate email signup (should fail)"""
    print("\n=== Testing Duplicate Signup (should fail) ===")
    data = {
        "email": "testuser@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/signup", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 400

def test_invalid_login():
    """Test login with wrong password (should fail)"""
    print("\n=== Testing Invalid Login (should fail) ===")
    data = {
        "email": "testuser@example.com",
        "password": "wrongpassword"
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 401

if __name__ == "__main__":
    print("=" * 60)
    print("Authentication System Test")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print("Make sure the backend server is running!")
    print("=" * 60)
    
    try:
        # Test health endpoint first
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("❌ Backend server is not responding!")
            exit(1)
        print("✓ Backend server is running")
        
        # Run tests
        results = []
        results.append(("Signup", test_signup()))
        results.append(("Login", test_login()))
        results.append(("Duplicate Signup Prevention", test_duplicate_signup()))
        results.append(("Invalid Login Prevention", test_invalid_login()))
        
        # Summary
        print("\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)
        for test_name, passed in results:
            status = "✓ PASS" if passed else "❌ FAIL"
            print(f"{status} - {test_name}")
        
        all_passed = all(result[1] for result in results)
        if all_passed:
            print("\n🎉 All tests passed!")
        else:
            print("\n⚠️  Some tests failed. Check the output above.")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server!")
        print("Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")
