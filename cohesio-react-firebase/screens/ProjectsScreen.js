import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import db from "../database/firebase";
import { ScrollView } from "react-native-gesture-handler";
import { ListItem, Avatar } from "react-native-elements";

const ProjectsScreen = (props) => {
  const email = props.route.params?.email; //Current user's email.
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectsCollection = collection(db, "projects");
    const userProjectsQuery = query(projectsCollection, where("userId", "==", email));

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

    return () => unsubscribe(); //Clean the listener
  }, [email]);

  const deleteProject = async (projectId) => {
    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
      Alert.alert("Success", "Project deleted successfully.");
    } catch (error) {
      console.error("Error deleting project: ", error);
      Alert.alert("Error", "Failed to delete project.");
    }
  };

  const confirmDelete = (projectId) => {
    Alert.alert(
      "Delete Project",
      "Are you sure you want to delete this project?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => deleteProject(projectId) },
      ]
    );
  };

  return (
    <ScrollView>
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            props.navigation.navigate("CreateReview", { email })
          }
        >
          <Text style={styles.buttonText}>New Project</Text>
        </TouchableOpacity>
      </View>
      {projects.map((project) => (
        <ListItem
          key={project.id}
          bottomDivider
          onPress={() =>
            props.navigation.navigate("ReviewScreen", {

              email, // Pass the user's email.
              direction: project.direction,
              block: project.block,
              floor: project.floor,
              apartment: project.apartment,
            })
          }
        >
          <ListItem.Chevron />
          <Avatar source={{ uri: "https://randomuser.me/api/portraits/lego/1.jpg" }} rounded />
          <ListItem.Content>
            <ListItem.Title>{`Direction: ${project.direction}`}</ListItem.Title>
            <ListItem.Subtitle>{`Block: ${project.block}, Floor: ${project.floor}, Apartment: ${project.apartment}`}</ListItem.Subtitle>
          </ListItem.Content>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(project.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </ListItem>
      ))}
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
    margin: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
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
