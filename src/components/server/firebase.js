import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCPs5CW5knVlnXLo4fA5Ig3DavQRzFYPlA",
  authDomain: "scd2-925b7.firebaseapp.com",
  databaseURL: "https://scd2-925b7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scd2-925b7",
  storageBucket: "scd2-925b7.firebasestorage.app",
  messagingSenderId: "724863961788",
  appId: "1:724863961788:web:6190a3d1a1d8314cf1deb9",
  measurementId: "G-780RFTJ4Y1"
};

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const database = firebase.database();
  const App = initializeApp(firebaseConfig);
  const auth = getAuth(App);
  const googleProvider = new GoogleAuthProvider();

  export {database,auth,googleProvider };