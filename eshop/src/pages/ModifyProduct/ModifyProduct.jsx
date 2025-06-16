import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { API_BASE } from '../../common/config';

export default function ModifyProduct({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    manufacturer: '',
    availableItems: 0,
    imageUrl: '',
  });
  const [categories, setCategories] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (location.state?.productData) {
      const data = location.state.productData;
      setProduct(data);
      setForm({
        name: data.name,
        category: data.category,
        price: data.price,
        description: data.description,
        manufacturer: data.manufacturer,
        availableItems: data.availableItems,
        imageUrl: data.imageUrl || '',
      });
      setLoading(false);
    } else {
      if (!token) {
        setSnackbarMessage('Authentication token is missing. Please log in.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      axios.get(`${API_BASE}/products/${id}`, {
        headers: { 'x-auth-token': token },
      })
      .then(res => {
        const data = res.data;
        setProduct(data);
        setForm({
          name: data.name,
          category: data.category,
          price: data.price,
          description: data.description,
          manufacturer: data.manufacturer,
          availableItems: data.availableItems,
          imageUrl: data.imageUrl || '',
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product:", err);
        setSnackbarMessage('Failed to load product details.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
      });
    }

    if (!token) return;
    axios.get(`${API_BASE}/products/categories`, {
      headers: { 'x-auth-token': token }
    })
    .then(res => setCategories(res.data))
    .catch(err => {
      console.error("Error fetching categories:", err);
      setSnackbarMessage('Failed to load categories.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  }, [id, token, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModifyProduct = async () => {
    if (!token) {
      setSnackbarMessage('Authentication token is missing. Please log in.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        availableItems: Number(form.availableItems),
      };

      const res = await axios.put(
        `${API_BASE}/products/${id}`,
        payload,
        {
          headers: { 'x-auth-token': token },
          validateStatus: (status) => status === 200,
        }
      );

      setSnackbarMessage(`Product "${res.data.name}" modified successfully!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      navigate('/', {
        state: {
          productModified: true,
          productName: res.data.name
        }
      });
    } catch (error) {
      console.error('Error modifying product:', error);
      setSnackbarMessage(
        error.response?.status === 401
          ? 'Unauthorized: Please log in again with admin privileges.'
          : 'Failed to modify product. Please check your inputs.'
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product && !loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h6" align="center" color="error">
          Product not found or access denied.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Modify Product
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Name *"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <TextField
          select
          fullWidth
          margin="normal"
          label="Category *"
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          margin="normal"
          label="Manufacturer"
          name="manufacturer"
          value={form.manufacturer}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Available Items"
          name="availableItems"
          type="number"
          value={form.availableItems}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Price *"
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Image URL"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Product Description"
          name="description"
          multiline
          rows={4}
          value={form.description}
          onChange={handleChange}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{
              mt: 3,
              backgroundColor: '#3f51b5',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#303f9f', // darker shade on hover
              },
            }}
          onClick={handleModifyProduct}
        >
          MODIFY PRODUCT
        </Button>
      </Box>

      <Snackbar
             open={snackbarOpen}
             autoHideDuration={4000}
             anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
             onClose={() => setSnackbarOpen(false)}
             sx={{ '& .MuiPaper-root': { backgroundColor: '#00C853', boxShadow: 'none', borderRadius: 0 } }} // Snackbar override
           >
             <Alert
               onClose={() => setSnackbarOpen(false)}
               severity={snackbarSeverity}
               icon={false}
               sx={{
                 width: '100%',
                 backgroundColor: '#00C853', // bright green
                 color: '#fff',              // white text
                 fontWeight: 'bold',
                 borderRadius: 0,
                 boxShadow: 'none',
                 alignItems: 'center'
               }}
             >
               {snackbarMessage}
             </Alert>
           </Snackbar>
    </Container>
  );
}
