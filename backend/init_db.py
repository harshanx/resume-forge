"""
Database initialization script for Firebase Firestore.
Run this script to initialize required Firestore collections.
"""
from app.database import init_db, db

if __name__ == "__main__":
    print("Initializing Firebase Firestore...")
    
    # Initialize collections
    init_db()
    
    # Create indexes (optional but recommended for better performance)
    print("Creating test data structures...")
    
    # Verify collections exist by checking if we can write and read
    try:
        # Create a test document in users collection
        test_doc = {
            "email": "test@example.com",
            "name": "Test User",
            "hashed_password": "test_hash",
            "created_at": db.server_timestamp()
        }
        db.collection("users").document("test@example.com").set(test_doc, merge=True)
        print("✓ Users collection initialized")
        
        # Create a test document in resume_versions collection
        test_resume = {
            "user_id": "test@example.com",
            "version_name": "Test Resume",
            "resume_data": {"personal": {}},
            "template": "ats-one-page",
            "created_at": db.server_timestamp()
        }
        db.collection("resume_versions").add(test_resume)
        print("✓ Resume versions collection initialized")
        
        # Clean up test documents
        db.collection("users").document("test@example.com").delete()
        print("\nFirebase Firestore initialization complete!")
        
    except Exception as e:
        print(f"Error during initialization: {e}")
        print("Please ensure your Firebase credentials are properly configured.")

