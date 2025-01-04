import React ,{ useState }from "react";
import { View,Button, TextInput, ScrollView, StyleSheet} from "react-native";
import { collection, addDoc } from "firebase/firestore"; // Importa correctamente
import  db  from "../database/firebase";
import UsersList from "./UsersList";


const CreateReview = (props) => {

    const [state, setState] = useState({ // initial state using useState
        direction: '', //TODO: cambiar todo esto a review
        block: '',
        floor: '',
        apartment: ''
    })

    const handleChangeText = (name, value) => {
        setState({...state,[name]:value }) //guarda el state actual y le agrega el nuevo valor a name
    }

    const saveNewProject = async () => { //asincrona para guardar en la base de datos 
        
        if(state.direction === ''){
            alert('Please provide a direction')
        }
        else {
            try {
                // Obtén la referencia a la colección
                const projectsCollection = collection(db, "projects");
            
                // Agrega un documento a la colección
                await addDoc(projectsCollection, {
                    direction: state.direction,
                    block: state.block,
                    floor: state.floor,
                    apartment: state.apartment
                });
            
                console.log("Proyecto agregado con éxito");
                props.navigation.navigate('ProjectsScreen'); // Redirige a la lista de usuarios habia un  props. 
              } catch (error) {
                console.error("Error al agregar el proyecto:", error);
              }
        }

    }
    return (
        <ScrollView style={styles.container}>
            <View style={styles.inputGroup}>
                <TextInput placeholder= "Direction" 
                onChangeText={(value) => handleChangeText('direction',value) }/> 
            </View>
            <View style={styles.inputGroup}>
                <TextInput placeholder= "Block"
                onChangeText={(value) => handleChangeText('block',value) }/>
            </View>
            <View style={styles.inputGroup}>
                <TextInput placeholder= "Floor"
                onChangeText={(value) => handleChangeText('floor',value) }/>
            </View>
            <View style={styles.inputGroup}>
                <TextInput placeholder= "Apartment "
                onChangeText={(value) => handleChangeText('apartment',value) }/>
            </View>
            <View style={styles.inputGroup}>
                <Button title="Save Project " onPress={() => saveNewProject()}/>
            </View>
        </ScrollView>
    );
}

 const styles= StyleSheet.create({

    container: {
        flex: 1,
        padding: 35
    },  
    

    inputGroup: {
        flex: 1,
        padding: 0,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc'
    }
}) 

export default CreateReview