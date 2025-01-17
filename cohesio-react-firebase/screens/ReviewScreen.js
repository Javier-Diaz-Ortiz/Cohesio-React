import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from "expo-sharing";
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import Svg, { Rect,Text } from "react-native-svg";
import { collection, addDoc,updateDoc ,doc} from "firebase/firestore";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { launchImageLibrary } from "react-native-image-picker";
import Mailer from "react-native-mail";
import db from "../database/firebase"; // Firebase setup.
import { jsPDF } from "jspdf"; //For Web.

const ReviewScreen = (props) => {
  console.log("Route Params:", props.route.params);
  const projectId = props.route.params?.projectId;

  if (!projectId) {
    console.error("Project ID is missing in route params.");
    Alert.alert("Error", "Project ID is missing.");
    return null;
  }
  const [selectedData, setSelectedData] = useState({
    email : props.route.params.emailOfUser, //The email for the email sender.
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

    const predefinedLayouts = [ //TODO Put more please and change the randomFactor
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
    const photoHTML = photo
      ? `<img src='${photo.uri}' alt='Attached photo' style='width:100%; max-width:400px; border:3px solid #0056b3; border-radius:12px; margin:20px 0;'/>`
      : "";
    
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Apartment Inspection Report</title>
      <style>
        body {
          font-family: 'Helvetica Neue', 'Arial', sans-serif;
          background: linear-gradient(120deg, #f4f4f9, #e6ebf5);
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 900px;
          margin: 40px auto;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        header {
          background-color: #0056b3;
          color: white;
          padding: 20px 40px;
          text-align: center;
        }
        header h1 {
          font-size: 2.4em;
          margin: 0;
        }
        header p {
          font-size: 1em;
          margin-top: 10px;
        }
        .content {
          padding: 20px 40px;
        }
        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .details p {
          margin: 0;
          font-size: 1em;
        }
        .details p strong {
          color: #0056b3;
        }
        h2 {
          color: #0056b3;
          border-bottom: 2px solid #0056b3;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        ul {
          list-style: none;
          padding-left: 0;
        }
        ul li {
          padding: 10px;
          margin-bottom: 5px;
          background: #e6ebf5;
          border-radius: 8px;
        }
        ul li:hover {
          background: #d1d9e6;
        }
        .photo-section {
          text-align: center;
          margin-top: 20px;
        }
        .photo-section img {
          transition: transform 0.3s ease;
        }
        .photo-section img:hover {
          transform: scale(1.05);
        }
        footer {
          background: #0056b3;
          color: white;
          text-align: center;
          padding: 10px;
          margin-top: 20px;
        }
        footer p {
          margin: 0;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Apartment Inspection Report</h1>
          <p>Comprehensive and detailed assessment</p>
        </header>
        <div class="content">
          <div class="details">
            <p><strong>Direction:</strong> ${selectedData.direction}</p>
            <p><strong>Block:</strong> ${selectedData.block}</p>
            <p><strong>Floor:</strong> ${selectedData.floor}</p>
            <p><strong>Apartment:</strong> ${selectedData.apartment}</p>
          </div>
          <h2>Marked Rooms</h2>
          <ul>
            ${redRooms.length > 0 
              ? redRooms.map((room) => `<li>${room.name}</li>`).join("") 
              : "<li>No marked rooms.</li>"
            }
          </ul>
          <h2>Comment</h2>
          <p>${comment || "No comment provided."}</p>
          <div class="photo-section">
            ${photoHTML}
          </div>
        </div>
        <footer>
          <p>© 2025 Cohesio. All rights reserved.</p>
        </footer>
      </div>
    </body>
    </html>
    `;
    


    if (Platform.OS === 'web') {
      // Importar jsPDF y preparar la generación del PDF
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
    
   // Título principal con un estilo más llamativo
doc.setFontSize(24);
doc.setFont("helvetica", "bold");
doc.setTextColor(0, 102, 204); // Color azul
doc.text("Apartment Inspection Report", 105, 20, { align: "center" }); // Centrado en la página

// Línea separadora debajo del título
doc.setDrawColor(0, 102, 204); // Azul
doc.setLineWidth(1);
doc.line(10, 25, 200, 25);

// Datos principales del reporte en una sección estructurada
doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.setTextColor(0, 0, 0); // Negro
doc.text("Property Details:", 10, 40); // Más espacio debajo del título

// Formato atractivo para los datos principales
doc.setFontSize(12);
doc.setFont("helvetica", "normal");
doc.text(`Direction: ${selectedData.direction}`, 15, 50);
doc.text(`Block: ${selectedData.block}`, 15, 60);
doc.text(`Floor: ${selectedData.floor}`, 15, 70);
doc.text(`Apartment: ${selectedData.apartment}`, 15, 80);

// Línea separadora para marcar inicio de otra sección
doc.setDrawColor(150); // Gris
doc.line(10, 90, 200, 90);

// Lista de habitaciones marcadas con mayor separación
doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.setTextColor(0, 0, 0);
doc.text("Marked Rooms:", 10, 110); // Mucho más espacio debajo del título

// Agregar un recuadro o viñetas para las habitaciones marcadas
doc.setFontSize(12);
doc.setFont("helvetica", "normal");
redRooms.forEach((room, index) => {
  doc.setDrawColor(0); // Negro
  doc.rect(10, 120 + index * 20 - 6, 190, 10); // Más espacio entre recuadros
  doc.text(`${index + 1}. ${room.name}`, 15, 120 + index * 20);
});

// Línea separadora para comentarios
doc.line(10, 130 + redRooms.length * 20 + 5, 200, 130 + redRooms.length * 20 + 5);

// Comentarios con formato atractivo
doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.setTextColor(0, 0, 0);
doc.text("Comment:", 10, 150 + redRooms.length * 20); // Más espacio debajo del título

// Comentario en un recuadro
doc.setFontSize(12);
doc.setFont("helvetica", "normal");
doc.setTextColor(80, 80, 80); // Gris oscuro
doc.text(
  comment || "No comment provided.",
  15,
  160 + redRooms.length * 20,
  { maxWidth: 180 } // Ajustar texto largo al ancho del recuadro
);
doc.setDrawColor(0);
doc.rect(10, 155 + redRooms.length * 20 - 5, 190, 20); // Recuadro para el comentario

// Pie de página con un diseño profesional
doc.setFontSize(10);
doc.setFont("helvetica", "italic");
doc.setTextColor(120); // Gris
doc.text("Generated with Apartment Inspection Report System © 2025", 105, 290, {
  align: "center",
});



      // Agregar imagen si está disponible
      if (photo) {
        // Añadir imagen al PDF (escalada para encajar en la página)
        doc.addImage(photo.uri, "JPEG", 10, 100 + redRooms.length * 10, 180, 120);
      }
    
      // Descargar automáticamente el archivo PDF
      doc.save('Apartment_Inspection_Report.pdf'); // Descarga el archivo con este nombre
    
      // Crear un enlace "mailto" para abrir el cliente de correo
      const email = "recipient@example.com"; // Cambiar por el correo del destinatario
      const subject = encodeURIComponent("Apartment Inspection Report");
      const body = encodeURIComponent(
        "Attached is the apartment inspection report. Please review the details."
      );
    
      // Redirigir al cliente de correo
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
      const a = document.createElement("a");
      a.href = mailtoLink;
      a.target = "_blank";
      a.click();
    }
    

        else {
      // Use react-native-html-to-pdf on Android.
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

  function mandarEmail(){
    console.log("mandar email")
    emailSender=selectedData.email
    console.log(emailSender) //Up to here, it works.
  }

  const sendEmailWithPDF = async () => {
    try {
      const timestamp = new Date().toISOString();
      const redRooms = rooms.filter((room) => room.isRed).map((room) => room.name);

      const docToUpdate = doc(db, "projects", projectId);

      const dataToSave = {
        apartment: selectedData.apartment,
        block: selectedData.block,
        comment: comment || "No comment provided",
        direction: selectedData.direction,
        floor: selectedData.floor,
        photo: photo ? photo.uri : null,
        redRooms: redRooms,
        timestamp: timestamp,
        userId: selectedData.email,
        isCompleted: true,
      };

      await updateDoc(docToUpdate, dataToSave);
      console.log("Success", "Project marked as completed.");
      Alert.alert("Success", "Project marked as completed.");

      console.log("Success", "Data saved to Firebase successfully!");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      console.log("Error", "Failed to save data to Firebase.");
    }

    const pdfPath = await generatePDF();
    if (!pdfPath) return;

    if (Platform.OS === 'web') {
      window.open(pdfPath); // For the web, the generated PDF file just opens.
      Alert.alert("Success", "PDF is ready to be downloaded.");
    } else {
      // Send the email with the native application.
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
      // Use a file input on the web.
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
      //Use launchImageLibrary on Android.
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
          <React.Fragment key={room.id}>
            <Rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={room.isRed ? "red" : "lightgray"}
              stroke="black"
              strokeWidth="2"
              onPress={() => toggleRoomColor(room.id)}
            />
            <Text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2}
              textAnchor="middle"
              alignmentBaseline="middle"
              fill="black"
              fontSize="10"
              fontWeight="bold"
            >
              {room.name}
            </Text>
          </React.Fragment>
        ))}
      </Svg>

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
