import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDUgLrgvUOgpWlBAUo-u_Da9jE34MWBDSk",
  authDomain: "anuwat-cf0af.firebaseapp.com",
  databaseURL: "https://anuwat-cf0af-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anuwat-cf0af",
  storageBucket: "anuwat-cf0af.firebasestorage.app",
  messagingSenderId: "380507856082",
  appId: "1:380507856082:web:f517c5552abd8ef3de610b",
  measurementId: "G-L40Y3JPXFY"
};

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const database = firebase.database();
  const App = initializeApp(firebaseConfig);
  const auth = getAuth(App);
  const googleProvider = new GoogleAuthProvider();

  export {database,auth,googleProvider };