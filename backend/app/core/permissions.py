from fastapi import HTTPException, status
from app.models.user import User, UserRole

def require_role(required_role: UserRole):
    def role_checker(current_user: User):
        role_hierarchy = {
            UserRole.VIEWER: 1,
            UserRole.OFFICER: 2,
            UserRole.ADMIN: 3
        }
        
        if role_hierarchy.get(current_user.role, 0) < role_hierarchy.get(required_role, 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

def require_admin(current_user: User = None):
    return require_role(UserRole.ADMIN)(current_user)

def require_officer(current_user: User = None):
    return require_role(UserRole.OFFICER)(current_user)

def can_modify_violation(current_user: User, violation_owner_id: int = None):
    if current_user.role == UserRole.ADMIN:
        return True
    if current_user.role == UserRole.OFFICER and (violation_owner_id is None or current_user.id == violation_owner_id):
        return True
    return False
