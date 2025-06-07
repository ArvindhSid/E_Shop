import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardMedia, CardContent, CardActions,
  Typography, Button, IconButton, ToggleButton, ToggleButtonGroup,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { API_BASE } from '../../common/config';

const SearchBar = styled('div')(({ theme }) => ({
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
}));

export default function Home({ token, isAdmin }) {
  const [products, setProducts]                  = useState([]);
  const [categories, setCategories]              = useState(['ALL']);
  const [selectedCategory, setSelectedCategory]  = useState('ALL');
  const [sortBy, setSortBy]                      = useState('DEFAULT');

  useEffect(() => {
    axios.get(`${API_BASE}/products/categories`, { headers:{'x-auth-token':token} })
      .then(res => setCategories(['ALL', ...res.data]))
      .catch(console.error);

    axios.get(`${API_BASE}/products`, { headers:{'x-auth-token':token} })
      .then(res => setProducts(res.data))
      .catch(console.error);
  }, [token]);

  const handleCategory = (_,val) => val && setSelectedCategory(val);
  const handleSort = e => setSortBy(e.target.value);

  // filter & sort
  let filtered = products.filter(p =>
    selectedCategory==='ALL' ? true : p.category===selectedCategory
  );
  if (sortBy==='PRICE_HIGH_TO_LOW')
    filtered.sort((a,b)=>b.price - a.price);
  else if(sortBy==='PRICE_LOW_TO_HIGH')
    filtered.sort((a,b)=>a.price - b.price);
  else if(sortBy==='NEWEST')
    filtered.sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Box sx={{ p:2 }}>
      <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
        <FormControl sx={{ minWidth:200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={handleSort}>
            <MenuItem value="DEFAULT">Default</MenuItem>
            <MenuItem value="PRICE_HIGH_TO_LOW">Price: High to Low</MenuItem>
            <MenuItem value="PRICE_LOW_TO_HIGH">Price: Low to High</MenuItem>
            <MenuItem value="NEWEST">Newest</MenuItem>
          </Select>
        </FormControl>

        <ToggleButtonGroup
          value={selectedCategory}
          exclusive
          onChange={handleCategory}
          sx={{ ml:4 }}
        >
          {categories.map(cat=>(
            <ToggleButton key={cat} value={cat}>{cat}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2}>
        {filtered.map(p=>(
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
            <Card>
              {p.imageUrl && (
                <CardMedia
                  component="img"
                  height="140"
                  image={p.imageUrl}
                  alt={p.name}
                />
              )}
              <CardContent>
                <Box sx={{ display:'flex', justifyContent:'space-between', mb:1 }}>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography variant="h6">₹ {p.price}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {p.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent:'space-between' }}>
                <Button size="small">BUY</Button>
                {isAdmin && (
                  <Box>
                    <IconButton size="small"><EditIcon fontSize="small"/></IconButton>
                    <IconButton size="small"><DeleteIcon fontSize="small"/></IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
