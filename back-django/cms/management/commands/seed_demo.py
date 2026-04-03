from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from cms.models import Article, Category, EmailNotification, Network, UserProfile


class Command(BaseCommand):
    help = "Seed demo data for the Django backend"

    def handle(self, *args, **options):
        tech, _ = Category.objects.get_or_create(
            slug="technology",
            defaults={
                "name": "Technology",
                "description": "Articles autour de la tech",
                "color": "#2563EB",
            },
        )
        business, _ = Category.objects.get_or_create(
            slug="business",
            defaults={
                "name": "Business",
                "description": "Actualites business et strategie",
                "color": "#059669",
            },
        )
        lifestyle, _ = Category.objects.get_or_create(
            slug="lifestyle",
            defaults={
                "name": "Lifestyle",
                "description": "Contenus lifestyle",
                "color": "#D97706",
            },
        )

        tech_network, _ = Network.objects.get_or_create(
            name="Tech Enthusiasts",
            defaults={"description": "Communaute passionnee de technologie"},
        )
        Network.objects.get_or_create(
            name="Business Leaders",
            defaults={"description": "Reseau de dirigeants et managers"},
        )

        user, created = User.objects.get_or_create(
            username="admin@cms.local",
            defaults={"email": "admin@cms.local"},
        )
        if created:
            user.set_password("Admin123!")
            user.save()
        UserProfile.objects.get_or_create(user=user, defaults={"role": UserProfile.ROLE_ADMIN})

        article, _ = Article.objects.get_or_create(
            title="Bienvenue sur le CMS Django",
            defaults={
                "content": "Contenu de demonstration pour valider le backend Django.",
                "excerpt": "Premier article seed du backend Django.",
                "author": "System",
                "network": tech_network,
                "status": Article.STATUS_PUBLISHED,
                "featured": True,
                "published_at": timezone.now(),
            },
        )
        article.categories.set([tech, business, lifestyle])

        EmailNotification.objects.get_or_create(
            article=article,
            subject="Bienvenue sur le CMS Django",
            defaults={
                "recipients": ["demo@cms.local"],
                "status": EmailNotification.STATUS_SENT,
            },
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
