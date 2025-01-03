import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

// Componente principal de la pantalla
const CohesioMainScreen = (props) => {
  const [bounceValue] = useState(new Animated.Value(1)); // Animación de rebote

  useEffect(() => {
    // Animación para hacer el rebote cuando la pantalla se carga
    Animated.loop(
      Animated.sequence([
        Animated.spring(bounceValue, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(bounceValue, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceValue]);

  return (
    <View style={styles.container}>
      {/* Animación en el título */}
      <Animated.View style={[styles.titleContainer, { transform: [{ scale: bounceValue }] }]}>
        <Text style={styles.title}>Welcome to Cohesio</Text>
      </Animated.View>

      {/* Botón de navegación */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => props.navigation.navigate('CreateUserScreen')}
      >
        <Text style={styles.buttonText}>Create New User</Text>
      </TouchableOpacity>

      {/* Otro botón para navegar */}
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={() => props.navigation.navigate('UsersList')}
      >
        <Text style={styles.buttonText}>View Users</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // Fondo claro
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4A90E2', // Color atractivo para el título
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#E37999', // Color de fondo del botón
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#4A90E2', // Botón secundario con otro color
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CohesioMainScreen;
