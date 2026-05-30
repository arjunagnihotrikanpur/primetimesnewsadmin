import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getAllPushTokens() {
  try {
    const snapshot = await getDocs(collection(db, "pushTokens"));

    const tokens = snapshot.docs.map((doc) => doc.data().token);

    return tokens;
  } catch (error) {
    console.log(error);
    return [];
  }
}
