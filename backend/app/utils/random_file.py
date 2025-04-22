import secrets
import string

# Define the characters to use (letters + digits)
characters = string.ascii_letters + string.digits

# Generate a 36-character secure key
secret_key = ''.join(secrets.choice(characters) for _ in range(36))

print(secret_key)
