// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const app = express();
const port = 3000;

// Start the server
app.listen(port, () => {
    console.log(`Restaurant API server running at http://localhost:${port}`);
});

const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
    // Log request body for POST and PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
         console.log('Request Body:',
   JSON.stringify(req.body, null, 2));
}
  
    next(); // Pass control to next middleware
};

// Middleware to parse JSON bodies and log requests
app.use(express.json());
app.use(requestLogger);

// Import express-validator for input validation
const { body, validationResult } = require('express-validator');

// Validation rules for creating/updating a to-do item
const todoValidation = [
    body('name')
        .isString({ min: 3 })
        .withMessage('Name must be a string at least 3 characters long'),

    body('description')
        .isString({ min: 10 })
        .withMessage('Description must be a string at least 10 characters long'),

    body('price')
    	.isNumeric({min: 1})
        .withMessage('Price must be greater than zero'),

    body('category')
        .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
        .withMessage('Category must be one of: appetizer, entree, dessert, beverage'),

    body('ingredients')
        .isArray({ min: 1 })
        .withMessage('Ingredients must be an array with at least one ingredient'),
  
    body('available')
        .optional({ defaults: true })
        .isBoolean()
        .withMessage('Available must be true or false')
];

// Middleware to handle validation errors and set default values
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        const errorMessages =
    errors.array().map(error => error.msg);
    
        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }
  
    // Set default value for completed if not provided
    if (req.body.completed === undefined) {
        req.body.completed = false;
    }
  
    next();
};

// Root endpoint - API homepage
app.get('/', (req, res) => {
    res.json({ 
        message: "Welcome to the Restaurant API", 
        endpoints: { 
            "GET /api/menu": "Get all menu items", 
            "GET /api/menu/:id": "Get a specific menu item by ID",
            "POST /api/menu": "Add a new menu item",
            "PUT /api/menu/:id": "Update a menu item by ID",
            "DELETE /api/menu/:id": "Delete a menu item by ID"
        } 
    }); 
});

// GET /menu - Return all menu items
app.get('/api/menu', (req, res) => {
    // Sends back the menu items as JSON as the response to the request
    res.json(menuItems);
});

// GET /menu/:id - Return a specific menu item by ID
app.get('/api/menu/:id', (req, res) => {
    const menuId = parseInt(req.params.id);
    const menuItem = menuItems.find(m => m.id === menuId);
// Return menu item if it is found
    if (menuItem) {
        res.json(menuItem);
    } else {
        res.status(404).json({ error: 'Menu item not found' });
    }
});

// POST /menu - Create a new menu item
app.post('/api/menu', todoValidation, handleValidationErrors, (req, res) => {
    // Extract data from request body
    const { name, description, price, category, ingredients, available } = req.body;
  
  	// Create new menu item with generated ID
    const newMenuItem = {
        id: menuItems.length + 1,
        name,
        description,
        price,
        category,
        ingredients,
        available
    };
  
    // Add to menu items array
    menuItems.push(newMenuItem);
  
    // Return the created menu item with 201 status
    res.status(201).json(newMenuItem);
});

// PUT /menu/:id - Update an existing menu item
app.put('/api/menu/:id', todoValidation, handleValidationErrors, (req, res) => {
    const menuId = parseInt(req.params.id);
    const { name, description, price, category, ingredients, available } = req.body;
  
    // Find the menu item to update
    const menuItemIndex = menuItems.findIndex(m => m.id === menuId);
  
    if (menuItemIndex === -1) {
          return res.status(404).json({ error: 'Menu item not found' });
    }
  
    // Update the menu item
    menuItems[menuItemIndex] = {
        id: menuId,
        name,
        description,
        price,
        category,
        ingredients,
        available
    };
  
    // Return the updated menu item
    res.json(menuItems[menuItemIndex]);
});

// DELETE /api/menu/:id - Delete a menu item
app.delete('/api/menu/:id', (req, res) => {
    const menuId = parseInt(req.params.id);
  
    // Find the menu item index
    const menuItemIndex = menuItems.findIndex(m => m.id === menuId);
  
    if (menuItemIndex === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
    }
  
    // Remove the menu item from array
    const deletedMenuItem = menuItems.splice(menuItemIndex, 1)[0];
  
    // Return the deleted menu item
    res.json({ message: 'Menu item deleted successfully', menuItem: deletedMenuItem });
});



// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here
