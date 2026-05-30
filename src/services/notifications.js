import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

import { db } from "../services/firebase";

// OLD WAY !!!!!!!!!!!!!!!
export async function sendPushNotification({ title, body }) {
  try {
    await addDoc(collection(db, "notifications"), {
      title,
      body,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.log(error);

    throw error;
  }
}

// NEW WAY!!!!!!!!!!!!  - we're not using this currently

// export default async function sendPushNotification({ title, body }) {
//   try {
//     // Fetch all push tokens
//     const snapshot = await getDocs(collection(db, "pushTokens"));

//     const tokens = [];

//     snapshot.forEach((doc) => {
//       const data = doc.data();

//       if (data?.token) {
//         tokens.push(data.token);
//       }
//     });

//     // Create notification messages
//     const messages = tokens.map((token) => ({
//       to: token,
//       sound: "default",
//       title,
//       body,
//     }));

//     // Chunk notifications (Expo recommends batches)
//     const chunkSize = 100;

//     for (let i = 0; i < messages.length; i += chunkSize) {
//       const chunk = messages.slice(i, i + chunkSize);

//       await fetch("https://exp.host/--/api/v2/push/send", {
//         method: "POST",
//         mode: "no-cors",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(chunk),
//       });
//     }

//     console.log("Push notifications sent successfully");
//   } catch (error) {
//     console.log(error);

//     throw error;
//   }
// }
