import 'package:flutter/material.dart';

class VideosPage extends StatefulWidget {
  const VideosPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => VideosPageState();
}

class VideosPageState extends State<VideosPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Text('videos'),
    );
  }
}
