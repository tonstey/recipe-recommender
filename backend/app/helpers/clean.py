import math

def default_if_nan(value, default):
    return default if (isinstance(value, float) and math.isnan(value)) else value