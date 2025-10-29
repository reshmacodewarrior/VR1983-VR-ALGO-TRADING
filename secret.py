import secrets

# Generate secure random keys
secret_key = secrets.token_urlsafe(32)
refresh_secret_key = secrets.token_urlsafe(32)

print("SECRET_KEY=" + secret_key)
print("REFRESH_SECRET_KEY=" + refresh_secret_key)