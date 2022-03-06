import 'package:flutter/material.dart';
import 'data.dart' as data;
class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key, required this.title}) : super(key: key);
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  List<Widget> _getList() {
    return data.list.map((e) => ListTile(
      title: Text(e['title']),
      subtitle: Text(e['id'].toString()),
    )).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
          height: 200,
          alignment: Alignment.bottomLeft,
          padding: const EdgeInsets.all(20),
          margin: const EdgeInsets.all(20),
          decoration: BoxDecoration(border: Border.all(width: 0.5, color: Colors.black), borderRadius: const BorderRadius.all(Radius.circular(5))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            FloatingActionButton(
              onPressed: _incrementCounter,
              backgroundColor: Colors.blue,
              child: Text('按钮' + _counter.toString()),
            )
          ])),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
