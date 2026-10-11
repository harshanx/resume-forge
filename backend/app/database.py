from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase credentials not found. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env variables.")

# Initialize Supabase client
supabase: Client = create_client(supabase_url, supabase_key)

def get_db():
    """Dependency to get Supabase client."""
    return supabase

def init_db():
    """Initialize Supabase database."""
    print("Supabase initialized successfully!")
    # Tables will be created via SQL migrations
