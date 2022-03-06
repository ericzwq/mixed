import 'package:flutter/material.dart';

class PersonalPage extends StatefulWidget {
  const PersonalPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => PersonalPageState();
}

class PersonalPageState extends State<PersonalPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Text('personal'),
    );
  }
}
