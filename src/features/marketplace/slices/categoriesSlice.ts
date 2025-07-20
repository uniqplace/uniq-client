// src/features/categories/categoriesSlice.ts
import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { ICategory, ISubCategory } from '../../../types/index'; // הנחה שהגדרות אלו נמצאות ב-types.ts
 // הנחה שהגדרות אלו נמצאות ב-types.ts

// הגדרת טיפוס עבור פריט ב-TreeSelect
export interface TreeSelectItem {
  label: string;
  value: string;
  children?: TreeSelectItem[];
  count?: number; // להצגת ספירה אם תשתמש ב-with-counts
}

interface CategoriesState {
  categories: ICategory[];
  subCategories: ISubCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  subCategories: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<ICategory[]>) => {
      state.categories = action.payload;
    },
    setSubCategories: (state, action: PayloadAction<ISubCategory[]>) => {
      state.subCategories = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ניתן להשתמש ב-extraReducers כדי להגיב ל-actions של RTK Query אם תרצה לשמור את הנתונים ב-slice גם
    // אך לרוב, כאשר משתמשים ב-RTK Query, הנתונים נשמרים בקאש שלו ואז נשלפים מההוקים.
    // אם תרצה לשלוף את הנתונים ישירות ל-slice, זה המקום:
    /*
    builder
      .addMatcher(categoriesApiSlice.endpoints.getCategories.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(categoriesApiSlice.endpoints.getCategories.matchFulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addMatcher(categoriesApiSlice.endpoints.getCategories.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      .addMatcher(categoriesApiSlice.endpoints.getSubCategories.matchPending, (state) => {
        state.loading = true; // או loading נפרד לתת-קטגוריות
        state.error = null;
      })
      .addMatcher(categoriesApiSlice.endpoints.getSubCategories.matchFulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload;
      })
      .addMatcher(categoriesApiSlice.endpoints.getSubCategories.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch subcategories';
      });
    */
  },
});

export const { setCategories, setSubCategories, setLoading, setError } = categoriesSlice.actions;

export default categoriesSlice.reducer;

// סלקטור לבניית עץ הקטגוריות
export const selectCategoriesTree = createSelector(
  (state: { categories: CategoriesState }) => state.categories.categories,
  (state: { categories: CategoriesState }) => state.categories.subCategories,
  (categories, subCategories) => {
    const categoriesMap = new Map<string, TreeSelectItem>();

    // הוספת קטגוריות ראשיות
    categories.forEach(cat => {
      categoriesMap.set(cat._id.toString(), {
        label: cat.name,
        value: cat._id.toString(),
        children: [], // אתחול מערך ילדים
      });
    });

    // הוספת תת-קטגוריות כילדים של הקטגוריות הראשיות
    subCategories.forEach(subCat => {
      const parentCategory = categoriesMap.get(subCat.category.toString());
      if (parentCategory) {
        parentCategory.children?.push({
          label: subCat.name,
          value: subCat._id.toString(),
          // אם תשתמש ב-getSubCategoriesWithCounts, תוכל להוסיף כאן את ה-count
          // count: subCat.count // יש לוודא שה-type ISubCategory כולל count אם משתמשים בו
        });
      }
    });

    // מחזיר את מערך האובייקטים ברמה העליונה
    return Array.from(categoriesMap.values());
  }
);


