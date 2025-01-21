import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from "expo-sharing";
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  TextInput,
  Image,
  TouchableOpacity,
  Platform,
  Text as Textilia
} from "react-native";
import Svg, { Rect,Text } from "react-native-svg";
import { collection, addDoc,updateDoc ,doc} from "firebase/firestore";
import Mailer from "react-native-mail";
import db from "../database/firebase"; // Firebase setup.
import * as ImagePicker from 'expo-image-picker';
import { jsPDF } from "jspdf"; //For Web.
import * as FileSystem from 'expo-file-system';


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

    const [selectedImage, setSelectedImage] = useState(null);

  

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
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
    

doc.setFontSize(24);
doc.setFont("helvetica", "bold");
doc.setTextColor(0, 102, 204); 
doc.text("Apartment Inspection Report", 105, 20, { align: "center" }); 

//Separator line below the title
doc.setDrawColor(0, 102, 204); 
doc.setLineWidth(1);
doc.line(10, 25, 200, 25);


doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.setTextColor(0, 0, 0); 
doc.text("Property Details:", 10, 40); 


doc.setFontSize(12);
doc.setFont("helvetica", "normal");
doc.text(`Direction: ${selectedData.direction}`, 15, 50);
doc.text(`Block: ${selectedData.block}`, 15, 60);
doc.text(`Floor: ${selectedData.floor}`, 15, 70);
doc.text(`Apartment: ${selectedData.apartment}`, 15, 80);

doc.setDrawColor(150); 
doc.line(10, 90, 200, 90);


doc.setFontSize(14);
doc.setFont("helvetica", "bold");
doc.setTextColor(0, 0, 0);
doc.text("Marked Rooms:", 10, 110); 


doc.setFontSize(12);
doc.setFont("helvetica", "normal");
redRooms.forEach((room, index) => {
  doc.setDrawColor(0); 
  doc.rect(10, 120 + index * 20 - 6, 190, 10); 
  doc.text(`${index + 1}. ${room.name}`, 15, 120 + index * 20);
});


doc.line(10, 130 + redRooms.length * 20 + 5, 200, 130 + redRooms.length * 20 + 5);



doc.setFontSize(10);
doc.setFont("helvetica", "italic");
doc.setTextColor(120); 
doc.text("Generated by Cohesio © 2025", 105, 290, {
  align: "center",
});

if (photo) {
  const textX = 10;
  const textY = 160 + redRooms.length * 20;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); 
  doc.text("Comment:", textX, textY);

  // Adjust the position of the comment text so that it does not overlap with the box
  const commentTextY = textY + 15; 


  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80); 
  doc.text(
    comment || "No comment provided.",
    15,
    commentTextY,
    { maxWidth: 180 } 
  );

  // Adjust the position for the image, below the comment
  const imageYPosition = commentTextY + 20; 

  // 
  const scaleFactor = 0.3; 
  const imageAspectRatio = photo.width / photo.height || 1; 
  const containerWidth = 190; 
  const containerHeight = 80; 
  let imageWidth = containerWidth * scaleFactor; 
  let imageHeight = imageWidth / imageAspectRatio; 

  
  if (imageHeight > containerHeight) {
    imageHeight = containerHeight * scaleFactor; 
    imageWidth = imageHeight * imageAspectRatio; 
  }


  const imageX = textX + (containerWidth - imageWidth) / 2; 
  const imageY = imageYPosition; 

  
  if (
    !isNaN(imageX) &&
    !isNaN(imageY) &&
    !isNaN(imageWidth) &&
    !isNaN(imageHeight) &&
    imageWidth > 0 &&
    imageHeight > 0
  ) {
    
    doc.addImage(photo.uri, "JPEG", imageX, imageY, imageWidth, imageHeight);
  } else {
    console.error("Error: Coordenadas o dimensiones de la imagen no válidas");
  }
}


      // Automatically download the PDF file
      doc.save('Apartment_Inspection_Report.pdf');  
    
      
      const email = "recipient@example.com"; 
      const subject = encodeURIComponent("Apartment Inspection Report");
      const body = encodeURIComponent(
        "Attached is the apartment inspection report. Please review the details."
      );
    
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
    console.log(emailSender) 
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

  const selectPhoto = async () => {
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
      
      try {
        // Request permissions to access the gallery
        const { status } = await MediaLibrary.requestPermissionsAsync();
  
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "You need to enable permissions to access the gallery!", 
            [
              {
                text: 'Go to Settings',
                onPress: () => Linking.openSettings(), // open settings
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
          return;
        }
        
  
        // Open photo gallery
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 1,
        });
  
        console.log('Result:', result);

        if (!result.canceled ) {
          //Make sure the URI is valid
          if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
            const uri = result.assets[0].uri;
            console.log('Selected Image URI:', uri); // check URI



              if (uri) {
                // Ορισμός νέας τοποθεσίας για αποθήκευση της εικόνας
                const newUri = FileSystem.documentDirectory + 'image.jpg';

                try {
                  // Μετακίνηση της εικόνας στην μόνιμη τοποθεσία
                  await FileSystem.moveAsync({
                    from: uri,
                    to: newUri,
                  });

                  // Ενημέρωση του state για να εμφανιστεί η εικόνα
                  setPhoto({ uri: newUri });
                  console.log("Image saved to:", newUri);
                } catch (error) {
                  console.log("Error saving image:", error);
                }
            }
          } else {
            console.log('User canceled image selection');
          }
        }
      } catch (error) {
        console.error("Error selecting photo:", error);
      }
    };
  };

  return (
    <ScrollView 
    contentContainerStyle={[styles.container, { paddingBottom: 50 }]}  
    keyboardShouldPersistTaps="handled"  
    scrollEventThrottle={16}  
    showsVerticalScrollIndicator={true}  
    >
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

      {photo && photo.uri ? (
        <Image source={{ uri: photo.uri }} style={styles.photo} />
      ) : (
        <Text>No image selected</Text>
      )}

      <TouchableOpacity style={styles.photoButton} onPress={selectPhoto}>
        <View>
          <Textilia style={styles.photoButtonText}>Select Photo</Textilia>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.photoButton} onPress={sendEmailWithPDF}>
        <View>
        <Textilia style={styles.photoButtonText}>Share</Textilia  >
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
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
    width: "100%",
    height: "100%", 
    resizeMode: "contain",
  },
  photoButton: {
    backgroundColor: '#6c8c72', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoContainer: {
    width: "100%",
    height: 300,  
    overflow: "hidden", 
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ReviewScreen;
