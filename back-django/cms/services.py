from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import serializers

from .models import Article, Category, EmailNotification, Network


def build_article_queryset():
    return Article.objects.select_related("network").prefetch_related(
        "categories",
        "notifications",
    )


def create_or_update_article(*, instance=None, validated_data):
    network_id = validated_data.get("networkId")
    category_ids = validated_data.get("categoryIds")

    if network_id is not None:
        try:
            network = Network.objects.get(pk=network_id)
        except Network.DoesNotExist as exc:
            raise serializers.ValidationError({"networkId": "Reseau introuvable."}) from exc
    else:
        network = None

    categories = None
    if category_ids is not None:
        categories = list(Category.objects.filter(pk__in=category_ids))
        if len(categories) != len(set(category_ids)):
            raise serializers.ValidationError({"categoryIds": "Une ou plusieurs categories sont introuvables."})

    fields = {}
    for src, dest in {
        "title": "title",
        "content": "content",
        "excerpt": "excerpt",
        "author": "author",
        "featured": "featured",
    }.items():
        if src in validated_data:
            fields[dest] = validated_data[src]

    if network is not None:
        fields["network"] = network

    if instance is None:
        article = Article.objects.create(**fields)
    else:
        for attr, value in fields.items():
            setattr(instance, attr, value)
        instance.save()
        article = instance

    if categories is not None:
        article.categories.set(categories)

    return build_article_queryset().get(pk=article.pk)


def update_article_status(article: Article, status: str) -> Article:
    article.status = status
    article.published_at = timezone.now() if status == Article.STATUS_PUBLISHED else None
    article.save(update_fields=["status", "published_at", "updated_at"])
    return build_article_queryset().get(pk=article.pk)


def send_article_notification(*, article: Article, recipients: list[str], subject: str):
    article_url = f"{settings.APP_URL.rstrip('/')}/articles/{article.pk}"
    message = f"{article.title}\n\n{article.excerpt}\n\nAuteur: {article.author}\n\nLien: {article_url}"

    try:
        sent_count = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        status = EmailNotification.STATUS_SENT if sent_count > 0 else EmailNotification.STATUS_FAILED
    except Exception:
        status = EmailNotification.STATUS_FAILED

    notification = EmailNotification.objects.create(
        article=article,
        recipients=recipients,
        subject=subject,
        status=status,
    )

    return notification, status == EmailNotification.STATUS_SENT
