import re

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Article, Category, EmailNotification, Network, UserProfile


HEX_COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


class UserSummarySerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "role")

    def get_role(self, obj: User) -> str | None:
        profile = getattr(obj, "profile", None)
        return getattr(profile, "role", None)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Cet email est deja utilise.")
        return value.lower()

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        UserProfile.objects.create(user=user, role=UserProfile.ROLE_EDITOR)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "color", "created_at", "updated_at")

    def validate_color(self, value: str) -> str:
        if not HEX_COLOR_RE.match(value):
            raise serializers.ValidationError("Code couleur hex invalide.")
        return value


class NetworkSerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()

    class Meta:
        model = Network
        fields = ("id", "name", "description", "article_count", "created_at", "updated_at")

    def get_article_count(self, obj: Network) -> int:
        return obj.articles.count()


class ArticleSerializer(serializers.ModelSerializer):
    network = NetworkSerializer(read_only=True)
    categories = CategorySerializer(read_only=True, many=True)

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "content",
            "excerpt",
            "author",
            "network",
            "categories",
            "status",
            "featured",
            "published_at",
            "created_at",
            "updated_at",
        )


class ArticleWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False)
    content = serializers.CharField(required=False)
    excerpt = serializers.CharField(required=False)
    author = serializers.CharField(max_length=255, required=False)
    networkId = serializers.UUIDField(required=False)
    categoryIds = serializers.ListField(child=serializers.UUIDField(), required=False, allow_empty=False)
    featured = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        if self.context.get("partial"):
            return attrs

        required_fields = ["title", "content", "excerpt", "author", "networkId", "categoryIds"]
        missing = [field for field in required_fields if field not in attrs]
        if missing:
            raise serializers.ValidationError({field: "Ce champ est obligatoire." for field in missing})
        return attrs


class ArticleStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Article.STATUS_CHOICES)


class ArticleNotifySerializer(serializers.Serializer):
    recipients = serializers.ListField(
        child=serializers.EmailField(),
        allow_empty=False,
    )
    subject = serializers.CharField(max_length=255)


class EmailNotificationSerializer(serializers.ModelSerializer):
    article = ArticleSerializer(read_only=True)

    class Meta:
        model = EmailNotification
        fields = ("id", "article", "recipients", "subject", "status", "sent_at", "created_at")
