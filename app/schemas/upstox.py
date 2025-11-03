from pydantic import BaseModel, Field, validator
from typing import Optional, List
from enum import Enum

class ProductType(str, Enum):
    DELIVERY = "D"
    INTRADAY = "I"

class ValidityType(str, Enum):
    DAY = "DAY"
    IOC = "IOC"

class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    SL = "SL"
    SL_M = "SL-M"

class TransactionType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity of the instrument to trade")
    product: str = Field("D", description="Product type (D for delivery, I for intraday)")
    validity: str = Field("DAY", description="Order validity (DAY, IOC)")
    price: float = Field(0, ge=0, description="Price at which to place the order (0 for market orders)")
    tag: Optional[str] = Field("sandbox-demo", description="Tag for the order")
    instrument_token: str = Field(..., description="Instrument token to trade")
    order_type: str = Field("MARKET", description="Order type (MARKET, LIMIT, SL, SL-M)")
    transaction_type: str = Field(..., description="Transaction type (BUY or SELL)")
    disclosed_quantity: int = Field(0, ge=0, description="Disclosed quantity")
    trigger_price: float = Field(0, ge=0, description="Trigger price for SL orders")
    is_amo: bool = Field(False, description="Is After Market Order")

class SingleOrderRequest(BaseModel):
    correlation_id: str = Field(..., description="Unique identifier for each order")
    quantity: int = Field(..., gt=0, description="Quantity of the instrument to trade")
    product: ProductType = Field(ProductType.DELIVERY, description="Product type (D for delivery, I for intraday)")
    validity: ValidityType = Field(ValidityType.DAY, description="Order validity (DAY, IOC)")
    price: float = Field(0, ge=0, description="Price at which to place the order (0 for market orders)")
    tag: str = Field("sandbox-demo", description="Tag for the order")
    instrument_token: str = Field(..., min_length=1, description="Instrument token to trade")
    order_type: OrderType = Field(OrderType.MARKET, description="Order type (MARKET, LIMIT, SL, SL-M)")
    transaction_type: TransactionType = Field(..., description="Transaction type (BUY or SELL)")
    disclosed_quantity: int = Field(0, ge=0, description="Disclosed quantity")
    trigger_price: float = Field(0, ge=0, description="Trigger price for SL orders")
    is_amo: bool = Field(False, description="Is After Market Order")
    slice: bool = Field(False, description="Is slice order")

    @validator('disclosed_quantity')
    def validate_disclosed_quantity(cls, v, values):
        if 'quantity' in values and v > values['quantity']:
            raise ValueError('Disclosed quantity cannot be greater than total quantity')
        return v

    @validator('price')
    def validate_price_for_market_order(cls, v, values):
        if 'order_type' in values and values['order_type'] == OrderType.MARKET and v > 0:
            raise ValueError('Price must be 0 for MARKET orders')
        return v

    @validator('trigger_price')
    def validate_trigger_price(cls, v, values):
        if 'order_type' in values and values['order_type'] in [OrderType.SL, OrderType.SL_M] and v <= 0:
            raise ValueError('Trigger price is required for SL and SL-M orders')
        return v

class MultiOrderRequest(BaseModel):
    orders: List[SingleOrderRequest] = Field(..., min_items=1, max_items=10, description="List of orders to place")
class ModifyOrderRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Modified quantity of the instrument")
    validity: ValidityType = Field(ValidityType.DAY, description="Order validity (DAY, IOC)")
    price: float = Field(..., ge=0, description="Modified price for the order")
    order_id: str = Field(..., description="Original order ID to modify")
    order_type: OrderType = Field(..., description="Modified order type (MARKET, LIMIT, SL, SL-M)")
    disclosed_quantity: int = Field(0, ge=0, description="Modified disclosed quantity")
    trigger_price: float = Field(0, ge=0, description="Modified trigger price for SL orders")

    @validator('disclosed_quantity')
    def validate_disclosed_quantity(cls, v, values):
        if 'quantity' in values and v > values['quantity']:
            raise ValueError('Disclosed quantity cannot be greater than total quantity')
        return v

    @validator('trigger_price')
    def validate_trigger_price(cls, v, values):
        if 'order_type' in values and values['order_type'] in [OrderType.SL, OrderType.SL_M] and v <= 0:
            raise ValueError('Trigger price is required for SL and SL-M orders')
        return v
class OrderHistoryRequest(BaseModel):
    order_id: str = Field(..., description="Order ID to get history for")
class ModifyOrderRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Modified quantity of the instrument")
    validity: ValidityType = Field(ValidityType.DAY, description="Order validity (DAY, IOC)")
    price: float = Field(..., ge=0, description="Modified price for the order")
    order_id: str = Field(..., description="Original order ID to modify")
    order_type: OrderType = Field(..., description="Modified order type (MARKET, LIMIT, SL, SL-M)")
    disclosed_quantity: int = Field(0, ge=0, description="Modified disclosed quantity")
    trigger_price: float = Field(0, ge=0, description="Modified trigger price for SL orders")

    @validator('disclosed_quantity')
    def validate_disclosed_quantity(cls, v, values):
        if 'quantity' in values and v > values['quantity']:
            raise ValueError('Disclosed quantity cannot be greater than total quantity')
        return v

    @validator('price')
    def validate_price_for_market_order(cls, v, values):
        if 'order_type' in values and values['order_type'] == OrderType.MARKET and v > 0:
            raise ValueError('Price must be 0 for MARKET orders')
        return v

    @validator('trigger_price')
    def validate_trigger_price(cls, v, values):
        if 'order_type' in values and values['order_type'] in [OrderType.SL, OrderType.SL_M] and v <= 0:
            raise ValueError('Trigger price is required for SL and SL-M orders')
        return v