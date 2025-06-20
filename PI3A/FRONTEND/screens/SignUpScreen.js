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
import API_URL from "../API_URL";

export default function SignUp() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  function showSnackbar(message) {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }

  async function handleSignUp() {
    try {
      const response = await fetch(`${API_URL}:3001/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Usuário cadastrado com sucesso!");
        setTimeout(() => navigation.navigate("SignIn"), 1500);
      } else {
        showSnackbar(data.error || "Erro ao cadastrar.");
      }
    } catch (err) {
      showSnackbar("Erro de conexão.");
      console.log(err);
    }
  }

  return (
    <PaperProvider>
      <View style={styles.loginContainer}>
        <View style={styles.loginBox}>
          <Text style={{ fontWeight: "bold", fontSize: 40 }}>Sign up</Text>
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
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#4d4d4d"
            keyboardType="phone-pad"
            maxLength={11}
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
            <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>
              Sign up
            </Text>
          </TouchableOpacity>
          <View style={styles.termsConditions}>
            <Text style={{ color: "#4d4d4d" }}>
              By clicking this button, you agree with our{" "}
            </Text>
            <TouchableOpacity>
              <Text style={{ color: "#4d4d4d", fontWeight: "bold" }}>
                Terms and Conditions
              </Text>
            </TouchableOpacity>
          </View>
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
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>
              Sign in
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
    height: 470,
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
  termsConditions: {
    justifyContent: "center",
    alignItems: "center",
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
