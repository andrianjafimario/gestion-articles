from django.contrib import admin

from .models import Article, Category, EmailNotification, Network, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "created_at")


@admin.register(Network)
class NetworkAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at", "updated_at")
    search_fields = ("name",)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "color", "created_at")
    search_fields = ("name", "slug")


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "status", "featured", "network", "published_at")
    list_filter = ("status", "featured", "network")
    search_fields = ("title", "author")
    filter_horizontal = ("categories",)


@admin.register(EmailNotification)
class EmailNotificationAdmin(admin.ModelAdmin):
    list_display = ("subject", "article", "status", "sent_at")
    search_fields = ("subject",)
