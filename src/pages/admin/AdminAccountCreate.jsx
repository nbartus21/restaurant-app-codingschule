import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

const AdminAccountCreate = () => {
  const [adminUsers, setAdminUsers] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const response = await api.get('/auth/admins');
      setAdminUsers(response.data);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/create-admin', { ...data, isAdmin: true });
      toast({
        title: "Success",
        description: "New admin account created successfully.",
      });
      setIsCreateDialogOpen(false);
      reset();
      fetchAdminUsers();
    } catch (error) {
      console.error('Error creating admin account:', error);
      toast({
        title: "Error",
        description: "Failed to create admin account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6">Admin Accounts</h1>

      <div className="mb-6">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Admin Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username", { required: "Username is required" })}
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
              <Button type="submit">Create Admin Account</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adminUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminAccountCreate;