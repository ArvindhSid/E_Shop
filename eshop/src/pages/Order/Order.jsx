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
  Snackbar,
  Alert
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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const navigate = useNavigate();
  const location = useLocation();
  const { id: productId } = useParams();
  const { quantity } = location.state || {};

  const showSnackbar = (message, severity = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

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
        showSnackbar('Failed to load product details.');
      });
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
        showSnackbar('Failed to load addresses.');
      });
  };

  const isStepSkipped = (step) => skipped.has(step);

  const handleNext = async () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    if (activeStep === 1) {
      if (!selectedAddressId) {
        showSnackbar('Please select an existing address or save a new one.');
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
    if (!product || !selectedAddressId || !quantity) {
      showSnackbar('Missing product, address, or quantity information.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/orders`, {
        productId: product.id,
        quantity,
        addressId: selectedAddressId
      }, {
        headers: { 'x-auth-token': token }
      });

      if (res.status === 200 || res.status === 201) {
        showSnackbar('Your order is confirmed.', 'success');
        navigate('/', { state: { orderPlaced: true } });
      } else {
        showSnackbar('Failed to place order.');
      }
    } catch (err) {
      console.error('Order error:', err);
      showSnackbar('Failed to place order. Please try again.');
    }
  };

  const handleSaveAddress = async () => {
    const { name, contactNumber, street, city, state, zipCode } = newAddressForm;
    if (!name || !contactNumber || !street || !city || !state || !zipCode) {
      showSnackbar('Please fill all required fields!');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/addresses`, newAddressForm, {
        headers: { 'x-auth-token': token }
      });
      if (res.status === 200 || res.status === 201) {
        fetchAddresses();
        setSelectedAddressId(res.data.id);
        setNewAddressForm({
          name: '', contactNumber: '', street: '', city: '',
          state: '', landmark: '', zipCode: ''
        });
        showSnackbar('Address saved successfully.', 'success');
      } else {
        showSnackbar('Failed to save address.');
      }
    } catch (err) {
      console.error(err);
      showSnackbar('Error saving address. Please try again.');
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
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
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Select Address</Typography>
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
                    {`${addr.name} --> ${addr.street}, ${addr.city}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" mt={4} mb={2}>Add Address</Typography>
            {['name', 'contactNumber', 'street', 'city', 'state', 'landmark', 'zipCode'].map((field) => (
              <TextField
                key={field}
                margin="normal"
                fullWidth
                label={`${field.charAt(0).toUpperCase() + field.slice(1)}${field === 'landmark' ? '' : ' *'}`}
                value={newAddressForm[field]}
                onChange={(e) => setNewAddressForm({ ...newAddressForm, [field]: e.target.value })}
              />
            ))}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSaveAddress}
                sx={{
                  backgroundColor: '#3f51b5',
                  color: '#fff',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#303f9f',
                  },
                }}
              >
                SAVE ADDRESS
              </Button>
            </Box>
          </Box>
        );
      case 2:
        const confirmedAddress = addresses.find(addr => addr.id === selectedAddressId);
        return (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                border: '1px solid #ccc',
                borderRadius: 2,
                p: 3,
                gap: 3
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>{product.name}</Typography>
                <Typography>Quantity: <b>{quantity}</b></Typography>
                <Typography>Category: <b>{product.category}</b></Typography>
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                  {product.description}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2, color: 'red', fontWeight: 'bold' }}>
                  Total Price : ₹ {product.price * quantity}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>Address Details :</Typography>
                {confirmedAddress ? (
                  <>
                    <Typography>{confirmedAddress.name}</Typography>
                    <Typography>Contact Number: {confirmedAddress.contactNumber}</Typography>
                    <Typography>{confirmedAddress.street}, {confirmedAddress.city}</Typography>
                    <Typography>{confirmedAddress.state}</Typography>
                    <Typography>{confirmedAddress.zipCode}</Typography>
                  </>
                ) : (
                  <Typography color="error">Address not found.</Typography>
                )}
              </Box>
            </Box>
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
        {steps.map((label, index) => (
          <Step key={label} completed={index < activeStep}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
        {getStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, pt: 2 }}>
        <Button
          variant="contained"
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{
            backgroundColor: '#3f51b5',
            color: '#fff',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#303f9f',
            }
          }}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlaceOrder}
            sx={{ textTransform: 'none' }}
          >
            Place Order
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              backgroundColor: '#3f51b5',
              color: '#fff',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#303f9f',
              }
            }}
          >
            Next
          </Button>
        )}
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
  );
}
