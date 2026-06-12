import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductPage.css';

const ProductPage = () => {
  const navigate = useNavigate();

  const collections = [
    {
      id: 1,
      name: 'Towels',
      path: '/towels',
      description: 'Handcrafted premium towels with artistic block printing',
      icon: '🏠'
    },
    {
      id: 2,
      name: 'Bags',
      path: '/bags',
      description: 'Beautiful artisan bags for everyday use',
      icon: '👜'
    },
    {
      id: 3,
      name: 'Napkins',
      path: '/napkins',
      description: 'Elegant designer napkins for dining',
      icon: '🍽️'
    },
    {
      id: 4,
      name: 'Bedsheets',
      path: '/bedsheets',
      description: 'Comfortable and artistic bedsheets',
      icon: '🛏️'
    },
    {
      id: 5,
      name: 'Cup Coasters',
      path: '/cupcoaster',
      description: 'Decorative coasters for your home',
      icon: '☕'
    },
    {
      id: 6,
      name: 'Bamboo Products',
      path: '/bamboo',
      description: 'Eco-friendly bamboo home essentials',
      icon: '🌿'
    },
    {
      id: 7,
      name: 'Paper Files',
      path: '/paperfiles',
      description: 'Handmade paper file organizers',
      icon: '📄'
    },
    {
      id: 8,
      name: 'Custom Products',
      path: '/custproduct',
      description: 'Create your own custom designs',
      icon: '🎨'
    }
  ];

  return (
    <div className="product-page">
      <section className="products-header">
        <h1>Our Collections</h1>
        <p>Explore our curated collections of handcrafted products from Enterprises1, Enterprises2, and Enterprises3</p>
      </section>

      <div className="collections-grid">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="collection-card"
            onClick={() => navigate(collection.path)}
          >
            <div className="collection-icon">{collection.icon}</div>
            <h3>{collection.name}</h3>
            <p>{collection.description}</p>
            <button className="view-btn">View Collection</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
