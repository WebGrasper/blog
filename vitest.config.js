import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // We will use project-based config or just handle setup manually
    // to avoid starting MongoMemoryServer for unit tests
  },
});
