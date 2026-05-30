import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

const categoriesRef = collection(db, "categories");

/*
|--------------------------------------------------------------------------
| ADD CATEGORY
|--------------------------------------------------------------------------
*/
export const addCategory = async (category) => {
  try {
    const docRef = await addDoc(categoriesRef, {
      ...category,
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      id: docRef.id,
    };
  } catch (error) {
    console.log("Add Category Error:", error);

    return {
      success: false,
      error,
    };
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL CATEGORIES
|--------------------------------------------------------------------------
*/
export const getCategories = async () => {
  try {
    const q = query(categoriesRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.log("Get Categories Error:", error);

    return [];
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CATEGORY
|--------------------------------------------------------------------------
*/
export const updateCategory = async (id, updatedData) => {
  try {
    const categoryRef = doc(db, "categories", id);

    await updateDoc(categoryRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log("Update Category Error:", error);

    return {
      success: false,
      error,
    };
  }
};

/*
|--------------------------------------------------------------------------
| DELETE SINGLE CATEGORY
|--------------------------------------------------------------------------
*/
export const deleteCategory = async (id) => {
  try {
    await deleteDoc(doc(db, "categories", id));

    return {
      success: true,
    };
  } catch (error) {
    console.log("Delete Category Error:", error);

    return {
      success: false,
      error,
    };
  }
};

/*
|--------------------------------------------------------------------------
| DELETE MULTIPLE CATEGORIES
|--------------------------------------------------------------------------
*/
export const deleteMultipleCategories = async (ids = []) => {
  try {
    const batch = writeBatch(db);

    ids.forEach((id) => {
      const categoryRef = doc(db, "categories", id);

      batch.delete(categoryRef);
    });

    await batch.commit();

    return {
      success: true,
    };
  } catch (error) {
    console.log("Bulk Delete Error:", error);

    return {
      success: false,
      error,
    };
  }
};

/*
|--------------------------------------------------------------------------
| EXPORT CATEGORIES TO CSV
|--------------------------------------------------------------------------
*/
export const exportCategoriesToCSV = (categories = []) => {
  try {
    const rows = categories.map((category) => ({
      Name: category.name || "",
      Slug: category.slug || "",
      Description: category.description || "",
    }));

    const csvContent = [
      Object.keys(rows[0] || {}).join(","),
      ...rows.map((row) =>
        Object.values(row)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "categories.csv");

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  } catch (error) {
    console.log("CSV Export Error:", error);
  }
};
