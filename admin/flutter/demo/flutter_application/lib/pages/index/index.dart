import 'package:flutter/material.dart';

class IndexPage extends StatefulWidget {
  const IndexPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => IndexPageState();
}

class IndexPageState extends State<IndexPage> {
  final TextEditingController _inputController = TextEditingController(text: '');

  @override
  void initState() {
    super.initState();
    _inputController.addListener(() {
      print(_inputController.text);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          width: 600,
          alignment: Alignment.center,
          decoration: BoxDecoration(border: Border.all(color: Colors.black)),
          child: TextField(
            controller: _inputController,
            cursorColor: Colors.black,
            decoration: const InputDecoration(
                prefixIcon: Icon(Icons.dark_mode),
                hintText: "请输入用户名",
                labelText: "用户名",
                border: OutlineInputBorder()),
          ),
          height: 400,
          padding: const EdgeInsets.all(10),
          margin: const EdgeInsets.fromLTRB(10, 50, 10, 10),
        ),
      ),
    );
  }
}
