import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import db from "../database/firebase";
import { ScrollView } from "react-native-gesture-handler";
import { ListItem, Avatar } from "react-native-elements";

const ProjectsScreen = (props) => {
  console.log(props.route.params.userId);

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectsCollection = collection(db, "projects");

    onSnapshot(projectsCollection, (querySnapshot) => {
      // querySnapshot contiene los datos de la base de datos
      const projects = [];

      querySnapshot.docs.forEach((doc) => {
        const { direction, block, floor, apartment } = doc.data();
        projects.push({
          id: doc.id, // project id
          direction,
          block,
          floor,
          apartment,
        });
      });

      setProjects(projects); // Guarda los proyectos en el estado
    });
  }, []);

  return (
    <ScrollView>
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => props.navigation.navigate("CreateReview")}
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
                projectId: project.id, // Pasa el ID del proyecto
                direction: project.direction, // Dirección
                block: project.block, // Bloque
                floor: project.floor, // Piso
                apartment: project.apartment, // Apartamento
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
          </ListItem>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#E37999", // Color de fondo del botón
    paddingVertical: 12, // Espaciado vertical
    paddingHorizontal: 20, // Espaciado horizontal
    borderRadius: 30, // Bordes redondeados
    shadowColor: "#000", // Sombra
    shadowOffset: { width: 0, height: 4 }, // Desplazamiento de la sombra
    shadowOpacity: 0.2, // Opacidad de la sombra
    shadowRadius: 5, // Radio de la sombra
    elevation: 5, // Elevación para Android
    alignItems: "center", // Centrar el texto horizontalmente
    justifyContent: "center", // Centrar el texto verticalmente
  },
});

export default ProjectsScreen;
