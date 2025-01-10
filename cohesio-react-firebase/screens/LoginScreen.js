import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../database/firebase'; // Asegúrate de tener bien configurada tu conexión a Firebase

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      // Intentamos autenticar al usuario con el correo y la contraseña proporcionados
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', email);
      // Si la autenticación es exitosa, navegamos a la pantalla principal o inicio
      navigation.navigate('HomeScreen'); // Cambia esto según tu navegación
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'The email address is not registered.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'The password is incorrect.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'The email address is invalid.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
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
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>
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
    backgroundColor: '#f4f4f9' 
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
});

export default LoginScreen;
