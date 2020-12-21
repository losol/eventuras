import React from 'react';
import NavBar from '../NavBar/NavBar';

const Layout = ({ children }) => {
  return (
    <>
      <NavBar />
      <main>{children}</main>
    </>
  )
}

export default Layout;