import pandas as pd
import schedule
import time
import yfinance as yf
from datetime import datetime
import logging
import os

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ExcelSignalTrigger:
    def __init__(self, excel_file_path):
        self.excel_file = excel_file_path
        self.stock_data = None
        self.load_excel_data()
        self.triggered_signals = set()  # To avoid duplicate triggers
        
    def load_excel_data(self):
        """Load stock target levels from Excel file"""
        try:
            # Read Excel file, skip the first row if it contains headers
            df = pd.read_excel(self.excel_file, header=0)
            
            # Clean column names (remove extra spaces and make lowercase)
            df.columns = df.columns.str.strip().str.lower()
            
            # Extract relevant columns - adjust column names based on your Excel structure
            # Assuming columns: 'stock name', 'levels', 'ltp'
            self.stock_data = df[['stock name', 'levels', 'ltp']].copy()
            
            # Clean stock names and convert to NSE format
            self.stock_data['stock name'] = self.stock_data['stock name'].astype(str).str.strip()
            
            # Add .NS suffix for NSE stocks (adjust if needed for other exchanges)
            self.stock_data['symbol'] = self.stock_data['stock name'] + '.NS'
            
            logging.info(f"Loaded {len(self.stock_data)} stocks from Excel")
            logging.info(f"Sample stocks: {self.stock_data['stock name'].head().tolist()}")
            
        except Exception as e:
            logging.error(f"Error loading Excel file: {e}")
            raise
    
    def get_current_price(self, symbol):
        """Get current market price using yfinance"""
        try:
            stock = yf.Ticker(symbol)
            # Get the latest price
            current_data = stock.history(period='1d', interval='1m')
            if not current_data.empty:
                return current_data['Close'].iloc[-1]
            else:
                # Fallback to info if history fails
                info = stock.info
                return info.get('regularMarketPrice', info.get('currentPrice', None))
        except Exception as e:
            logging.error(f"Error fetching price for {symbol}: {e}")
            return None
    
    def check_price_levels(self):
        """Check if current prices hit target levels and trigger signals"""
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logging.info(f"Checking price levels at {current_time}")
        
        triggered_count = 0
        
        for index, row in self.stock_data.iterrows():
            stock_name = row['stock name']
            symbol = row['symbol']
            target_level = row['levels']
            current_excel_ltp = row['ltp']
            
            # Skip if target level is not valid
            if pd.isna(target_level) or target_level <= 0:
                continue
            
            # Get current market price
            current_market_price = self.get_current_price(symbol)
            
            if current_market_price is None:
                logging.warning(f"Could not fetch price for {stock_name}")
                continue
            
            # Create unique identifier for this signal
            signal_id = f"{stock_name}_{target_level}"
            
            # Check if price hit the target level (with 0.1% tolerance)
            price_diff_percent = abs((current_market_price - target_level) / target_level * 100)
            
            if price_diff_percent <= 0.1 and signal_id not in self.triggered_signals:
                # Trigger signal
                self.trigger_signal(stock_name, target_level, current_market_price, current_excel_ltp)
                self.triggered_signals.add(signal_id)
                triggered_count += 1
            elif price_diff_percent <= 1.0:  # Within 1% of target
                logging.info(f"{stock_name}: Current ₹{current_market_price:.2f} approaching target ₹{target_level:.2f} "
                           f"(diff: {price_diff_percent:.2f}%)")
        
        if triggered_count == 0:
            logging.info("No new triggers in this check")
    
    def trigger_signal(self, stock_name, target_level, current_price, excel_ltp):
        """Execute the signal trigger action"""
        signal_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        message = f"""
        🚨 SIGNAL TRIGGERED 🚨
        Time: {signal_time}
        Stock: {stock_name}
        Target Level: ₹{target_level:.2f}
        Current Market Price: ₹{current_price:.2f}
        Excel LTP: ₹{excel_ltp:.2f}
        Action: PRICE TARGET HIT!
        """
        
        logging.info(message)
        
        # Here you can add your actual signal execution logic:
        # - Send email/SMS notification
        # - Place orders through broker API
        # - Update database
        # - Send webhook notification
        
        self.execute_trading_signal(stock_name, current_price)
    
    def execute_trading_signal(self, stock_name, current_price):
        """Placeholder for actual trading execution"""
        # Implement your broker API integration here
        # Example:
        # broker.place_order(stock_name, quantity, "BUY", current_price)
        
        logging.info(f"EXECUTING TRADE: {stock_name} at ₹{current_price:.2f}")
        
        # Example implementation (pseudo-code):
        """
        if your_broker_api:
            try:
                order_id = your_broker_api.place_order(
                    instrument=stock_name,
                    quantity=calculate_quantity(stock_name, current_price),
                    order_type="MARKET",
                    transaction_type="BUY"  # or "SELL" based on your strategy
                )
                logging.info(f"Order placed successfully: {order_id}")
            except Exception as e:
                logging.error(f"Order failed: {e}")
        """
    
    def update_excel_ltp(self):
        """Update LTP column in Excel with current market prices"""
        try:
            for index, row in self.stock_data.iterrows():
                symbol = row['symbol']
                current_price = self.get_current_price(symbol)
                
                if current_price:
                    self.stock_data.at[index, 'ltp'] = current_price
            
            # Save updated data back to Excel (optional)
            # self.stock_data.to_excel('updated_stock_data.xlsx', index=False)
            logging.info("LTP data updated with current market prices")
            
        except Exception as e:
            logging.error(f"Error updating LTP: {e}")

# Scheduler Setup
def setup_scheduler():
    signal_trigger = ExcelSignalTrigger('weekly (2).xlsx')
    
    # Schedule frequent price checks during market hours
    schedule.every(1).minutes.do(signal_trigger.check_price_levels).tag('price_check')
    
    # Update Excel LTP less frequently
    schedule.every(30).minutes.do(signal_trigger.update_excel_ltp).tag('ltp_update')
    
    # Daily reset of triggered signals (for new trading day)
    schedule.every().day.at("09:00").do(
        lambda: signal_trigger.triggered_signals.clear()
    ).tag('daily_reset')
    
    return signal_trigger

def main():
    """Main execution function"""
    logging.info("Starting Excel-based Signal Trigger System")
    
    try:
        signal_trigger = setup_scheduler()
        
        # Initial check
        signal_trigger.check_price_levels()
        
        # Main loop
        while True:
            schedule.run_pending()
            time.sleep(1)
            
    except KeyboardInterrupt:
        logging.info("System stopped by user")
    except Exception as e:
        logging.error(f"System error: {e}")

# Alternative: One-time execution without scheduler
def run_single_check():
    """Run a single price check (useful for testing)"""
    signal_trigger = ExcelSignalTrigger('weekly (2).xlsx')
    signal_trigger.check_price_levels()

if __name__ == "__main__":
    # For testing
    run_single_check()
    
    # For continuous operation
    # main()