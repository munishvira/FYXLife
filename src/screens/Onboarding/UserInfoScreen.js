import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const UserInfoScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    age: '',
    phone: '',
    gender: '',
    activityLevel: '',
    height: '',
    weight: '',
  });

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!userData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (
      !userData.age ||
      parseInt(userData.age) < 18 ||
      parseInt(userData.age) > 100
    ) {
      Alert.alert('Error', 'Please enter a valid age (18-100)');
      return false;
    }
    if (!userData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!userData.gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }
    if (!userData.activityLevel) {
      Alert.alert('Error', 'Please select your activity level');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateForm()) {
      navigation.navigate('Confirmation', { userData });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        enableOnAndroid={true}
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>
          This helps us personalize your wellness journey
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={userData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={userData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              placeholder="Enter your age"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={userData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                style={styles.picker}>
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activity Level *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userData.activityLevel}
                onValueChange={(value) =>
                  handleInputChange('activityLevel', value)
                }
                style={styles.picker}>
                <Picker.Item label="Select activity level" value="" />
                <Picker.Item label="Sedentary" value="sedentary" />
                <Picker.Item label="Lightly Active" value="lightly_active" />
                <Picker.Item
                  label="Moderately Active"
                  value="moderately_active"
                />
                <Picker.Item label="Very Active" value="very_active" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={userData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              placeholder="Enter your height"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={userData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              placeholder="Enter your weight"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 55,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserInfoScreen;
