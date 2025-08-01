import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { OrderItem } from '../models/OrderItem';
import { Rating } from '../models/Rating';

// ONDC Search Controller
export const handleONDCSearch = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { intent } = message;

    // Extract search criteria from ONDC request
    const searchCriteria = intent?.item?.descriptor?.name || '';
    const category = intent?.item?.category_id || '';
    const location = intent?.fulfillment?.end?.location?.address?.locality || '';

    // Search products in database
    const products = await Product.findAll({
      where: {
        name: {
          [require('sequelize').Op.iLike]: `%${searchCriteria}%`
        }
      },
      limit: 20
    });

    // Map products to ONDC format
    const ondcProducts = products.map(product => ({
      id: product.id.toString(),
      descriptor: {
        name: product.name,
        short_desc: product.description,
        long_desc: product.description,
        images: product.images ? [product.images] : []
      },
      price: {
        currency: 'INR',
        value: product.price.toString()
      },
      category_id: product.category || 'electronics',
      fulfillment_id: '1',
      location_id: '1'
    }));

    // ONDC Search Response
    const response = {
      context: {
        domain: 'ONDC:RET10',
        country: 'IND',
        city: 'std:080',
        action: 'search',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bap_uri: 'https://buyer-app.ondc.org/protocol/v1',
        transaction_id: message.context?.transaction_id,
        message_id: message.context?.message_id,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S'
      },
      message: {
        catalog: {
          'bpp/descriptor': {
            name: 'ONDC Seller App'
          },
          'bpp/providers': [
            {
              id: '1',
              descriptor: {
                name: 'ONDC Seller',
                short_desc: 'Digital Commerce Seller'
              },
              items: ondcProducts,
              fulfillments: [
                {
                  id: '1',
                  type: 'Delivery',
                  provider_name: 'ONDC Seller',
                  rating: '4.5'
                }
              ]
            }
          ]
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('ONDC Search Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ONDC Select Controller
export const handleONDCSelect = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { order } = message;

    // Validate items in the order
    const items = order.items || [];
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.id);
      if (product && product.stock >= item.quantity) {
        validatedItems.push({
          ...item,
          price: {
            currency: 'INR',
            value: (product.price * item.quantity).toString()
          }
        });
      }
    }

    // ONDC Select Response
    const response = {
      context: {
        domain: 'ONDC:RET10',
        country: 'IND',
        city: 'std:080',
        action: 'select',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bap_uri: 'https://buyer-app.ondc.org/protocol/v1',
        bpp_id: 'seller-app.ondc.org',
        bpp_uri: 'https://seller-app.ondc.org/protocol/v1',
        transaction_id: message.context?.transaction_id,
        message_id: message.context?.message_id,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S'
      },
      message: {
        order: {
          id: `order_${Date.now()}`,
          state: 'Created',
          provider: {
            id: '1',
            descriptor: {
              name: 'ONDC Seller'
            }
          },
          items: validatedItems,
          billing: {
            name: order.billing?.name || 'Customer',
            address: order.billing?.address || {
              locality: 'Bangalore',
              city: 'Bangalore',
              state: 'Karnataka'
            }
          },
          fulfillment: {
            type: 'Delivery',
            tracking: false,
            end: {
              location: {
                gps: '12.9716,77.5946',
                address: {
                  locality: 'Bangalore',
                  city: 'Bangalore',
                  state: 'Karnataka'
                }
              }
            }
          },
          payment: {
            '@ondc/org/buyer_app_finder_fee_type': 'percent',
            '@ondc/org/buyer_app_finder_fee': '3',
            '@ondc/org/settlement_basis': 'delivery',
            '@ondc/org/settlement_window': 'P1D',
            '@ondc/org/withholding_amount': '0.00',
            '@ondc/org/settlement_details': [
              {
                settlement_counterparty: 'buyer-app',
                settlement_phase: 'sale-amount',
                beneficiary_name: 'ONDC Seller',
                settlement_status: 'PAID',
                settlement_reference: 'TXN123456',
                settlement_timestamp: new Date().toISOString(),
                amount: {
                  currency: 'INR',
                  value: validatedItems.reduce((sum, item) => sum + parseFloat(item.price.value), 0).toString()
                }
              }
            ]
          }
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('ONDC Select Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ONDC Init Controller
export const handleONDCInit = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { order } = message;

    // Create order in database
    const newOrder = await Order.create({
      orderId: order.id,
      customerId: req.user?.id || 1,
      status: 'pending',
      totalAmount: order.payment?.settlement_details?.[0]?.amount?.value || '0',
      currency: 'INR',
      createdAt: new Date()
    });

    // Create order items
    for (const item of order.items || []) {
      await OrderItem.create({
        orderId: newOrder.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.price.value
      });

      // Update product stock
      const product = await Product.findByPk(item.id);
      if (product) {
        await product.update({
          stock: product.stock - item.quantity
        });
      }
    }

    // ONDC Init Response
    const response = {
      context: {
        domain: 'ONDC:RET10',
        country: 'IND',
        city: 'std:080',
        action: 'init',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bap_uri: 'https://buyer-app.ondc.org/protocol/v1',
        bpp_id: 'seller-app.ondc.org',
        bpp_uri: 'https://seller-app.ondc.org/protocol/v1',
        transaction_id: message.context?.transaction_id,
        message_id: message.context?.message_id,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S'
      },
      message: {
        order: {
          id: order.id,
          state: 'Created',
          provider: {
            id: '1',
            descriptor: {
              name: 'ONDC Seller'
            }
          },
          items: order.items,
          billing: order.billing,
          fulfillment: order.fulfillment,
          payment: order.payment
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('ONDC Init Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ONDC Confirm Controller
export const handleONDCConfirm = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { order } = message;

    // Update order status
    const existingOrder = await Order.findOne({
      where: { orderId: order.id }
    });

    if (existingOrder) {
      await existingOrder.update({
        status: 'confirmed',
        updatedAt: new Date()
      });
    }

    // ONDC Confirm Response
    const response = {
      context: {
        domain: 'ONDC:RET10',
        country: 'IND',
        city: 'std:080',
        action: 'confirm',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bap_uri: 'https://buyer-app.ondc.org/protocol/v1',
        bpp_id: 'seller-app.ondc.org',
        bpp_uri: 'https://seller-app.ondc.org/protocol/v1',
        transaction_id: message.context?.transaction_id,
        message_id: message.context?.message_id,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S'
      },
      message: {
        order: {
          id: order.id,
          state: 'Confirmed',
          provider: {
            id: '1',
            descriptor: {
              name: 'ONDC Seller'
            }
          },
          items: order.items,
          billing: order.billing,
          fulfillment: order.fulfillment,
          payment: order.payment
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('ONDC Confirm Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ONDC Status Controller
export const handleONDCStatus = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { order_id } = message;

    // Get order from database
    const order = await Order.findOne({
      where: { orderId: order_id },
      include: [OrderItem]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // ONDC Status Response
    const response = {
      context: {
        domain: 'ONDC:RET10',
        country: 'IND',
        city: 'std:080',
        action: 'status',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bap_uri: 'https://buyer-app.ondc.org/protocol/v1',
        bpp_id: 'seller-app.ondc.org',
        bpp_uri: 'https://seller-app.ondc.org/protocol/v1',
        transaction_id: message.context?.transaction_id,
        message_id: message.context?.message_id,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S'
      },
      message: {
        order: {
          id: order.orderId,
          state: order.status,
          provider: {
            id: '1',
            descriptor: {
              name: 'ONDC Seller'
            }
          },
          items: order.OrderItems?.map(item => ({
            id: item.productId,
            quantity: item.quantity,
            price: {
              currency: 'INR',
              value: item.price.toString()
            }
          })) || [],
          billing: {
            name: 'Customer',
            address: {
              locality: 'Bangalore',
              city: 'Bangalore',
              state: 'Karnataka'
            }
          },
          fulfillment: {
            type: 'Delivery',
            tracking: false,
            end: {
              location: {
                gps: '12.9716,77.5946',
                address: {
                  locality: 'Bangalore',
                  city: 'Bangalore',
                  state: 'Karnataka'
                }
              }
            }
          }
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('ONDC Status Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ONDC Cancel Controller
export const handleONDCCancel = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { order_id, cancellation_reason_id } = message;

    // Update order status
    const order = await Order.findOne({
      where: { orderId: order_id }
    });

    if (order) {
      await order.update({
        status: 'cancelled',
        updatedAt: new Date()
      });

      // Restore product stock
      const orderItems = await OrderItem.findAll({
        where: { orderId: order.id }
      });

      for (const item of orderItems) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          await product.update({
            stock: product.stock + item.quantity
          });
        }
      }
    }

    // ONDC Cancel Response
    const response = {
      context: {
        domain: 'ONDC:RET10',
        country: 'IND',
        city: 'std:080',
        action: 'cancel',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bap_uri: 'https://buyer-app.ondc.org/protocol/v1',
        bpp_id: 'seller-app.ondc.org',
        bpp_uri: 'https://seller-app.ondc.org/protocol/v1',
        transaction_id: message.context?.transaction_id,
        message_id: message.context?.message_id,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S'
      },
      message: {
        order: {
          id: order_id,
          state: 'Cancelled',
          cancellation_reason_id: cancellation_reason_id
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('ONDC Cancel Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ONDC Rating Controller
export const handleONDCRating = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { rating } = message;

    // Save rating to database
    await Rating.create({
      orderId: rating.order_id,
      rating: rating.rating_value,
      review: rating.rating_comment || '',
      createdAt: new Date()
    });

    // ONDC Rating Response
    const response = {
      context: {
        domain: 'ONDC:RET10',
        country: 'IND',
        city: 'std:080',
        action: 'rating',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bap_uri: 'https://buyer-app.ondc.org/protocol/v1',
        bpp_id: 'seller-app.ondc.org',
        bpp_uri: 'https://seller-app.ondc.org/protocol/v1',
        transaction_id: message.context?.transaction_id,
        message_id: message.context?.message_id,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S'
      },
      message: {
        rating: {
          order_id: rating.order_id,
          rating_value: rating.rating_value,
          rating_comment: rating.rating_comment
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('ONDC Rating Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ONDC Support Controller
export const handleONDCSupport = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { support } = message;

    // ONDC Support Response
    const response = {
      context: {
        domain: 'ONDC:RET10',
        country: 'IND',
        city: 'std:080',
        action: 'support',
        core_version: '1.2.0',
        bap_id: 'buyer-app.ondc.org',
        bap_uri: 'https://buyer-app.ondc.org/protocol/v1',
        bpp_id: 'seller-app.ondc.org',
        bpp_uri: 'https://seller-app.ondc.org/protocol/v1',
        transaction_id: message.context?.transaction_id,
        message_id: message.context?.message_id,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S'
      },
      message: {
        support: {
          ref_id: support.ref_id,
          status: 'Open',
          resolution: {
            short_desc: 'Your support request has been received',
            long_desc: 'We will get back to you within 24 hours',
            action_triggered: 'email_sent'
          }
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('ONDC Support Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 