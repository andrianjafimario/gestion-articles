from rest_framework.permissions import BasePermission, SAFE_METHODS


def get_user_role(user) -> str | None:
    profile = getattr(user, "profile", None)
    return getattr(profile, "role", None)


class IsAdminOrEditor(BasePermission):
    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        return get_user_role(request.user) in {"ADMIN", "EDITOR"}


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        return get_user_role(request.user) == "ADMIN"


class PublicReadEditorWriteAdminDelete(BasePermission):
    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        if request.method == "DELETE":
            return IsAdminOnly().has_permission(request, view)
        return IsAdminOrEditor().has_permission(request, view)
