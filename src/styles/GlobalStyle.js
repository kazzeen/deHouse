import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #6C5CE7;
    --primary-dark: #5A49D6;
    --secondary:rgb(171, 171, 175);
    --accent: #FD79A8;
    --background: rgba(230, 230, 230, 0.01); /* 1% transparent background (98% visible) */
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

  html, body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: 'Inter', sans-serif;
    color: var(--text-primary);
    line-height: 1.6;
    position: relative;
  }

  /* Video background container */
  body::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    background-color: var(--background);
    pointer-events: none; /* Allow clicking through the overlay */
  }

  /* Create a pseudo-element for the video background */
  #video-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -3;
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
