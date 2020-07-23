import React from 'react'
import Wrapper from './components/Wrapper'
import Login from './components/Login'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';

export const PrettyLogin = () => {
  return (
    <Wrapper>
      <Login />
    </Wrapper>
  )
}
