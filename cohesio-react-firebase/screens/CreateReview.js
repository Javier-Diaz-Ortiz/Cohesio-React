import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { collection, addDoc } from "firebase/firestore";
import db from "../database/firebase";

const CreateReview = (props) => {
  const userId = props.route.params?.email; // Get the email passed as a prop

  const [state, setState] = useState({
    direction: "",
    block: "",
    floor: "",
    apartment: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState("");

  const handleSelect = (field, value) => {
    setState({ ...state, [field]: value });
    setModalVisible(false);
  };

  const saveNewProject = async () => {
    if (state.direction === "") {
      alert("Please provide a direction");
    } else {
      try {
        const projectsCollection = collection(db, "projects");

        await addDoc(projectsCollection, { //data inicialization
          apartment: state.apartment,
          block: state.block,
          comment: null,
          direction: state.direction,
          floor: state.floor,
          photo: null,
          redRooms: null,
          timestamp: null,
          userId: userId, // Include the userId associated with the project
        });

        console.log("Project successfully added.");
        props.navigation.navigate("ProjectsScreen", { userId }); // Navigate back with the userId.
      } catch (error) {
        console.error("Error adding the project:", error);
      }
    }
  };

  const options = {
    direction: ["North", "South", "East", "West"],
    block: ["A", "B", "C", "D"],
    floor: ["1", "2", "3", "4", "5"],
    apartment: ["101", "102", "201", "202"],
  };

  return (
    <ScrollView style={styles.container}>
      {["direction", "block"].map((field, index) => (
        <View style={styles.inputGroup} key={index}>
          <Text style={styles.label}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setCurrentField(field);
              setModalVisible(true);
            }}
          >
            <Text style={styles.selectedValue}>
              {state[field] || `Select ${field}`}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      {/*Only for Floor */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Floor</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter floor"
          keyboardType="numeric"
          value={state.floor}
          onChangeText={(value) => setState({ ...state, floor: value })}
        />
      </View>

      {/* Only for Apartment */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Apartment</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter apartment"
          keyboardType="numeric"
          value={state.apartment}
          onChangeText={(value) => setState({ ...state, apartment: value })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Button title="Save Project" onPress={() => saveNewProject()} />
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select {currentField.charAt(0).toUpperCase() + currentField.slice(1)}
            </Text>
            {options[currentField]?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => handleSelect(currentField, option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    backgroundColor: "#f8f8f8",
  },
  inputGroup: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dropdown: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 5,
  },
  selectedValue: {
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
  },
  textInput: {
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
});

export default CreateReview;
