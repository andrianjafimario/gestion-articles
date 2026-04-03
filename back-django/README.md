# Backend Django

Backend Django REST cree comme alternative au backend Node/Express du projet.

## Fonctionnalites

- Authentification JWT par email
- CRUD categories, reseaux, articles
- Filtres et pagination des articles
- Historique des notifications email
- Import JSON d'articles
- Base SQLite par defaut

## Installation

```bash
cd back-django
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

API par defaut: `http://localhost:8000`
