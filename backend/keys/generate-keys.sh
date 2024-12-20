#!/bin/bash

# Generate the private key and encode it in base64 without writing to disk
PRIVATE_KEY_BASE64=$(openssl genrsa 2048 | base64 -w 0)

# Extract the public key from the private key and encode it in base64
PUBLIC_KEY_BASE64=$(echo "$PRIVATE_KEY_BASE64" | base64 -d | openssl rsa -pubout 2>/dev/null | base64 -w 0)

# Output the keys in JWK string format
echo "Private Key:"
echo "$PRIVATE_KEY_BASE64" | base64 -d | openssl rsa -text
echo ""
echo "Public Key:"
echo "$PUBLIC_KEY_BASE64" | base64 -d | openssl rsa -pubin -pubout -text

# Output the base64-encoded keys
echo "Base64-encoded Private Key:"
echo "$PRIVATE_KEY_BASE64"
echo ""
echo "Base64-encoded Public Key:"
echo "$PUBLIC_KEY_BASE64"

# Optional: Output instructions for environment variable setup
echo ""
echo "To use these keys in your environment, add the following lines to your CI/CD pipeline or .env file:"
echo "JWT_PRIVATE_KEY=\"$PRIVATE_KEY_BASE64\""
echo "JWT_PUBLIC_KEY=\"$PUBLIC_KEY_BASE64\""