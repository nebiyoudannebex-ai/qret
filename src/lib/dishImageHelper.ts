// Utility for matching and generating accurate dish images based on dish name and category
export const DISH_IMAGE_MAP: Array<{ keywords: string[]; url: string }> = [
  // Ethiopian Dishes
  {
    keywords: ["tibs", "beef tibs", "shekla tibs", "key tibs", "zilzil tibs", "lamb tibs", "chiko"],
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" // Sizzled meat tibs
  },
  {
    keywords: ["doro", "doro wat", "doro wot", "chicken stew", "chicken wat", "ye doro"],
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" // Chicken stew with egg
  },
  {
    keywords: ["kitfo", "gored gored", "raw beef", "teraye", "lebleb"],
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" // Spiced beef kitfo
  },
  {
    keywords: ["shiro", "shiro tegabino", "shiro wat", "shiro wot", "chickpea"],
    url: "https://images.unsplash.com/photo-1541518763669-27fef04b14e8?auto=format&fit=crop&w=800&q=80" // Shiro stew pot
  },
  {
    keywords: ["beyaynetu", "yetsom", "veggie combo", "vegetable combo", "fasting combo", "gomen", "atkilt", "misir"],
    url: "https://images.unsplash.com/photo-1541518763669-27fef04b14e8?auto=format&fit=crop&w=800&q=80" // Ethiopian veggie platter
  },
  {
    keywords: ["firfir", "fitfit", "tibs firfir", "quanta firfir", "kinche", "chechebsa"],
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80" // Firfir / spiced bread
  },

  // Western & Fast Food
  {
    keywords: ["burger", "cheeseburger", "beef burger", "chicken burger", "double burger"],
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["pizza", "margherita", "pepperoni", "cheese pizza", "calzone"],
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["pasta", "spaghetti", "lasagna", "macaroni", "penne", "bolognese", "carbonara"],
    url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281273?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["steak", "ribeye", "grilled beef", "beef steak", "fillet"],
    url: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["chicken", "fried chicken", "grilled chicken", "wings", "nuggets", "roasted chicken"],
    url: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["fish", "asa", "fried fish", "grilled fish", "fish cutlet", "salmon"],
    url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["fries", "french fries", "chips", "potato wedges"],
    url: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["salad", "caesar", "greek salad", "green salad", "garden salad"],
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["soup", "broth", "cream soup", "vegetable soup"],
    url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },

  // Drinks & Beverages
  {
    keywords: ["coffee", "buna", "espresso", "macchiato", "cappuccino", "latte", "highland coffee"],
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["tea", "chai", "black tea", "green tea", "spiced tea"],
    url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["juice", "spris", "mango juice", "avocado juice", "papaya", "smoothie"],
    url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["beer", "st george", "habesha", "walya", "draft", "heineken", "lager"],
    url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["tej", "honey wine", "wine", "red wine", "white wine"],
    url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["water", "ambo", "mineral water", "sparkling water", "bottled water"],
    url: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80"
  },
  {
    keywords: ["soda", "coca cola", "coke", "fanta", "sprite", "soft drink", "pepsi"],
    url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80"
  }
];

// Image lookup disabled. Return empty string to indicate no image.
export function getDishImageUrl(dishName: string, category: string = ""): string {
  return "";
}
