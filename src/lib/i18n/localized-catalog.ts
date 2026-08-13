/**
 * Catalog localization: product/category names & descriptions are stored in
 * Vietnamese (source locale); translations live in catalog-bundle.json keyed
 * by slug. Missing entries fall back to the original Vietnamese text.
 */
import type { Locale } from "@/lib/i18n/config";
import type { Category, Product } from "@/lib/data/local";
import catalogBundle from "@/lib/i18n/content/catalog-bundle.json";

const SOURCE_LOCALE: Locale = "vi";

type ProductEntry = {
  name: string;
  short_description?: string;
  description?: string;
};

type CategoryEntry = {
  name: string;
  description?: string;
};

type CatalogBundle = {
  products: Record<string, Partial<Record<Locale, ProductEntry>>>;
  categories: Record<string, Partial<Record<Locale, CategoryEntry>>>;
};

const bundle = catalogBundle as CatalogBundle;

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === SOURCE_LOCALE) return product;
  const entry = bundle.products[product.slug]?.[locale];
  if (!entry) return product;
  return {
    ...product,
    name: entry.name,
    short_description: entry.short_description ?? product.short_description,
    description: entry.description ?? product.description,
  };
}

export function localizeProducts(products: Product[], locale: Locale): Product[] {
  return products.map((p) => localizeProduct(p, locale));
}

export function localizeCategory(category: Category, locale: Locale): Category {
  if (locale === SOURCE_LOCALE) return category;
  const entry = bundle.categories[category.slug]?.[locale];
  if (!entry) return category;
  return {
    ...category,
    name: entry.name,
    description: entry.description ?? category.description,
  };
}

export function localizeCategories(categories: Category[], locale: Locale): Category[] {
  return categories.map((c) => localizeCategory(c, locale));
}
