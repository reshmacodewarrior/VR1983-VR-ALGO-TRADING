# Create a new file: app/exceptions.py
class TradingError(Exception):
    """Base exception for all trading-related errors"""
    pass

class BrokerConnectionError(TradingError):
    """Raised when unable to connect to broker API"""
    pass

class OrderExecutionError(TradingError):
    """Raised when order execution fails"""
    pass

class InvalidSignalError(TradingError):
    """Raised when a trading signal is invalid"""
    pass

class DatabaseConnectionError(TradingError):
    """Raised when database connection fails"""
    pass

class InsufficientFundsError(TradingError):
    """Raised when account has insufficient funds for a trade"""
    pass