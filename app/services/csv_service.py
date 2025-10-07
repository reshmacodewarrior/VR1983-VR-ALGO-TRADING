# app/services/csv_service.py
import pandas as pd
import json
from datetime import datetime
from fastapi.responses import Response
from typing import List, Dict
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class CSVResponseService:
    def __init__(self, output_dir="data/csv_exports"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def convert_signals_to_dataframe(self, signals_data: Dict) -> pd.DataFrame:
        """Convert signals JSON response to DataFrame"""
        signals_list = signals_data.get('signals', [])
        
        # Create DataFrame
        df = pd.DataFrame(signals_list)
        
        # Add metadata columns
        df['export_timestamp'] = datetime.now().isoformat()
        df['data_source'] = 'fake_algorithm'
        
        return df
    
    def generate_csv_response(self, signals_data: Dict, filename: str = None) -> Response:
        """Generate FastAPI CSV Response from signals data"""
        try:
            df = self.convert_signals_to_dataframe(signals_data)
            
            if filename is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"trading_signals_{timestamp}.csv"
            
            # Convert to CSV
            csv_content = df.to_csv(index=False)
            
            # Create FastAPI Response
            response = Response(
                content=csv_content,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}",
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )
            
            logger.info(f"Generated CSV response with {len(df)} signals")
            return response
            
        except Exception as e:
            logger.error(f"Error generating CSV response: {e}")
            return Response(
                content="Error generating CSV",
                status_code=500,
                media_type="text/plain"
            )
    
    def save_signals_to_daily_csv(self, signals_data: Dict) -> str:
        """Save signals to daily CSV file (24-hour basis)"""
        try:
            df = self.convert_signals_to_dataframe(signals_data)
            
            # Generate filename based on current date
            date_str = datetime.now().strftime("%Y-%m-%d")
            filename = self.output_dir / f"daily_signals_{date_str}.csv"
            
            # Check if file exists to append or create new
            if filename.exists():
                existing_df = pd.read_csv(filename)
                combined_df = pd.concat([existing_df, df], ignore_index=True)
                combined_df.to_csv(filename, index=False)
                mode = "appended"
            else:
                df.to_csv(filename, index=False)
                mode = "created"
            
            logger.info(f"Daily CSV {mode}: {filename} with {len(df)} new signals")
            return str(filename)
            
        except Exception as e:
            logger.error(f"Error saving to daily CSV: {e}")
            return None
    
    def get_daily_csv_content(self, date_str: str = None) -> str:
        """Get content of daily CSV file"""
        if date_str is None:
            date_str = datetime.now().strftime("%Y-%m-%d")
        
        filename = self.output_dir / f"daily_signals_{date_str}.csv"
        
        if not filename.exists():
            return None
        
        return filename.read_text()
    
    def list_available_csv_files(self) -> List[Dict]:
        """List all available CSV files"""
        csv_files = []
        for file_path in self.output_dir.glob("daily_signals_*.csv"):
            stats = file_path.stat()
            csv_files.append({
                'filename': file_path.name,
                'file_path': str(file_path),
                'file_size': stats.st_size,
                'created_date': datetime.fromtimestamp(stats.st_ctime).isoformat(),
                'modified_date': datetime.fromtimestamp(stats.st_mtime).isoformat()
            })
        
        return sorted(csv_files, key=lambda x: x['filename'], reverse=True)