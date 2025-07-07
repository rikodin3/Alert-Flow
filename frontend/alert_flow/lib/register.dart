import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:config.dart';  // replace with actual project name


//Stateful Widget for the register page
class RegisterPage extends StatefulWidget{
  @override 
  _RegisterPageState createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage>{
  //Input fields to take user info
  final TextEditingController _districtField = TextEditingController();
  final TextEditingController _deviceTokenField = TextEditingController();

  String message= ""; //store response or error messages

  Future<void> registerUser() async{
    final district = _districtField.text.trim();
    final deviceToken = _deviceTokenField.text.trim();

     // Validate inputs before sending
    if (district.isEmpty || deviceToken.isEmpty) {
      setState(() {
        message = 'Both fields are required';
      });
      return;
    }

    try{
      //prepare the request
      final response = await http.post(
        Uri.parse('http://$IP_ADDRESS:$PORT/register'),  //POST endpoint
        headers: {'Content-Type':'application.json'}, //content type for RESTful API
        body: json.encode({
          'district': district,
          'deviceToken' : deviceToken,
        })
      );

      //Handle the response 
      if(response.statusCode == 200){
        setState(() {
          message = "Registration Successful";
        });
      } else {
          setState(() {
            message = 'Registration failed: ${response.statusCode}';
          });
      }
    } catch (e) {
      //Catch and display network error
      setState(() {
        message = "Error: $e";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Register for Alerts"),
      ),
      body: Padding(
        padding:const EdgeInsets.all(16.0),
        child: Column(
          children: [
            //District INput
            TextField(
              controller: _districtField,
              decoration: InputDecoration(
                labelText: 'Enter District',
                border: OutlineInputBorder(),
              ),
            ),

            SizedBox(height:10),

            //Device Token Input (Firebase token for pushing notifications)
            TextField(
              controller: _deviceTokenField,
              decoration: InputDecoration(
                labelText: 'Enter device Token',
                border: OutlineInputBorder(),
              ),
            ),

            SizedBox(height: 20),

            //Submit button to trigger registerUser()
            ElevatedButton(onPressed: registerUser, child: Text("Register")),

            SizedBox(height: 20),

            //Show server response or error message
            if(message.isNotEmpty)
                Text(
                  message,
                  style: TextStyle(
                    color: message.contains("successful")? Colors.green : Colors.red,
                  ),
                ),
          ]
        ))
    );
  }
}