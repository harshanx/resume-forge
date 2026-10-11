from pypdf import PdfReader
from typing import Tuple
import io


class PDFValidator:
    @staticmethod
    def get_page_count(pdf_bytes: bytes) -> int:
        """
        Get the number of pages in a PDF.
        """
        try:
            # Convert bytes to BytesIO for PdfReader
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            return len(reader.pages)
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return 0
    
    @staticmethod
    def validate_one_page(pdf_bytes: bytes) -> Tuple[bool, int]:
        """
        Validate that PDF is exactly one page.
        Returns (is_valid, page_count).
        """
        page_count = PDFValidator.get_page_count(pdf_bytes)
        return page_count == 1, page_count
    
    @staticmethod
    def check_pdf_health(pdf_bytes: bytes) -> dict:
        """
        Perform various health checks on the PDF.
        """
        try:
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            page_count = len(reader.pages)

            health = {
                'is_valid': True,
                'page_count': page_count,
                'is_one_page': page_count == 1,
                'has_text': False,
                'text_length': 0,
            }

            # Check if pages have selectable text
            total_text = ""
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    total_text += text

            health['has_text'] = len(total_text.strip()) > 0
            health['text_length'] = len(total_text.strip())

            return health

        except Exception as e:
            return {
                'is_valid': False,
                'error': str(e)
            }
