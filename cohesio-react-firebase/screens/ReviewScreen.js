import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';

import * as Sharing from "expo-sharing";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
import { collection, addDoc } from "firebase/firestore";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { launchImageLibrary } from "react-native-image-picker";
import Mailer from "react-native-mail";
import db from "../database/firebase"; // Configuración de Firebase
import { jsPDF } from "jspdf"; // Para Web

const ReviewScreen = (props) => {
  const [selectedData, setSelectedData] = useState({
    direction: props.route.params?.direction || "",
    block: props.route.params?.block || "",
    floor: props.route.params?.floor || "",
    apartment: props.route.params?.apartment || "",
  });

  const [rooms, setRooms] = useState([]);
  const [constructorEmail, setConstructorEmail] = useState("");
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);

   //Permissions
   const checkPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log("You need to grant permission to access media library.");
    }
  };

  //Check for permissions
  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    generateRooms(selectedData);
  }, [selectedData]);

  const generateRooms = ({ direction, block, floor, apartment }) => {
    const randomFactor =
      (direction.length + block.length + parseInt(floor) + parseInt(apartment)) % 3;

    const predefinedLayouts = [
      [
        { id: 1, name: "Living Room", x: 10, y: 10, width: 100, height: 70 },
        { id: 2, name: "Kitchen", x: 120, y: 10, width: 80, height: 70 },
        { id: 3, name: "Bedroom 1", x: 10, y: 90, width: 90, height: 60 },
        { id: 4, name: "Bathroom", x: 110, y: 90, width: 70, height: 60 },
      ],
      [
        { id: 1, name: "Hall", x: 10, y: 10, width: 80, height: 50 },
        { id: 2, name: "Bedroom", x: 10, y: 70, width: 120, height: 80 },
        { id: 3, name: "Kitchen", x: 140, y: 10, width: 60, height: 50 },
        { id: 4, name: "Bathroom", x: 140, y: 70, width: 60, height: 80 },
      ],
      [
        { id: 1, name: "Bedroom", x: 10, y: 10, width: 100, height: 60 },
        { id: 2, name: "Living Room", x: 120, y: 10, width: 80, height: 60 },
        { id: 3, name: "Kitchen", x: 10, y: 80, width: 90, height: 70 },
        { id: 4, name: "Bathroom", x: 110, y: 80, width: 90, height: 70 },
      ],
    ];

    const layout = predefinedLayouts[randomFactor];
    setRooms(layout.map((room) => ({ ...room, isRed: false })));
  };

  const toggleRoomColor = (id) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === id ? { ...room, isRed: !room.isRed } : room
      )
    );
  };

  const generatePDF = async () => {
    const redRooms = rooms.filter((room) => room.isRed);
    const photoHTML = photo ? `<img src='${photo.uri}' alt='Attached photo' width='300'/>` : "";
    const htmlContent = `
      <h1>Apartment Inspection Report</h1>
      <p><strong>Direction:</strong> ${selectedData.direction}</p>
      <p><strong>Block:</strong> ${selectedData.block}</p>
      <p><strong>Floor:</strong> ${selectedData.floor}</p>
      <p><strong>Apartment:</strong> ${selectedData.apartment}</p>
      <h2>Marked Rooms:</h2>
      <ul>
        ${redRooms.map((room) => `<li>${room.name}</li>`).join("")}
      </ul>
      <h2>Comment:</h2>
      <p>${comment || "No comment provided."}</p>
      ${photoHTML}
    `;

    if (Platform.OS === 'web') {
      // Usar jsPDF en la web
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Apartment Inspection Report", 10, 10);

      doc.setFontSize(12);
      doc.text(`Direction: ${selectedData.direction}`, 10, 20);
      doc.text(`Block: ${selectedData.block}`, 10, 30);
      doc.text(`Floor: ${selectedData.floor}`, 10, 40);
      doc.text(`Apartment: ${selectedData.apartment}`, 10, 50);
      doc.text("Marked Rooms:", 10, 60);
      redRooms.forEach((room, index) => {
        doc.text(`${index + 1}. ${room.name}`, 10, 70 + index * 10);
      });
      doc.text(`Comment: ${comment || "No comment provided."}`, 10, 90);

      if (photo) {
        doc.addImage(photo.uri, "JPEG", 10, 100, 180, 160);
      }

      const pdfOutput = doc.output("blob");
      return URL.createObjectURL(pdfOutput); // Esto retorna un enlace al blob de PDF
    } else {
      // Usar react-native-html-to-pdf en Android
      try {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        if (Platform.OS !== "web" && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
        return uri;
      } catch (error) {
        console.error("Error generating PDF:", error);
        Alert.alert("Error", "Failed to generate PDF.");
        return null;
      }
    }
  };

  const sendEmailWithPDF = async () => {
    if (!constructorEmail || !/\S+@\S+\.\S+/.test(constructorEmail)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const pdfPath = await generatePDF();
    if (!pdfPath) return;

    if (Platform.OS === 'web') {
      window.open(pdfPath); // For web, opens generated PDF.
      Alert.alert("Success", "PDF is ready to be downloaded.");
    } else {
      // Enviar el correo con la aplicación nativa
      Mailer.mail(
        {
          subject: "Inspection Report",
          recipients: [constructorEmail],
          body: "Please find attached the inspection report.",
          isHTML: true,
          attachment: {
            path: pdfPath,
            type: "pdf",
            name: "Inspection_Report.pdf",
          },
        },
        (error) => {
          if (error) {
            Alert.alert("Error", "Failed to send email.");
            console.error(error);
          } else {
            Alert.alert("Success", "Email sent successfully!");
          }
        }
      );
    }
  };

  const selectPhoto = () => {
    if (Platform.OS === "web") {
      // Usar un input de tipo file en la web
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhoto({ uri: reader.result });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // Usar launchImageLibrary en Android
      launchImageLibrary(
        { mediaType: "photo", selectionLimit: 1 },
        (response) => {
          if (response.didCancel) {
            console.log("User cancelled photo picker");
          } else if (response.errorCode) {
            console.error("ImagePicker Error: ", response.errorMessage);
          } else {
            setPhoto(response.assets[0]);
          }
        }
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Svg width="300" height="200" style={styles.svgContainer}>
        {rooms.map((room) => (
          <Rect
            key={room.id}
            x={room.x}
            y={room.y}
            width={room.width}
            height={room.height}
            fill={room.isRed ? "red" : "lightgray"}
            stroke="black"
            strokeWidth="2"
            onPress={() => toggleRoomColor(room.id)}
          />
        ))}
      </Svg>

      <TextInput
        style={styles.input}
        placeholder="Constructor's Email"
        value={constructorEmail}
        onChangeText={(email) => {
          setConstructorEmail(email.trim()); 
        }}
      />
      

      <TextInput
        style={[styles.input, styles.commentInput]}
        placeholder="Comment"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      {photo && <Image source={{ uri: photo.uri }} style={styles.photo} />}

      <TouchableOpacity style={styles.photoButton} onPress={selectPhoto}>
        <Text style={styles.photoButtonText}>Select Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.photoButton} onPress={sendEmailWithPDF}>
        <Text style={styles.photoButtonText}>Send Email</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  svgContainer: {
    marginVertical: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  commentInput: {
    height: 80,
    textAlignVertical: "top",
  },
  photo: {
    width: 300,
    height: 200,
    marginVertical: 15,
  },
  photoButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  photoButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ReviewScreen;
