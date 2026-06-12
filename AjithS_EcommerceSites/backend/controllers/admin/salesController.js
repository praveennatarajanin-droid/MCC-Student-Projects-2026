// Architect: SP
const Order = require('../../models/user/Order');
// this logic cant be finsied 
// Get sales overview for the admin's store



// this logic cant be finished as it requires overhaul of the project 
// its very hard and modifying could crash the project 






const getSalesOverview = async (req, res) => {
    try {
        const store = req.admin.storeName;
        const timeframe = req.query.timeframe || 'all';
        const startDate = getStartDate(timeframe);

        console.log('Admin store name:', store);

        // First check if we have any orders at all
        const allOrders = await Order.find({});
        console.log('Total orders in database:', allOrders.length);
        
        // Check orders with products
        const ordersWithProducts = await Order.find({ 'products': { $exists: true, $ne: [] } });
        console.log('Orders with products:', ordersWithProducts.length);
        
        // Check unique store names in products
        const uniqueStores = [...new Set(ordersWithProducts.flatMap(order => 
            order.products.map(product => product.store)
        ))];
        console.log('Unique store names found:', uniqueStores);

        // Base query for store's orders
        let query = {
            'products.store': store,
            orderStatus: { $in: ['delivered', 'completed'] }
        };

        // Add date filter if timeframe specified
        if (startDate) {
            query.createdAt = { $gte: startDate };
        }

        console.log('Query:', JSON.stringify(query, null, 2));

        // Get all matching orders
        const orders = await Order.find(query);
        console.log('Found orders for store:', orders.length);

        if (orders.length === 0) {
            // If no orders found, let's check orders with this store regardless of status
            const allStoreOrders = await Order.find({ 'products.store': store });
            console.log('All orders for store (any status):', allStoreOrders.length);
            if (allStoreOrders.length > 0) {
                console.log('Order statuses found:', [...new Set(allStoreOrders.map(o => o.orderStatus))]);
            }
        }

        // Calculate total sales and other metrics
        const metrics = calculateSalesMetrics(orders, store);
        console.log('Calculated metrics:', metrics);

        // Get sales by category
        const categoryData = await getSalesByCategory(store, startDate);
        console.log('Category data:', categoryData);

        // Get daily sales data for chart
        const dailySales = await getDailySales(store, startDate);
        console.log('Daily sales:', dailySales);

        res.status(200).json({
            status: 'success',
            data: {
                overview: metrics,
                categoryData,
                dailySales
            }
        });
    } catch (error) {
        console.error('Error in getSalesOverview:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching sales overview'
        });
    }
};

// Get detailed sales report
const getSalesReport = async (req, res) => {
    try {
        const store = req.admin.storeName;
        const { startDate, endDate } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('Getting sales report for:', {
            store,
            startDate,
            endDate,
            page,
            limit
        });

        // Construct date range query
        let dateQuery = {};
        if (startDate && endDate) {
            dateQuery = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const query = {
            'products.store': store,
            orderStatus: { $in: ['delivered', 'completed'] },
            ...dateQuery
        };

        console.log('Query:', JSON.stringify(query, null, 2));

        // Get orders for the store within date range
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        console.log('Found orders:', orders.length);

        // Get total count for pagination
        const total = await Order.countDocuments(query);
        console.log('Total orders:', total);

        // Process orders to get sales data
        const salesData = orders.map(order => ({
            orderId: order.orderNumber,
            date: order.createdAt,
            customer: order.shippingAddress.fullName,
            products: order.products
                .filter(p => p.store === store)
                .map(p => ({
                    name: p.name,
                    quantity: p.quantity,
                    price: p.price,
                    total: p.quantity * p.price
                })),
            total: order.products
                .filter(p => p.store === store)
                .reduce((sum, p) => sum + (p.quantity * p.price), 0)
        }));

        console.log('Processed sales data:', salesData.length);

        res.status(200).json({
            status: 'success',
            data: {
                sales: salesData,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error in getSalesReport:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching sales report'
        });
    }
};

// Helper function to get start date based on timeframe
const getStartDate = (timeframe) => {
    const now = new Date();
    switch (timeframe) {
        case 'today':
            return new Date(now.setHours(0, 0, 0, 0));
        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return weekAgo;
        case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return monthAgo;
        case 'year':
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return yearAgo;
        default:
            return null;
    }
};

// Helper function to calculate sales metrics
const calculateSalesMetrics = (orders, store) => {
    let totalSales = 0;
    let totalOrders = orders.length;
    let totalProducts = 0;
    let averageOrderValue = 0;

    orders.forEach(order => {
        const storeProducts = order.products.filter(p => p.store === store);
        const orderTotal = storeProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);
        totalSales += orderTotal;
        totalProducts += storeProducts.reduce((sum, p) => sum + p.quantity, 0);
    });

    averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
        totalSales,
        totalOrders,
        totalProducts,
        averageOrderValue
    };
};

// Helper function to get sales by category
const getSalesByCategory = async (store, startDate) => {
    let matchQuery = {
        'products.store': store,
        orderStatus: { $in: ['delivered', 'completed'] }
    };

    if (startDate) {
        matchQuery.createdAt = { $gte: startDate };
    }

    console.log('Category query:', JSON.stringify(matchQuery, null, 2));

    const categoryData = await Order.aggregate([
        { $match: matchQuery },
        { $unwind: '$products' },
        { $match: { 'products.store': store } },
        {
            $group: {
                _id: '$products.category',
                totalSales: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
                totalQuantity: { $sum: '$products.quantity' }
            }
        },
        { $sort: { totalSales: -1 } }
    ]);

    console.log('Category aggregation result:', categoryData);
    return categoryData;
};

// Helper function to get daily sales data
const getDailySales = async (store, startDate) => {
    let matchQuery = {
        'products.store': store,
        orderStatus: { $in: ['delivered', 'completed'] }
    };

    if (startDate) {
        matchQuery.createdAt = { $gte: startDate };
    }

    console.log('Daily sales query:', JSON.stringify(matchQuery, null, 2));

    const dailyData = await Order.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                totalSales: {
                    $sum: {
                        $reduce: {
                            input: {
                                $filter: {
                                    input: '$products',
                                    as: 'product',
                                    cond: { $eq: ['$$product.store', store] }
                                }
                            },
                            initialValue: 0,
                            in: { $add: ['$$value', { $multiply: ['$$this.price', '$$this.quantity'] }] }
                        }
                    }
                },
                totalOrders: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    console.log('Daily sales aggregation result:', dailyData);

    return dailyData.map(day => ({
        date: day._id,
        totalSales: day.totalSales,
        totalOrders: day.totalOrders
    }));
};

module.exports = {
    getSalesOverview,
    getSalesReport
};
