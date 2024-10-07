import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const menuSchema = new Schema({
  category: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [1, "Price must be at least 1"]
  },
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;