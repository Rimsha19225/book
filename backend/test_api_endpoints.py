"""Simple test to verify the API endpoints are working."""
import requests
import time

def test_api_endpoints():
    """Test the main API endpoints."""
    base_url = "http://localhost:8000"

    print("Testing API endpoints...")

    # Test health check
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")

    # Test modules endpoint
    try:
        response = requests.get(f"{base_url}/api/content/modules")
        print(f"Modules endpoint: {response.status_code}")
        if response.status_code == 200:
            modules = response.json()
            print(f"  Number of modules: {len(modules.get('modules', []))}")
    except Exception as e:
        print(f"Modules endpoint failed: {e}")

    # Test loading content endpoint (if available)
    try:
        response = requests.post(f"{base_url}/api/content/load-content")
        print(f"Load content endpoint: {response.status_code}")
        if response.status_code == 200:
            print("  Content loading initiated successfully")
        else:
            print(f"  Content loading response: {response.json()}")
    except Exception as e:
        print(f"Load content endpoint failed: {e}")

    print("\nAPI endpoint tests completed.")

if __name__ == "__main__":
    test_api_endpoints()