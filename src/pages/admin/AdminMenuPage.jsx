import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Edit, Trash2, Plus, Upload, Link } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOutletContext } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast"

const AdminMenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { token } = useOutletContext();
  const { toast } = useToast();
  const [imageInputType, setImageInputType] = useState('upload');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/menu/getAll');
      const data = await response.json();
      setMenuItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/menu/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        },
      });
      setMenuItems(menuItems.filter(item => item._id !== id));
      setIsDeleteModalOpen(false);
      toast({
        title: "Item deleted",
        description: "Menu item has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const convertToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const dataUrl = await convertToDataURL(file);
        setEditItem({ ...editItem, image: dataUrl });
      } catch (error) {
        console.error('Error converting image to data URL:', error);
        toast({
          title: "Error",
          description: "Failed to process the image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/menu/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(editItem),
      });
      const newItem = await response.json();
      setMenuItems([newItem, ...menuItems]);
      setEditItem(null);
      setIsCreateModalOpen(false);
      toast({
        title: "Item created",
        description: `${newItem.title} has been added to the menu.`,
      });
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast({
        title: "Error",
        description: "Failed to create menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/api/menu/update/${editItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(editItem),
      });
      const updatedItem = await response.json();
      setMenuItems(menuItems.map(item => item._id === updatedItem._id ? updatedItem : item));
      setEditItem(null);
      toast({
        title: "Item updated",
        description: `${updatedItem.title} has been updated.`,
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast({
        title: "Error",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageInputTypeChange = (value) => {
    setImageInputType(value);
    setEditItem({ ...editItem, image: '' });
  };

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <h1 className="text-3xl font-bold mb-8">Manage Menu</h1>
      <Button onClick={() => { setEditItem({}); setIsCreateModalOpen(true); }} className="mb-4">
        <Plus className="h-4 w-4 mr-2" />
        Create New Item
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <motion.div
            key={item._id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-md mb-4" />
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-2">{item.description}</p>
            <p className="text-lg font-bold text-blue-600 mb-4">${item.price.toFixed(2)}</p>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => { setEditItem(item); setIsCreateModalOpen(false); }} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={() => { setItemToDelete(item); setIsDeleteModalOpen(true); }} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      <Dialog open={!!editItem} onOpenChange={() => { setEditItem(null); setIsCreateModalOpen(false); setImageInputType('upload'); }}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <h2 className="text-2xl font-bold mb-4">{isCreateModalOpen ? 'Create Menu Item' : 'Edit Menu Item'}</h2>
          <form onSubmit={isCreateModalOpen ? handleCreate : handleEdit} className="space-y-4">
            <Input
              type="text"
              value={editItem?.title || ''}
              onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
              placeholder="Title"
              required
            />
            <Input
              type="text"
              value={editItem?.description || ''}
              onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
              placeholder="Description"
              required
            />
            <Input
              type="number"
              value={editItem?.price || ''}
              onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) })}
              placeholder="Price"
              required
              min="0"
              step="0.01"
            />
            <Input
              type="text"
              value={editItem?.category || ''}
              onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
              placeholder="Category"
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <Select onValueChange={handleImageInputTypeChange} value={imageInputType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select image input type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upload">
                    <div className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Upload Image</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="link">
                    <div className="flex items-center">
                      <Link className="mr-2 h-4 w-4" />
                      <span>Image URL</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {imageInputType === 'upload' ? (
                <Input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              ) : (
                <Input
                  type="text"
                  value={editItem?.image || ''}
                  onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                  placeholder="Image URL"
                />
              )}
            </div>
            {editItem?.image && (
              <div className="mt-2">
                <img src={editItem.image} alt="Preview" className="max-w-full h-auto rounded-md" />
              </div>
            )}
            <Button type="submit" className="w-full">
              {isCreateModalOpen ? 'Create Item' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
          <p>Are you sure you want to delete {itemToDelete?.title}?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={() => handleDelete(itemToDelete?._id)} variant="destructive">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMenuPage;