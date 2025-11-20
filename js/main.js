/* ========================================
   YUMMY - MAIN JAVASCRIPT
   Recipe search and display application
   ======================================== */

/* eslint-disable no-undef */

// ========== INITIAL PAGE LOAD ==========
// Fade out loading spinner after 500ms, then remove it and restore scrolling
document.addEventListener("DOMContentLoaded", function () {
  const loader = document.querySelector(".loading-spinner");
  if (!loader) return;

  // Wait 500ms, then start the fade (CSS transition is 500ms)
  setTimeout(() => {
    loader.classList.add("fade-out");

    // ========== APPLICATION VARIABLES ==========

    // Sidebar menu state tracker
    let sideToggle = false;

    // ========== VALIDATION REGEX PATTERNS ==========
    const nameRegex = /^[a-zA-Z]+$/; // Letters only
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // Standard email format
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/; // International phone format
    const ageRegex = /^(0?[1-9]|[1-9][0-9]|[1][1-9][1-9]|200)$/; // Age 1-200
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])[0-9a-zA-Z]{8,}$/; // Min 8 chars, 1 letter, 1 number

    // ========== DOCUMENT READY EVENT ==========
    // Initialize the application when DOM is ready
    $(document).ready(async () => {
      closeSideMenu(0); // Close menu instantly on load
      removeLoaderScreen(); // Remove loading screen
      resizeSectionWidth(); // Adjust section widths for sidebar
    });

    // ========== WINDOW READY EVENT ==========
    // Load initial meal data when window is fully loaded
    $(window).ready(async () => {
      const meals = (await getMealByName("")) || []; // Fetch all meals (empty search)
      await displayMeals(meals);
    });

    // ========== WINDOW RESIZE EVENT ==========
    // Adjust section widths when window is resized
    $(window).on("resize", resizeSectionWidth);

    // ========== MENU TOGGLE EVENT ==========
    // Toggle sidebar menu open/close
    $("#menuToggle").on("click", () => {
      sideToggle ? openSideMenu() : closeSideMenu();
    });

    // ========== NAVIGATION LINK CLICK EVENTS ==========
    // Handle navigation between different sections
    $("a.nav-link[href^='#']").on("click", async (e) => {
      e.preventDefault();
      closeSideMenu(); // Close sidebar when navigating

      const targetSection = $(e.currentTarget).attr("href");

      // Hide all sections, show target section
      $("section").fadeOut(0);
      $(`section${targetSection}`).fadeIn(0, () => {
        $("html, body").animate({ scrollTop: 0 }, 10); // Scroll to top
      });

      // Section-specific initialization
      switch (targetSection) {
        case "#search":
          $("#search .inner-loading-screen").css({ display: "none" });
          $("#searchByNameInput").val(""); // Clear search inputs
          $("#searchByFLetterInput").val("");
          $("#dataSearch").html("");
          break;
        case "#categories":
          await displayCategories();
          break;
        case "#area":
          await displayArea();
          break;
        case "#ingredients":
          await displayIngredients();
          break;
        case "#contactUs":
          handleInputsValidation(); // Setup form validation
          break;
        default:
          break;
      }
    });

    // ========== SEARCH INPUT EVENTS ==========

    // Search by meal name (real-time search)
    $("#searchByNameInput").on("keyup", async function () {
      await searchByName($(this).val());
    });

    // Search by first letter (limited to 1 character)
    $("#searchByFLetterInput").on("keyup", async function () {
      const $this = $(this);

      // Enforce max length of 1 character
      if ($this.val().length > 1) {
        $this.val($this.val().substring(0, 1));
      }

      await searchByFLetter($this.val() || "a"); // Default to 'a' if empty
    });

    // ========== UTILITY FUNCTIONS ==========

    // ========== UTILITY FUNCTIONS ==========

    /**
     * Remove the initial loading screen with fade effect
     */
    function removeLoaderScreen() {
      const $loader = $(".loading-spinner");
      if (!$loader.length) return;

      $loader.fadeOut(500, () => {
        $("body").css("overflow", "visible"); // Restore scrolling
      });
    }

    /**
     * Open the sidebar menu with animation
     */
    function openSideMenu() {
      $(".side-menu").animate({ left: 0 }, 500);
      $("#menuToggle").removeClass("fa-bars").addClass("fa-xmark"); // Change icon to X

      // Animate menu items with staggered delay
      $(".nav .nav-item").each(function (index) {
        $(this).animate({ opacity: 1, top: 0 }, (index + 5) * 100);
      });

      sideToggle = !sideToggle;
    }

    /**
     * Close the sidebar menu with animation
     * @param {number} duration - Animation duration in milliseconds (default: 500)
     */
    function closeSideMenu(duration = 500) {
      const navTabWidth = $(".nav-tab").outerWidth();
      $(".side-menu").animate({ left: -navTabWidth }, duration);
      $("#menuToggle").removeClass("fa-xmark").addClass("fa-bars"); // Change icon to bars

      // Hide menu items
      $(".nav .nav-item").each(function () {
        $(this).animate({ opacity: 0, top: 300 }, 500);
      });

      sideToggle = !sideToggle;
    }

    /**
     * Adjust section widths based on sidebar width
     * Ensures content doesn't overlap with fixed sidebar
     */
    function resizeSectionWidth() {
      const navHeaderWidth = $(".nav-header").outerWidth();
      const newWidth = $("body").width() - navHeaderWidth;
      $("section").css({ maxWidth: newWidth, width: newWidth });
    }

    // ========== FORM VALIDATION FUNCTIONS ==========

    /**
     * Validate name input (letters only)
     */
    const validateName = (input, alertDiv) => {
      const name = input.value.trim();

      if (name === "") {
        $(alertDiv).text("Username is required.").removeClass("d-none");
      } else if (nameRegex.test(name)) {
        $(alertDiv).text("").addClass("d-none");
        return true;
      } else {
        $(alertDiv)
          .text("Special characters and numbers not allowed.")
          .removeClass("d-none");
      }

      return false;
    };

    /**
     * Validate email input
     */
    const validateEmail = (input, alertDiv) => {
      const email = input.value.trim();

      if (email === "") {
        $(alertDiv).text("Email is required.").removeClass("d-none");
      } else if (emailRegex.test(email)) {
        $(alertDiv).text("").addClass("d-none");
        return true;
      } else {
        $(alertDiv)
          .text("Email not valid *example@yyy.zzz")
          .removeClass("d-none");
      }

      return false;
    };

    /**
     * Validate phone number input
     */
    const validatePhone = (input, alertDiv) => {
      const phone = input.value.trim();

      if (phone === "") {
        $(alertDiv).text("Phone is required.").removeClass("d-none");
      } else if (phoneRegex.test(phone)) {
        $(alertDiv).text("").addClass("d-none");
        return true;
      } else {
        $(alertDiv).text("Enter valid Phone Number").removeClass("d-none");
      }

      return false;
    };

    /**
     * Validate age input (1-200)
     */
    const validateAge = (input, alertDiv) => {
      const age = input.value.trim();

      if (age === "") {
        $(alertDiv).text("Your age is required.").removeClass("d-none");
      } else if (ageRegex.test(age)) {
        $(alertDiv).text("").addClass("d-none");
        return true;
      } else {
        $(alertDiv).text("Enter valid age.").removeClass("d-none");
      }

      return false;
    };

    /**
     * Validate password (min 8 chars, at least 1 letter and 1 number)
     */
    const validatePassword = (input, alertDiv) => {
      const password = input.value.trim();

      if (password === "") {
        $(alertDiv).text("Password is required.").removeClass("d-none");
      } else if (passwordRegex.test(password)) {
        $(alertDiv).text("").addClass("d-none");
        return true;
      } else {
        $(alertDiv)
          .text(
            "Enter valid password *Minimum eight characters, at least one letter and one number:*"
          )
          .removeClass("d-none");
      }

      return false;
    };

    /**
     * Validate password confirmation matches original password
     */
    const validateRepassword = (input, password, alertDiv) => {
      const repassword = $(input).val().trim();

      if (repassword === "") {
        $(alertDiv).text("Repassword is required.").removeClass("d-none");
      } else if (repassword !== password) {
        $(alertDiv).text("Enter valid repassword").removeClass("d-none");
      } else {
        $(alertDiv).text("").addClass("d-none");
        return true;
      }

      return false;
    };

    /**
     * Setup real-time validation for all contact form inputs
     */
    /**
     * Setup real-time validation for all contact form inputs
     */
    function handleInputsValidation() {
      // Validation state flags
      let nameValid = false;
      let emailValid = false;
      let phoneValid = false;
      let ageValid = false;
      let passwordValid = false;
      let repasswordValid = false;

      clearInputs(); // Clear form on initialization

      // Name input validation
      $("#contactUs #nameInput")
        .off("keyup")
        .on("keyup", function () {
          const nameAlert = $("#contactUs #nameAlert");
          nameValid = validateName(this, nameAlert);
          validateForm(
            nameValid,
            emailValid,
            phoneValid,
            ageValid,
            passwordValid,
            repasswordValid
          );
        });

      // Email input validation
      $("#contactUs #emailInput")
        .off("keyup")
        .on("keyup", function () {
          const emailAlert = $("#contactUs #emailAlert");
          emailValid = validateEmail(this, emailAlert);
          validateForm(
            nameValid,
            emailValid,
            phoneValid,
            ageValid,
            passwordValid,
            repasswordValid
          );
        });

      // Phone input validation
      $("#contactUs #phoneInput")
        .off("keyup")
        .on("keyup", function () {
          const phoneAlert = $("#contactUs #phoneAlert");
          phoneValid = validatePhone(this, phoneAlert);
          validateForm(
            nameValid,
            emailValid,
            phoneValid,
            ageValid,
            passwordValid,
            repasswordValid
          );
        });

      // Age input validation
      $("#contactUs #ageInput")
        .off("keyup")
        .on("keyup", function () {
          const ageAlert = $("#contactUs #ageAlert");
          ageValid = validateAge(this, ageAlert);
          validateForm(
            nameValid,
            emailValid,
            phoneValid,
            ageValid,
            passwordValid,
            repasswordValid
          );
        });

      // Password input validation
      $("#contactUs #passwordInput")
        .off("keyup")
        .on("keyup", function () {
          const passwordAlert = $("#contactUs #passwordAlert");
          passwordValid = validatePassword(this, passwordAlert);
          validateForm(
            nameValid,
            emailValid,
            phoneValid,
            ageValid,
            passwordValid,
            repasswordValid
          );
        });

      // Re-password input validation
      $("#contactUs #repasswordInput")
        .off("keyup")
        .on("keyup", function () {
          const passwordInputValue = $("#contactUs #passwordInput")
            .val()
            .trim();
          const repasswordAlert = $("#contactUs #repasswordAlert");
          repasswordValid = validateRepassword(
            this,
            passwordInputValue,
            repasswordAlert
          );
          validateForm(
            nameValid,
            emailValid,
            phoneValid,
            ageValid,
            passwordValid,
            repasswordValid
          );
        });
    }

    /**
     * Enable/disable submit button based on form validity
     */
    function validateForm(
      nameValid,
      emailValid,
      phoneValid,
      ageValid,
      passwordValid,
      repasswordValid
    ) {
      const $submit = $("#submitBtn");
      $submit.off("click");

      // Enable submit button only if all fields are valid
      if (
        nameValid &&
        emailValid &&
        phoneValid &&
        ageValid &&
        passwordValid &&
        repasswordValid
      ) {
        $submit.prop("disabled", false).on("click", submitContact);
      } else {
        $submit.prop("disabled", true);
      }
    }

    /**
     * Clear all contact form inputs and alerts
     */
    function clearInputs() {
      $("#contactUs input").each(function () {
        $(this).val("");
      });

      $("#contactUs .alert").each(function () {
        $(this).addClass("d-none");
      });
    }

    /**
     * Handle form submission
     */
    function submitContact() {
      clearInputs();
      alert(
        "Your message has been successfully submitted. We will get back to you shortly."
      );
    }

    // ========== SEARCH FUNCTIONS ==========

    /**
     * Search for meals by name and display results
     * @param {string} mealName - The name to search for
     */
    // ========== SEARCH FUNCTIONS ==========

    /**
     * Search for meals by name and display results
     * @param {string} mealName - The name to search for
     */
    async function searchByName(mealName) {
      $("#dataSearch").html(" ");
      $("#search .inner-loading-screen").css({ display: "flex" });

      const arr = (await getMealByName(mealName)) || [];
      let htmlContent = "";

      // Build meal cards HTML
      arr.forEach((item) => {
        htmlContent += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="meal-details meal position-relative overflow-hidden rounded-2 cursor-pointer" data-id="${item.idMeal}">
          <img loading="lazy" class="w-100" src="${item.strMealThumb}" alt="${item.strMeal}">
          <div class="meal-layer position-absolute d-flex align-items-center text-black p-2"><h3>${item.strMeal}</h3></div>
        </div>
      </div>`;
      });

      $("#dataSearch").html(htmlContent);

      // Hide loader and attach click events
      $("#search .inner-loading-screen").fadeOut(500, () => {
        $(".meal")
          .off("click")
          .on("click", async function () {
            const mealId = $(this).data("id");
            const mealsdetails = await getMealDetails(mealId);
            await displayMealDetails(mealsdetails);
          });
      });
    }

    /**
     * Search for meals by first letter and display results
     * @param {string} fLetter - The first letter to search for
     */
    async function searchByFLetter(fLetter) {
      $("#dataSearch").html(" ");
      $("#search .inner-loading-screen").css({ display: "flex" });

      const arr = (await getMealByFLetter(fLetter)) || [];
      let htmlContent = "";

      // Build meal cards HTML
      arr.forEach((item) => {
        htmlContent += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="meal-details meal position-relative overflow-hidden rounded-2 cursor-pointer" data-id="${item.idMeal}">
          <img loading="lazy" class="w-100" src="${item.strMealThumb}" alt="${item.strMeal}">
          <div class="meal-layer position-absolute d-flex align-items-center text-black p-2"><h3>${item.strMeal}</h3></div>
        </div>
      </div>`;
      });

      $("#dataSearch").html(htmlContent);

      // Hide loader and attach click events
      $("#search .inner-loading-screen").fadeOut(500, () => {
        $(".meal")
          .off("click")
          .on("click", async function () {
            const mealId = $(this).data("id");
            const mealsdetails = await getMealDetails(mealId);
            await displayMealDetails(mealsdetails);
          });
      });
    }

    // ========== DISPLAY FUNCTIONS ==========

    /**
     * Fetch and display all meal categories
     */
    // ========== DISPLAY FUNCTIONS ==========

    /**
     * Fetch and display all meal categories
     */
    async function displayCategories() {
      $("#categories .inner-loading-screen").css({ display: "flex" });
      $("#dataCategories").html("");

      const arr = (await getListCategories()) || [];
      let htmlContent = "";

      // Build category cards HTML with truncated descriptions
      arr.forEach((item) => {
        htmlContent += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="meal h-100 position-relative overflow-hidden rounded-2 cursor-pointer" data-category="${
          item.strCategory
        }">
          <img loading="lazy" class="d-block w-100" src="${
            item.strCategoryThumb
          }" alt="${item.strCategory}">
          <div class="meal-layer position-absolute text-center text-black p-2 overflow-hidden">
            <h3>${item.strCategory}</h3>
            <p>${item.strCategoryDescription
              .split(" ")
              .slice(0, 20)
              .join(" ")}..</p>
          </div>
        </div>
      </div>`;
      });

      $("#dataCategories").html(htmlContent);

      // Hide loader and attach click events to fetch meals by category
      $("#categories .inner-loading-screen").fadeOut(500, () => {
        $(".meal")
          .off("click")
          .on("click", async function () {
            const catName = $(this).data("category");
            const mealsList = (await getCategoryMeals(catName)) || [];
            await displayMeals(mealsList);
          });
      });
    }

    /**
     * Fetch and display all available areas/countries
     */
    async function displayArea() {
      $("#area .inner-loading-screen").css({ display: "flex" });
      $("#dataArea").html("");

      const arr = (await getListArea()) || [];
      let htmlContent = "";

      // Build area cards HTML
      arr.forEach((item) => {
        htmlContent += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="area rounded-2 text-center cursor-pointer" data-area="${item.strArea}">
          <i class="fa-solid fa-house-laptop icon-area"></i>
          <h3>${item.strArea}</h3>
        </div>
      </div>`;
      });

      $("#dataArea").html(htmlContent);

      // Hide loader and attach click events to fetch meals by area
      $("#area .inner-loading-screen").fadeOut(500, () => {
        $(".area")
          .off("click")
          .on("click", async function () {
            const areaName = $(this).data("area");
            const mealsList = (await getAreaMeals(areaName)) || [];
            await displayMeals(mealsList);
          });
      });
    }

    /**
     * Fetch and display meal ingredients (limited to 20)
     */
    async function displayIngredients() {
      $("#ingredients .inner-loading-screen").css({ display: "flex" });
      $("#dataIngredients").html(" ");

      const arr = (await getIngredients()) || [];
      let htmlContent = "";

      // Build ingredient cards HTML with truncated descriptions
      arr.forEach((item) => {
        htmlContent += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="ingredient h-100 p-1 rounded-2 text-center cursor-pointer" data-ingredients="${
          item.strIngredient
        }">
          <i class="fa-solid fa-drumstick-bite icon-ingredients"></i>
          <h3 class="fs-3 mt-2">${item.strIngredient}</h3>
          <p class="mb-auto">${item.strDescription
            .split(" ")
            .slice(0, 20)
            .join(" ")}..</p>
        </div>
      </div>`;
      });

      $("#dataIngredients").html(htmlContent);

      // Hide loader and attach click events to fetch meals by ingredient
      $("#ingredients .inner-loading-screen").fadeOut(500, () => {
        $(".ingredient")
          .off("click")
          .on("click", async function () {
            const ingredientName = $(this).data("ingredients");
            const mealsList = (await getIngredientsMeals(ingredientName)) || [];
            await displayMeals(mealsList);
          });
      });
    }

    /**
     * Display a list of meals in the main meals section
     * @param {Array} arr - Array of meal objects to display
     */
    /**
     * Display a list of meals in the main meals section
     * @param {Array} arr - Array of meal objects to display
     */
    async function displayMeals(arr) {
      const items = arr || [];
      $("#meals .inner-loading-screen").css({ display: "flex" });
      $("#dataMeals").html("");

      // Switch to meals section with fade effect
      $("section").fadeOut(10, () => {
        $("#meals").fadeIn(100);
      });
      $("html, body").animate({ scrollTop: 0 });

      let htmlContent = "";

      // Build meal cards HTML
      items.forEach((item) => {
        htmlContent += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="meal-details meal position-relative overflow-hidden rounded-2 cursor-pointer" data-id="${item.idMeal}">
          <img loading="lazy" class="w-100" src="${item.strMealThumb}" alt="${item.strMeal}">
          <div class="meal-layer position-absolute d-flex align-items-center text-black p-2"><h3>${item.strMeal}</h3></div>
        </div>
      </div>`;
      });

      $("#dataMeals").html(htmlContent);

      // Hide loader and attach click events to view meal details
      $("#meals .inner-loading-screen").fadeOut(500, () => {
        $(".meal")
          .off("click")
          .on("click", async function () {
            const mealId = $(this).data("id");
            const mealsdetails = await getMealDetails(mealId);
            await displayMealDetails(mealsdetails);
          });
      });
    }

    /**
     * Display detailed information about a specific meal
     * @param {Object} meal - Meal object containing all details
     */
    async function displayMealDetails(meal) {
      if (!meal) return;

      $("#mealsDetails .inner-loading-screen").css({ display: "flex" });
      $("#dataMealsDetails").html("");

      // Switch to meal details section with fade effect
      $("section").fadeOut(10, () => {
        $("#mealsDetails").fadeIn(100);
      });
      $("html, body").animate({ scrollTop: 0 });

      // Build ingredients list (API provides up to 20 ingredients)
      let ingredients = "";
      for (let i = 1; i <= 20; i += 1) {
        if (meal[`strIngredient${i}`]) {
          ingredients += `<li class="alert alert-info m-2 p-1">${
            meal[`strMeasure${i}`]
          } ${meal[`strIngredient${i}`]}</li>`;
        }
      }

      // Build tags list (comma-separated tags from API)
      let tagsStr = "";
      const tags = meal.strTags?.split(",") || [];
      tags.forEach((tag) => {
        tagsStr += `<li class="alert alert-danger m-2 p-1">${tag}</li>`;
      });

      // Build complete meal details HTML
      const htmlContent = `
    <div class="col-md-4">
      <img loading="lazy" class="d-block w-100 rounded-3" src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h2>${meal.strMeal}</h2>
    </div>
    <div class="col-md-8">
      <h2>Instructions</h2>
      <p>${meal.strInstructions}</p>
      <h3><span class="fw-bolder">Area : </span>${meal.strArea}</h3>
      <h3><span class="fw-bolder">Category : </span>${meal.strCategory}</h3>
      <h3>Recipes :</h3>
      <ul class="list-unstyled d-flex g-3 flex-wrap">
        ${ingredients}
      </ul>
      <h3>Tags :</h3>
      <ul class="list-unstyled d-flex g-3 flex-wrap">
        ${tagsStr}
      </ul>
      <a target="_blank" rel="noreferrer" href="${meal.strSource}" class="btn btn-success">Source</a>
      <a target="_blank" rel="noreferrer" href="${meal.strYoutube}" class="btn btn-danger">Youtube</a>
    </div>`;

      $("#dataMealsDetails").html(htmlContent);
      $("#mealsDetails .inner-loading-screen").fadeOut(500);
    }

    // ========== API FUNCTIONS ==========
    // Base URL for TheMealDB API
    const baseURL = "https://www.themealdb.com/api/json/v1/1";

    /**
     * Fetch detailed information about a specific meal by ID
     * @param {string} mealID - The unique meal ID
     * @returns {Object|null} Meal object or null if error/not found
     */
    async function getMealDetails(mealID) {
      try {
        const response = await fetch(`${baseURL}/lookup.php?i=${mealID}`);
        const data = await response.json();
        return data.meals?.[0] || null; // Return first meal or null
      } catch (err) {
        console.error("error getMealDetails: ==>", err);
        return null;
      }
    }

    /**
     * Search for meals by name
     * @param {string} mealName - Name or partial name of meal
     * @returns {Array} Array of matching meals or empty array
     */
    async function getMealByName(mealName) {
      try {
        const response = await fetch(`${baseURL}/search.php?s=${mealName}`);
        const data = await response.json();
        return data.meals || [];
      } catch (err) {
        console.error("error getMealByName: ==>", err);
        return [];
      }
    }

    /**
     * Search for meals by first letter
     * @param {string} fLetter - Single letter to search by
     * @returns {Array} Array of matching meals or empty array
     */
    async function getMealByFLetter(fLetter) {
      try {
        const response = await fetch(`${baseURL}/search.php?f=${fLetter}`);
        const data = await response.json();
        return data.meals || [];
      } catch (err) {
        console.error("error getMealByFLetter: ==>", err);
        return [];
      }
    }

    /**
     * Fetch all available meal categories
     * @returns {Array} Array of category objects or empty array
     */
    async function getListCategories() {
      try {
        const response = await fetch(`${baseURL}/categories.php`);
        const data = await response.json();
        return data.categories || [];
      } catch (err) {
        console.error("error getListCategories: ==>", err);
        return [];
      }
    }

    /**
     * Fetch meals by category (limited to 20 results)
     * @param {string} category - Category name
     * @returns {Array} Array of meals or empty array
     */
    async function getCategoryMeals(category) {
      try {
        const response = await fetch(`${baseURL}/filter.php?c=${category}`);
        const data = await response.json();
        return (data.meals || []).slice(0, 20); // Limit to 20 meals
      } catch (err) {
        console.error("error getCategoryMeals: ==>", err);
        return [];
      }
    }

    /**
     * Fetch all available areas/countries
     * @returns {Array} Array of area objects or empty array
     */
    async function getListArea() {
      try {
        const response = await fetch(`${baseURL}/list.php?a=list`);
        const data = await response.json();
        return data.meals || [];
      } catch (err) {
        console.error("error getListArea: ==>", err);
        return [];
      }
    }

    /**
     * Fetch meals by area/country (limited to 20 results)
     * @param {string} area - Area/country name
     * @returns {Array} Array of meals or empty array
     */
    async function getAreaMeals(area) {
      try {
        const response = await fetch(`${baseURL}/filter.php?a=${area}`);
        const data = await response.json();
        return (data.meals || []).slice(0, 20); // Limit to 20 meals
      } catch (err) {
        console.error("error getAreaMeals: ==>", err);
        return [];
      }
    }

    /**
     * Fetch list of ingredients (limited to 20 results)
     * @returns {Array} Array of ingredient objects or empty array
     */
    async function getIngredients() {
      try {
        const response = await fetch(`${baseURL}/list.php?i=list`);
        const data = await response.json();
        return (data.meals || []).slice(0, 20); // Limit to 20 ingredients
      } catch (err) {
        console.error("error getIngredients: ==>", err);
        return [];
      }
    }

    /**
     * Fetch meals by ingredient (limited to 20 results)
     * @param {string} ingredients - Ingredient name
     * @returns {Array} Array of meals or empty array
     */
    async function getIngredientsMeals(ingredients) {
      try {
        const response = await fetch(`${baseURL}/filter.php?i=${ingredients}`);
        const data = await response.json();
        return (data.meals || []).slice(0, 20); // Limit to 20 meals
      } catch (err) {
        console.error("error getIngredientsMeals: ==>", err);
        return [];
      }
    }

    // ========== LOADER CLEANUP ==========
    // Handle transition end event to remove loader from DOM
    const onTransitionEnd = (e) => {
      if (e.propertyName !== "opacity") return;
      loader.removeEventListener("transitionend", onTransitionEnd);

      // Remove loader element from DOM
      if (loader.parentNode) loader.parentNode.removeChild(loader);

      // Restore scrolling (clear inline style so stylesheet can control it)
      document.body.style.overflow = "";
    };

    loader.addEventListener("transitionend", onTransitionEnd);
  }, 500);
});
