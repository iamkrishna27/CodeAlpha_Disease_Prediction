from sqlalchemy import Column, Integer, String, DateTime
from database import Base
import datetime

class User(Base):
    """
    The User database model.
    This defines the structure of the 'users' table in the MySQL database.
    """
    __tablename__ = "users"

    # id: The primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Profile Details
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)
    
    # email: The user's email
    email = Column(String(150), unique=True, index=True, nullable=False)
    
    # hashed_password: Hashed version of the password
    hashed_password = Column(String(255), nullable=False)
    
    # created_at: Timestamp of account creation
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
