from datetime import datetime
from pydantic import BaseModel

class Dialog(BaseModel):
    id: int
    message: str
    response: str
    timestamp: datetime


class DialogHistory(BaseModel):
    history: list[Dialog]
    
    
class UserInfo(BaseModel):
    user_id: str
    
    
class SessionInfo(BaseModel):
    session_id: str
    

class UserInput(BaseModel):
    user_input: str