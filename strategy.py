# tatamotors_ml_analysis.py
import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

class TataMotorsAnalyzer:
    def __init__(self):
        self.symbol = "TATAMOTORS.NS"
        self.end_date = datetime.now()
        self.start_date = self.end_date - timedelta(days=5*365)  # 5 years
        self.df = None
        self.model = None
        self.scaler = StandardScaler()
        
    def fetch_data(self):
        """Fetch 5 years of OHLC data for Tata Motors"""
        print("Fetching Tata Motors data...")
        self.df = yf.download(self.symbol, start=self.start_date, end=self.end_date)
        
        if self.df.empty:
            raise ValueError("No data fetched. Please check the symbol and try again.")
            
        print(f"Fetched {len(self.df)} trading days of data")
        return self.df
    
    def calculate_technical_indicators(self):
        """Calculate all technical indicators"""
        try:
                # Simple Moving Averages
                self.df['SMA_20'] = self.df['Close'].rolling(window=20).mean()
                self.df['SMA_50'] = self.df['Close'].rolling(window=50).mean()
                
                # Exponential Moving Averages
                self.df['EMA_12'] = self.df['Close'].ewm(span=12).mean()
                self.df['EMA_26'] = self.df['Close'].ewm(span=26).mean()
                
                # MACD
                ema_12 = self.df['Close'].ewm(span=12).mean()
                ema_26 = self.df['Close'].ewm(span=26).mean()
                self.df['MACD'] = ema_12 - ema_26
                self.df['MACD_Signal'] = self.df['MACD'].ewm(span=9).mean()
                self.df['MACD_Histogram'] = self.df['MACD'] - self.df['MACD_Signal']
                
                # RSI
                delta = self.df['Close'].diff()
                gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
                loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
                rs = gain / loss
                self.df['RSI'] = 100 - (100 / (1 + rs))
                
                # Bollinger Bands (FIXED)
                bb_period = 20
                bb_middle = self.df['Close'].rolling(window=bb_period).mean()
                bb_std = self.df['Close'].rolling(window=bb_period).std()
                
                self.df['BB_Middle'] = bb_middle
                self.df['BB_Upper'] = bb_middle + (bb_std * 2)
                self.df['BB_Lower'] = bb_middle - (bb_std * 2)
                
                # Stochastic Oscillator
                low_14 = self.df['Low'].rolling(window=14).min()
                high_14 = self.df['High'].rolling(window=14).max()
                self.df['%K'] = 100 * ((self.df['Close'] - low_14) / (high_14 - low_14))
                self.df['%D'] = self.df['%K'].rolling(window=3).mean()
                
                # Volume indicators
                self.df['Volume_SMA'] = self.df['Volume'].rolling(window=20).mean()
                
                print("Technical indicators calculated successfully")
                
        except Exception as e:
                print(f"Error calculating technical indicators: {e}")
                raise
        def create_target_variable(self):
                """Create target variable for ML model (1 for buy, 0 for sell/hold)"""
                # Future price change (5 days ahead)
                future_returns = self.df['Close'].pct_change(5).shift(-5)
                
                # Create binary target: 1 if price increases by more than 2% in 5 days, else 0
                self.df['Target'] = (future_returns > 0.02).astype(int)
                
                return self.df
            
    def prepare_features(self):
        """Prepare features for ML model"""
        feature_columns = [
            'SMA_20', 'SMA_50', 'SMA_200', 'MACD', 'MACD_Signal', 'MACD_Histogram',
            'RSI', 'BB_Upper', 'BB_Lower', 'BB_Width', 'ROC', 'Volume_Ratio', 'Momentum'
        ]
        
        # Add lagged features
        for col in feature_columns:
            for lag in [1, 2, 3]:
                self.df[f'{col}_lag{lag}'] = self.df[col].shift(lag)
        
        # Remove rows with NaN values
        self.df = self.df.dropna()
        
        # Get final feature set
        all_features = [col for col in self.df.columns if col not in ['Target', 'Open', 'High', 'Low', 'Close', 'Volume', 'Adj Close']]
        
        return all_features
    
    def train_model(self):
        """Train the ML model"""
        print("Training ML model...")
        
        # Prepare features and target
        feature_columns = self.prepare_features()
        X = self.df[feature_columns]
        y = self.df['Target']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"Model Accuracy: {accuracy:.2f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        return accuracy
    
    def generate_signals(self):
        """Generate buy/sell signals based on current data"""
        print("\nGenerating trading signals...")
        
        # Prepare features for prediction
        feature_columns = self.prepare_features()
        current_features = self.df[feature_columns].iloc[-1:].values
        current_features_scaled = self.scaler.transform(current_features)
        
        # Make prediction
        prediction = self.model.predict(current_features_scaled)[0]
        prediction_proba = self.model.predict_proba(current_features_scaled)[0]
        
        # Get current price data
        current_price = self.df['Close'].iloc[-1]
        previous_price = self.df['Close'].iloc[-2]
        price_change = ((current_price - previous_price) / previous_price) * 100
        
        # Generate signal
        if prediction == 1 and prediction_proba[1] > 0.6:  # Buy signal with high confidence
            signal = "BUY"
            confidence = prediction_proba[1]
            reason = "ML model predicts price increase > 2% in next 5 days"
        else:
            signal = "HOLD/SELL"
            confidence = prediction_proba[0]
            reason = "No strong bullish signal detected"
        
        # Check technical indicators for confirmation
        rsi = self.df['RSI'].iloc[-1]
        macd_hist = self.df['MACD_Histogram'].iloc[-1]
        
        if signal == "BUY":
            if rsi > 70:  # Overbought
                signal = "HOLD"
                reason += ", but RSI indicates overbought conditions"
            elif macd_hist < 0:  # Negative momentum
                signal = "HOLD"
                reason += ", but MACD shows negative momentum"
        
        # Prepare signal details
        signal_details = {
            'symbol': self.symbol,
            'current_price': current_price,
            'price_change_pct': price_change,
            'signal': signal,
            'confidence': confidence,
            'reason': reason,
            'rsi': rsi,
            'macd_histogram': macd_hist,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        return signal_details
    def create_target_variable(self):
                             """Create target variable for ML model (1 if next day's close is higher, else 0)"""
                             try:
                                    # Create target variable: 1 if next day's close is higher, else 0
                                        self.df['Target'] = (self.df['Close'].shift(-1) > self.df['Close']).astype(int)
                                        
                                        # Alternative: Price change percentage as target (for regression)
                                        # self.df['Target'] = ((self.df['Close'].shift(-1) - self.df['Close']) / self.df['Close']) * 100
                                        
                                        print("Target variable created successfully")
                                        print(f"Target value counts:\n{self.df['Target'].value_counts()}")
                                        
                            except Exception as e:
                                    print(f"Error creating target variable: {e}")
                                    raise
    def plot_analysis(self):
        """Create visualization of the analysis"""
        fig, axes = plt.subplots(3, 1, figsize=(14, 12))
        
        # Price chart with signals
        axes[0].plot(self.df.index, self.df['Close'], label='Close Price', linewidth=2)
        axes[0].plot(self.df.index, self.df['SMA_50'], label='SMA 50', alpha=0.7)
        axes[0].plot(self.df.index, self.df['SMA_200'], label='SMA 200', alpha=0.7)
        axes[0].set_title('Tata Motors Price Chart with Moving Averages')
        axes[0].set_ylabel('Price (₹)')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        # RSI
        axes[1].plot(self.df.index, self.df['RSI'], label='RSI', color='purple')
        axes[1].axhline(y=70, color='r', linestyle='--', alpha=0.7, label='Overbought (70)')
        axes[1].axhline(y=30, color='g', linestyle='--', alpha=0.7, label='Oversold (30)')
        axes[1].set_title('Relative Strength Index (RSI)')
        axes[1].set_ylabel('RSI')
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)
        
        # MACD
        axes[2].plot(self.df.index, self.df['MACD'], label='MACD', color='blue')
        axes[2].plot(self.df.index, self.df['MACD_Signal'], label='Signal', color='red')
        axes[2].bar(self.df.index, self.df['MACD_Histogram'], label='Histogram', color='gray', alpha=0.3)
        axes[2].set_title('MACD Indicator')
        axes[2].set_ylabel('MACD')
        axes[2].legend()
        axes[2].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('tatamotors_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def run_full_analysis(self):
        """Run the complete analysis"""
        print("=" * 60)
        print("TATA MOTORS 5-YEAR ANALYSIS WITH ML TRADING SIGNALS")
        print("=" * 60)
        
        # Step 1: Fetch data
        self.fetch_data()
        
        # Step 2: Calculate indicators
        self.calculate_technical_indicators()
        
        # Step 3: Create target variable
        self.create_target_variable()
        
        # Step 4: Train model
        accuracy = self.train_model()
        
        # Step 5: Generate signals
        signal = self.generate_signals()
        
        # Step 6: Display results
        print("\n" + "=" * 60)
        print("TRADING SIGNAL RESULTS")
        print("=" * 60)
        print(f"Symbol: {signal['symbol']}")
        print(f"Current Price: ₹{signal['current_price']:.2f}")
        print(f"Price Change: {signal['price_change_pct']:.2f}%")
        print(f"RSI: {signal['rsi']:.2f}")
        print(f"MACD Histogram: {signal['macd_histogram']:.4f}")
        print(f"Signal: {signal['signal']}")
        print(f"Confidence: {signal['confidence']:.2%}")
        print(f"Reason: {signal['reason']}")
        print(f"Analysis Time: {signal['timestamp']}")
        
        # Step 7: Create visualization
        self.plot_analysis()
        
        return signal

# Run the analysis
if __name__ == "__main__":
    analyzer = TataMotorsAnalyzer()
    signal = analyzer.run_full_analysis()
    
    # Save results to CSV
    result_df = pd.DataFrame([signal])
    result_df.to_csv('tatamotors_trading_signal.csv', index=False)
    print("\nResults saved to 'tatamotors_trading_signal.csv'")