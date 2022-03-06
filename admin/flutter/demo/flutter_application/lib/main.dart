import 'package:flutter/material.dart';
import 'layout.dart';
import 'router/router.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // routes: routes,
      theme: ThemeData(
        primarySwatch: Colors.red,
      ),
      home: const LayoutPage(),
    );
  }
}
