import 'package:flutter/material.dart';
import '../pages/index/index.dart';
import '../pages/community/community.dart';
import '../pages/videos/videos.dart';
import '../pages/creation/creation.dart';
import '../pages/personal/personal.dart';

class LayoutPage extends StatefulWidget {
  const LayoutPage({Key? key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => LayoutPageState();
}

class LayoutPageState extends State<LayoutPage> {
  int _currentIndex = 4;
  final _items = [
    const BottomNavigationBarItem(icon: Icon(Icons.set_meal), label: '首页'),
    const BottomNavigationBarItem(icon: Icon(Icons.padding), label: '云社区'),
    const BottomNavigationBarItem(icon: Icon(Icons.cabin), label: '云视频'),
    const BottomNavigationBarItem(icon: Icon(Icons.dangerous), label: '创作中心'),
    const BottomNavigationBarItem(icon: Icon(Icons.baby_changing_station), label: '个人中心')
  ];
  final tabPages = [const IndexPage(), const CommunityPage(), const VideosPage(), const CreationPage(), const PersonalPage()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: BottomNavigationBar(
        items: _items,
        unselectedItemColor: Colors.black,
        showUnselectedLabels: true,
        unselectedLabelStyle: const TextStyle(color: Colors.black),
        backgroundColor: Colors.blue,
        fixedColor: Colors.blue,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
      // appBar: AppBar(
      //   title: const Text('bar'),
      // ),
      body: tabPages[_currentIndex],
      // body: SpinKitWave(color: Colors.black, type: SpinKitWaveType.start),
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
