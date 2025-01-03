import React ,{useEffect, useState} from "react"; 
import { View, StyleSheet,TextInput, ScrollView,Button,TouchableOpacity,Text} from "react-native";
import  db  from "../database/firebase";

import { doc, getDoc ,deleteDoc, updateDoc} from "firebase/firestore";
import { ActivityIndicator } from "react-native"; 

const UserDetailScreen = (props) => {
    console.log(props.route.params.userId) //lo que me esta pasando de la pantalla anterior

    const initialState ={ 
        id: '',
        name: '',
        email: '',
        phone: ''
    }

    const [user , setUser] = useState(initialState)
    const [loading , setLoading] = useState(true)

    const getUserByid = async(id) => {
      // Crea una referencia al documento
            const dbRef = doc(db, "users", id);

            // Obtén el documento
            const docSnap = await getDoc(dbRef);

            if (docSnap.exists()) {
            console.log("Documento encontrado:", docSnap.data());
            } else {
            console.log("No existe un documento con ese ID");
            }
            const user =docSnap.data(); 
            setUser({ 
                ...user,
                id:docSnap.id,
            })
            setLoading(false)

    }

    useEffect(() => 
        {
            getUserByid(props.route.params.userId)
        },[])

    const handleChangeText = (name, value) => {
            setUser({...user,[name]:value }) //guarda el state actual y le agrega el nuevo valor a name
        }

        const deleteUser = async () => {
            try {
              // Obtén el ID del usuario desde props
              const userId = props.route.params.userId;
          
              // Crea una referencia al documento
              const dbRef = doc(db, "users", userId);
          
              // Elimina el documento
              await deleteDoc(dbRef);
          
              console.log("Usuario eliminado correctamente");
            } catch (error) {
              console.error("Error al eliminar el usuario:", error);
            }
          };
    const updateUser = async () => {
        try {
            // Obtén el ID del usuario desde props
            const userId = props.route.params.userId;
        
            // Crea una referencia al documento
            const dbRef = doc(db, "users", userId);
            
            // Define los campos a actualizar
            const updatedData = {
                name: user.name, // Reemplaza por el nuevo valor de name
                email: user.email, // Reemplaza por el nuevo valor de email
                phone: user.phone, // Reemplaza por el nuevo valor de phone
            };
            // Elimina el documento
            await updateDoc(dbRef,updatedData);
        
            console.log("Usuario actualizado correctamente");
          } catch (error) {
            console.error("Error al actualizar el usuario:", error);
          }
          setUser(initialState)
        };

    if(loading){
        return (
            <View>
                <ActivityIndicator  size="large" color="#9e9e9e"/>
            </View>
        )
    }

    return (
        <ScrollView style={styles.container}>
                    <View style={styles.inputGroup}>
                        <TextInput placeholder= "Name User" 
                        value={user.name}
                        onChangeText={(value) => handleChangeText('name',value) }/> 
                    </View>
                    <View style={styles.inputGroup}>
                        <TextInput placeholder= "Email User"
                         value={user.email}
                        onChangeText={(value) => handleChangeText('email',value) }/>
                    </View>
                    <View style={styles.inputGroup}>
                        <TextInput placeholder= "Phone User"
                         value={user.phone}
                        onChangeText={(value) => handleChangeText('phone',value) }/>
                    </View>
                    <View style={styles.inputGroup}>
                       <TouchableOpacity style={{backgroundColor:'#19AC52'}} onPress={() => updateUser()}>
                                           <Text>Update User</Text>
                                       </TouchableOpacity>
                        
                    </View>
                    <View style={styles.inputGroup}>
                    
                    <TouchableOpacity style={{backgroundColor:'#E37999'}} onPress={() => deleteUser()}>
                                           <Text>Delete User</Text>
                                       </TouchableOpacity>
                    </View>
                </ScrollView>
    );
}
//   <Button  color="#19AC52" title="Update User " onPress={() => updateUser()}/>
//   <Button color="#E37999" title="Delete User " onPress={() => deleteUser()}/>

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 35 
    } 
    ,
    inputGroup: {
        flex: 1,
        padding: 0,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc'
    }
})

export default UserDetailScreen