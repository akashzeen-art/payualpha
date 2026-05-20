#!/bin/bash

# Convert Food Theme to Yoga Theme
# Run this script from the project root

echo "Converting project from Food theme to Yoga theme..."

# Find all TypeScript/JavaScript files
find ./client -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i '' \
  -e 's/TheCookStudio/ThEYogaStudio/g' \
  -e 's/Recipes/Classes/g' \
  -e 's/recipes/classes/g' \
  -e 's/Recipe/Class/g' \
  -e 's/recipe/class/g' \
  -e 's/Cuisines/Styles/g' \
  -e 's/cuisines/styles/g' \
  -e 's/Cuisine/Style/g' \
  -e 's/cuisine/style/g' \
  -e 's/Chef/Instructor/g' \
  -e 's/chef/instructor/g' \
  -e 's/Cooking/Practice/g' \
  -e 's/cooking/practice/g' \
  -e 's/Kitchen/Studio/g' \
  -e 's/kitchen/studio/g' \
  -e 's/Meals/Sessions/g' \
  -e 's/meals/sessions/g' \
  -e 's/Food/Yoga/g' \
  -e 's/food/yoga/g' \
  -e 's/Culinary/Yoga/g' \
  -e 's/culinary/yoga/g' \
  -e 's/EatMe/YogaFlow/g' \
  -e 's/bg-food-cream/bg-yoga-cream/g' \
  -e 's/bg-food-brown/bg-yoga-purple/g' \
  -e 's/text-food-brown/text-purple-600/g' \
  -e 's/text-red-500/text-purple-500/g' \
  -e 's/from-red-600 to-red-500/from-purple-600 to-purple-500/g' \
  -e 's/bg-red-500/bg-purple-500/g' \
  -e 's/bg-red-600/bg-purple-600/g' \
  -e 's/border-red-500/border-purple-500/g' \
  -e 's/border-red-600/border-purple-600/g' \
  -e 's/hover:bg-red-600/hover:bg-purple-600/g' \
  -e 's/hover:border-red-600/hover:border-purple-600/g' \
  -e 's/shadow-red-500/shadow-purple-500/g' \
  -e 's/hover:text-red-400/hover:text-purple-400/g' \
  {} \;

echo "Conversion complete!"
echo "Note: You may need to manually update some emojis and specific content."
