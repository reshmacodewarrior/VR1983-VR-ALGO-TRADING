from pydantic import BaseModel

class BrokerBase(BaseModel):
    broker_name: str
    api_key: str
    api_secret: str

class BrokerCreate(BrokerBase):
    pass
