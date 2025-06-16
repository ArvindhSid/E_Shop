import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  LinearProgress
} from '@mui/material';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
import { API_BASE } from '../../common/config';

export default function AddProduct({ token }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    manufacturer: '',
    availableItems: '',
    imageUrl: ''
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false); // for linear progress

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: '#fff',
      borderColor: '#c4c4c4',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#888',
      },
      minHeight: 56,
      fontSize: '1rem',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#fff',
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#f0f0f0' : '#fff',
      color: '#000',
      cursor: 'pointer',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#888',
      fontSize: '1rem',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '1rem',
      color: '#000',
    }),
  };

  useEffect(() => {
    if (token) {
      setLoading(true);
      axios
        .get(`${API_BASE}/products/categories`, {
          headers: { 'x-auth-token': token }
        })
        .then((res) => {
          const categoryOptions = res.data.map((cat) => ({
            value: cat,
            label: cat
          }));
          setCategories(categoryOptions);
        })
        .catch(() => {
          setSnackbarMessage('Failed to load categories');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !selectedCategory || !form.price) {
      setSnackbarMessage('Please fill all required fields');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        category: selectedCategory.value,
        price: Number(form.price),
        availableItems: Number(form.availableItems)
      };

      const res = await axios.post(`${API_BASE}/products`, payload, {
        headers: { 'x-auth-token': token }
      });

      if (res.status === 201) {
        setSnackbarMessage(`Product ${form.name.trim()} added successfully`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setForm({
          name: '',
          price: '',
          description: '',
          manufacturer: '',
          availableItems: '',
          imageUrl: ''
        });
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Add product error:', error);
      setSnackbarMessage('Failed to add product');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LinearProgress color="secondary" />}

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Add Product
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography sx={{ mb: 1 }}>Category *</Typography>
            <CreatableSelect
              isClearable
              styles={customSelectStyles}
              options={categories}
              value={selectedCategory}
              onChange={(newValue) => {
                setSelectedCategory(newValue);
                if (
                  newValue &&
                  !categories.some((opt) => opt.value === newValue.value)
                ) {
                  setCategories((prev) => [...prev, newValue]);
                }
              }}
            />
          </Box>

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
            onClick={handleSubmit}
            disabled={loading}
          >
            SAVE PRODUCT
          </Button>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={() => setSnackbarOpen(false)}
          sx={{ '& .MuiPaper-root': { backgroundColor: '#00C853', boxShadow: 'none', borderRadius: 0 } }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            icon={false}
            sx={{
              width: '100%',
              backgroundColor: '#00C853',
              color: '#fff',
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
    </>
  );
}
