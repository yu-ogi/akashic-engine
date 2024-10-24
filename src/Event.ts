import type { CommonOffset } from "@akashic/pdi-types";
import type { Player } from "./Player";
import type { RandomGenerator } from "./RandomGenerator";
import type { StorageValueStore } from "./Storage";

/**
 * イベントの種別。
 *
 * - `"unknown"`: 不明なイベント。ゲーム開発者はこの値を利用してはならない。
 * - `"join"`: プレイヤーの参加を表すイベント。
 * - `"leave"`: プレイヤーの離脱を表すイベント。
 * - `"timestamp"`: タイムスタンプを表すイベント。
 * - `"player-info"`: プレイヤー情報を表すイベント。
 * - `"seed"`: 乱数生成器の生成を表すイベント。この値は現在利用されていない。
 * - `"point-down"`: ポイントダウンイベント。
 * - `"point-move"`: ポイントムーブイベント。
 * - `"point-up"`: ポイントアップイベント。
 * - `"message"`: 汎用的なメッセージを表すイベント。
 * - `"operation"`: 操作プラグインが通知する操作を表すイベント。
 */
export type EventTypeString =
	| "unknown"
	| "join"
	| "leave"
	| "timestamp"
	| "player-info"
	| "seed"
	| "point-down"
	| "point-move"
	| "point-up"
	| "message"
	| "operation";

/**
 * イベントを表すインターフェース。
 */
export interface Event {
	/**
	 * イベントの種別。
	 */
	type: EventTypeString;
	/**
	 * イベントフラグ値。
	 * 詳細な仕様は @akashic/playlog を参照のこと。
	 */
	eventFlags: number;
	/**
	 * このイベントがローカルであるか否か。
	 */
	local?: boolean;
}

/**
 * ポインティングソースによる対象を表すインターフェース。
 * 対象とその対象から見た相対座標によって構成される。
 */
export interface PointSourceBase<T extends PointTarget> {
	target: T | undefined;
	point: CommonOffset | undefined;
	local?: boolean;
}

/**
 * ポインティングの対象を表すインターフェース。
 */
export interface PointTarget extends CommonOffset {
	id: number;
}

/**
 * ポインティング操作を表すイベントの基底クラス。
 * PointEvent#targetでそのポインティング操作の対象が、
 * PointEvent#pointでその対象からの相対座標が取得できる。
 *
 * 本イベントはマルチタッチに対応しており、PointEvent#pointerIdを参照することで識別することが出来る。
 *
 * abstract
 */
export class PointEventBase<T extends PointTarget> implements Event {
	/**
	 * 本クラスはどのtypeにも属さない。
	 */
	// @ts-ignore
	type: "point-down" | "point-move" | "point-up";
	eventFlags: number;
	local: boolean;
	player: Player | undefined;
	pointerId: number;
	point: CommonOffset;
	target: T | undefined;

	constructor(pointerId: number, target: T | undefined, point: CommonOffset, player?: Player, local?: boolean, eventFlags?: number) {
		// @ts-ignore TODO: eventFlags のデフォルト値の扱い
		this.eventFlags = eventFlags;
		this.local = !!local;
		this.player = player;
		this.pointerId = pointerId;
		this.target = target;
		this.point = point;
	}
}

/**
 * ポインティング操作の開始を表すイベントの基底クラス。
 */
export class PointDownEventBase<T extends PointTarget> extends PointEventBase<T> {
	type: "point-down" = "point-down";
}

/**
 * ポインティング操作の終了を表すイベントの基底クラス。
 * PointDownEvent後にのみ発生する。
 *
 * PointUpEvent#startDeltaによってPointDownEvent時からの移動量が、
 * PointUpEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
 * PointUpEvent#pointにはPointDownEvent#pointと同じ値が格納される。
 */
export class PointUpEventBase<T extends PointTarget> extends PointEventBase<T> {
	type: "point-up" = "point-up";
	startDelta: CommonOffset;
	prevDelta: CommonOffset;

	constructor(
		pointerId: number,
		target: T | undefined,
		point: CommonOffset,
		prevDelta: CommonOffset,
		startDelta: CommonOffset,
		player?: Player,
		local?: boolean,
		eventFlags?: number
	) {
		super(pointerId, target, point, player, local, eventFlags);
		this.prevDelta = prevDelta;
		this.startDelta = startDelta;
	}
}

