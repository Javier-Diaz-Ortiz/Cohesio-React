import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator}from '@react-navigation/stack'

const Stack =createStackNavigator()

import UsersList from './screens/UsersList';
import CreateUserScreen from './screens/CreateUserScreen';
import UserDetailScreen from './screens/UserDetailScreen';
import CohesioMainScreen from './screens/CohesioMainScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import Reviews from './screens/Reviews';

function MyStack(){
  return (
    <Stack.Navigator>
       <Stack.Screen name="CohesioMainScreen" component={CohesioMainScreen} />  
      <Stack.Screen name="UsersList" component={UsersList} options={{title: 'Who are you?'}}/> 
      <Stack.Screen name="CreateUserScreen"  component={CreateUserScreen} options={{title: 'Create a new user'}}/>
      <Stack.Screen name="UserDetailScreen"  component={UserDetailScreen} options={{title: 'User Detail'}} />
      {/* TODO : put all screens here  */}

      </Stack.Navigator>
  )
}

export default function App() {
  return (
   <NavigationContainer>
      <MyStack/>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
