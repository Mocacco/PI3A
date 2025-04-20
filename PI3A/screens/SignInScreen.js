import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function SignInScreen() {
  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginBox}>
        <Text style={{ fontWeight: "bold", fontSize: 40 }}>Sign in</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#4d4d4d"
          keyboardType="email-address"
          autoCapitalize="none"
        ></TextInput>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#4d4d4d"
          secureTextEntry={true}
        ></TextInput>
        <TouchableOpacity style={styles.loginButton}>
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
        <TouchableOpacity>
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
