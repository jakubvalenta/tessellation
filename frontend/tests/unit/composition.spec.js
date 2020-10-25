import {
  reverseDigits,
  generateComposition,
  generateTiles
} from '@/js/composition.js';

describe('composition', () => {
  describe('reverseDigits', () => {
    it('reverses digits of a single-digit number', () => {
      expect(reverseDigits(0)).toBe(0);
      expect(reverseDigits(1)).toBe(1);
    });
    it('reverses digits of a multi-digit number', () => {
      expect(reverseDigits(12)).toBe(21);
      expect(reverseDigits(9986)).toBe(6899);
    });
  });
  describe('generateComposition', () => {
    it('generates small composition', () => {
      const images = [{ connections: [1, 2, 2, 1] }];
      const tiles = generateTiles(images);
      const expected = [
        [tiles[0], tiles[1], tiles[3]],
        [tiles[2], tiles[3], tiles[1]],
        [tiles[0], tiles[1], tiles[3]]
      ];
      const size = [expected[0].length, expected.length];
      expect(generateComposition(tiles, size)).toEqual(expected);
    });

    it('generates large composition', () => {
      const images = [
        { connections: [1, 1, 1, 1] },
        { connections: [2, 2, 1, 2] },
        { connections: [1, 2, 2, 1] },
        { connections: [1, 1, 2, 1] },
        { connections: [2, 2, 2, 2] }
      ];
      const tiles = generateTiles(images);
      const size = [500, 500];
      expect(generateComposition(tiles, size)).toBeDefined();
    });

    it('generates composition with multi-digit connections', () => {
      const images = [{ connections: [1, 12, 1, 21] }];
      const tiles = generateTiles(images);
      const expected = [
        [tiles[0], tiles[2], tiles[0]],
        [tiles[0], tiles[2], tiles[0]],
        [tiles[0], tiles[2], tiles[0]]
      ];
      const size = [expected[0].length, expected.length];
      expect(generateComposition(tiles, size)).toEqual(expected);
    });

    it('tries only a limited amount of steps', () => {
      const images = [
        { connections: [1, 1, 1, 1] },
        { connections: [2, 2, 1, 2] },
        { connections: [1, 2, 2, 1] },
        { connections: [1, 1, 2, 1] },
        { connections: [2, 2, 2, 2] }
      ];
      const tiles = generateTiles(images);
      const size = [500, 500];
      expect(() =>
        generateComposition(tiles, size, { maxSteps: Math.pow(2, 10) })
      ).toThrow();
    });
  });
});
