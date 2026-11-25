from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "StockFlow"
    debug: bool = True

    database_url: str = "postgresql+psycopg:///stockflow_db"

    jwt_secret_key: str = "CHANGE_THIS_SECRET_IN_ENV"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    default_low_stock_threshold: int = 5
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
