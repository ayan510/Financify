import React, { useState, useEffect } from 'react';

export default function Home() {
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowImage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ marginTop: '100px' }}>
      {showImage && (
        <img
          src="logo192.png"
          alt="Loading"
          style={{ display: 'block', margin: '0 auto' }}
        />
      )}
      {!showImage && (
        <>
          <h1 style={{ textAlign: 'center', margin: 40 }}>FINANCIFY</h1>
          <h1 style={{ textAlign: 'center', margin: 40 }}>(Tracking App for your Finance)</h1>
          <h1 style={{ textAlign: 'center', margin: 40 }}>BE CALCULATED....</h1>
          <h2 style={{ textAlign: 'center', margin: 40 }}>ADD YOUR TRANSACTIONS</h2>
          <h2 style={{ textAlign: 'center', margin: 40 }}>REWISE YOUR TRANSACTIONS</h2>
        </>
      )}
    </div>
  );
}
