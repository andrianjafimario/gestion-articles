from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from cms.views import (
    ArticleImportView,
    ArticleNotifyView,
    ArticleStatusView,
    ArticleViewSet,
    AuthLoginView,
    AuthProfileView,
    AuthRegisterView,
    CategoryViewSet,
    HealthView,
    NetworkViewSet,
    NotificationArticleListView,
    NotificationDetailView,
    NotificationListView,
)


router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("networks", NetworkViewSet, basename="network")
router.register("articles", ArticleViewSet, basename="article")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health", HealthView.as_view(), name="health"),
    path("api/auth/register", AuthRegisterView.as_view(), name="auth-register"),
    path("api/auth/login", AuthLoginView.as_view(), name="auth-login"),
    path("api/auth/profile", AuthProfileView.as_view(), name="auth-profile"),
    path("api/articles/<uuid:pk>/status/", ArticleStatusView.as_view(), name="article-status"),
    path("api/articles/<uuid:pk>/notify/", ArticleNotifyView.as_view(), name="article-notify"),
    path("api/notifications/", NotificationListView.as_view(), name="notification-list"),
    path(
        "api/notifications/article/<uuid:article_id>/",
        NotificationArticleListView.as_view(),
        name="notification-article-list",
    ),
    path("api/notifications/<uuid:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
    path("api/import/articles/", ArticleImportView.as_view(), name="article-import"),
    path("api/", include(router.urls)),
]
