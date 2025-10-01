import React, { useEffect, useState } from 'react';
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import auth from '../firebase/firebase.config';
import { AuthContext } from './AuthContext'; // Ensure this exists in the same folder
import axios from 'axios';

const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Create user with email and password
    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    // Sign in with email and password
    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Sign in with Google
    const googleSignIn = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    // Log out
    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };

    // Update user profile (name and photo)
    const updateUserProfile = (name, photo) => {
        if (!auth.currentUser) return;
        return updateProfile(auth.currentUser, {
            displayName: name,
            photoURL: photo
        });
    };

    // Watch for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            console.log('Current user:', currentUser);

            if (currentUser) {
                // If user exists, request a JWT
                axios.post('https://aegis-life-server.onrender.com/jwt', { email: currentUser.email })
                    .then(res => {
                        localStorage.setItem('access-token', res.data.token);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error("JWT fetch error:", err);
                        setLoading(false);
                    });
            } else {
                // If user logs out, remove token
                localStorage.removeItem('access-token');
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const authInfo = {
        user,
        loading,
        createUser,
        signIn,
        googleSignIn,
        logOut,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
