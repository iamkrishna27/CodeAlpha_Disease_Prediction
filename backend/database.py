from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. SQLite Database URL (Server thevai illa, local file-a save aagum)
SQLALCHEMY_DATABASE_URL = "sqlite:///./medcore.db"

# 2. Create the Database Engine (SQLite-ku check_same_thread: False thevai)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a Session Local Class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create a Base Class
Base = declarative_base()

# 5. Dependency Function (FastAPI-ku thevaiyanathu)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()