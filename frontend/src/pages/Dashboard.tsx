import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  alpha,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Total Products',
      value: '0',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      trend: '+12%',
    },
    {
      title: 'Active Orders',
      value: '0',
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.success.main,
      trend: '+5%',
    },
    {
      title: 'Total Revenue',
      value: '₹0',
      icon: <MoneyIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.warning.main,
      trend: '+8%',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.main,
          }}
        >
          Dashboard
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <RefreshIcon color="primary" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {stats.map((stat) => (
            <Box
              key={stat.title}
              sx={{
                flex: '1 1 300px',
                minWidth: 0,
              }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: alpha(stat.color, 0.1),
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {React.cloneElement(stat.icon, { sx: { color: stat.color } })}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: theme.palette.success.main,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {stat.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                minHeight: 400,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Orders
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 'calc(100% - 40px)',
                  color: 'text.secondary',
                }}
              >
                No recent orders
              </Box>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                minHeight: 400,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Top Products
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 'calc(100% - 40px)',
                  color: 'text.secondary',
                }}
              >
                No products available
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard; 