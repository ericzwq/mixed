import 'package:flutter/material.dart';
import 'router/router.dart';

class LayoutPage extends StatefulWidget {
  const LayoutPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => LayoutPageState();
}

class BarItems {
  final BottomNavigationBarItem widget;
  final String path;

  BarItems(this.widget, this.path);
}

class LayoutPageState extends State<LayoutPage> {
  int _currentIndex = 0;
  final _items = [
    BarItems(const BottomNavigationBarItem(icon: Icon(Icons.set_meal), label: '首页'), '/index'),
    BarItems(const BottomNavigationBarItem(icon: Icon(Icons.padding), label: '云社区'), '/community'),
    BarItems(const BottomNavigationBarItem(icon: Icon(Icons.cabin), label: '云视频'), '/videos'),
    BarItems(const BottomNavigationBarItem(icon: Icon(Icons.dangerous), label: '创作中心'), '/creation'),
    BarItems(const BottomNavigationBarItem(icon: Icon(Icons.baby_changing_station), label: '个人中心'), '/personal'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: BottomNavigationBar(
        items: _items.map((e) => e.widget).toList(),
        unselectedItemColor: Colors.black,
        showUnselectedLabels: true,
        unselectedLabelStyle: const TextStyle(color: Colors.black),
        backgroundColor: Colors.blue,
        fixedColor: Colors.blue,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() {
          // Navigator.pushNamed(context, _items[index].path);
          _currentIndex = index;
        }),
      ),
      // appBar: AppBar(
      //   title: const Text('bar'),
      // ),
      body: routes[_currentIndex],
      drawer: Drawer(
        child: ListView(
          children: const [
            ListTile(title: Text('title')),
            ListTile(title: Text('title')),
            ListTile(title: Text('title')),
          ],
        ),
      ),
    );
  }
}
