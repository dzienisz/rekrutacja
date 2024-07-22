import { Category } from "./mockedApi";

export interface CategoryListElement {
  name: string;
  id: number;
  image: string;
  order: number;
  children: CategoryListElement[];
  showOnHome: boolean;
}

interface CategoryProvider {
  getCategories: () => Promise<{ data: Category[] }>;
}

const getOrder = (title: string, id: number): number => {
  if (title && title.includes("#")) {
    const order = parseInt(title.split("#")[0]);
    return isNaN(order) ? id : order;
  }
  return id;
};

const mapCategory = (category: Category, level: number): CategoryListElement => ({
  id: category.id,
  image: category.MetaTagDescription,
  name: category.name,
  order: getOrder(category.Title, category.id),
  children: category.children
    ? category.children.map((child) => mapCategory(child, level + 1))
    : [],
  showOnHome: false,
});

const sortCategories = (categories: CategoryListElement[]): CategoryListElement[] =>
  categories.sort((a, b) => a.order - b.order);

const setShowOnHome = (categories: CategoryListElement[]): void => {
  const toShowOnHome = categories.filter((c) => c.order !== c.id).map((c) => c.id);

  if (categories.length <= 5) {
    categories.forEach((c) => (c.showOnHome = true));
  } else if (toShowOnHome.length > 0) {
    categories.forEach((c) => (c.showOnHome = toShowOnHome.includes(c.id)));
  } else {
    categories.forEach((c, index) => (c.showOnHome = index < 3));
  }
};

export const categoryTree = async (
  categoryProvider: CategoryProvider
): Promise<CategoryListElement[]> => {
  const res = await categoryProvider.getCategories();

  if (!res.data) {
    return [];
  }

  const result = res.data.map((category) => mapCategory(category, 0));
  sortCategories(result);
  result.forEach((category) => sortCategories(category.children));
  setShowOnHome(result);

  return result;
};
