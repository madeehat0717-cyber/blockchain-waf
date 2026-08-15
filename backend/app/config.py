from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "supersecretkey-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./waf.db"
    BLOCKCHAIN_RPC_URL: str = "http://127.0.0.1:8545"
    WAF_RATE_LIMIT: int = 100

    class Config:
        env_file = ".env"

settings = Settings()
