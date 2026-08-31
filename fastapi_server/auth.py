from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, firestore
import logging

logger = logging.getLogger("healthchain_auth")
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Verify Firebase ID Token
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        logger.warning(f"Firebase token verification failed: {e}. Falling back to sandbox credential decoder.")
        
        # Development / Sandbox fallback
        if token.startswith("mock_token_"):
            parts = token.split("_")
            uid = parts[2] if len(parts) > 2 else "mock-user-123"
            role = parts[3] if len(parts) > 3 else "patient"
            return {
                "uid": uid, 
                "email": f"{role}@healthchain.org", 
                "role": role, 
                "name": f"Demo {role.capitalize()}"
            }
        
        raise HTTPException(
            status_code=401,
            detail="Access Denied. You do not have permission to access this information."
        )

def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        
        # Check custom Firestore user record for role if missing in claims
        if not user_role:
            try:
                db = firestore.client()
                uid = current_user.get("uid")
                user_doc = db.collection("users").document(uid).get()
                if user_doc.exists:
                    user_role = user_doc.to_dict().get("role")
                else:
                    clinical_doc = db.collection("clinical_users").document(uid).get()
                    if clinical_doc.exists:
                        user_role = clinical_doc.to_dict().get("role")
            except Exception as firestore_err:
                logger.warning(f"Firestore role lookup failed: {firestore_err}")
                user_role = "patient"  # Safe default fallback
        
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Access Denied. You do not have permission to access this information."
            )
        current_user["resolved_role"] = user_role
        return current_user
    return role_checker
