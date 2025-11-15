# server/db/database.py
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
load_dotenv()  # Load variables from .env

DATABASE_URL = os.getenv("DB_URL")

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()
# Dependency to get DB session
async def get_db():
    async with async_session() as session:
        yield session
