import React, {useEffect,useState} from "react";
import { View, Text,TouchableOpacity,StyleSheet} from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import db from "../database/firebase";
import { ScrollView } from "react-native-gesture-handler";
//import { Button } from "react-native-web";
import {ListItem , Avatar} from 'react-native-elements';

const UsersList = (props) => {

    const [users, setUsers] = useState([])
    useEffect(() => {
                        const usersCollection = collection(db, "users");

                onSnapshot(usersCollection, (querySnapshot) => {
                // querySnapshot contiene los datos de la base de datos
                const users = [];

                querySnapshot.docs.forEach((doc) => {
                    const { name, email, phone } = doc.data();
                    users.push({
                    id: doc.id,
                    name,
                    email,
                    phone,
                    });
                });

                setUsers(users); // Guarda los usuarios en el estado
                });
    }, [])
    // <Button title="Create User" onPress={() => props.navigation.navigate('CreateUserScreen')}/> esto es debajo en touchable opacity
    return (
        <ScrollView>
            <View>
                <TouchableOpacity style={styles.button} onPress={() => props.navigation.navigate('CreateUserScreen')}> 
                    <Text>Create User</Text>
                </TouchableOpacity>
            </View>
            {
                users.map(user => {
                    return (
                        <ListItem
                            key={user.id}
                            bottomDivider
                            onPress={() => 
                                props.navigation.navigate('UserDetailScreen', {
                                    userId: user.id // Pasa el ID del usuario a la pantalla de detalles para mostrar el usuario con ese id 
                            })}
                           >
                            <ListItem.Chevron />
                            <Avatar source={{uri: 'https://randomuser.me/api/portraits '}} rounded/>
                            <ListItem.Content>
                                <ListItem.Title>{user.name}</ListItem.Title>
                                <ListItem.Subtitle>{user.email}</ListItem.Subtitle>

                            </ListItem.Content>  
                            </ListItem>
                    )
                })
            }
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    button: {
      backgroundColor: '#E37999', // Color de fondo del botón
      paddingVertical: 12, // Espaciado vertical
      paddingHorizontal: 20, // Espaciado horizontal
      borderRadius: 30, // Bordes redondeados
      shadowColor: '#000', // Sombra
      shadowOffset: { width: 0, height: 4 }, // Desplazamiento de la sombra
      shadowOpacity: 0.2, // Opacidad de la sombra
      shadowRadius: 5, // Radio de la sombra
      elevation: 5, // Elevación para Android
      alignItems: 'center', // Centrar el texto horizontalmente
      justifyContent: 'center', // Centrar el texto verticalmente
    }});

export default UsersList