import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Button, TextField, CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../common/config';

export default function ProductDetails({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [orderError, setOrderError] = useState(''); // New state for order errors

  useEffect(() => {
    axios
      .get(`${API_BASE}/products/${id}`, {
        headers: { 'x-auth-token': token }
      })
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, token]);

  const handlePlaceOrderClick = () => {
    setOrderError('');
    if (qty < 1 || qty > product.availableItems) {
      setOrderError(`Please enter a quantity between 1 and ${product.availableItems}`);
      return;
    }
    // Navigate to the order page, passing product ID and quantity as state
    navigate(`/order/${product.id}`, { state: { quantity: qty } }); //
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (!product) {
    return <Typography align="center" variant="h6" mt={4}>Product not found.</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Image */}
        <Box sx={{ flex: 1 }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
            />
          ) : (
            <Typography color="text.secondary">Image not available</Typography>
          )}
        </Box>

        {/* Details */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>{product.name}</Typography>

          <Typography
            sx={{
              backgroundColor: '#3f51b5',
              color: 'white',
              display: 'inline-block',
              px: 2,
              py: 0.5,
              mt: 1,
              borderRadius: 1,
              fontSize: 14,
            }}
          >
            Available Quantity: {product.availableItems}
          </Typography>

          <Typography mt={2}>Category: <strong>{product.category}</strong></Typography>
          <Typography mt={1} color="text.secondary">{product.description}</Typography>

          <Typography variant="h6" color="error" mt={2}>
            ₹ {product.price}
          </Typography>

          {/* Quantity input */}
          <Box mt={3} display="flex" alignItems="center" gap={2}>
            <TextField
              type="number"
              label="Enter Quantity *"
              size="small"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              inputProps={{ min: 1, max: product.availableItems }}
              sx={{ width: 120 }}
            />

            <Button
              variant="contained"
              onClick={handlePlaceOrderClick} // Changed from handleOrder
              disabled={qty < 1 || qty > product.availableItems || !token}
            >
              PLACE ORDER
            </Button>
          </Box>
          {orderError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {orderError}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}