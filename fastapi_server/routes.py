from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi_server.auth import get_current_user
from fastapi_server.privacy import mask_pii, verify_patient_consent
from fastapi_server.rag import get_rag_context
from fastapi_server.audit import write_audit_log
from fastapi_server.models.gemma import GemmaModel
import logging

logger = logging.getLogger("healthchain_routes")
router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    role: str
    conversationId: str = ""

@router.post("/api/ai/chat")
async def chat_endpoint(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    uid = current_user.get("uid")
    # Resolve the role verified in auth middleware
    user_role = current_user.get("resolved_role") or req.role
    
    logger.info(f"Received secure chat request from user {uid} ({user_role})")
    
    # 1. Retrieve context dynamically using RAG
    rag_res = get_rag_context(req.message, user_role)
    
    # 2. Strict Privacy Masking (PII sanitization)
    masked_message = mask_pii(req.message)
    masked_context = mask_pii(rag_res["context_text"])
    
    # 3. Securely Invoke Google Gemma 4 Model
    model = GemmaModel()
    response_text = model.generate(masked_message, masked_context, user_role)
    
    # Clean output to ensure PII did not leak in LLM reflection
    masked_response = mask_pii(response_text)
    
    # 4. Generate Immutable Audit Log
    write_audit_log(uid, user_role, "chat_query", masked_message, masked_response)
    
    return {
        "response": masked_response,
        "sources": rag_res["sources"]
    }
