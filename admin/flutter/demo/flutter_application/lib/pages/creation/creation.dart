import 'package:flutter/material.dart';

class CreationPage extends StatefulWidget {
  const CreationPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _CreationPageState();
}

class _CreationPageState extends State<CreationPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Text('creation'),
    );
  }
}
