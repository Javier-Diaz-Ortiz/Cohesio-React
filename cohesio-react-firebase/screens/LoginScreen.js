import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../database/firebase'; 

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ email: '', password: '', general: '' });

  const handleLogin = async () => {
    setError({ email: '', password: '', general: '' }); 

    if (!email) {
      setError((prev) => ({ ...prev, email: 'Email is required' }));
    }
    if (!password) {
      setError((prev) => ({ ...prev, password: 'Password is required' }));
    }
    if (!email || !password) {
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', email);
      navigation.navigate('ProjectsScreen', { email });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setError((prev) => ({ ...prev, general: 'The email address is not registered.' }));
      } else if (error.code === 'auth/wrong-password') {
        setError((prev) => ({ ...prev, password: 'The password is incorrect.' }));
      } else if (error.code === 'auth/invalid-email') {
        setError((prev) => ({ ...prev, email: 'The email address is invalid.' }));
      } else {
        setError((prev) => ({ ...prev, general: `An unexpected error occurred: ${error.message}` }));
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {error.email ? <Text style={styles.errorText}>{error.email}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error.password ? <Text style={styles.errorText}>{error.password}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
      {error.general ? <Text style={styles.errorText}>{error.general}</Text> : null}
      <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
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
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 5, 
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  errorText: {
    color: '#e63946', 
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
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
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#2a9d8f',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
});

export default LoginScreen;
