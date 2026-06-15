from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Database Connection URL
# Format for MySQL: mysql+pymysql://<username>:<password>@<host>:<port>/<database_name>
# IMPORTANT: Replace 'root', 'password', and 'disease_db' with your actual MySQL credentials
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/disease_db"

# 2. Create the Database Engine
# The engine is the starting point for any SQLAlchemy application. It manages connections to the DB.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. Create a Session Local Class
# Each instance of this class will act as an independent, temporary workspace (a "session") for database operations.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create a Base Class
# All of our database models (like the User table) will inherit from this Base class.
Base = declarative_base()

# 5. Dependency Function
# This function will be used by FastAPI endpoints to get a database session for each incoming request.
# It ensures the session is closed safely after the request finishes.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Replace 'your_password' with your actual MySQL root password
# If you didn't set a password during installation, leave it empty like this: "mysql+pymysql://root:@localhost:3306/disease_db"
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:NewPassword123@localhost:3306/disease_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()