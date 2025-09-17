import logging
from app import database
from app.exceptions import DatabaseConnectionError

logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        # Your database connection logic
        connection = database.connect()
        return connection
    except database.ConnectionError as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise DatabaseConnectionError(f"Failed to connect to database: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected database connection error: {str(e)}")
        raise DatabaseConnectionError(f"Unexpected database error: {str(e)}")