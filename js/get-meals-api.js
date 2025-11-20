/* ========================================
   YUMMY - API SERVICE MODULE
   TheMealDB API integration
   ======================================== */

// ========== API CONFIGURATION ==========
// Base URL for all API requests
let baseURL = "https://www.themealdb.com/api/json/v1/1";

// ========== MEAL LOOKUP FUNCTIONS ==========

/**
 * Get detailed information about a specific meal by its ID
 * @param {string} mealID - The unique meal identifier
 * @returns {Object|null} Meal object with full details or null if error
 */
const getMealDetails = async (mealID) => {
  try {
    let response = await fetch(`${baseURL}/lookup.php?i=${mealID}`);
    let data = await response.json();
    return data.meals[0];
  } catch (err) {
    console.log("error getMealDetails: ==>", err);
  }
};

// ========== SEARCH FUNCTIONS ==========

/**
 * Search for meals by name (supports partial matches)
 * @param {string} mealName - Full or partial meal name to search for
 * @returns {Array|null} Array of matching meals or null if error
 */
const getMealByName = async (mealName) => {
  try {
    let response = await fetch(`${baseURL}/search.php?s=${mealName}`);
    let data = await response.json();
    return data.meals;
  } catch (err) {
    console.log("error getMealByName: ==>", err);
  }
};

/**
 * Search for meals by first letter
 * @param {string} fLetter - Single letter to search by (a-z)
 * @returns {Array|null} Array of meals starting with the letter or null if error
 */
const getMealByFLetter = async (fLetter) => {
  try {
    let response = await fetch(`${baseURL}/search.php?f=${fLetter}`);
    let data = await response.json();
    console.log(data.meals);
    return data.meals;
  } catch (err) {
    console.log("error getMealByFLetter: ==>", err);
  }
};

// ========== CATEGORY FUNCTIONS ==========

/**
 * Get all available meal categories
 * @returns {Array|null} Array of category objects or null if error
 */
const getListCategories = async () => {
  try {
    let response = await fetch(`${baseURL}/categories.php`);
    let data = await response.json();
    return data.categories;
  } catch (err) {
    console.log("error getListCategories: ==>", err);
  }
};

/**
 * Get meals filtered by category (limited to 20 results)
 * @param {string} category - Category name (e.g., "Seafood", "Dessert")
 * @returns {Array|null} Array of up to 20 meals or null if error
 */
const getCategoryMeals = async (category) => {
  try {
    let response = await fetch(`${baseURL}/filter.php?c=${category}`);
    let data = await response.json();
    return data.meals.slice(0, 20); // Limit to 20 meals for performance
  } catch (err) {
    console.log("error getCategoryMeals: ==>", err);
  }
};

// ========== AREA/COUNTRY FUNCTIONS ==========

/**
 * Get all available meal areas/countries
 * @returns {Array|null} Array of area objects or null if error
 */
const getListArea = async () => {
  try {
    let response = await fetch(`${baseURL}/list.php?a=list`);
    let data = await response.json();
    return data.meals;
  } catch (err) {
    console.log("error getListArea: ==>", err);
  }
};

/**
 * Get meals filtered by area/country (limited to 20 results)
 * @param {string} area - Area/country name (e.g., "Canadian", "Italian")
 * @returns {Array|null} Array of up to 20 meals or null if error
 */
const getAreaMeals = async (area) => {
  try {
    let response = await fetch(`${baseURL}/filter.php?a=${area}`);
    let data = await response.json();
    return data.meals.slice(0, 20); // Limit to 20 meals for performance
  } catch (err) {
    console.log("error getAreaMeals: ==>", err);
  }
};

// ========== INGREDIENT FUNCTIONS ==========

/**
 * Get list of available ingredients (limited to 20 results)
 * @returns {Array|null} Array of up to 20 ingredient objects or null if error
 */
const getIngredients = async () => {
  try {
    let response = await fetch(`${baseURL}/list.php?i=list`);
    let data = await response.json();
    return data.meals.slice(0, 20); // Limit to 20 ingredients for performance
  } catch (err) {
    console.log("error getIngredients: ==>", err);
  }
};

/**
 * Get meals filtered by ingredient (limited to 20 results)
 * @param {string} ingredients - Ingredient name (e.g., "chicken_breast", "garlic")
 * @returns {Array|null} Array of up to 20 meals or null if error
 */
const getIngredientsMeals = async (ingredients) => {
  try {
    let response = await fetch(`${baseURL}/filter.php?i=${ingredients}`);
    let data = await response.json();
    return data.meals.slice(0, 20); // Limit to 20 meals for performance
  } catch (err) {
    console.log("error getIngredientsMeals: ==>", err);
  }
};

// ========== MODULE EXPORTS ==========
// Export all API functions for use in other modules
export {
  getMealDetails,
  getMealByName,
  getMealByFLetter,
  getListCategories,
  getCategoryMeals,
  getListArea,
  getAreaMeals,
  getIngredients,
  getIngredientsMeals,
};

/* ========================================
   API DOCUMENTATION REFERENCE
   ======================================== 

TheMealDB API - Using developer test key '1'

SEARCH ENDPOINTS:
-----------------
• Search meal by name:
  www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata

• List all meals by first letter:
  www.themealdb.com/api/json/v1/1/search.php?f=a

• Lookup full meal details by id:
  www.themealdb.com/api/json/v1/1/lookup.php?i=52772

• Lookup a single random meal:
  www.themealdb.com/api/json/v1/1/random.php

• Lookup 10 random meals (Paypal supporters only):
  www.themealdb.com/api/json/v1/1/randomselection.php


LIST ENDPOINTS:
---------------
• List all meal categories:
  www.themealdb.com/api/json/v1/1/categories.php

• Latest meals (Paypal supporters only):
  www.themealdb.com/api/json/v1/1/latest.php

• List all categories:
  www.themealdb.com/api/json/v1/1/list.php?c=list

• List all areas:
  www.themealdb.com/api/json/v1/1/list.php?a=list

• List all ingredients:
  www.themealdb.com/api/json/v1/1/list.php?i=list


FILTER ENDPOINTS:
-----------------
• Filter by ingredient:
  www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast

• Filter by multi-ingredient (Paypal supporters only):
  www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast,garlic,salt

• Filter by category:
  www.themealdb.com/api/json/v1/1/filter.php?c=Seafood

• Filter by area:
  www.themealdb.com/api/json/v1/1/filter.php?a=Canadian


IMAGE URLS:
-----------
• Meal thumbnail images (add /preview for smaller size):
  /images/media/meals/llcbn01574260722.jpg
  /images/media/meals/llcbn01574260722.jpg/preview

• Ingredient thumbnail images:
  www.themealdb.com/images/ingredients/Lime.png
  www.themealdb.com/images/ingredients/Lime-Small.png

======================================== */
