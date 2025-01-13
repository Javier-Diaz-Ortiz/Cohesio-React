import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert } from 'react-native';

const UserHomeScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]); // Estado para almacenar los proyectos
  const [newProjectName, setNewProjectName] = useState(''); // Estado para el nombre del nuevo proyecto

  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Project name cannot be empty.');
      return;
    }
    // Agregar el nuevo proyecto
    const newProject = { id: Date.now().toString(), name: newProjectName };
    setProjects([...projects, newProject]);
    setNewProjectName(''); // Limpiar el campo de entrada
  };

  const renderProject = ({ item }) => (
    <TouchableOpacity
      style={styles.projectItem}
      onPress={() => navigation.navigate('CreateReview', { projectId: item.id })}
    >
      <Text style={styles.projectName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, User!</Text>
        <Text style={styles.subHeader}>Manage your projects below</Text>
      </View>

      {/* Input and Add Project Button */}
      <View style={styles.addProjectContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new project name"
          value={newProjectName}
          onChangeText={setNewProjectName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
          <Text style={styles.addButtonText}>Create New Project</Text>
        </TouchableOpacity>
      </View>

      {/* Project List */}
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProject}
        contentContainerStyle={styles.projectList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No projects created yet. Start by creating one!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f9',
  },
  header: {
    padding: 20,
    backgroundColor: '#2a9d8f',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#dfe5e9',
    textAlign: 'center',
    marginTop: 5,
  },
  addProjectContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#264653',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectList: {
    padding: 20,
  },
  projectItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  projectName: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default UserHomeScreen;
