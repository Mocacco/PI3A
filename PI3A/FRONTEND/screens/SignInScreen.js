import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Snackbar, Provider as PaperProvider } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from "../API_URL";

export default function SignIn() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  function showSnackbar(message) {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }

  async function handleSignIn() {
    if (!email || !password) {
      showSnackbar("Preencha email e senha.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}:3001/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem('userToken', data.token);
        showSnackbar("Login realizado!");
        setTimeout(() => 
          navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp' }]
          })
        )} else {
        showSnackbar(data.message || "Credenciais inválidas.");
      }
    } catch (err) {
      showSnackbar("Erro de conexão com o servidor.");
      console.log(err);
    }
  }

  return (
    <PaperProvider>
      <View style={styles.loginContainer}>
        <View style={styles.loginBox}>
          <Text style={{ fontWeight: "bold", fontSize: 40 }}>Sign in</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#4d4d4d"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#4d4d4d"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleSignIn}>
            <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>
              Sign in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={{ color: "#4d4d4d", fontWeight: "bold" }}>
              Forgot your password?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.alterLogin}>
          <TouchableOpacity style={styles.alterLoginButton}>
            <Text style={{ color: "#4d4d4d", fontSize: 16 }}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alterLoginButton}>
            <Text style={{ color: "#4d4d4d", fontSize: 16 }}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.createAccount}>
          <Text style={{ color: "#fff", fontSize: 16 }}>
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: "#323232" }}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#4d4d4d",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  loginBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 400,
    width: 350,
    borderRadius: 30,
    backgroundColor: "#fff",
    gap: 20,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: "#4d4d4d",
    width: 300,
    height: 50,
    fontSize: 18,
  },
  loginButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4d4d4d",
    width: 300,
    height: 55,
    borderRadius: 100,
  },
  alterLogin: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  alterLoginButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 55,
    width: 165,
    backgroundColor: "#fff",
    borderRadius: 100,
  },
  createAccount: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
});
