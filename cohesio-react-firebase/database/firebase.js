
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyACFH9fZe09lQfQhC_gbZnWv1HVk_06vy4",
  authDomain: "cohesio-react-firebase.firebaseapp.com",
  projectId: "cohesio-react-firebase",
  storageBucket: "cohesio-react-firebase.appspot.com",
  messagingSenderId: "634572187200",
  appId: "1:634572187200:web:09ff6d01c94bbddfbc21a5"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const auth = getAuth(app);
export default db; 
