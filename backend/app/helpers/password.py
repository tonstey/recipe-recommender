import re

def password_checklist(password: str) -> tuple[bool, str]:
  if len(password) < 8 or len(password) > 100:
      return False, "Password is not between 8 and 100 characters long."
  
  # No spaces
  if re.search(r"\s", password):
      return False, "Password contains a space character."

  # At least 1 Uppercase
  if not re.search(r"[A-Z]", password):
      return False, "Password is missing an uppercase letter."
  
  # At least 1 Lowercase
  if not re.search(r"[a-z]", password):
      return False, "Password is missing a lowercase letter."
  
  # At least 1 Digit
  if not re.search(r"\d", password):
      return False, "Password is missing a digit."
  
  # At least 1 Special Character
  if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>/?]", password):
      return False, "Password is missing a special character."

  return True, "Strong password"