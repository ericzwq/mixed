import 'package:flutter_easyloading/flutter_easyloading.dart';

class Loading {
  bool _closed = true;
  bool _autoOpen = true; // 是否在发请求时自动开启loading
  bool _manual = false; // 是否手动关闭loading

  open({manual = false, status = '加载中...'}) {
    EasyLoading.show(status: status, maskType: EasyLoadingMaskType.black);
    _closed = false;
    _manual = manual;
  }

  close() {
    EasyLoading.dismiss();
    _closed = true;
    _manual = false;
    _autoOpen = true;
  }

  bool getClosed() => _closed;

  void setAutoOpen(bool v) {
    _autoOpen = v;
  }

  bool getAutoOpen() {
    return _autoOpen;
  }

  bool getManual() {
    return _manual;
  }
}
