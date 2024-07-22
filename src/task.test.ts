import test from 'ava';

import { CORRECT } from './correctResult';
import { INPUT } from './input';
import { Category } from './mockedApi';
import { CategoryListElement, categoryTree } from './task';

const mockCategoryProvider = {
  getCategories: async (): Promise<{ data: Category[] }> => ({ data: INPUT }),
};

test('should return the correct category tree', async (t) => {
  const result = await categoryTree(mockCategoryProvider);
  t.deepEqual(result, CORRECT);
});

test('should handle empty input', async (t) => {
  const emptyProvider = {
    getCategories: async (): Promise<{ data: Category[] }> => ({ data: [] }),
  };
  const result = await categoryTree(emptyProvider);
  t.deepEqual(result, []);
});

test('should handle null data', async (t) => {
  const nullProvider = {
    getCategories: async (): Promise<{ data: Category[] | null }> => ({
      data: null,
    }),
  };
  const result = await categoryTree(nullProvider as any);
  t.deepEqual(result, []);
});

test('should correctly set showOnHome for 5 or fewer categories', async (t) => {
  const fewCategoriesProvider = {
    getCategories: async (): Promise<{ data: Category[] }> => ({
      data: INPUT.slice(0, 1).map((cat) => ({
        ...cat,
        children: cat.children.slice(0, 4),
      })),
    }),
  };
  const result = await categoryTree(fewCategoriesProvider);
  t.true(result.every((cat) => cat.showOnHome));
});

test('should correctly set order based on Title', async (t) => {
  const result = await categoryTree(mockCategoryProvider);
  const orderCheck = (cats: CategoryListElement[]): boolean =>
    cats.every((cat, index) => {
      if (index === 0) return true;
      return cat.order >= cats[index - 1].order;
    });

  t.true(orderCheck(result));
  t.true(result.every((cat) => orderCheck(cat.children)));
});
