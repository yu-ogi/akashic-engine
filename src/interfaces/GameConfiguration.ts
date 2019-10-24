import { AssetConfigurationMap, AudioSystemConfigurationMap, ModuleMainScriptsMap } from "./AssetConfiguration";
import { OperationPluginInfo } from "./OperationPluginInfo";

/**
 * ゲームの設定を表すインターフェース。
 * game.jsonによって定義される。
 */
export interface GameConfiguration {
	/**
	 * ゲーム画面の幅。
	 */
	width: number;

	/**
	 * ゲーム画面の高さ。
	 */
	height: number;

	/**
	 * ゲームのFPS。省略時は30。
	 */
	fps?: number;

	/**
	 * エントリポイント。require() できるパス。
	 *
	 * 省略された場合、アセット mainScene (典型的には script/mainScene.js)と
	 * スナップショットローダ snapshotLoader (典型的には script/snapshotLoader.js; 必要なら)を使う従来の挙動が採用される。
	 * 省略可能だが、省略は非推奨である。
	 */
	main?: string;

	/**
	 * AudioSystemの追加定義。キーにsystem名を書く。不要(デフォルトの "sound" と "music" しか使わない)なら省略してよい。
	 */
	audio?: AudioSystemConfigurationMap;

	/**
	 * アセット宣言。ユニットテスト記述の都合上省略を許すが、通常非undefinedでしか使わない。
	 */
	assets?: AssetConfigurationMap;

	/**
	 * 操作プラグインの情報。
	 */
	operationPlugins?: OperationPluginInfo[];

	/**
	 * スクリプトアセットの簡略記述用テーブル。
	 *
	 * グローバルアセットである *.js ファイル、*.json ファイルに限り、この配列にファイル名(コンテンツルートディレクトリから相対パス)を書くことができる。
	 * ここにファイル名を書いた場合、 `assets` でのアセット定義は不要であり、拡張子 js であれば `ScriptAsset` として、
	 * 拡張子 json であれば `TextAsset` として扱われる。また常に "global": true として扱われる。
	 * ここに記述されたファイルのアセットIDは不定である。ゲーム開発者がこのファイルを読み込むためには、相対パスによる (`require()` を用いねばならない)
	 */
	// akashic-engine はこのフィールドを認識しないので、エンジンユーザはあらかじめ
	// `globalScripts` を相当する `assets` 定義に変換する必要がある。
	globalScripts?: string[];

	/**
	 * require()解決用ののエントリポイントを格納したテーブル。
	 *
	 * require()の第一引数をキーとした値が本テーブルに存在した場合、require()時にその値をパスとしたスクリプトアセットを評価する。
	 */
	moduleMainScripts?: ModuleMainScriptsMap;

	/**
	 * デフォルトローディングシーンについての指定。
	 * 省略時または "default" を指定すると `DefaultLoadingScene` を表示する。
	 * デフォルトローディングシーンを非表示にしたい場合は "none" を指定する。
	 */
	defaultLoadingScene?: "default" | "none";
}
