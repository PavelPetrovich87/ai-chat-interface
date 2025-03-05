/// <reference types="vite/client" />

// CSS modules declaration
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
} 