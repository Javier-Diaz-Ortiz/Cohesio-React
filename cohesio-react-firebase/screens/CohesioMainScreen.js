import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PARTICLE_COUNT = 50;
const TITLE_PARTICLE_COUNT = 10;

const CohesioMainScreen = (props) => {
  const [gradientAnimation] = useState(new Animated.Value(0));
  const particles = useRef([]);
  const titleParticles = useRef([]);
  const oPositions = useRef([]);

  useEffect(() => {
    // Fondo animado con una transición más dinámica y fluida, como un degradado
    Animated.loop(
      Animated.timing(gradientAnimation, {
        toValue: 1,
        duration: 10000, // Duración de la animación (más suave)
        useNativeDriver: false, // No usamos el driver nativo para interpolación de colores
      })
    ).start();

    // Inicializar partículas
    initializeParticles(particles, PARTICLE_COUNT, false);
    initializeParticles(titleParticles, TITLE_PARTICLE_COUNT, true);

    // Animar partículas
    particles.current.forEach((particle) => animateParticle(particle));
    titleParticles.current.forEach((particle) => animateParticle(particle, true));
  }, []);

  const initializeParticles = (particleRef, count, isTitle) => {
    const particleArray = Array.from({ length: count }, () => ({
      x: new Animated.Value(Math.random() * screenWidth),
      y: new Animated.Value(isTitle ? -50 : Math.random() * screenHeight),
      size: Math.random() * 8 + 3,
      opacity: new Animated.Value(1),
      duration: Math.random() * 5000 + 3000,
    }));
    particleRef.current = particleArray;
  };

  const animateParticle = (particle, isTitleParticle = false) => {
    const newX = isTitleParticle
      ? oPositions.current[Math.floor(Math.random() * oPositions.current.length)]?.x || Math.random() * screenWidth
      : Math.random() * screenWidth;
    const newY = isTitleParticle ? screenHeight : Math.random() * screenHeight;

    Animated.parallel([
      Animated.timing(particle.x, {
        toValue: newX,
        duration: particle.duration,
        useNativeDriver: true,
      }),
      Animated.timing(particle.y, {
        toValue: newY,
        duration: particle.duration,
        useNativeDriver: true,
      }),
      Animated.timing(particle.opacity, {
        toValue: Math.random(),
        duration: particle.duration,
        useNativeDriver: true,
      }),
    ]).start(() => resetParticle(particle, isTitleParticle));
  };

  const resetParticle = (particle, isTitleParticle = false) => {
    particle.x.setValue(isTitleParticle ? -50 : Math.random() * screenWidth);
    particle.y.setValue(isTitleParticle ? -50 : Math.random() * screenHeight);
    particle.opacity.setValue(1);
    animateParticle(particle, isTitleParticle);
  };

  // Interpolación dinámica para el fondo, creando un degradado continuo
  const interpolateColors = gradientAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      'rgba(74, 144, 226, 1)',  // Color inicial
      'rgba(123, 67, 151, 1)',  // Primer color intermedio
      'rgba(255, 183, 77, 1)',  // Segundo color intermedio
      'rgba(252, 112, 112, 1)', // Tercer color intermedio
      'rgba(74, 144, 226, 1)',  // Color final (igual al inicial para crear el bucle)
    ],
  });

  const handleTitleLayout = (event, index) => {
    const { x, width } = event.nativeEvent.layout;
    if (index === 0) {
      oPositions.current[0] = { x: x + width / 2 };
    } else if (index === 1) {
      oPositions.current[1] = { x: x + width / 2 };
    }
  };

  return (
    <View style={styles.container}>
      {/* Fondo dinámico con degradado continuo */}
      <Animated.View
        style={[
          styles.background,
          {
            backgroundColor: interpolateColors,
          },
        ]}
      />

      {/* Partículas de fondo */}
      {particles.current.map((particle, index) => (
        <Animated.View
          key={`particle-${index}`}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            opacity: particle.opacity,
            transform: [{ translateX: particle.x }, { translateY: particle.y }],
          }}
        />
      ))}

      {/* Partículas del título */}
      {titleParticles.current.map((particle, index) => (
        <Animated.View
          key={`title-particle-${index}`}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: 'rgba(255, 183, 77, 0.8)',
            opacity: particle.opacity,
            transform: [{ translateX: particle.x }, { translateY: particle.y }],
          }}
        />
      ))}

      {/* Título */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          C
          <Text
            style={styles.strikethrough}
            onLayout={(event) => handleTitleLayout(event, 0)} // Obtiene la posición de la primera "O"
          >
            o
          </Text>
          hesi
          <Text
            style={styles.lastO}  // Última "O" en blanco
            onLayout={(event) => handleTitleLayout(event, 1)} // Obtiene la posición de la segunda "O"
          >
            o
          </Text>
        </Text>
      </View>

      {/* Botones */}
      <TouchableOpacity
        style={styles.smallButton}
        onPress={() => props.navigation.navigate('CreateUserScreen')}
      >
        <Text style={styles.buttonText}>Create New User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.smallButton, styles.secondaryButton]}
        onPress={() => props.navigation.navigate('UsersList')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          View Users
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  background: { ...StyleSheet.absoluteFillObject },
  titleContainer: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 50, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  strikethrough: { textDecorationLine: 'line-through', color: '#FFB74D', fontSize: 50 },
  lastO: { color: '#FFFFFF', fontSize: 50 },  // Estilo para la última "O" en blanco
  smallButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.6,
  },
  secondaryButton: { backgroundColor: '#7B4397' },
  secondaryButtonText: { color: '#FFFFFF' },
  buttonText: { color: '#4A90E2', fontSize: 16, fontWeight: 'bold' },
});

export default CohesioMainScreen;
