// components/Layout.js
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Layout = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = e => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#000', backgroundColor: '#fff' }}>
      <header style={{ backgroundColor: '#000', padding: '10px' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/">
            <a style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>My Webshop</a>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', marginRight: '15px' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '5px' }}
              />
              <button type="submit" style={{ padding: '5px', backgroundColor: '#fff', color: '#000' }}>
                Search
              </button>
            </form>
            <Link href="/cart">
              <a style={{ color: '#fff', marginRight: '15px' }}>Cart</a>
            </Link>
            <Link href="/admin/products">
              <a style={{ color: '#fff', marginRight: '15px' }}>Admin</a>
            </Link>
            <Link href="/admin/orders">
              <a style={{ color: '#fff', marginRight: '15px' }}>Orders</a>
            </Link>
            <Link href="/admin/reports">
              <a style={{ color: '#fff' }}>Reports</a>
            </Link>
          </div>
        </nav>
      </header>
      <main style={{ padding: '20px' }}>{children}</main>
      <footer style={{ backgroundColor: '#000', color: '#fff', textAlign: 'center', padding: '10px' }}>
        &copy; {new Date().getFullYear()} My Webshop
      </footer>
    </div>
  );
};

export default Layout;
