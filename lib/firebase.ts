import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWdcPq5XG4f9HxDhu9yg0T0uY62YG5CEw",
  authDomain: "kcf-org.firebaseapp.com",
  projectId: "kcf-org",
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
