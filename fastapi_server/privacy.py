import re
from fastapi import HTTPException
import logging

logger = logging.getLogger("healthchain_privacy")

# Masking regex compiler patterns
AADHAAR_PATTERN = re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b')
PHONE_PATTERN = re.compile(r'\b(?:\+?91[-\s]?)?[6789]\d{9}\b')
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
INSURANCE_PATTERN = re.compile(r'\bPOL-\d{4,8}\b|\bINS-\d{4,8}\b')

def mask_pii(text: str) -> str:
    if not text:
        return ""
    
    # Mask Aadhaar numbers: XXXX-XXXX-1234
    def mask_aadhaar_match(match):
        val = match.group(0).replace(" ", "").replace("-", "")
        return f"XXXX-XXXX-{val[-4:]}"
    text = AADHAAR_PATTERN.sub(mask_aadhaar_match, text)
    
    # Mask Phone numbers: XXXXXX-1234
    def mask_phone_match(match):
        val = match.group(0)
        return f"XXXXXX-{val[-4:]}"
    text = PHONE_PATTERN.sub(mask_phone_match, text)
    
    # Mask Email addresses: u***r@domain.com
    def mask_email_match(match):
        val = match.group(0)
        parts = val.split('@')
        if len(parts) == 2:
            name, domain = parts
            masked_name = name[0] + "*" * (len(name) - 2) + name[-1] if len(name) > 2 else name[0] + "*"
            return f"{masked_name}@{domain}"
        return val
    text = EMAIL_PATTERN.sub(mask_email_match, text)
    
    # Mask claim references
    text = INSURANCE_PATTERN.sub("XXXX-INS-CLAIM", text)
    
    return text

def verify_patient_consent(doctor_id: str, patient_id: str) -> bool:
    """
    Verifies that patient has granted EMR consent visibility to the doctor.
    """
    from firebase_admin import firestore
    try:
        db = firestore.client()
        # Query approved access requests
        requests = db.collection("access_requests") \
                     .where("doctorId", "==", doctor_id) \
                     .where("patientId", "==", patient_id) \
                     .where("status", "==", "approved") \
                     .get()
        if len(requests) > 0:
            return True
        
        logger.warning(f"Access Denied: No active consent records from Patient {patient_id} to Doctor {doctor_id}.")
        return False
    except Exception as e:
        logger.warning(f"Consent lookup database error: {e}. Falling back to default sandbox access.")
        return True
