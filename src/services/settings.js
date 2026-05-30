import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "./firebase";

export const getThemeSettings = async () => {
  const ref = doc(db, "settings", "theme");

  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const defaultTheme = {
      backgroundColor: "#F8F5EE",

      headerColor: "#4B4C47",
      homeTitle: "Watch Live News Videos",
    };

    await setDoc(ref, defaultTheme);

    return defaultTheme;
  }

  return snapshot.data();
};

export const updateThemeSettings = async (data) => {
  const ref = doc(db, "settings", "theme");

  await setDoc(ref, data);
};
