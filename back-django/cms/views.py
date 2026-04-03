from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, EmailNotification, Network
from .permissions import IsAdminOrEditor, PublicReadEditorWriteAdminDelete
from .serializers import (
    ArticleNotifySerializer,
    ArticleSerializer,
    ArticleStatusSerializer,
    ArticleWriteSerializer,
    CategorySerializer,
    EmailNotificationSerializer,
    LoginSerializer,
    NetworkSerializer,
    RegisterSerializer,
    UserSummarySerializer,
)
from .services import build_article_queryset, create_or_update_article, send_article_notification, update_article_status


def token_payload_for(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    profile = getattr(user, "profile", None)
    refresh["role"] = getattr(profile, "role", None)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({"status": "OK"})


class AuthRegisterView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = token_payload_for(user)
        data = {
            "user": UserSummarySerializer(user).data,
            "token": tokens["access"],
            "refresh": tokens["refresh"],
        }
        return Response({"success": True, "data": data}, status=status.HTTP_201_CREATED)


class AuthLoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        password = serializer.validated_data["password"]
        user = authenticate(username=email, password=password)
        if not user:
            return Response(
                {"success": False, "message": "Identifiants invalides."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tokens = token_payload_for(user)
        data = {
            "user": UserSummarySerializer(user).data,
            "token": tokens["access"],
            "refresh": tokens["refresh"],
        }
        return Response({"success": True, "data": data})


class AuthProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"success": True, "data": UserSummarySerializer(request.user).data})


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("-created_at")
    serializer_class = CategorySerializer
    permission_classes = [PublicReadEditorWriteAdminDelete]


class NetworkViewSet(viewsets.ModelViewSet):
    serializer_class = NetworkSerializer
    permission_classes = [PublicReadEditorWriteAdminDelete]

    def get_queryset(self):
        return Network.objects.all().order_by("-created_at")


class ArticleViewSet(viewsets.ViewSet):
    permission_classes = [PublicReadEditorWriteAdminDelete]

    def list(self, request):
        queryset = build_article_queryset().order_by("-published_at", "-created_at")

        status_filter = request.query_params.get("status")
        network_id = request.query_params.get("networkId")
        category_id = request.query_params.get("categoryId")
        featured = request.query_params.get("featured")
        page = max(int(request.query_params.get("page", 1)), 1)
        limit = min(max(int(request.query_params.get("limit", 10)), 1), 100)

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if network_id:
            queryset = queryset.filter(network_id=network_id)
        if category_id:
            queryset = queryset.filter(categories__id=category_id)
        if featured is not None:
            queryset = queryset.filter(featured=featured.lower() == "true")

        total = queryset.distinct().count()
        start = (page - 1) * limit
        end = start + limit
        items = queryset.distinct()[start:end]

        return Response(
            {
                "success": True,
                "data": ArticleSerializer(items, many=True).data,
                "pagination": {
                    "total": total,
                    "page": page,
                    "limit": limit,
                    "pages": (total + limit - 1) // limit,
                },
            }
        )

    def retrieve(self, request, pk=None):
        article = get_object_or_404(build_article_queryset(), pk=pk)
        return Response({"success": True, "data": ArticleSerializer(article).data})

    def create(self, request):
        serializer = ArticleWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = create_or_update_article(validated_data=serializer.validated_data)
        return Response(
            {"success": True, "data": ArticleSerializer(article).data},
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, pk=None):
        article = get_object_or_404(build_article_queryset(), pk=pk)
        serializer = ArticleWriteSerializer(
            data=request.data,
            context={"partial": False},
        )
        serializer.is_valid(raise_exception=True)
        updated = create_or_update_article(instance=article, validated_data=serializer.validated_data)
        return Response({"success": True, "data": ArticleSerializer(updated).data})

    def partial_update(self, request, pk=None):
        article = get_object_or_404(build_article_queryset(), pk=pk)
        serializer = ArticleWriteSerializer(
            data=request.data,
            context={"partial": True},
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        updated = create_or_update_article(instance=article, validated_data=serializer.validated_data)
        return Response({"success": True, "data": ArticleSerializer(updated).data})

    def destroy(self, request, pk=None):
        article = get_object_or_404(build_article_queryset(), pk=pk)
        article.delete()
        return Response({"success": True, "message": "Article deleted successfully"})


class ArticleStatusView(APIView):
    permission_classes = [IsAdminOrEditor]

    def patch(self, request, pk):
        serializer = ArticleStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = get_object_or_404(build_article_queryset(), pk=pk)
        updated = update_article_status(article, serializer.validated_data["status"])
        return Response(
            {
                "success": True,
                "message": f"Article status updated to \"{serializer.validated_data['status']}\"",
                "data": ArticleSerializer(updated).data,
            }
        )


class ArticleNotifyView(APIView):
    permission_classes = [IsAdminOrEditor]

    def post(self, request, pk):
        serializer = ArticleNotifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = get_object_or_404(build_article_queryset(), pk=pk)
        notification, success = send_article_notification(
            article=article,
            recipients=serializer.validated_data["recipients"],
            subject=serializer.validated_data["subject"],
        )
        return Response(
            {
                "success": success,
                "message": "Notification sent successfully" if success else "Failed to send notification",
                "data": {
                    "notification": EmailNotificationSerializer(notification).data,
                    "recipients": serializer.validated_data["recipients"],
                },
            },
            status=status.HTTP_201_CREATED,
        )


class NotificationListView(APIView):
    def get(self, request):
        notifications = EmailNotification.objects.select_related("article").order_by("-created_at")[:50]
        return Response({"success": True, "data": EmailNotificationSerializer(notifications, many=True).data})


class NotificationArticleListView(APIView):
    def get(self, request, article_id):
        notifications = EmailNotification.objects.select_related("article").filter(article_id=article_id)
        return Response({"success": True, "data": EmailNotificationSerializer(notifications, many=True).data})


class NotificationDetailView(APIView):
    def get(self, request, pk):
        notification = get_object_or_404(EmailNotification.objects.select_related("article"), pk=pk)
        return Response({"success": True, "data": EmailNotificationSerializer(notification).data})


class ArticleImportView(APIView):
    permission_classes = [IsAdminOrEditor]

    def post(self, request):
        payload = request.data if isinstance(request.data, list) else [request.data]
        created = []
        for item in payload:
            serializer = ArticleWriteSerializer(data=item)
            serializer.is_valid(raise_exception=True)
            created.append(create_or_update_article(validated_data=serializer.validated_data))

        return Response(
            {
                "success": True,
                "message": f"{len(created)} article(s) imported successfully",
                "data": {
                    "imported": len(created),
                    "articles": ArticleSerializer(created, many=True).data,
                },
            },
            status=status.HTTP_201_CREATED,
        )
