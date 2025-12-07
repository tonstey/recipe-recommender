import hashlib

def hashToken(token:str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()