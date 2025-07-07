//flutters widgets
import 'package:flutter/material.dart';
//to make http requests to backend
import 'package:http/http.dart' as http;
//for decoding JSON
import 'dart:convert';

//this page needs to manage changing data so we have used Stateful Widget
class LocationAlertPage extends StatefulWidget{
  const LocationAlertPage({super.key});

  @override
  _locationAlertPageState createState() => _locationAlertPageState();
}

//state class to hold the state of LocationAlertPage
class _locationAlertPageState extends State<LocationAlertPage>{
  //TextEditingController to manage location input
  final TextEditingController _districtController = TextEditingController();
  //String object to store summary of the warning
  String summary = "";
  //List of warning data
  List<dynamic> alerts = [];
  //shows loading spinner when data is being fetched
  bool loading = false;
  //error message in case of an error 
  String error ="";

  Future<void> fetchAlerts(String district) async{
      //Start loading and reset previous errors
      setState(() {
        loading = true;
        error="";
      });

      try{
        //build the request url encoding the district
        final response = await http.get(
          Uri.parse('http://192.168.29.49:3000/alerts?district=${Uri.encodeComponent(district)}') 
        );

        //if response in successful (HTTP 200 OK status)
        if(response.statusCode == 200){
          //decode the JSON body from response
          final data = json.decode(response.body);

          //update the UI with summary 
          setState(() {
            summary = data["summary"] ?? "No summary available";
            alerts = data["alerts"] ?? [];
          });
        } else{
          //if response failed show an error
          setState(() {
            error="Failed to fetch alerts: ${response.statusCode}";
          });
        }
      } catch(e){
        //Catches other errors such as network error
        setState(() {
          error = "Error: $e";
        });
      } finally{
        //Stop loading spinner
        setState(() {
          loading = false;
        });
      }
  }

    @override 
    Widget build(BuildContext context){
      return Scaffold(
        appBar: AppBar(title: Text("Alert Flow")),

        body:Padding(
          padding: const EdgeInsets.all(16.0),
          
          child: Column(
            children: [
              //Input field for district name
              TextField(
                controller: _districtController,
                decoration: InputDecoration(
                  labelText: "Enter your district",
                  border: OutlineInputBorder()
                ),
              ),

              SizedBox(height: 10),
              
              //Button to fetch alerts
              ElevatedButton(
                onPressed: (){
                  final district = _districtController.text.trim();
                  if(district.isNotEmpty){
                    fetchAlerts(district);//if district is not empty fetch the alerts
                  }
                }
                , child: Text("Get Alerts"),
              ),

              SizedBox(height: 20),

              //Show loading spinner while fetching
              if(loading) CircularProgressIndicator(),

              //Show error message if its there
              if(error.isNotEmpty)
                Text(
                  error,
                  style: TextStyle(color: Colors.red),
                ),
              
              //Show the summary if its available
              if(summary.isNotEmpty)...[
                Text("Summary:",style:TextStyle(fontWeight: FontWeight.bold)),
                Text(summary),
                SizedBox(height:10),
              ],

              if (alerts.isNotEmpty)
                Expanded(
                  child: ListView.builder(
                    itemCount: alerts.length,  
                    itemBuilder: (context, index) {
                      final alert = alerts[index];
                      return Card(
                        child: ListTile(
                          title: Text(alert['district']),
                          subtitle: Text("Warning: ${(alert['hazard'] ?? [])}"),
                          trailing: Text(alert['warningLevel']),
                        ),
                      );
                    },
                  ),
                ),
            ],))
      );
  }
}

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Alert Flow',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: LocationAlertPage(), 
    );
  }
}