/**
 * ポインティング操作の移動を表すイベント。
 * PointDownEvent後にのみ発生するため、MouseMove相当のものが本イベントとして発生することはない。
 *
 * PointMoveEvent#startDeltaによってPointDownEvent時からの移動量が、
 * PointMoveEvent#prevDeltaによって直近のPointMoveEventからの移動量が取得出来る。
 * PointMoveEvent#pointにはPointMoveEvent#pointと同じ値が格納される。
 *
 * 本イベントは、プレイヤーがポインティングデバイスを移動していなくても、
 * カメラの移動等視覚的にポイントが変化している場合にも発生する。
 */
export class PointMoveEventBase<T extends PointTarget> extends PointEventBase<T> {
	type: "point-move" = "point-move";
	startDelta: CommonOffset;
	prevDelta: CommonOffset;

	constructor(
		pointerId: number,
		target: T | undefined,
		point: CommonOffset,
		prevDelta: CommonOffset,
		startDelta: CommonOffset,
		player?: Player,
		local?: boolean,
		eventFlags?: number
	) {
		super(pointerId, target, point, player, local, eventFlags);
		this.prevDelta = prevDelta;
		this.startDelta = startDelta;
	}
}

/**
 * 汎用的なメッセージを表すイベント。
 * MessageEvent#dataによってメッセージ内容を取得出来る。
 */
export class MessageEvent implements Event {
	type: "message" = "message";
	eventFlags: number;
	local: boolean;
	player: Player | undefined;
	data: any;

	constructor(data: any, player?: Player, local?: boolean, eventFlags?: number) {
		// @ts-ignore TODO: eventFlags のデフォルト値の扱い
		this.eventFlags = eventFlags;
		this.local = !!local;
		this.player = player;
		this.data = data;
	}
}

/**
 * 操作プラグインが通知する操作を表すイベント。
 * プラグインを識別する `OperationEvent#code` と、プラグインごとの内容 `OperationEvent#data` を持つ。
 */
export class OperationEvent implements Event {
	type: "operation" = "operation";
	eventFlags: number;
	local: boolean;
	player: Player | undefined;
	code: number;
	data: any;

	constructor(code: number, data: any, player?: Player, local?: boolean, eventFlags?: number) {
		// @ts-ignore TODO: eventFlags のデフォルト値の扱い
		this.eventFlags = eventFlags;
		this.local = !!local;
		this.player = player;
		this.code = code;
		this.data = data;
	}
}

/**
 * プレイヤーの参加を表すイベント。
 * JoinEvent#playerによって、参加したプレイヤーを取得出来る。
 */
export class JoinEvent implements Event {
	type: "join" = "join";
	eventFlags: number;
	player: Player;
	storageValues: StorageValueStore | undefined;

	constructor(player: Player, storageValues?: StorageValueStore, eventFlags?: number) {
		// @ts-ignore TODO: eventFlags のデフォルト値の扱い
		this.eventFlags = eventFlags;
		this.player = player;
		this.storageValues = storageValues;
	}
}

/**
 * プレイヤーの離脱を表すイベント。
 * LeaveEvent#playerによって、離脱したプレイヤーを取得出来る。
 */
export class LeaveEvent implements Event {
	type: "leave" = "leave";
	eventFlags: number;
	player: Player;

	constructor(player: Player, eventFlags?: number) {
		// @ts-ignore TODO: eventFlags のデフォルト値の扱い
		this.eventFlags = eventFlags;
		this.player = player;
	}
}

/**
 * タイムスタンプを表すイベント。
 */
export class TimestampEvent implements Event {
	type: "timestamp" = "timestamp";
	eventFlags: number;
	player: Player;
	timestamp: number;

	constructor(timestamp: number, player: Player, eventFlags?: number) {
		// @ts-ignore TODO: eventFlags のデフォルト値の扱い
		this.eventFlags = eventFlags;
		this.player = player;
		this.timestamp = timestamp;
	}
}

/**
 * プレイヤー情報を表すイベント。
 * PointInfoEvent#player.nameによってプレイヤー名を、PlayerInfoEvent#player.userDataによって送信者依存の追加データを取得できる。
 */
export class PlayerInfoEvent implements Event {
	type: "player-info" = "player-info";
	eventFlags: number;
	player: Player;

	constructor(player: Player, eventFlags?: number) {
		// @ts-ignore TODO: eventFlags のデフォルト値の扱い
		this.eventFlags = eventFlags;
		this.player = player;
	}
}

/**
 * 新しい乱数の発生を表すイベント。
 * SeedEvent#generatorによって、本イベントで発生したRandomGeneratorを取得出来る。
 */
export class SeedEvent implements Event {
	type: "seed" = "seed";
	eventFlags: number;
	generator: RandomGenerator;

	constructor(generator: RandomGenerator, eventFlags?: number) {
		// @ts-ignore TODO: eventFlags のデフォルト値の扱い
		this.eventFlags = eventFlags;
		this.generator = generator;
	}
}
