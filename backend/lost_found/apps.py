from django.apps import AppConfig


class LostFoundConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "lost_found"

    def ready(self):
        """Import signals when app is ready"""
        import lost_found.signals
