// Importa solo las funciones necesarias del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyACFH9fZe09lQfQhC_gbZnWv1HVk_06vy4",
  authDomain: "cohesio-react-firebase.firebaseapp.com",
  projectId: "cohesio-react-firebase",
  storageBucket: "cohesio-react-firebase.appspot.com",
  messagingSenderId: "634572187200",
  appId: "1:634572187200:web:09ff6d01c94bbddfbc21a5"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app);

export default db; // Exporta las funciones necesarias
