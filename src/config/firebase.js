import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCviwqiqT2Nm6dYAclLMeF7yRgdyDqP8MU",
  authDomain: "manzapp-ace38.firebaseapp.com",
  projectId: "manzapp-ace38",
  storageBucket: "manzapp-ace38.firebasestorage.app",
  messagingSenderId: "405582019817",
  appId: "1:405582019817:web:622b3355a812cc24ce8478",
  measurementId: "G-5CFEZN1DC6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();