from Ui_main import Ui_MainWindow
from PyQt5.QtWidgets import QApplication, QMainWindow
import sys
from faker import Factory
import datetime


def start_main_process(ui):
    program_out_str = ''
    web_out_str = ''
    acc_out_str = ''
    IsTimeSwtich = True
    program_out_str += '启动运行！\n'
    #判断定时与否
    if(ui.TimeSwitch.checkState() == 2):
        IsTimeSwtich = True
        program_out_str += '定时模式：'
        program_out_str = program_out_str + ui.hour.text() + '时' + ui.minites.text() + '分' + ui.seconds.text() + '秒\n'
        ui.ProgramOut.setText(program_out_str)
    else:
        IsTimeSwtich = False
        program_out_str += '非定时模式，程序将直接执行发送请求\n'
        ui.ProgramOut.setText(program_out_str)


    #得到账号数
    AccCnt = int(ui.AccCnt.text())
    program_out_str += '登录中，账号数：' + ui.AccCnt.text() + '\n'
    ui.ProgramOut.setText(program_out_str)

    #读取txt文本
    try:
        with open('LoginAccount.txt', 'r', encoding='utf-8') as f:
            print(f.read())
    except BaseException:
        program_out_str += '账号密码文件不存在，请创建文件并填写信息！\n'
        ui.ProgramOut.setText(program_out_str)

    
if __name__ == '__main__':
    app = QApplication(sys.argv)
    MainWindow = QMainWindow()
    ui = Ui_MainWindow()
    ui.setupUi(MainWindow)
    #fake_generator = Factory.create()
    #print(fake_generator.ipv4())
    now_date = datetime.datetime.now().timetuple()          
    expire_date = datetime.datetime(2022,6,15,10,0,0).timetuple()      
    if(now_date.tm_mon > expire_date.tm_mon or (now_date.tm_mon == expire_date.tm_mon and now_date.tm_mday > expire_date.tm_mday)):
        print('expire!')
        sys.exit()

    
    ui.StartButton.clicked.connect(lambda: start_main_process(ui))
    MainWindow.show()
    
    sys.exit(app.exec_())