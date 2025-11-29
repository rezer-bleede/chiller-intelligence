import '@testing-library/jest-dom/vitest';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// @ts-expect-error jsdom global augmentation for chart components
global.ResizeObserver = ResizeObserver;
