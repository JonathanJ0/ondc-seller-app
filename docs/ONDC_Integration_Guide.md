# ONDC Integration Guide for Seller Application

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Integration Steps](#integration-steps)
4. [Technical Implementation](#technical-implementation)
5. [Resources](#resources)
6. [Troubleshooting](#troubleshooting)

## Introduction

This document outlines the step-by-step process for integrating our seller application with the Open Network for Digital Commerce (ONDC). ONDC is an Indian government initiative that aims to create an interoperable network for digital commerce, allowing buyers and sellers to transact regardless of the platform they're using.

## Prerequisites

Before starting the integration, ensure you have:

1. ONDC Seller Account
   - Register at [ONDC Seller Portal](https://seller.ondc.org)
   - Complete seller verification
   - Obtain API credentials

2. Technical Requirements
   - Node.js v16 or higher
   - PostgreSQL database
   - SSL certificates for secure communication
   - Public IP or domain for webhook endpoints

3. Development Environment
   ```bash
   # Required environment variables
   ONDC_SELLER_ID=your_seller_id
   ONDC_API_KEY=your_api_key
   ONDC_BASE_URL=https://api.ondc.org
   ONDC_WEBHOOK_URL=https://your-domain.com/webhooks
   ```

## Integration Steps

### 1. Seller Onboarding

#### 1.1 Registration
- Complete seller registration on ONDC portal
- Submit required documentation
- Wait for verification and approval

#### 1.2 API Configuration
```typescript
// src/config/ondc.ts
interface ONDCConfig {
  sellerId: string;
  apiKey: string;
  baseUrl: string;
  webhookUrl: string;
  certificates: {
    public: string;
    private: string;
  };
}

export const ondcConfig: ONDCConfig = {
  sellerId: process.env.ONDC_SELLER_ID,
  apiKey: process.env.ONDC_API_KEY,
  baseUrl: process.env.ONDC_BASE_URL,
  webhookUrl: process.env.ONDC_WEBHOOK_URL,
  certificates: {
    public: process.env.ONDC_PUBLIC_CERT,
    private: process.env.ONDC_PRIVATE_CERT
  }
};
```

### 2. Catalog Management

#### 2.1 Product Schema Mapping
```typescript
// src/models/ondc/Product.ts
interface ONDCProduct {
  id: string;
  name: string;
  description: string;
  price: {
    currency: string;
    value: number;
  };
  category: {
    id: string;
    name: string;
  };
  images: string[];
  attributes: {
    [key: string]: string | number | boolean;
  };
  fulfillment: {
    type: string;
    locations: {
      id: string;
      address: string;
    }[];
  };
}

// Mapping function
function mapToONDCProduct(product: Product): ONDCProduct {
  return {
    id: product.id.toString(),
    name: product.name,
    description: product.description,
    price: {
      currency: "INR",
      value: product.price
    },
    // ... other mappings
  };
}
```

#### 2.2 Catalog Sync Service
```typescript
// src/services/ondc/CatalogService.ts
class CatalogService {
  async syncCatalog(products: Product[]): Promise<void> {
    const ondcProducts = products.map(mapToONDCProduct);
    
    try {
      await this.ondcClient.post('/catalog/update', {
        products: ondcProducts
      });
    } catch (error) {
      // Handle errors and implement retry mechanism
      await this.handleSyncError(error);
    }
  }
}
```

### 3. Order Management

#### 3.1 Webhook Implementation
```typescript
// src/routes/ondc/webhooks.ts
router.post('/orders', async (req, res) => {
  try {
    const order = req.body;
    
    // Verify ONDC signature
    if (!verifyONDCRequest(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process order
    await orderService.processONDCOrder(order);
    
    res.status(200).json({ message: 'Order received' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

#### 3.2 Order Status Updates
```typescript
// src/services/ondc/OrderService.ts
class OrderService {
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await this.ondcClient.post(`/orders/${orderId}/status`, {
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Implement retry mechanism
      await this.handleStatusUpdateError(error);
    }
  }
}
```

### 4. Payment Integration

#### 4.1 Payment Processing
```typescript
// src/services/ondc/PaymentService.ts
class PaymentService {
  async processPayment(orderId: string, paymentDetails: PaymentDetails): Promise<void> {
    try {
      const response = await this.ondcClient.post(`/payments/${orderId}`, {
        amount: paymentDetails.amount,
        currency: "INR",
        method: paymentDetails.method,
        // ... other payment details
      });

      // Update local payment status
      await this.updateLocalPaymentStatus(orderId, response);
    } catch (error) {
      // Handle payment errors
      await this.handlePaymentError(error);
    }
  }
}
```

### 5. Logistics Integration

#### 5.1 Shipping Updates
```typescript
// src/services/ondc/LogisticsService.ts
class LogisticsService {
  async updateShippingStatus(orderId: string, status: ShippingStatus): Promise<void> {
    try {
      await this.ondcClient.post(`/logistics/${orderId}/status`, {
        status,
        trackingId: status.trackingId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Handle logistics update errors
      await this.handleLogisticsError(error);
    }
  }
}
```

## Technical Implementation

### Error Handling and Retry Mechanism
```typescript
// src/utils/retry.ts
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
}
```

### Logging and Monitoring
```typescript
// src/utils/logger.ts
class ONDCLogger {
  log(message: string, data?: any): void {
    console.log(`[ONDC] ${message}`, data);
    // Implement proper logging mechanism
  }

  error(message: string, error: Error): void {
    console.error(`[ONDC] ${message}`, error);
    // Implement error tracking
  }
}
```

## Resources

### Official Documentation
1. [ONDC Seller Documentation](https://docs.ondc.org)
2. [ONDC API Reference](https://api.ondc.org/docs)
3. [ONDC Protocol Specification](https://protocol.ondc.org)

### Development Tools
1. [ONDC Sandbox Environment](https://sandbox.ondc.org)
2. [ONDC Testing Tools](https://tools.ondc.org)
3. [ONDC Postman Collection](https://postman.ondc.org)

### Community Resources
1. [ONDC Developer Forum](https://forum.ondc.org)
2. [ONDC GitHub Repository](https://github.com/ONDC)
3. [ONDC Stack Overflow](https://stackoverflow.com/questions/tagged/ondc)

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API credentials
   - Check certificate validity
   - Ensure proper signature generation

2. **Webhook Issues**
   - Verify webhook URL accessibility
   - Check SSL certificate validity
   - Monitor webhook response times

3. **Catalog Sync Issues**
   - Validate product schema
   - Check for required fields
   - Monitor sync status

### Debugging Tools

1. **ONDC Dashboard**
   - Monitor API calls
   - Track order status
   - View error logs

2. **Local Testing**
   - Use sandbox environment
   - Implement mock responses
   - Test error scenarios

### Support Channels

1. **Technical Support**
   - ONDC Support Portal
   - Developer Community
   - Email Support

2. **Documentation**
   - API Documentation
   - Integration Guides
   - Best Practices

## Best Practices

1. **Security**
   - Use environment variables for sensitive data
   - Implement proper authentication
   - Regular security audits

2. **Performance**
   - Implement caching
   - Optimize API calls
   - Monitor response times

3. **Maintenance**
   - Regular updates
   - Monitor API changes
   - Keep documentation updated

## Conclusion

This integration guide provides a comprehensive overview of integrating our seller application with ONDC. Follow the steps carefully and refer to the resources for additional information. Regular updates and maintenance are crucial for successful integration.

For any questions or issues, refer to the troubleshooting section or contact ONDC support. 