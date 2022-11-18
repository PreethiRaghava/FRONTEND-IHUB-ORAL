import firebase from 'firebase/app'
import 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAPitgdYGcVH2aoMkxHt4ncT5qoU6RKjxQ",
  authDomain: "tih-hcp.firebaseapp.com",
  projectId: "tih-hcp",
  storageBucket: "tih-hcp.appspot.com",
  messagingSenderId: "663252432176",
  appId: "1:663252432176:web:350195a761e89ac25384f5"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
export default firebase
