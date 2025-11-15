from fastapi import HTTPException, status

def require_role(*allowed_roles):
    def checker(current_user):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    return checker
