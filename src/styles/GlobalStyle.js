import React from 'react';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #6C5CE7;
    --primary-dark: #5A49D6;
    --secondary:rgb(171, 171, 175);
    --accent: #FD79A8;
    --background: #000000;
    --card-bg: #333333;
    --text-primary: #FFFFFF;
    --text-secondary: #B2BECD;
    --success: #00B894;
    --warning: #FDCB6E;
    --error: #FF7675;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--background);
    color: var(--text-primary);
    line-height: 1.6;
  }

  a {
    color: var(--secondary);
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary);
    }
  }

  button {
    font-family: 'Inter', sans-serif;
    cursor: pointer;
  }
`;

export default GlobalStyle;
