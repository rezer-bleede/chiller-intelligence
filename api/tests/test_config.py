from src.config import Settings, get_settings


def test_settings_apply_default_values_when_env_missing(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("SECRET_KEY", raising=False)

    settings = get_settings()

    assert settings.database_url == "postgresql+psycopg://postgres:postgres@db:5432/postgres"
    assert settings.secret_key == "dev-secret-key"


def test_settings_reads_environment(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/db")
    monkeypatch.setenv("SECRET_KEY", "test-secret")

    settings = get_settings()

    assert settings.database_url.endswith("localhost:5432/db")
    assert settings.secret_key == "test-secret"
