from app.database import SessionLocal, engine, Base
from app import models, auth
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Seed Admin
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin:
            admin_user = models.User(
                username="admin",
                password_hash=auth.get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
            logger.info("Admin user created.")

        # Seed Analyst
        analyst = db.query(models.User).filter(models.User.username == "analyst").first()
        if not analyst:
            analyst_user = models.User(
                username="analyst",
                password_hash=auth.get_password_hash("analyst123"),
                role="analyst"
            )
            db.add(analyst_user)
            logger.info("Analyst user created.")
            
        db.commit()
    except Exception as e:
        logger.error(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    logger.info("Starting seed process...")
    seed_db()
    logger.info("Seed process finished.")
