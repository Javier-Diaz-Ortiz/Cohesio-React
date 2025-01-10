import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../database/firebase'; // Asegúrate de tener bien configurada tu conexión a Firebase

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      alert('Password must be at least 6 characters long, contain a number, and include both uppercase and lowercase letters.');
      return;
    }

    if (!validateEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
      });

      console.log('User registered and saved to Firestore:', user);
      navigation.navigate('LoginScreen'); 
    } catch (error) {
      
      if (error.code === 'auth/email-already-in-use') {
        alert('The email address is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        alert('The email address is invalid.');
      } else if (error.code === 'auth/weak-password') {
        alert('Password should be at least 6 characters.');
      } else {
        alert('You have been registered correctly', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#f4f4f9' // Fondo suave para un toque profesional
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 30, 
    textAlign: 'center', 
    color: '#333', // Color oscuro para mayor contraste
  },
  input: { 
    width: '100%', 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#ddd', // Color de borde suave
    backgroundColor: '#fff', 
    paddingHorizontal: 15, 
    marginBottom: 15, 
    borderRadius: 8, 
    fontSize: 16, 
    color: '#333', 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 2 }, 
    elevation: 2 
  },
  button: { 
    backgroundColor: '#2a9d8f', 
    paddingVertical: 15, 
    borderRadius: 8, 
    width: '100%', 
    alignItems: 'center', 
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  linkText: { 
    color: '#2a9d8f', 
    textAlign: 'center', 
    marginTop: 15, 
    fontSize: 16 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    color: '#2a9d8f',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default RegisterScreen;
