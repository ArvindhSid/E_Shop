import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { API_BASE } from '../../common/config';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Home({ token, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['ALL']);
  const [selectedCategory, setSelectedCat] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const searchQuery = params.get('search') || '';

  const fetchProducts = async () => {
    try {
      const url = `${API_BASE}/products`;
      const res = await axios.get(url, {
        headers: { 'x-auth-token': token }
      });
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Failed to fetch products.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  useEffect(() => {
    if (location.state?.orderPlaced) {
      setSnackbarMessage('Order placed successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.productAdded) {
      setSnackbarMessage(`Product ${location.state.productName} added successfully!`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.productModified) {
      setSnackbarMessage(`Product ${location.state.productName} modified successfully!`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      navigate(location.pathname, { replace: true, state: {} });
    }

    axios
      .get(`${API_BASE}/products/categories`, {
        headers: { 'x-auth-token': token }
      })
      .then(res => setCategories(['ALL', ...res.data]))
      .catch(console.error);

    fetchProducts();
  }, [token, location.state, navigate, location.pathname]);

  useEffect(() => {
    if (openSnackbar) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => (prev < 100 ? prev + 2.5 : 100));
      }, 100);

      const autoClose = setTimeout(() => {
        handleCloseSnackbar();
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(autoClose);
      };
    }
  }, [openSnackbar]);

  const handleCategory = (_, newCat) => {
    if (newCat) setSelectedCat(newCat);
  };

  const handleSort = e => setSortBy(e.target.value);

  let filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  filtered = filtered.filter(p =>
    selectedCategory === 'ALL' ? true : p.category === selectedCategory
  );

  if (sortBy === 'PRICE_HIGH_TO_LOW') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'PRICE_LOW_TO_HIGH') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'NEWEST') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setOpenConfirmDialog(false);
    if (!productToDelete) return;

    try {
      await axios.delete(`${API_BASE}/products/${productToDelete.id}`, {
        headers: { 'x-auth-token': token }
      });
      setSnackbarMessage(`Product ${productToDelete.name} deleted successfully!`);
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbarMessage('Failed to delete product.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCancelDelete = () => {
    setOpenConfirmDialog(false);
    setProductToDelete(null);
  };

  const handleEditProduct = (product) => {
    navigate(`/modify-product/${product.id}`, { state: { productData: product } });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        mb: 4,
        gap: 2
      }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={handleSort}>
            <MenuItem value="DEFAULT">Default</MenuItem>
            <MenuItem value="PRICE_HIGH_TO_LOW">Price: High to Low</MenuItem>
            <MenuItem value="PRICE_LOW_TO_HIGH">Price: Low to High</MenuItem>
            <MenuItem value="NEWEST">Newest</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }}>
          <ToggleButtonGroup
            value={selectedCategory}
            exclusive
            onChange={handleCategory}
            fullWidth
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              '.MuiToggleButton-root': { flex: 1, border: 'none' },
              '.MuiToggleButton-root.Mui-selected': {
                backgroundColor: '#eee'
              }
            }}
          >
            {categories.map(cat => (
              <ToggleButton key={cat} value={cat}>
                {cat}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={3} alignItems="stretch">
        {filtered.length === 0 ? (
          <Typography variant="h6" sx={{ mt: 4, mx: 'auto' }}>
            No products found{searchQuery ? ` matching "${searchQuery}"` : ''}.
          </Typography>
        ) : (
          filtered.map((p) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{ display: 'flex' }}
              key={p.id}
            >
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  height: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3,
                }}
              >
                <Box
                  sx={{
                    height: 180,
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={p.imageUrl}
                    alt={p.name}
                    sx={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                      width: '100%',
                      hyphens: 'auto',
                    }}
                  >
                    {p.name}
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{ color: 'primary.main', fontWeight: 500 }}
                  >
                    ₹ {p.price}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4,
                      marginTop: 'auto',
                    }}
                  >
                    {p.description}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(`/product/${p.id}`)}
                    sx={{
                      backgroundColor: '#3f51b5',
                      '&:hover': { backgroundColor: '#303f9f' },
                    }}
                  >
                    BUY
                  </Button>
                  {isAdmin && (
                    <Box>
                      <IconButton size="small" onClick={() => handleEditProduct(p)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteProduct(p)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleCloseSnackbar}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: '#00C853',
            boxShadow: 'none',
            borderRadius: 0,
            padding: 0
          }
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          icon={false}
          sx={{
            width: '100%',
            backgroundColor: '#00C853',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: 0,
            boxShadow: 'none',
            alignItems: 'center',
            paddingBottom: 0
          }}
        >
          <Box sx={{ px: 2, py: 1 }}>{snackbarMessage}</Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 3,
              backgroundColor: 'transparent',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#b9f6ca',
              }
            }}
          />
        </Alert>
      </Snackbar>

      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm deletion of product!</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to delete the product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} variant="outlined" color="primary">
            CANCEL
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
