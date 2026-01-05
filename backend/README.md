# DASA KNUST Backend

Django REST API backend for the Dagomba Students Association (DASA) KNUST web application.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd dasa-app/backend
```

### 2. Create a virtual environment

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment variables (Optional)

Create a `.env` file in the backend directory if you need custom settings:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create a superuser (for admin access)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 7. Run the development server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Documentation

Once the server is running, you can access:
- **API Documentation (Swagger)**: `http://localhost:8000/swagger/`
- **API Documentation (ReDoc)**: `http://localhost:8000/redoc/`
- **Django Admin**: `http://localhost:8000/admin/`

## Key Features

- User authentication with JWT tokens
- Student registration (restricted to @st.knust.edu.gh emails)
- Elections and voting system
- Gallery management (images and videos)
- Events management
- Market place
- Lost & Found
- Career opportunities
- Resources sharing
- Welfare reporting
- Leadership profiles
- System configuration

## Project Structure

```
backend/
├── core/                 # Project settings and configuration
├── dasa_users/          # User authentication and profiles
├── elections/           # Elections and voting system
├── events/              # Events management
├── gallery/             # Gallery (images/videos)
├── market/              # Marketplace
├── lost_found/          # Lost and found items
├── opportunities/       # Career opportunities
├── resources/           # Academic resources
├── welfare/             # Welfare reports
├── leadership/          # Executive leadership
├── announcements/       # Announcements
├── legal/               # Constitution and legal docs
└── manage.py            # Django management script
```

## Common Commands

### Run migrations
```bash
python manage.py migrate
```

### Create migrations after model changes
```bash
python manage.py makemigrations
```

### Create superuser
```bash
python manage.py createsuperuser
```

### Collect static files (for production)
```bash
python manage.py collectstatic
```

### Run tests
```bash
python manage.py test
```

## Database

The project uses SQLite by default for development. The database file (`db.sqlite3`) will be created automatically when you run migrations.

For production, consider using PostgreSQL:
1. Uncomment `psycopg2-binary` in `requirements.txt`
2. Update `DATABASES` setting in `core/settings.py`

## CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000` (Next.js development)
- Your production frontend URL (configure in `core/settings.py`)

## Deployment

For production deployment:
1. Set `DEBUG=False` in settings
2. Configure `ALLOWED_HOSTS`
3. Set up a production database (PostgreSQL recommended)
4. Use a production WSGI server like Gunicorn
5. Serve static files with WhiteNoise or a CDN
6. Set up proper media file storage (AWS S3, Azure, etc.)

## Contributing

When contributing:
1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Add your license here]
