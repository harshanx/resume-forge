from supabase import Client
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

from supabase import create_client
supabase: Client = create_client(supabase_url, supabase_key)


class SupabaseStorage:
    """Supabase Storage client for PDF uploads."""
    
    BUCKET_NAME = "resumes"
    
    def upload_pdf(self, pdf_bytes: bytes, filename: str, user_id: str) -> str:
        """
        Upload PDF to Supabase Storage.
        
        Args:
            pdf_bytes: PDF file bytes
            filename: Name of the file
            user_id: User ID for folder organization
            
        Returns:
            Public URL of the uploaded file
        """
        path = f"{user_id}/{filename}"
        
        try:
            # Upload file
            result = supabase.storage.from_(self.BUCKET_NAME).upload(
                path=path,
                file=pdf_bytes,
                file_options={"content-type": "application/pdf"}
            )
            
            # Get public URL
            public_url = supabase.storage.from_(self.BUCKET_NAME).get_public_url(path)
            return public_url
            
        except Exception as e:
            raise Exception(f"Failed to upload PDF to Supabase: {str(e)}")
    
    def delete_pdf(self, path: str) -> bool:
        """
        Delete PDF from Supabase Storage.
        
        Args:
            path: Path to the file in storage
            
        Returns:
            True if successful
        """
        try:
            supabase.storage.from_(self.BUCKET_NAME).remove([path])
            return True
        except Exception as e:
            print(f"Failed to delete PDF from Supabase: {str(e)}")
            return False
    
    def get_pdf_url(self, path: str) -> str:
        """
        Get public URL for a PDF.
        
        Args:
            path: Path to the file in storage
            
        Returns:
            Public URL
        """
        return supabase.storage.from_(self.BUCKET_NAME).get_public_url(path)


# Singleton instance
storage = SupabaseStorage()
