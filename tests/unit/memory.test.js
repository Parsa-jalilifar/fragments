// tests/unit/memory.test.js

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');

describe('Memory Tests', () => {
  describe('writeFragment', () => {
    test('should be successful', async () => {
      const fragment = {
        ownerId: '1234',
        id: 'id',
        created: new Date(),
      };

      await writeFragment(fragment);
      const data = await readFragment(fragment.ownerId, fragment.id);

      expect(data).toEqual(fragment);
    });
  });

  describe('readFragment', () => {
    test('should be successful', async () => {
      const fragment = {
        ownerId: '4321',
        id: 'id',
        created: new Date(),
      };

      await writeFragment(fragment);
      const data = await readFragment(fragment.ownerId, fragment.id);

      expect(data).toEqual(fragment);
    });
  });

  describe('writeFragmentData', () => {
    test('should be successful', async () => {
      const fragment = {
        ownerId: '5678',
        id: 'id',
        created: new Date(),
      };

      await writeFragmentData(fragment.ownerId, fragment.id, 'test');
      const data = await readFragmentData(fragment.ownerId, fragment.id);

      expect(data).toEqual('test');
    });
  });

  describe('readFragmentData', () => {
    test('should be successful', async () => {
      const fragment = {
        ownerId: '8765',
        id: 'id',
        created: new Date(),
      };

      await writeFragmentData(fragment.ownerId, fragment.id, 'test');
      const data = await readFragmentData(fragment.ownerId, fragment.id);

      expect(data).toEqual('test');
    });
  });
});
