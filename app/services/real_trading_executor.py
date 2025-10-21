import pandas as pd
import yfinance as yf

# === Step 1: Load Excel file ===
file_path = "weekly (1).xlsx"   # adjust path if needed
df = pd.read_excel(file_path, sheet_name="Sheet1")

# === Step 2: Clean and standardize column names ===
df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]

# Handle potential naming mismatches
if "stock_name" not in df.columns and "stock name" in df.columns:
    df.rename(columns={"stock name": "stock_name"}, inplace=True)
if "levels" not in df.columns and "level" in df.columns:
    df.rename(columns={"level": "levels"}, inplace=True)

# === Step 3: Fetch current prices using Yahoo Finance ===
current_prices = []

for stock in df["stock_name"]:
    try:
        # Yahoo Finance usually uses ".NS" for NSE stocks
        ticker = stock.strip().upper()
        if not ticker.endswith(".NS"):
            ticker += ".NS"

        data = yf.Ticker(ticker).history(period="1d")
        if not data.empty:
            current_price = data["Close"].iloc[-1]
        else:
            current_price = None
            print(f"⚠️ No data for {stock}")
    except Exception as e:
        current_price = None
        print(f"⚠️ Could not fetch price for {stock}: {e}")

    current_prices.append(current_price)

# === Step 4: Add calculated columns ===
df["current_price"] = current_prices
df["profit_loss"] = df["current_price"] - df["levels"]
df["percent_change"] = (df["profit_loss"] / df["levels"]) * 100

# === Step 5: Save the new Excel file ===
output_path = "weekly_with_current_price_yahoo.xlsx"
df.to_excel(output_path, index=False)

print(f"✅ Updated Excel saved as '{output_path}'")
print("Columns added: current_price, profit_loss, percent_change")
