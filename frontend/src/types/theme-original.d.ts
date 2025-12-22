declare module '@theme-original/Layout' {
  const component: React.ComponentType<any>;
  export default component;
}

// Add other theme-original modules as needed
declare module '@theme-original/*' {
  const component: React.ComponentType<any>;
  export default component;
}