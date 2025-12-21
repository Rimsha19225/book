#!/usr/bin/env python3
"""Test script to debug Qdrant client functionality."""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.database.vector_connection import get_qdrant_client, get_collection_name

def test_qdrant():
    """Test Qdrant client functionality."""
    try:
        client = get_qdrant_client()
        print(f"Qdrant client type: {type(client)}")

        # Check available methods
        methods = [method for method in dir(client) if not method.startswith('_')]
        print(f"Available methods: {methods}")

        # Check if search method exists
        if hasattr(client, 'search'):
            print("✓ 'search' method exists")
        else:
            print("✗ 'search' method does NOT exist")

        # Check if search_points method exists (alternative)
        if hasattr(client, 'search_points'):
            print("✓ 'search_points' method exists (alternative)")
        else:
            print("✗ 'search_points' method does NOT exist")

        # Get collection name
        collection_name = get_collection_name()
        print(f"Collection name: {collection_name}")

        # Try to get collection info
        try:
            collection_info = client.get_collection(collection_name)
            print(f"✓ Collection '{collection_name}' exists")
            print(f"Collection info: {collection_info}")
        except Exception as e:
            print(f"✗ Error getting collection: {e}")

    except Exception as e:
        print(f"Error testing Qdrant: {str(e)}")

if __name__ == "__main__":
    test_qdrant()