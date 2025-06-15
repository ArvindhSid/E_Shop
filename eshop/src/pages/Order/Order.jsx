import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Stack // Import Stack component
} from '@mui/material';
import axios from 'axios';
import { API_BASE } from '../../common/config';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const steps = ['Items', 'Select Address', 'Confirm Order'];

export default function Order({ token }) {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddressForm, setNewAddressForm] = useState({
    name: '',
    contactNumber: '',
    street: '',
    city: '',
    state: '',
    landmark: '',
    zipCode: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { id: productId } = useParams(); // Get product ID from URL
  const { quantity } = location.state || {}; // Get quantity from location state

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch product details
    axios.get(`${API_BASE}/products/${productId}`, {
      headers: { 'x-auth-token': token }
    })
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product:', err);
        setLoading(false);
        setError('Failed to load product details.');
      });

    // Fetch existing addresses
    fetchAddresses();
  }, [token, productId, navigate]);

  const fetchAddresses = () => {
    axios.get(`${API_BASE}/addresses`, {
      headers: { 'x-auth-token': token }
    })
      .then(res => {
        setAddresses(res.data);
      })
      .catch(err => {
        console.error('Error fetching addresses:', err);
        setError('Failed to load addresses.');
      });
  };

  const isStepOptional = (step) => {
    return false; // No optional steps in this flow
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = async () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setError(''); // Clear previous errors

    if (activeStep === 1) { // Address selection/addition step
      if (!selectedAddressId && !newAddressForm.street) {
        setError('Please select an existing address or fill in the form to add a new address!');
        return;
      }
      if (newAddressForm.street) { // If new address form is filled
        try {
          const res = await axios.post(`${API_BASE}/addresses`, newAddressForm, {
            headers: { 'x-auth-token': token }
          });
          if (res.status === 200 || res.status === 201) {

            setSelectedAddressId(res.data.id);
            fetchAddresses(); // Refresh addresses list
            setNewAddressForm({
              name: '', contactNumber: '', street: '', city: '',
              state: '', landmark: '', zipCode: ''
            }); // Clear form
          } else {
            setError('Failed to add new address.');
            return;
          }
        } catch (err) {
          console.error('Error adding address:', err);
          setError('Failed to add new address. Please check your input.');
          return;
        }
      }
      if (!selectedAddressId) { // After potential new address creation, if no address is selected
        setError('Please select an address!');
        return;
      }
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    setError('');
    if (!product || !selectedAddressId || !quantity) {
      setError('Missing product, address, or quantity information for order.');
      return;
    }

    try {
      const orderPayload = {
        productId: product.id,
        quantity: quantity,
        addressId: selectedAddressId
      };
      const res = await axios.post(`${API_BASE}/orders`, orderPayload, {
        headers: { 'x-auth-token': token }
      });

      if (res.status === 200 || res.status === 201) {
        alert('Your order is confirmed.');
        navigate('/', { state: { orderPlaced: true } }); // Redirect to products page with success message
      } else {
        setError('Failed to place order.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0: // Items
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : product ? (
              <Paper elevation={2} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <img src={product.imageUrl} alt={product.name} style={{ width: 100, height: 100, objectFit: 'contain' }} />
                <Box>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">Quantity: {quantity}</Typography>
                  <Typography variant="body2" color="text.secondary">Category: {product.category}</Typography>
                  <Typography variant="subtitle1" color="error">₹ {product.price * quantity}</Typography>
                </Box>
              </Paper>
            ) : (
              <Typography color="error">Product details not found.</Typography>
            )}
          </Box>
        );
      case 1: // Select Address
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Address
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="address-select-label">Select Address</InputLabel>
              <Select
                labelId="address-select-label"
                value={selectedAddressId}
                label="Select Address"
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                {addresses.map((addr) => (
                  <MenuItem key={addr.id} value={addr.id}>
                    {`${addr.name} -> ${addr.street}, ${addr.city}, ${addr.state} - ${addr.zipCode}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" mt={4} mb={2}>
              -OR- Add New Address
            </Typography>
            {/* Using Stack for a clean, vertical layout */}
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Name *"
                value={newAddressForm.name}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Contact Number *"
                value={newAddressForm.contactNumber}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, contactNumber: e.target.value })}
              />
              <TextField
                fullWidth
                label="Street *"
                value={newAddressForm.street}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, street: e.target.value })}
              />
              <TextField
                fullWidth
                label="City *"
                value={newAddressForm.city}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
              />
              <TextField
                fullWidth
                label="State *"
                value={newAddressForm.state}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
              />
              <TextField
                fullWidth
                label="Landmark"
                value={newAddressForm.landmark}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, landmark: e.target.value })}
              />
              <TextField
                fullWidth
                label="Zip Code *"
                value={newAddressForm.zipCode}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, zipCode: e.target.value })}
              />
            </Stack>
          </Box>
        );
      case 2: // Confirm Order
        const confirmedAddress = addresses.find(addr => addr.id === selectedAddressId);
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Order
            </Typography>
            {product && (
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">Quantity: {quantity}</Typography>
                <Typography variant="subtitle1" color="error">Total Price: ₹ {product.price * quantity}</Typography>
              </Paper>
            )}

            {confirmedAddress && (
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6">Address Details</Typography>
                <Typography>{confirmedAddress.name}</Typography>
                <Typography>{confirmedAddress.contactNumber}</Typography>
                <Typography>{confirmedAddress.street}, {confirmedAddress.landmark && `${confirmedAddress.landmark}, `}{confirmedAddress.city}</Typography>
                <Typography>{confirmedAddress.state} - {confirmedAddress.zipCode}</Typography>
              </Paper>
            )}
            {!product && <Typography color="error">Product details missing for confirmation.</Typography>}
            {!confirmedAddress && <Typography color="error">Address details missing for confirmation.</Typography>}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <Box sx={{ mt: 2, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        {getStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, justifyContent: 'space-between' }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handlePlaceOrder}>
            Place Order
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
}