from fastapi import APIRouter, Depends, logger
from datetime import datetime
from app.schemas.user import UserInDB
from app.services.storage import trading_signals  # 👈 shared signals
from app.services.storage import user_trading_signals
from app.services.user import get_current_user
from services.enhanced_algorithm import enhanced_trading_algorithm


router = APIRouter(prefix="/api", tags=["signals"])



@router.get("/signals")
async def get_signals():
    return {
        "signals": trading_signals,
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/api/user/generate-signals")
async def generate_user_signals(current_user: UserInDB = Depends(get_current_user)):
    """Generate fresh trading signals for the current user's watchlist"""
    try:
        user_watchlist = current_user.watchlist or []
        
        if not user_watchlist:
            return {
                "success": False,
                "message": "Your watchlist is empty. Add stocks to generate signals."
            }
        
        user_signals = []
        
        # Generate signals for each stock in user's watchlist
        for symbol in user_watchlist:
            decision = enhanced_trading_algorithm(symbol)
            
            if decision and decision.get('signal') != 'HOLD':
                # Add user-specific information
                decision['user_email'] = current_user.email
                decision['user_id'] = str(current_user.id)
                decision['for_user'] = True
                user_signals.append(decision)
        
        # Store the signals
        if user_signals:
            timestamp = datetime.utcnow().isoformat()
            user_signal_data = {
                'user_email': current_user.email,
                'signals': user_signals,
                'generated_at': timestamp,
                'signal_count': len(user_signals)
            }
            await user_trading_signals.insert_one(user_signal_data)
            
            return {
                "success": True,
                "signals": user_signals,
                "generated_at": timestamp,
                "message": f"Generated {len(user_signals)} trading signals"
            }
        else:
            return {
                "success": True,
                "signals": [],
                "message": "No strong trading signals found for your watchlist at this time"
            }
            
    except Exception as e:
        logger.error(f"Error generating user signals: {e}")
        return {
            "success": False,
            "error": "Failed to generate signals"
        }

@router.get("/api/user/signals")
async def get_user_signals(current_user: UserInDB = Depends(get_current_user)):
    """Get latest trading signals for the current user"""
    try:
        # Get latest signals for this user
        user_signals = await user_trading_signals.find({
            "user_email": current_user.email
        }).sort("generated_at", -1).limit(1).to_list(length=1)
        
        if user_signals:
            return {
                "success": True,
                "signals": user_signals[0]['signals'],
                "generated_at": user_signals[0]['generated_at'],
                "user_email": current_user.email
            }
        else:
            return {
                "success": True,
                "signals": [],
                "message": "No signals generated yet for your watchlist",
                "user_email": current_user.email
            }
            
    except Exception as e:
        logger.error(f"Error fetching user signals: {e}")
        return {
            "success": False,
            "error": "Failed to fetch signals"
        }