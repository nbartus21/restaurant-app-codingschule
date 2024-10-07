import Menu from '../models/Menu.js';


// Create a new menu item
export const createMenuItem = async (req, res) => {
  try {
    const menuItem = new Menu(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single menu item by ID
export const getMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a menu item
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};