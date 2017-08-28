![logo](../master/prettypullrequests/ppr-logo/128x128.png)

# プルリクレビューが使いやすくなるChrome拡張機能

* Githubのプルリクファイル一覧ページに、ファイルの折りたたみ機能を追加します。
* cs/xmlファイル以外を自動的に折りたたみます。オプションで変更可能です。
* Githubがpjaxに対応し、旧Pretty Pull Requestsプラグインが利用できないので改造しました。

![image](https://user-images.githubusercontent.com/12690315/29799993-8541713c-8ca2-11e7-9a7a-be84aecb48aa.png)  


<br><br><br><br>
## ![](../master/prettypullrequests/ppr-logo/32x32.png) インストール

### Macの場合
* [prettypullrequests.crx](https://github.com/mob-sakai/prettypullrequests/raw/master/prettypullrequests.crx) をダウンロードする
* Chromeで「その他の機能 -> 拡張機能」を開くか、 chrome://extensions/ に移動する
* ダウンロードした [prettypullrequests.crx](https://github.com/mob-sakai/prettypullrequests/raw/master/prettypullrequests.crx) をドラッグ＆ドロップする  
![image](https://user-images.githubusercontent.com/12690315/29800154-41cbad36-8ca3-11e7-8c81-43f17e32d530.png)  
* 「拡張機能を追加」を押す  
![image](https://user-images.githubusercontent.com/12690315/29800171-5e388ffc-8ca3-11e7-818e-8ce6cd4884de.png)

　  
### Windowsの場合
* [prettypullrequests.zip](https://github.com/mob-sakai/prettypullrequests/archive/master.zip) をダウンロードし、展開する
* Chromeで「その他の機能 -> 拡張機能」を開くか、 chrome://extensions/ に移動する
* 「デベロッパーモード」にチェックを入れ、「パッケージ化されていない拡張機能を読み込む...」をクリックする  
![image](https://user-images.githubusercontent.com/12690315/27848696-1307d908-6182-11e7-8284-dad85cac29b2.png)  
* さきほど展開したフォルダ内のprettypullrequestsフォルダを選択し、「OK」をクリックする  
![image](https://user-images.githubusercontent.com/12690315/29800264-04349d92-8ca4-11e7-9c3e-596ba53ff467.png)

　  
### 注意事項 (※Windowsのみ)
* Chromeを起動するたびに次のようなポップアップが表示されます。  
「キャンセル」をクリックしてください。  
![image](https://user-images.githubusercontent.com/12690315/27848644-a2deebda-6181-11e7-9644-987efbe74653.png)

　  
### 更新
* 【Windows】  
上記インストール方法で最新版のプラグインをインストールしてください
* 【Mac】  
prettypullrequestsは自動的に更新がインストールされます。特に操作は不要です。


<br><br><br><br>
## ![](../master/prettypullrequests/ppr-logo/32x32.png) アンインストール
* 「その他の機能 -> 拡張機能」から、prettypullrequestsを削除してください。  
![image](https://user-images.githubusercontent.com/12690315/29800302-39105092-8ca4-11e7-9cac-7552d19d1dfb.png)


<br><br><br><br>
## ![](../master/prettypullrequests/ppr-logo/32x32.png) オプション
### 自動で折りたたむファイルを指定する
* デフォルトではcs/xmlファイルを自動的に折りたたむ設定になっています。
* 変更するには、OptionsにあるAuto-Collapse Rulesを変更してください。デフォルトは `^(?!.*(cs|xml)$).*$` です。
* 正規表現については http://uxmilk.jp/50674 を参考にしてください。
![image](https://user-images.githubusercontent.com/12690315/29768781-8983593e-8c22-11e7-91e1-6a52bcfdb571.png)


<br><br><br><br>
## ![](../master/prettypullrequests/ppr-logo/32x32.png) 備考
* ご利用は自己責任でお願いします


# Pretty Pull Requests

This extension will add various features to the diff view on Github's pull request pages.

Supports both files changed and commit diffs.

 ## Current Features

- Click on the file name to collapse a file, or collapse from bottom up via an added button
- Collapse/Expand all
- Collapse/Expand all that match a regex pattern
- Collapse/Expand added/removed lines
- File tree view allowing you to collapse a directory, or jump directly to a file diff
- (Optional) Use backtick/tilde to switch tabs in the pull request. Backtick goes forward, and tilde (shift-backtick) goes backward. Enable this setting in the extension's options. 
- Set regex patterns to automatically collapse all files in any PR that matches

![Example Image](https://raw.githubusercontent.com/Yatser/prettypullrequests/master/ppr_example.png)

To install the chrome extension, visit: [chrome web store / pretty pull requests](https://chrome.google.com/webstore/detail/pretty-pull-requests-gith/ljnjpkadhhcdniohpfilddnhahoigdec?hl=en)
