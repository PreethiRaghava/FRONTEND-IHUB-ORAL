import firebase from 'firebase/app'
import 'firebase/auth'
console.log('fire base initialising');

const firebaseConfig = {
  apiKey: "AIzaSyAPitgdYGcVH2aoMkxHt4ncT5qoU6RKjxQ",
  // authDomain: "tih-hcp.firebaseapp.com",
  authDomain: "https://healthcare-data.iiit.ac.in",
  projectId: "tih-hcp",
  storageBucket: "tih-hcp.appspot.com",
  messagingSenderId: "663252432176",
  appId: "1:663252432176:web:350195a761e89ac25384f5"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
console.log('fire base initialised');
export default firebase
