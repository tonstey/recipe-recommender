import math
import ast

def default_if_nan(value, default):
    return default if (isinstance(value, float) and math.isnan(value)) else value

def convert_recipes(recipe_info):
    recipe_info['name'] = str(default_if_nan(recipe_info['name'], ""))
    recipe_info['id'] = int(default_if_nan(recipe_info['id'], 0))
    recipe_info['minutes'] = int(default_if_nan(recipe_info['minutes'], 0))
    recipe_info['tags'] = ast.literal_eval(default_if_nan(recipe_info['tags'], []))
    recipe_info['nutrition'] = ast.literal_eval(default_if_nan(recipe_info['nutrition'], []))
    recipe_info['n_steps'] = int(default_if_nan(recipe_info['n_steps'], 0))
    recipe_info['steps'] = ast.literal_eval(default_if_nan(recipe_info['steps'], []))
    recipe_info['description'] = str(default_if_nan(recipe_info['description'], ""))
    recipe_info['ingredients'] = ast.literal_eval(default_if_nan(recipe_info['ingredients'], []))
    recipe_info['n_ingredients'] = int(default_if_nan(recipe_info['n_ingredients'], 0))

    return recipe_info