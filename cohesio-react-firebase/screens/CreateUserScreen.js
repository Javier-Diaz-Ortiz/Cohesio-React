import React ,{ useState }from "react";
import { View,Button, TextInput, ScrollView, StyleSheet} from "react-native";
import { collection, addDoc } from "firebase/firestore"; // Importa correctamente
import  db  from "../database/firebase";

const CreateUserScreen = (props) => {

    const [state, setState] = useState({ // initial state using useState
        name: '',
        email: '',
        phone: ''
    })

    const handleChangeText = (name, value) => {
        setState({...state,[name]:value }) //guarda el state actual y le agrega el nuevo valor a name
    }

    const saveNewUser = async () => { //asincrona para guardar en la base de datos 
        
        if(state.name === ''){
            alert('Please provide a name')
        }
        else {
            try {
                // Obtén la referencia a la colección
                const usersCollection = collection(db, "users");
            
                // Agrega un documento a la colección
                await addDoc(usersCollection, {
                  name: state.name,
                  email: state.email,
                  phone: state.phone,
                });
            
                console.log("Usuario agregado con éxito");
                props.navigation.navigate('UsersList'); // Redirige a la lista de usuarios
              } catch (error) {
                console.error("Error al agregar el usuario:", error);
              }
        }

    }
    return (
        <ScrollView style={styles.container}>
            <View style={styles.inputGroup}>
                <TextInput placeholder= "Name User" 
                onChangeText={(value) => handleChangeText('name',value) }/> 
            </View>
            <View style={styles.inputGroup}>
                <TextInput placeholder= "Email User"
                onChangeText={(value) => handleChangeText('email',value) }/>
            </View>
            <View style={styles.inputGroup}>
                <TextInput placeholder= "Phone User"
                onChangeText={(value) => handleChangeText('phone',value) }/>
            </View>
            <View style={styles.inputGroup}>
                <Button title="Save User " onPress={() => saveNewUser()}/>
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

export default CreateUserScreen