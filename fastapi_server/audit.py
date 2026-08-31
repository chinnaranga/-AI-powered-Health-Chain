from firebase_admin import firestore
import uuid
import datetime
import logging

logger = logging.getLogger("healthchain_audit")

def write_audit_log(user_id: str, role: str, action: str, request_text: str, response_text: str) -> str:
    """
    Writes a secure audit log document to the 'ai_audit_logs' collection in Firestore.
    """
    request_id = str(uuid.uuid4())
    response_id = str(uuid.uuid4())
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    
    log_doc = {
        "requestId": request_id,
        "responseId": response_id,
        "userId": user_id,
        "role": role,
        "action": action,
        "timestamp": timestamp,
        "inputLength": len(request_text) if request_text else 0,
        "outputLength": len(response_text) if response_text else 0,
        "status": "success"
    }
    
    try:
        db = firestore.client()
        db.collection("ai_audit_logs").document(request_id).set(log_doc)
        logger.info(f"[Audit] Logged AI request {request_id} for user {user_id} ({role})")
    except Exception as e:
        logger.warning(f"[Audit] Failed to write Firestore log document: {e}. Writing to standard console fallback: {log_doc}")
        
    return request_id
