from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class Dialog(BaseModel):
    id: int
    message: str
    response: str
    timestamp: datetime


class DialogHistory(BaseModel):
    history: list[Dialog]
    
    
class UserInfo(BaseModel):
    user_id: int
    insight: Optional[dict] = None
    
    
class SessionInfo(BaseModel):
    session_id: str
    insight: dict
    selected_supervisor: str
    cbt_info: dict
    pf_rating: dict
    ipt_log: dict
    

class UserInput(BaseModel):
    user_input: str