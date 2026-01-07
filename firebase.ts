
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAyW4j1p2jh6IEtKQEgFDQIJQeW4rabzkQ",
  authDomain: "appdacris-7e446.firebaseapp.com",
  databaseURL: "https://appdacris-7e446-default-rtdb.firebaseio.com",
  projectId: "appdacris-7e446",
  storageBucket: "appdacris-7e446.appspot.com",
  messagingSenderId: "817937813272",
  appId: "1:817937813272:web:2cfcb93478f06b7737186d",
  measurementId: "G-QQQZVJQY5R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
