// Firebase configuration and helper functions
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, onSnapshot, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyDtDVmyUJZ1hf3lkLjdGMZZKNu-lO80tPI",
  authDomain: "asrs-94824.firebaseapp.com",
  projectId: "asrs-94824",
  storageBucket: "asrs-94824.firebasestorage.app",
  messagingSenderId: "15730233471",
  appId: "1:15730233471:web:b2a3d514c98395785aaf4a",
  measurementId: "G-W97NT62ED0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// User management functions
export const createUser = async (email: string, password: string, userData: Record<string, unknown>) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user profile in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    ...userData,
    email: user.email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return user;
};

export const signInUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: Record<string, unknown>) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Application management functions
export const createApplication = async (applicationData: Record<string, unknown>) => {
  const docRef = await addDoc(collection(db, 'applications'), {
    ...applicationData,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateApplication = async (applicationId: string, data: Record<string, unknown>) => {
  const docRef = doc(db, 'applications', applicationId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const getApplicationsByUser = (userId: string, callback: (applications: Record<string, unknown>[]) => void) => {
  const q = query(
    collection(db, 'applications'),
    where('applicantId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(applications);
  });
};

export const getAllApplications = (callback: (applications: Record<string, unknown>[]) => void) => {
  const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(applications);
  });
};

// Review management functions
export const createReview = async (reviewData: Record<string, unknown>) => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getReviewsByApplication = async (applicationId: string) => {
  const q = query(
    collection(db, 'reviews'),
    where('applicationId', '==', applicationId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// File upload function
export const uploadFile = (file: File, path: string, onProgress: (progress: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

// Get all users (admin only)
export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};