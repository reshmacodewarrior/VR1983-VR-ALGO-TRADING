# app/services/algo_service.py
import logging
from datetime import datetime
from typing import List, Dict
import pandas as pd
from fastapi.responses import Response

logger = logging.getLogger(__name__)

class AlgorithmService:
    def __init__(self):
        # Import here to avoid circular imports
        from .price_algorithm import TradingAlgorithm
        self.algorithm = TradingAlgorithm()
    
    def analyze_symbols(self, symbols: List[str]) -> Dict:
        """Analyze symbols and return signals"""
        signals = []
        
        for symbol in symbols:
            result = self.algorithm.fake_secret_algorithm(symbol)
            
            if result:
                signals.append(result)
            else:
                # Add HOLD signal when no signal generated
                signals.append({
                    "signal": "HOLD",
                    "symbol": symbol,
                    "price": 0.0,
                    "type": "NO_SIGNAL",
                    "confidence": 0,
                    "timestamp": datetime.now().isoformat()
                })
        
        return {
            "signals": signals,
            "last_updated": datetime.now().isoformat()
        }
    
    def analyze_symbols_to_csv_response(self, symbols: List[str]) -> Response:
        """Analyze symbols and return CSV response"""
        try:
            signals_data = self.analyze_symbols(symbols)
            signals_list = signals_data.get('signals', [])
            
            # Create DataFrame
            df = pd.DataFrame(signals_list)
            
            # Add export timestamp
            df['export_timestamp'] = datetime.now().isoformat()
            df['data_source'] = 'fake_algorithm'
            
            # Convert to CSV
            csv_content = df.to_csv(index=False)
            
            # Create filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"trading_signals_{timestamp}.csv"
            
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}",
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )
            
        except Exception as e:
            logger.error(f"Error generating CSV response: {e}")
            return Response(
                content="Error generating CSV",
                status_code=500,
                media_type="text/plain"
            )