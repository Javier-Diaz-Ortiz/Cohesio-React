import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';

const PARTICLE_COUNT = 30; //Reduced for better performance
const TITLE_PARTICLE_COUNT = 5;

const CohesioMainScreen = (props) => {
  const [gradientAnimation] = useState(new Animated.Value(0));
  const particles = useRef([]);
  const titleParticles = useRef([]);
  const oPositions = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false); //State to force an update
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width); // To adjust the width
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height); //To adjust the height

  useEffect(() => {
    // Listener for changes in window dimensions
    const onChange = ({ window }) => {
      setScreenWidth(window.width);
      setScreenHeight(window.height);
    };

    Dimensions.addEventListener('change', onChange);

    //Background animation
    Animated.loop(
      Animated.timing(gradientAnimation, {
        toValue: 1,
        duration: 20000, 
        useNativeDriver: false,
      })
    ).start();

    //Initialize particles
    initializeParticles(particles, PARTICLE_COUNT, false);
    initializeParticles(titleParticles, TITLE_PARTICLE_COUNT, true);

    // Force update after mounting
    setIsLoaded(true);

    // Clean up the listener when the component unmounts
    return () => {
      Dimensions.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      // Animate particles after the update
      particles.current.forEach((particle) => animateParticle(particle));
      titleParticles.current.forEach((particle) => animateParticle(particle, true));
    }
  }, [isLoaded]);

  const initializeParticles = (particleRef, count, isTitle) => {
    const particleArray = Array.from({ length: count }, () => ({
      x: new Animated.Value(Math.random() * screenWidth),
      y: new Animated.Value(isTitle ? -50 : Math.random() * screenHeight),
      size: Math.random() * 10 + 5, // Larger size for better visibility
      opacity: new Animated.Value(1),
      duration: Math.random() * 8000 + 5000, // Longer animation
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
        toValue: Math.random() * 0.5 + 0.5, // Opacity between 0.5 and 1
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

  const interpolateColors = gradientAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      'rgba(74, 144, 226, 1)',
      'rgba(123, 67, 151, 1)',
      'rgba(255, 183, 77, 1)',
      'rgba(252, 112, 112, 1)',
      'rgba(74, 144, 226, 1)',
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
      {/* Dynamic background with continuous gradient */}
      <Animated.View
        style={[
          styles.background,
          {
            backgroundColor: interpolateColors,
          },
        ]}
      />

      {/* Background particles */}
      {particles.current.map((particle, index) => (
        <Animated.View
          key={`particle-${index}`}
          style={{
            position: 'absolute',
            zIndex: 1,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            opacity: particle.opacity,
            transform: [{ translateX: particle.x }, { translateY: particle.y }],
          }}
        />
      ))}

      {/* Title particles */}
      {titleParticles.current.map((particle, index) => (
        <Animated.View
          key={`title-particle-${index}`}
          style={{
            position: 'absolute',
            zIndex: 2,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: 'rgba(255, 183, 77, 0.8)',
            opacity: particle.opacity,
            transform: [{ translateX: particle.x }, { translateY: particle.y }],
          }}
        />
      ))}

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          C
          <Text
            style={styles.strikethrough}
            onLayout={(event) => handleTitleLayout(event, 0)}
          >
            o
          </Text>
          hesi
          <Text
            style={styles.lastO}
            onLayout={(event) => handleTitleLayout(event, 1)}
          >
            o
          </Text>
        </Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={[styles.smallButton, styles.secondaryButton]}
        onPress={() => props.navigation.navigate('LoginScreen')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Login
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.smallButton}
        onPress={() => props.navigation.navigate('RegisterScreen')}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  background: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
  titleContainer: { marginBottom: 40, alignItems: 'center', zIndex: 3 },
  title: { fontSize: 50, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  strikethrough: { textDecorationLine: 'line-through', color: '#FFB74D', fontSize: 50 },
  lastO: { color: '#FFFFFF', fontSize: 50 },
  smallButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%', 
    },
  secondaryButton: { backgroundColor: '#7B4397' },
  secondaryButtonText: { color: '#FFFFFF' },
  buttonText: { color: '#4A90E2', fontSize: 16, fontWeight: 'bold' },
});

export default CohesioMainScreen;
