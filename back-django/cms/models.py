import uuid

from django.contrib.auth.models import User
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserProfile(TimeStampedModel):
    ROLE_ADMIN = "ADMIN"
    ROLE_EDITOR = "EDITOR"
    ROLE_CHOICES = [
        (ROLE_ADMIN, "Admin"),
        (ROLE_EDITOR, "Editor"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_EDITOR)

    def __str__(self) -> str:
        return f"{self.user.email} ({self.role})"


class Network(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField()

    def __str__(self) -> str:
        return self.name


class Category(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    color = models.CharField(max_length=7)

    def __str__(self) -> str:
        return self.name


class Article(TimeStampedModel):
    STATUS_DRAFT = "draft"
    STATUS_PUBLISHED = "published"
    STATUS_ARCHIVED = "archived"
    STATUS_CHOICES = [
        (STATUS_DRAFT, "Draft"),
        (STATUS_PUBLISHED, "Published"),
        (STATUS_ARCHIVED, "Archived"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    excerpt = models.TextField()
    author = models.CharField(max_length=255)
    network = models.ForeignKey(Network, on_delete=models.CASCADE, related_name="articles")
    categories = models.ManyToManyField(Category, related_name="articles")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    def __str__(self) -> str:
        return self.title


class EmailNotification(models.Model):
    STATUS_SENT = "sent"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = [
        (STATUS_SENT, "Sent"),
        (STATUS_FAILED, "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="notifications")
    recipients = models.JSONField(default=list)
    subject = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SENT)
    sent_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.subject
