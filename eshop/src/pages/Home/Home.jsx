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
  Snackbar, // Import Snackbar
  Alert     // Import Alert for Snackbar content
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { API_BASE } from '../../common/config';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation

export default function Home({ token, isAdmin, searchQuery }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['ALL']);
  const [selectedCategory, setSelectedCat] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [openSnackbar, setOpenSnackbar] = useState(false); // State for Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message

  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to access state

  useEffect(() => {
    // Check for order placed message from location state
    if (location.state?.orderPlaced) {
      setSnackbarMessage('Order placed successfully!'); //
      setOpenSnackbar(true);
      // Clear the state so the message doesn't reappear on subsequent visits
      navigate(location.pathname, { replace: true, state: {} });
    }

    axios
      .get(`${API_BASE}/products/categories`, {
        headers: { 'x-auth-token': token }
      })
      .then(res => setCategories(['ALL', ...res.data]))
      .catch(console.error);

    const fetchProducts = async () => {
      try {
        let url = `${API_BASE}/products`;
        if (searchQuery) {
          url += `?name=${searchQuery}`;
        }
        const res = await axios.get(url, {
          headers: { 'x-auth-token': token }
        });
        setProducts(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, [token, searchQuery, location.state?.orderPlaced, navigate, location.pathname]); // Add location.state.orderPlaced to dependencies

  const handleCategory = (_, newCat) => {
    if (newCat) setSelectedCat(newCat);
  };
  const handleSort = e => setSortBy(e.target.value);

  let filtered = products.filter(p =>
    selectedCategory === 'ALL' ? true : p.category === selectedCategory
  );

  if (sortBy === 'PRICE_HIGH_TO_LOW') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'PRICE_LOW_TO_HIGH') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'NEWEST') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}
      >
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

      <Grid container spacing={4}>
        {filtered.map(p => (
          <Grid
            item
            key={p.id}
            xs={12}
            sm={6}
            md={4}
            sx={{ display: 'flex' }}
          >
            <Card
              elevation={2}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                minHeight: 400,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                bgcolor: 'background.paper'
              }}
            >
              {p.imageUrl && (
                <CardMedia
                  component="img"
                  height="180"
                  image={p.imageUrl}
                  alt={p.name}
                  sx={{
                    objectFit: 'contain',
                    backgroundColor: '#fafafa',
                    p: 1
                  }}
                />
              )}

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 600, fontSize: '1.1rem' }}
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
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                    maxHeight: '2.8em',
                    flexGrow: 1
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
                >
                  BUY
                </Button>
                {isAdmin && (
                  <Box>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}