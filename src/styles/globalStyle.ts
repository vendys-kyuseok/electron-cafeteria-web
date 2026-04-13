import { css } from '@emotion/react';

const globalStyleCss = css`
  html,
  body,
  main,
  #root,
  .App {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background: #e8e8e8;
    font-size: 14px;
    font-weight: 500;
    touch-action: auto;
    -ms-overflow-style: none;
  }

  body {
    margin: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  div::-webkit-scrollbar {
    width: 8px;
  }
  div::-webkit-scrollbar-thumb {
    background: #999999;
    border-radius: 10px;
  }
  div::-webkit-scrollbar-track {
    background: #f2f2f2;
    border-radius: 8px;
  }

  img {
    -webkit-user-drag: none;
  }

  a:focus {
    outline: none;
  }
  a:active {
    color: red; /* 클릭하는 동안 텍스트를 빨간색으로 */
    background-color: yellow; /* 클릭하는 동안 배경을 노란색으로 */
  }
`;

export default globalStyleCss;
export { globalStyleCss };
