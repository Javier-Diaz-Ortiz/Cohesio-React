import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { collection, onSnapshot, doc, deleteDoc, query, where } from "firebase/firestore";
import db from "../database/firebase";
import { ScrollView } from "react-native-gesture-handler";
import { ListItem, Avatar } from "react-native-elements";

const ProjectsScreen = (props) => {
  const userId = props.route.params.userId; // ID del usuario actual
  const emailOfUser = props.route.params.email; // Email del usuario actualº
  console.log(emailOfUser);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectsCollection = collection(db, "projects");
    const userProjectsQuery = query(projectsCollection, where("userId", "==", userId));

    const unsubscribe = onSnapshot(userProjectsQuery, (querySnapshot) => {
      const userProjects = [];

      querySnapshot.docs.forEach((doc) => {
        const { direction, block, floor, apartment } = doc.data();
        userProjects.push({
          id: doc.id,
          direction,
          block,
          floor,
          apartment,
        });
      });

      setProjects(userProjects);
    });

    return () => unsubscribe(); // Limpiar el listener
  }, [userId]);

  const deleteProject = async (projectId) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
      if (Platform.OS !== "web") {
        Alert.alert("Success", "Project deleted successfully.");
      }
    } catch (error) {
      console.error("Error deleting project: ", error);
      if (Platform.OS !== "web") {
        Alert.alert("Error", "Failed to delete project.");
      }
    }
  };

  const confirmDelete = (projectId) => {
    if (Platform.OS === "web") {
      const confirm = window.confirm("Are you sure you want to delete this project?");
      if (confirm) deleteProject(projectId);
    } else {
      Alert.alert(
        "Delete Project",
        "Are you sure you want to delete this project?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "OK", onPress: () => deleteProject(projectId) },
        ]
      );
    }
  };

  return (
    <ScrollView>
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => props.navigation.navigate("CreateReview", { userId: props.route.params.userId })}
        >
          <Text>New Review</Text>
        </TouchableOpacity>
      </View>
      {projects.map((project) => {
        return (
          <ListItem
            key={project.id}
            bottomDivider
            onPress={() =>
              props.navigation.navigate("ReviewScreen", {
                emailOfUser: emailOfUser, // email para el  correo
               // projectId: project.id,
                direction: project.direction,
                block: project.block,
                floor: project.floor,
                apartment: project.apartment,
              })
            }
          >
            <ListItem.Chevron />
            <Avatar source={{ uri: "https://randomuser.me/api/portraits" }} rounded />
            <ListItem.Content>
              <ListItem.Title>{project.direction}</ListItem.Title>
              <ListItem.Title>{project.block}</ListItem.Title>
              <ListItem.Title>{project.floor}</ListItem.Title>
              <ListItem.Title>{project.apartment}</ListItem.Title>
            </ListItem.Content>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDelete(project.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </ListItem>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#E37999",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProjectsScreen;
