import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native'
import {createStackNavigator}from '@react-navigation/stack'

const Stack =createStackNavigator()
import UserDetailScreen from './screens/UserDetailScreen';
import CohesioMainScreen from './screens/CohesioMainScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import CreateReview from './screens/CreateReview';
import ReviewScreen from './screens/ReviewScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import UserHomeScreen from './screens/UserHomeScreen';

function MyStack(){
  return (
    <Stack.Navigator>
      <Stack.Screen name="CohesioMainScreen" component={CohesioMainScreen} />  
      <Stack.Screen name="UserDetailScreen"  component={UserDetailScreen} options={{title: 'User Detail'}} />
      <Stack.Screen name="ProjectsScreen"  component={ProjectsScreen} options={{title: 'Projects Screen'}} />
      <Stack.Screen name="CreateReview"  component={CreateReview} options={{title: 'Create Review'}} />
      <Stack.Screen name="ReviewScreen"  component={ReviewScreen} options={{title: 'Review Screen'}} />
      <Stack.Screen name="LoginScreen"  component={LoginScreen} options={{title: 'Login'}} />
      <Stack.Screen name="RegisterScreen"  component={RegisterScreen} options={{title: 'Register'}} />
      <Stack.Screen name="UserHomeScreen"  component={UserHomeScreen} options={{title: 'User Home Screen'}} />
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
