# utils/auth.py

from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

# --- Imports from your project structure ---
from dependencies.security import oauth2_scheme
from db.database import get_db
from models.user import User

# --- Constants ---
SECRET_KEY = "anudeep123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Password Utilities ---
def get_password_hash(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        password = password.encode('utf-8')[:72].decode('utf-8', errors='ignore')
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- Token Creation ---
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- Token Verification and User Retrieval ---
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    # ***** THE ONLY CHANGE IS HERE *****
    except JWTError as e:
        # This line will print the specific reason for the 401 error to your backend terminal.
        print(f"!!! JWT VALIDATION ERROR: {e} !!!") 
        raise credentials_exception
    # ***** END OF CHANGE *****
    
    # Fetch the user from the database using the ID from the token
    user = await db.get(User, int(user_id))
    
    if user is None:
        # This handles the case where the token is valid but the user has been deleted
        raise credentials_exception
        
    return user

# --- User Authentication (Used by login route) ---
async def authenticate_user(db: AsyncSession, username: str, password: str):
    # Find the user by email/username
    result = await db.execute(select(User).where(User.email == username))
    user = result.scalar_one_or_none()
    
    if not user:
        return None
        
    # Verify the password
    if not verify_password(password, user.password_hash):
        return None
        
    return user