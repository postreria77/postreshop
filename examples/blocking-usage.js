// Usage Examples for Product Blocking Functions with Messages
// =========================================================

import { 
  isProductBlockedForSucursal, 
  checkBlockedProductsForSucursal 
} from "@/lib/orderConditions";

// Example 1: Check if a single product is blocked for a specific sucursal
async function checkSingleProduct() {
  const result = await isProductBlockedForSucursal(
    "price_1Qg5Dw2N0hejjjHDiY16NYda", // Product ID
    "2025-06-23",                      // Date
    "44"                              // Sucursal ID
  );

  if (result.blocked) {
    console.log("Product is blocked:", result.message);
    // Output: "Un producto no está disponible para la sucursal seleccionada en esta fecha"
  } else {
    console.log("Product is available");
  }
}

// Example 2: Check multiple products for blocking
async function checkMultipleProducts() {
  const products = [
    { 
      stripePriceId: "price_1Qg5Dw2N0hejjjHDiY16NYda", 
      cantidad: 1, 
      id: "1219", 
      id_pasteleria: "299", 
      presentacion: "normal" 
    },
    { 
      stripePriceId: "price_1Qg3bS2N0hejjjHDX8EYDGH1", 
      cantidad: 1, 
      id: "358", 
      id_pasteleria: "98", 
      presentacion: "normal" 
    }
  ];

  const result = await checkBlockedProductsForSucursal(
    products,
    "2025-06-26",
    "44"
  );

  if (result.blockedProducts.length > 0) {
    console.log("Blocked products:", result.blockedProducts);
    console.log("Reasons:", result.messages);
    // Output: ["Esta sucursal no está disponible para la fecha seleccionada"]
  } else {
    console.log("All products are available");
  }
}

// Example 3: Different blocking scenarios and their messages
async function demonstrateBlockingMessages() {
  
  // Scenario 1: Entire day blocked
  const dayBlockedResult = await isProductBlockedForSucursal(
    "price_1Qg5Dw2N0hejjjHDiY16NYda",
    "2025-06-20", // This date has dayDisabled: true
    "44"
  );
  // Message: "No hay entregas disponibles para esta fecha"

  // Scenario 2: Sucursal blocked completely
  const sucursalBlockedResult = await isProductBlockedForSucursal(
    "price_1Qg5Dw2N0hejjjHDiY16NYda",
    "2025-06-24", // This date blocks sucursales ["106", "109"]
    "106"
  );
  // Message: "Esta sucursal no está disponible para la fecha seleccionada"

  // Scenario 3: Product blocked globally
  const productBlockedResult = await isProductBlockedForSucursal(
    "price_1Qg57s2N0hejjjHD6e1l5fyx",
    "2025-06-25", // This date blocks products globally
    "44"
  );
  // Message: "Un producto no está disponible en esta fecha"

  // Scenario 4: Specific product blocked for specific sucursal
  const specificBlockResult = await isProductBlockedForSucursal(
    "price_1Qg3bS2N0hejjjHDX8EYDGH1",
    "2025-06-26", // This date blocks specific products for specific sucursales
    "44"
  );
  // Message: "Un producto no está disponible para la sucursal seleccionada en esta fecha"

  console.log("Day blocked:", dayBlockedResult);
  console.log("Sucursal blocked:", sucursalBlockedResult);
  console.log("Product blocked:", productBlockedResult);
  console.log("Specific block:", specificBlockResult);
}

// Example 4: Frontend usage for displaying user-friendly messages
async function frontendUsage() {
  const productId = "price_1Qg5Dw2N0hejjjHDiY16NYda";
  const date = "2025-06-23";
  const sucursalId = "44";

  const result = await isProductBlockedForSucursal(productId, date, sucursalId);

  if (result.blocked) {
    // Show specific error message to user
    showErrorToUser(result.message);
  } else {
    // Allow user to proceed with order
    allowOrderToProceed();
  }
}

function showErrorToUser(message) {
  // Display the specific blocking message to the user
  alert(message);
}

function allowOrderToProceed() {
  console.log("Order can proceed");
}

// Example 5: Blocking helper function usage
import { 
  blockOrderDate, 
  blockSucursalesForDate, 
  blockProductsForDate, 
  blockProductsForSucursalesAndDate 
} from "@/lib/orders";

async function demonstrateBlockingHelpers() {
  
  // Block entire day
  const dayBlock = await blockOrderDate("2025-07-01");
  console.log(dayBlock.message);
  
  // Block specific sucursales
  const sucursalBlock = await blockSucursalesForDate("2025-07-02", ["44", "106"]);
  console.log(sucursalBlock.message);
  
  // Block specific products globally
  const productBlock = await blockProductsForDate("2025-07-03", [
    "price_1Qg5Dw2N0hejjjHDiY16NYda",
    "price_1Qg3bS2N0hejjjHDX8EYDGH1"
  ]);
  console.log(productBlock.message);
  
  // Block specific products for specific sucursales
  const specificBlock = await blockProductsForSucursalesAndDate(
    "2025-07-04",
    ["44"],
    ["price_1Qg5Dw2N0hejjjHDiY16NYda"]
  );
  console.log(specificBlock.message);
}

// Export functions for use in other modules
export {
  checkSingleProduct,
  checkMultipleProducts,
  demonstrateBlockingMessages,
  frontendUsage,
  demonstrateBlockingHelpers
};