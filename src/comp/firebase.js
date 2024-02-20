import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { ref, remove } from 'firebase/database';
// import { db } from './firebase';

const firebaseConfig = {
  apiKey: "AIzaSyBGzgYb3rcshkQiff0tcrCrbADr1r2sru4",
  authDomain: "project3-5a4d6.firebaseapp.com",
  databaseURL: "https://project3-5a4d6-default-rtdb.firebaseio.com",
  projectId: "project3-5a4d6",
  storageBucket: "project3-5a4d6.appspot.com",
  messagingSenderId: "698312390113",
  appId: "1:698312390113:web:d1a32500ece37a40c48ea0",
  measurementId: "G-QXR2SMBQ4S"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const deleteTransaction = (transactionId) => {
  const transactionRef = ref(db, `transactions/${transactionId}`);
  remove(transactionRef)
    .then(() => {
      console.log('Transaction deleted successfully.');
    })
    .catch((error) => {
      console.error('Error deleting transaction:', error);
    });
};


export { db, app, auth, deleteTransaction }