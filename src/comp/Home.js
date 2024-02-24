import React, { useState, useEffect } from 'react';
import { Card, Grid, Segment } from 'semantic-ui-react';

export default function Home() {
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImage(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ marginTop: '100px', }}>
      {showImage && (
        <img
          src="logo512.png"
          alt=" Loading"
          style={{ display: 'block', width: '200px', margin: '0 auto' }}
        />
      )}

      {!showImage && (
        <Grid className='ui celled unstackable table' centered style={{ marginTop: '50px', borderRadius: '10px', }}>
          <Grid.Row>
            <Card style={{ boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)', borderRadius: '20px', margin: '20px' }}>
              <Card.Content>
                <Card.Header style={{ color: '#333', marginBottom: '10px' }}>Welcome to FINANCIFY</Card.Header>
                <Card.Description style={{ color: '#555' }}>
                  Start Adding Your Dialy Life Transactions
                  "Effortlessly track your spending and income - stay organized with every transaction, every time".
                </Card.Description>
              </Card.Content>
            </Card>
          </Grid.Row>
        </Grid>
      )}
    </div>
  );
}
