from django.apps import AppConfig


class DasaUsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = "dasa_users"

    def ready(self):
        """
        Import signals when the app is ready.
        This ensures the signal handlers are registered.
        """
        import dasa_users.signals
