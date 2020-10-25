import { generateComposition, generateTiles } from '@/js/composition.js';

describe('composition', () => {
  describe('generateComposition', () => {
    it('generates small composition', () => {
      expect.assertions(1);
      const images = [
        { connections: [1, 2, 2, 1], selfConnect: [true, true, true, true] }
      ];
      const tiles = generateTiles(images);
      const expected = [
        [tiles[0], tiles[1], tiles[3]],
        [tiles[2], tiles[3], tiles[1]],
        [tiles[0], tiles[1], tiles[3]]
      ];
      const size = [expected[0].length, expected.length];
      const abortController = new AbortController();
      const abortSignal = abortController.signal;
      expect(
        generateComposition(tiles, size, {
          abortSignal
        })
      ).resolves.toEqual(expected);
    });

    it('generates large composition', () => {
      expect.assertions(1);
      const images = [
        { connections: [1, 1, 1, 1], selfConnect: [true, true, true, true] },
        { connections: [2, 2, 1, 2], selfConnect: [true, true, true, true] },
        { connections: [1, 2, 2, 1], selfConnect: [true, true, true, true] },
        { connections: [1, 1, 2, 1], selfConnect: [true, true, true, true] },
        { connections: [2, 2, 2, 2], selfConnect: [true, true, true, true] }
      ];
      const tiles = generateTiles(images);
      const size = [500, 500];
      const abortController = new AbortController();
      const abortSignal = abortController.signal;
      expect(
        generateComposition(tiles, size, {
          abortSignal
        })
      ).resolves.toBeDefined();
    });
  });
});
