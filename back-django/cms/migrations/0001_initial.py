# Generated manually for the Django CMS backend.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Article",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=255)),
                ("content", models.TextField()),
                ("excerpt", models.TextField()),
                ("author", models.CharField(max_length=255)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("published", "Published"), ("archived", "Archived")], default="draft", max_length=20)),
                ("featured", models.BooleanField(default=False)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Category",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255, unique=True)),
                ("slug", models.SlugField(unique=True)),
                ("description", models.TextField()),
                ("color", models.CharField(max_length=7)),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="Network",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255, unique=True)),
                ("description", models.TextField()),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("role", models.CharField(choices=[("ADMIN", "Admin"), ("EDITOR", "Editor")], default="EDITOR", max_length=20)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="profile", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="EmailNotification",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("recipients", models.JSONField(default=list)),
                ("subject", models.CharField(max_length=255)),
                ("status", models.CharField(choices=[("sent", "Sent"), ("failed", "Failed")], default="sent", max_length=20)),
                ("sent_at", models.DateTimeField(auto_now_add=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("article", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to="cms.article")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddField(
            model_name="article",
            name="categories",
            field=models.ManyToManyField(related_name="articles", to="cms.category"),
        ),
        migrations.AddField(
            model_name="article",
            name="network",
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="articles", to="cms.network"),
        ),
    ]
